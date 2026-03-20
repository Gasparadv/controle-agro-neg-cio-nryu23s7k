import React, { createContext, useContext, useState, useEffect } from 'react'
import { Equipment } from '@/types'
import { fetchFromPB, saveToPB, deleteFromPB } from '@/lib/api'

interface EquipmentStoreContextType {
  equipments: Equipment[]
  isLoading: boolean
  addEquipment: (eq: Equipment) => void
  updateEquipment: (eq: Equipment) => void
  deleteEquipment: (id: string) => void
}

const EquipmentStoreContext = createContext<EquipmentStoreContextType | undefined>(undefined)

export function EquipmentProvider({ children }: { children: React.ReactNode }) {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const eq = await fetchFromPB('equipments')
      setEquipments(eq || [])
      setIsLoading(false)
    }
    loadData()
  }, [])

  const addEquipment = async (eq: Equipment) => {
    setEquipments((prev) => [...prev, eq])
    const saved = await saveToPB('equipments', eq)
    setEquipments((prev) => prev.map((e) => (e.id === eq.id ? saved : e)))
  }

  const updateEquipment = async (updatedEq: Equipment) => {
    setEquipments((prev) => prev.map((eq) => (eq.id === updatedEq.id ? updatedEq : eq)))
    const saved = await saveToPB('equipments', updatedEq)
    setEquipments((prev) => prev.map((eq) => (eq.id === updatedEq.id ? saved : eq)))
  }

  const deleteEquipment = async (id: string) => {
    setEquipments((prev) => prev.filter((eq) => eq.id !== id))
    await deleteFromPB('equipments', id)
  }

  return (
    <EquipmentStoreContext.Provider
      value={{ equipments, isLoading, addEquipment, updateEquipment, deleteEquipment }}
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
