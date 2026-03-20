import { useState, useEffect } from 'react'
import { Upload, Filter, History, Plus, Wand2, Download, Printer } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { TransactionTable } from '@/components/financeiro/TransactionTable'
import { TransactionSheet } from '@/components/financeiro/TransactionSheet'
import { FileImportModal } from '@/components/financeiro/FileImportModal'
import { ImportHistoryModal } from '@/components/financeiro/ImportHistoryModal'
import { QuickAddModal } from '@/components/financeiro/QuickAddModal'
import { BulkActionsBar } from '@/components/financeiro/BulkActionsBar'
import { MappingRulesModal } from '@/components/financeiro/MappingRulesModal'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import useAgroStore from '@/stores/useAgroStore'
import useAuthStore from '@/stores/useAuthStore'
import useEquipmentStore from '@/stores/useEquipmentStore'
import { useToast } from '@/hooks/use-toast'
import { exportToCSV } from '@/lib/export'
import { Transaction } from '@/types'

const ITEMS_PER_PAGE = 10

export default function Financeiro() {
  const { role } = useAuthStore()
  const isViewer = role === 'viewer'

  const {
    transactions,
    updateTransaction,
    deleteTransaction,
    bulkUpdateTransactions,
    bulkDeleteTransactions,
  } = useAgroStore()
  const { equipments } = useEquipmentStore()
  const { toast } = useToast()

  const [filterCrop, setFilterCrop] = useState<string>('Todos')
  const [filterType, setFilterType] = useState<string>('Todos')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false)

  useEffect(() => {
    setCurrentPage(1)
    setSelectedIds([])
  }, [filterCrop, filterType, sortOrder, dateRange])

  const filteredTransactions = transactions.filter((t) => {
    const matchCrop = filterCrop === 'Todos' || t.crop === filterCrop
    const matchType =
      filterType === 'Todos' ||
      (filterType === 'Receitas' && t.type === 'receita') ||
      (filterType === 'Despesas' && t.type === 'despesa') ||
      (filterType === 'Indefinidos' && t.type === 'indefinido')

    let matchDate = true
    if (dateRange?.from) {
      const [year, month, day] = t.date.split('T')[0].split('-').map(Number)
      const txDate = new Date(year, month - 1, day)
      txDate.setHours(0, 0, 0, 0)

      const from = new Date(dateRange.from)
      from.setHours(0, 0, 0, 0)

      if (dateRange.to) {
        const to = new Date(dateRange.to)
        to.setHours(23, 59, 59, 999)
        matchDate = txDate >= from && txDate <= to
      } else {
        matchDate = txDate.getTime() === from.getTime()
      }
    }

    return matchCrop && matchType && matchDate
  })

  filteredTransactions.sort((a, b) => {
    if (a.type === 'indefinido' && b.type !== 'indefinido') return -1
    if (a.type !== 'indefinido' && b.type === 'indefinido') return 1
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE) || 1
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleRowClick = (tx: Transaction) => {
    if (isViewer) return
    setSelectedTx(tx)
    setIsSheetOpen(true)
  }

  const handleUpdateTx = (tx: Transaction, updates: Partial<Transaction>) => {
    const updatedTx = { ...tx, ...updates }
    if (updates.type) {
      updatedTx.amount = updates.type === 'despesa' ? -Math.abs(tx.amount) : Math.abs(tx.amount)
    }
    updateTransaction(updatedTx)
  }

  const handleDeleteConfirm = () => {
    if (txToDelete) {
      deleteTransaction(txToDelete.id)
      setTxToDelete(null)
      toast({
        title: 'Lançamento excluído',
        description: 'O registro foi removido com sucesso.',
      })
      if (paginatedTransactions.length === 1 && currentPage > 1) {
        setCurrentPage((p) => p - 1)
      }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(paginatedTransactions.map((t) => t.id))
    else setSelectedIds([])
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) setSelectedIds((prev) => [...prev, id])
    else setSelectedIds((prev) => prev.filter((i) => i !== id))
  }

  const handleSortDate = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
  }

  const renderPaginationItems = () => {
    const items = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }
    return items
  }

  const emptyMessage =
    filterType === 'Indefinidos'
      ? 'Nenhum registro pendente encontrado.'
      : 'Nenhum lançamento encontrado para os filtros atuais.'

  const classifiedCount = transactions.filter((t) => t.type !== 'indefinido').length
  const totalCount = transactions.length
  const progressPercentage = totalCount === 0 ? 0 : Math.round((classifiedCount / totalCount) * 100)

  return (
    <>
      <style type="text/css">
        {`
          @media print {
            body * { visibility: hidden; }
            #financeiro-print-view, #financeiro-print-view * { visibility: visible; }
            #financeiro-print-view { 
              position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px;
            }
            .print\\:hidden { display: none !important; }
          }
        `}
      </style>
      <div id="financeiro-print-view" className="space-y-6">
        <div className="bg-card border rounded-lg p-4 flex flex-col gap-2 print:hidden shadow-sm">
          <div className="flex justify-between items-center text-sm font-medium">
            <span>Progresso de Classificação ({progressPercentage}%)</span>
            <span className="text-muted-foreground">
              {classifiedCount} de {totalCount} registros classificados
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 print:hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full xl:w-auto flex-wrap">
            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
              className="w-full sm:w-auto"
            />

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
              <Select value={filterCrop} onValueChange={setFilterCrop}>
                <SelectTrigger className="w-full sm:w-[150px] bg-background">
                  <SelectValue placeholder="Culturas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas as Culturas</SelectItem>
                  <SelectItem value="Soja">Soja</SelectItem>
                  <SelectItem value="Milho">Milho</SelectItem>
                  <SelectItem value="Cana">Cana de Açúcar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[150px] bg-background">
                  <SelectValue placeholder="Tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos os Tipos</SelectItem>
                  <SelectItem value="Receitas">Apenas Receitas</SelectItem>
                  <SelectItem value="Despesas">Apenas Despesas</SelectItem>
                  <SelectItem value="Indefinidos">Tipo: Não Definido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isViewer && (
              <Button
                onClick={() => setIsMappingModalOpen(true)}
                variant="outline"
                className="gap-2 w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20"
              >
                <Wand2 className="h-4 w-4" />
                <span className="hidden xl:inline">Regras (De-Para)</span>
                <span className="inline xl:hidden">Regras</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full xl:w-auto mt-2 xl:mt-0 items-center justify-start xl:justify-end">
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={() => exportToCSV(filteredTransactions, equipments)}
            >
              <Download className="h-4 w-4" />
              <span className="hidden xl:inline">Exportar CSV</span>
              <span className="inline xl:hidden">CSV</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              onClick={() => setTimeout(() => window.print(), 100)}
            >
              <Printer className="h-4 w-4" />
              <span className="hidden xl:inline">Exportar PDF</span>
              <span className="inline xl:hidden">PDF</span>
            </Button>

            {!isViewer && (
              <>
                <Button
                  onClick={() => setIsHistoryModalOpen(true)}
                  variant="outline"
                  className="gap-2 hidden sm:flex w-full sm:w-auto"
                >
                  <History className="h-4 w-4" />
                  Histórico
                </Button>
                <Button
                  onClick={() => setIsImportModalOpen(true)}
                  variant="secondary"
                  className="gap-2 w-full sm:w-auto"
                >
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Importar</span>
                </Button>
                <Button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="gap-2 col-span-2 sm:col-span-1 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Novo Lançamento</span>
                  <span className="inline sm:hidden">Novo</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <TransactionTable
          transactions={paginatedTransactions}
          onSelect={handleRowClick}
          onUpdate={handleUpdateTx}
          onDelete={(tx) => setTxToDelete(tx)}
          emptyStateMessage={emptyMessage}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectRow={handleSelectRow}
          readOnly={isViewer}
          sortOrder={sortOrder}
          onSortDate={handleSortDate}
        />

        {totalPages > 1 && (
          <div className="mt-4 print:hidden">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {renderPaginationItems()}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {!isViewer && selectedIds.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedIds.length}
            onUpdate={(updates) => {
              bulkUpdateTransactions(selectedIds, updates)
              setSelectedIds([])
              toast({ title: 'Lotes atualizados com sucesso' })
            }}
            onDelete={() => {
              bulkDeleteTransactions(selectedIds)
              setSelectedIds([])
              toast({ title: 'Registros excluídos' })
            }}
            onCancel={() => setSelectedIds([])}
          />
        )}

        <TransactionSheet
          transaction={selectedTx}
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onSave={updateTransaction}
        />

        <FileImportModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />
        <ImportHistoryModal open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen} />
        <QuickAddModal open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen} />
        <MappingRulesModal open={isMappingModalOpen} onOpenChange={setIsMappingModalOpen} />

        <AlertDialog open={!!txToDelete} onOpenChange={(val) => !val && setTxToDelete(null)}>
          <AlertDialogContent className="print:hidden">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Lançamento?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
