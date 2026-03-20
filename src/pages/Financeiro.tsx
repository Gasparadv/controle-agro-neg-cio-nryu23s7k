import { useState, useEffect } from 'react'
import { Upload, Filter, History } from 'lucide-react'
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
import { TransactionTable } from '@/components/financeiro/TransactionTable'
import { TransactionSheet } from '@/components/financeiro/TransactionSheet'
import { FileImportModal } from '@/components/financeiro/FileImportModal'
import { ImportHistoryModal } from '@/components/financeiro/ImportHistoryModal'
import useAgroStore from '@/stores/useAgroStore'
import { Transaction } from '@/types'

const ITEMS_PER_PAGE = 10

export default function Financeiro() {
  const { transactions, updateTransaction } = useAgroStore()

  const [filterCrop, setFilterCrop] = useState<string>('Todos')
  const [filterType, setFilterType] = useState<string>('Todos')
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filterCrop, filterType])

  const filteredTransactions = transactions.filter((t) => {
    const matchCrop = filterCrop === 'Todos' || t.crop === filterCrop
    const matchType =
      filterType === 'Todos' ||
      (filterType === 'Receitas' && t.type === 'receita') ||
      (filterType === 'Despesas' && t.type === 'despesa') ||
      (filterType === 'Indefinidos' && t.type === 'indefinido')

    return matchCrop && matchType
  })

  // Group undefined first, then sort by date
  filteredTransactions.sort((a, b) => {
    if (a.type === 'indefinido' && b.type !== 'indefinido') return -1
    if (a.type !== 'indefinido' && b.type === 'indefinido') return 1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(tx)
    setIsSheetOpen(true)
  }

  const handleUpdateType = (tx: Transaction, newType: 'receita' | 'despesa') => {
    updateTransaction({
      ...tx,
      type: newType,
      amount: newType === 'despesa' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
    })
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
      : 'Nenhum lançamento encontrado.'

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
            <Select value={filterCrop} onValueChange={setFilterCrop}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Filtrar por Cultura" />
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
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Filtrar por Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os Tipos</SelectItem>
                <SelectItem value="Receitas">Apenas Receitas</SelectItem>
                <SelectItem value="Despesas">Apenas Despesas</SelectItem>
                <SelectItem value="Indefinidos">Tipo: Não Definido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto mt-2 lg:mt-0">
          <Button
            onClick={() => setIsHistoryModalOpen(true)}
            variant="outline"
            className="gap-2 flex-1 sm:flex-none"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </Button>
          <Button
            onClick={() => setIsImportModalOpen(true)}
            variant="secondary"
            className="gap-2 flex-1 sm:flex-none"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Importar (CSV/Excel)</span>
            <span className="sm:hidden">Importar</span>
          </Button>
        </div>
      </div>

      <TransactionTable
        transactions={paginatedTransactions}
        onSelect={handleRowClick}
        onUpdateType={handleUpdateType}
        emptyStateMessage={emptyMessage}
      />

      {totalPages > 1 && (
        <div className="mt-4">
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
                    currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <TransactionSheet
        transaction={selectedTx}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={updateTransaction}
      />

      <FileImportModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />
      <ImportHistoryModal open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen} />
    </div>
  )
}
