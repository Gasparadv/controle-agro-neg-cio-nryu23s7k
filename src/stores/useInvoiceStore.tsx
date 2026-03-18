import React, { createContext, useContext, useState } from 'react'
import { Invoice } from '@/types'

interface InvoiceStoreContextType {
  invoices: Invoice[]
  addInvoice: (invoice: Invoice) => void
  toggleIrStatus: (id: string) => void
}

const initialInvoices: Invoice[] = [
  {
    id: '1',
    date: '2023-10-01',
    provider: 'AgroSul Sementes',
    amount: 45000,
    category: 'Insumo',
    fiscalYear: 2023,
    includedInIr: true,
    fileName: 'NF_AgroSul_1029.pdf',
  },
  {
    id: '2',
    date: '2024-01-15',
    provider: 'Mecânica TratorForte',
    amount: 8500,
    category: 'Maquinário',
    fiscalYear: 2024,
    includedInIr: false,
    fileName: 'NF_TratorForte_441.xml',
  },
]

const InvoiceStoreContext = createContext<InvoiceStoreContextType | undefined>(undefined)

export function InvoiceProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)

  const addInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev])
  }

  const toggleIrStatus = (id: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, includedInIr: !inv.includedInIr } : inv)),
    )
  }

  return (
    <InvoiceStoreContext.Provider value={{ invoices, addInvoice, toggleIrStatus }}>
      {children}
    </InvoiceStoreContext.Provider>
  )
}

export default function useInvoiceStore() {
  const context = useContext(InvoiceStoreContext)
  if (!context) {
    throw new Error('useInvoiceStore must be used within an InvoiceProvider')
  }
  return context
}
