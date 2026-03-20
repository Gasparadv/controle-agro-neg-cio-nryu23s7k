import React, { createContext, useContext, useState } from 'react'
import { Transaction, ImportBatch, MappingRule } from '@/types'

interface AgroStoreContextType {
  transactions: Transaction[]
  importBatches: ImportBatch[]
  mappingRules: MappingRule[]
  addTransaction: (tx: Transaction) => void
  addTransactions: (txs: Transaction[]) => void
  updateTransaction: (tx: Transaction) => void
  deleteTransaction: (id: string) => void
  approveTransaction: (id: string) => void
  rejectTransaction: (id: string, reason: string) => void
  addImportBatch: (batch: ImportBatch) => void
  undoImportBatch: (batchId: string) => void
  addMappingRule: (rule: MappingRule) => void
  deleteMappingRule: (id: string) => void
  applyMappingRules: () => void
  bulkUpdateTransactions: (ids: string[], updates: Partial<Transaction>) => void
  bulkDeleteTransactions: (ids: string[]) => void
}

const initialImportBatches: ImportBatch[] = [
  {
    id: 'batch-1',
    date: '2024-04-15T10:30:00.000Z',
    fileName: 'extrato_bradesco_abr.csv',
    recordCount: 2,
  },
]

const initialMappingRules: MappingRule[] = [
  { id: 'r1', keyword: 'fertilizante', category: 'Insumos', type: 'despesa' },
  { id: 'r2', keyword: 'cargill', category: 'Venda', type: 'receita', crop: 'Soja' },
]

const initialTransactions: Transaction[] = [
  {
    id: '1',
    date: '2023-10-01',
    description: 'Sementes de Soja XPTO',
    amount: -45000,
    type: 'despesa',
    category: 'Insumos',
    comments: 'Para o talhão 1',
    crop: 'Soja',
    status: 'approved',
  },
  {
    id: '2',
    date: '2023-10-15',
    description: 'Fertilizante NPK',
    amount: -32000,
    type: 'despesa',
    category: 'Insumos',
    comments: '',
    crop: 'Soja',
    status: 'approved',
  },
  {
    id: '3',
    date: '2024-03-20',
    description: 'Venda Safra Soja',
    amount: 150000,
    type: 'receita',
    category: 'Venda',
    comments: 'Cargill',
    crop: 'Soja',
    status: 'approved',
  },
  {
    id: '4',
    date: '2023-01-10',
    description: 'Manutenção Trator',
    amount: -8500,
    type: 'despesa',
    category: 'Manutenção',
    comments: 'Troca de óleo e pneus',
    crop: 'Geral',
    status: 'approved',
  },
  {
    id: '5',
    date: '2024-04-10',
    description: 'Combustível Diesel',
    amount: -12000,
    type: 'despesa',
    category: 'Manutenção',
    comments: 'Abastecimento dos tratores frota 2',
    crop: 'Geral',
    status: 'pending',
    collaboratorName: 'Carlos Assistente',
  },
  {
    id: '6',
    date: '2024-04-12',
    description: 'Compra de EPIs',
    amount: -1500,
    type: 'despesa',
    category: 'Insumos',
    comments: 'Luvas, óculos e máscaras para pulverização',
    crop: 'Soja',
    status: 'pending',
    collaboratorName: 'Maria Silva',
  },
  {
    id: '7',
    date: '2024-04-05',
    description: 'Reparo Cerca',
    amount: -800,
    type: 'despesa',
    category: 'Manutenção',
    comments: 'Materiais sem nota fiscal completa',
    crop: 'Geral',
    status: 'rejected',
    collaboratorName: 'Carlos Assistente',
    rejectionReason: 'Faltou anexar a nota fiscal da compra.',
  },
  {
    id: '8',
    date: '2024-04-14',
    description: 'Pagamento Fornecedor XYZ',
    amount: -5000,
    type: 'despesa',
    category: 'Outros',
    comments: 'Importado',
    crop: 'Geral',
    status: 'approved',
    importBatchId: 'batch-1',
  },
  {
    id: '9',
    date: '2024-04-15',
    description: 'Recebimento Cliente ABC',
    amount: 12000,
    type: 'receita',
    category: 'Venda',
    comments: 'Importado',
    crop: 'Geral',
    status: 'approved',
    importBatchId: 'batch-1',
  },
  {
    id: '10',
    date: '2024-04-16',
    description: 'Lançamento Desconhecido 1',
    amount: 5400,
    type: 'indefinido',
    category: 'Outros',
    comments: 'Lote de extrato pendente de revisão',
    crop: 'Geral',
    status: 'pending',
  },
  {
    id: '11',
    date: '2024-04-17',
    description: 'Pix Recebido / Enviado',
    amount: 1250,
    type: 'indefinido',
    category: 'Outros',
    comments: 'Falta classificar como entrada ou saída',
    crop: 'Geral',
    status: 'pending',
  },
]

