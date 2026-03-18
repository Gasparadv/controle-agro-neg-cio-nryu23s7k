import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InventoryTable } from '@/components/estoque/InventoryTable'
import { InventoryItemModal } from '@/components/estoque/InventoryItemModal'
import { InventoryMovementModal } from '@/components/estoque/InventoryMovementModal'
import useInventoryStore from '@/stores/useInventoryStore'
import { InventoryItem } from '@/types'

export default function Estoque() {
  const { items } = useInventoryStore()

  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null)

  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false)
  const [selectedItemForMovement, setSelectedItemForMovement] = useState<InventoryItem | null>(null)

  const handleAddNew = () => {
    setSelectedItemForEdit(null)
    setIsItemModalOpen(true)
  }

  const handleEdit = (item: InventoryItem) => {
    setSelectedItemForEdit(item)
    setIsItemModalOpen(true)
  }

  const handleMovement = (item: InventoryItem) => {
    setSelectedItemForMovement(item)
    setIsMovementModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Estoque de Insumos</h2>
          <p className="text-muted-foreground text-sm">
            Gerencie sementes, fertilizantes e defensivos.
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Insumo
        </Button>
      </div>

      <InventoryTable items={items} onEdit={handleEdit} onMovement={handleMovement} />

      <InventoryItemModal
        open={isItemModalOpen}
        onOpenChange={setIsItemModalOpen}
        itemToEdit={selectedItemForEdit}
      />

      <InventoryMovementModal
        open={isMovementModalOpen}
        onOpenChange={setIsMovementModalOpen}
        item={selectedItemForMovement}
      />
    </div>
  )
}
