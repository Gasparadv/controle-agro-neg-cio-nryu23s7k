import React, { createContext, useContext, useState } from 'react'
import { InventoryItem } from '@/types'

interface InventoryStoreContextType {
  items: InventoryItem[]
  addItem: (item: InventoryItem) => void
  updateItem: (item: InventoryItem) => void
  recordMovement: (id: string, amount: number, type: 'in' | 'out') => void
}

const initialItems: InventoryItem[] = [
  { id: '1', name: 'Semente Soja XPTO', type: 'Semente', quantity: 150, unit: 'sc', minStock: 50 },
  {
    id: '2',
    name: 'Adubo NPK 10-10-10',
    type: 'Fertilizante',
    quantity: 800,
    unit: 'kg',
    minStock: 1000,
  },
  { id: '3', name: 'Glifosato 480', type: 'Defensivo', quantity: 45, unit: 'L', minStock: 50 },
]

const InventoryStoreContext = createContext<InventoryStoreContextType | undefined>(undefined)

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems)

  const addItem = (item: InventoryItem) => {
    setItems((prev) => [...prev, item])
  }

  const updateItem = (updatedItem: InventoryItem) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
  }

  const recordMovement = (id: string, amount: number, type: 'in' | 'out') => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = type === 'in' ? item.quantity + amount : item.quantity - amount
          return { ...item, quantity: Math.max(0, newQty) }
        }
        return item
      }),
    )
  }

  return (
    <InventoryStoreContext.Provider value={{ items, addItem, updateItem, recordMovement }}>
      {children}
    </InventoryStoreContext.Provider>
  )
}

export default function useInventoryStore() {
  const context = useContext(InventoryStoreContext)
  if (!context) {
    throw new Error('useInventoryStore must be used within an InventoryProvider')
  }
  return context
}
