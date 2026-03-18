import React, { createContext, useContext, useState } from 'react'
import { Transaction } from '@/types'

interface AgroStoreContextType {
  transactions: Transaction[]
  addTransaction: (tx: Transaction) => void
  updateTransaction: (tx: Transaction) => void
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
  },
  {
    id: '5',
    date: '2023-08-05',
    description: 'Adiantamento Cana',
    amount: 80000,
    type: 'receita',
    category: 'Venda',
    comments: 'Usina',
    crop: 'Cana',
  },
  {
    id: '6',
    date: '2023-11-20',
    description: 'Mão de Obra Colheita',
    amount: 12000,
    type: 'despesa',
    category: 'Mão de Obra',
    comments: 'Equipe terceirizada',
    crop: 'Milho',
  },
]

const AgroStoreContext = createContext<AgroStoreContextType | undefined>(undefined)

export function AgroProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const addTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev])
  }

  const updateTransaction = (tx: Transaction) => {
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)))
  }

  return (
    <AgroStoreContext.Provider value={{ transactions, addTransaction, updateTransaction }}>
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
