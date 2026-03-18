import { useState } from 'react'
import { Upload, Filter, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TransactionTable } from '@/components/financeiro/TransactionTable'
import { TransactionSheet } from '@/components/financeiro/TransactionSheet'
import { CsvImportModal } from '@/components/financeiro/CsvImportModal'
import { ImportHistoryModal } from '@/components/financeiro/ImportHistoryModal'
import useAgroStore from '@/stores/useAgroStore'
import { Transaction } from '@/types'

export default function Financeiro() {
  const { transactions, updateTransaction } = useAgroStore()

  const [filterCrop, setFilterCrop] = useState<string>('Todos')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)

  const filteredTransactions = transactions.filter(
    (t) => filterCrop === 'Todos' || t.crop === filterCrop,
  )

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(tx)
    setIsSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterCrop} onValueChange={setFilterCrop}>
            <SelectTrigger className="w-[180px] bg-background">
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
        <div className="flex gap-2 w-full sm:w-auto">
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
            <span className="hidden sm:inline">Importar Extrato (CSV)</span>
            <span className="sm:hidden">Importar</span>
          </Button>
        </div>
      </div>

      <TransactionTable transactions={filteredTransactions} onSelect={handleRowClick} />

      <TransactionSheet
        transaction={selectedTx}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={updateTransaction}
      />

      <CsvImportModal open={isImportModalOpen} onOpenChange={setIsImportModalOpen} />
      <ImportHistoryModal open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen} />
    </div>
  )
}