const AgroStoreContext = createContext<AgroStoreContextType | undefined>(undefined)

export function AgroProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [importBatches, setImportBatches] = useState<ImportBatch[]>(initialImportBatches)
  const [mappingRules, setMappingRules] = useState<MappingRule[]>(initialMappingRules)

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev])
  }

  const addTransactions = (txs: Transaction[]) => {
    setTransactions((prev) => [...txs, ...prev])
  }

  const updateTransaction = (tx: Transaction) => {
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)))
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id))
  }

  const approveTransaction = (id: string) => {
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'approved', rejectionReason: undefined } : item,
      ),
    )
  }

  const rejectTransaction = (id: string, reason: string) => {
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'rejected', rejectionReason: reason } : item,
      ),
    )
  }

  const addImportBatch = (batch: ImportBatch) => {
    setImportBatches((prev) => [batch, ...prev])
  }

  const undoImportBatch = (batchId: string) => {
    setTransactions((prev) => prev.filter((tx) => tx.importBatchId !== batchId))
    setImportBatches((prev) => prev.filter((b) => b.id !== batchId))
  }

  const addMappingRule = (rule: MappingRule) => setMappingRules((prev) => [...prev, rule])
  const deleteMappingRule = (id: string) =>
    setMappingRules((prev) => prev.filter((r) => r.id !== id))

  const applyMappingRules = () => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.type !== 'indefinido' && tx.category !== 'Outros') return tx

        let newTx = { ...tx }
        const desc = tx.description.toLowerCase()

        for (const rule of mappingRules) {
          if (desc.includes(rule.keyword.toLowerCase())) {
            if (rule.category && tx.category === 'Outros') newTx.category = rule.category
            if (rule.crop && tx.crop === 'Geral') newTx.crop = rule.crop
            if (rule.type && tx.type === 'indefinido') {
              newTx.type = rule.type
              newTx.amount =
                rule.type === 'despesa' ? -Math.abs(newTx.amount) : Math.abs(newTx.amount)
            }
          }
        }
        return newTx
      }),
    )
  }

  const bulkUpdateTransactions = (ids: string[], updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (!ids.includes(tx.id)) return tx
        const newTx = { ...tx, ...updates }
        if (updates.type) {
          newTx.amount =
            updates.type === 'despesa' ? -Math.abs(newTx.amount) : Math.abs(newTx.amount)
        }
        return newTx
      }),
    )
  }

  const bulkDeleteTransactions = (ids: string[]) => {
    setTransactions((prev) => prev.filter((tx) => !ids.includes(tx.id)))
  }

  return (
    <AgroStoreContext.Provider
      value={{
        transactions,
        importBatches,
        mappingRules,
        addTransaction,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        approveTransaction,
        rejectTransaction,
        addImportBatch,
        undoImportBatch,
        addMappingRule,
        deleteMappingRule,
        applyMappingRules,
        bulkUpdateTransactions,
        bulkDeleteTransactions,
      }}
    >
      {children}
    </AgroStoreContext.Provider>
  )
}

export default function useAgroStore() {
  const context = useContext(AgroStoreContext)
  if (!context) {
    throw new Error('useAgroStore must be used within an AgroProvider')
  }
  return context
}
