import { useState } from 'react'
import { Upload, Filter } from 'lucide-react'
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
import useAgroStore from '@/stores/useAgroStore'
import { Transaction } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function Financeiro() {
  const { transactions, updateTransaction, addTransaction } = useAgroStore()
  const { toast } = useToast()

  const [filterCrop, setFilterCrop] = useState<string>('Todos')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const filteredTransactions = transactions.filter(
    (t) => filterCrop === 'Todos' || t.crop === filterCrop,
  )

  const handleRowClick = (tx: Transaction) => {
    setSelectedTx(tx)
    setIsSheetOpen(true)
  }

  const handleSimulateImport = () => {
    const mockImports: Transaction[] = [
      {
        id: Math.random().toString(),
        date: new Date().toISOString().split('T')[0],
        description: 'Posto Ipiranga - Diesel',
        amount: 3200,
        type: 'despesa',
        category: 'Outros',
        comments: '',
        crop: 'Geral',
      },
    ]
    mockImports.forEach(addTransaction)
    toast({
      title: 'Extrato Importado',
      description: '1 nova transação foi identificada e adicionada à lista.',
    })
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
        <Button onClick={handleSimulateImport} variant="secondary" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Extrato (CSV)
        </Button>
      </div>

      <TransactionTable transactions={filteredTransactions} onSelect={handleRowClick} />

      <TransactionSheet
        transaction={selectedTx}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSave={updateTransaction}
      />
    </div>
  )
}
