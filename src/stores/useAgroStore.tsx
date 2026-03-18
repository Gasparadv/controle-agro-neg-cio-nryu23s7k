import React, { createContext, useContext, useState } from 'react'
import { Transaction } from '@/types'

interface AgroStoreContextType {
  transactions: Transaction[]
  addTransaction: (tx: Transaction) => void
  addTransactions: (txs: Transaction[]) => void
  updateTransaction: (tx: Transaction) => void
  approveTransaction: (id: string) => void
  rejectTransaction: (id: string, reason: string) => void
}

const initialTransactions: Transaction[] = [
  {
    id: '1',
    date: '2023-10-01',
    description: 'Sementes de Soja XPTO',
    amount: 45000,
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
    amount: 32000,
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
    amount: 8500,
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
    amount: 12000,
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
    amount: 1500,
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
    amount: 800,
    type: 'despesa',
    category: 'Manutenção',
    comments: 'Materiais sem nota fiscal completa',
    crop: 'Geral',
    status: 'rejected',
    collaboratorName: 'Carlos Assistente',
    rejectionReason: 'Faltou anexar a nota fiscal da compra.',
  },
]

const AgroStoreContext = createContext<AgroStoreContextType | undefined>(undefined)

export function AgroProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev])
  }

  const addTransactions = (txs: Transaction[]) => {
    setTransactions((prev) => [...txs, ...prev])
  }

  const updateTransaction = (tx: Transaction) => {
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)))
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

  return (
    <AgroStoreContext.Provider
      value={{
        transactions,
        addTransaction,
        addTransactions,
        updateTransaction,
        approveTransaction,
        rejectTransaction,
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
