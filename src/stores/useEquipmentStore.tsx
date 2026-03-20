import React, { createContext, useContext, useState } from 'react'
import { Equipment } from '@/types'

interface EquipmentStoreContextType {
  equipments: Equipment[]
  addEquipment: (eq: Equipment) => void
  updateEquipment: (eq: Equipment) => void
  deleteEquipment: (id: string) => void
}

const initialEquipments: Equipment[] = [
  {
    id: 'eq1',
    name: 'Trator John Deere 8R',
    type: 'Máquina',
    identifier: 'JD-2023-A1',
    brand: 'John Deere',
    acquisitionDate: '2023-01-15',
    acquisitionValue: 850000,
  },
  {
    id: 'eq2',
    name: 'Caminhonete Hilux',
    type: 'Veículo',
    identifier: 'ABC-1234',
    brand: 'Toyota',
    acquisitionDate: '2022-05-10',
    acquisitionValue: 250000,
  },
  {
    id: 'eq3',
    name: 'Plantadeira 15 Linhas',
    type: 'Implemento',
    identifier: 'PL-5590',
    brand: 'Stara',
    acquisitionDate: '2021-08-20',
    acquisitionValue: 120000,
  },
]

const EquipmentStoreContext = createContext<EquipmentStoreContextType | undefined>(undefined)

export function EquipmentProvider({ children }: { children: React.ReactNode }) {
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments)

  const addEquipment = (eq: Equipment) => {
    setEquipments((prev) => [...prev, eq])
  }

  const updateEquipment = (updatedEq: Equipment) => {
    setEquipments((prev) => prev.map((eq) => (eq.id === updatedEq.id ? updatedEq : eq)))
  }

  const deleteEquipment = (id: string) => {
    setEquipments((prev) => prev.filter((eq) => eq.id !== id))
  }

  return (
    <EquipmentStoreContext.Provider
      value={{ equipments, addEquipment, updateEquipment, deleteEquipment }}
    >
      {children}
    </EquipmentStoreContext.Provider>
  )
}

export default function useEquipmentStore() {
  const context = useContext(EquipmentStoreContext)
  if (!context) {
    throw new Error('useEquipmentStore must be used within an EquipmentProvider')
  }
  return context
}
