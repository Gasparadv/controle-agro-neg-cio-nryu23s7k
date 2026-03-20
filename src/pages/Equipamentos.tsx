import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EquipmentTable } from '@/components/equipamentos/EquipmentTable'
import { EquipmentModal } from '@/components/equipamentos/EquipmentModal'
import useEquipmentStore from '@/stores/useEquipmentStore'
import { Equipment } from '@/types'

export default function Equipamentos() {
  const { equipments } = useEquipmentStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEquipmentForEdit, setSelectedEquipmentForEdit] = useState<Equipment | null>(null)

  const handleAddNew = () => {
    setSelectedEquipmentForEdit(null)
    setIsModalOpen(true)
  }

  const handleEdit = (eq: Equipment) => {
    setSelectedEquipmentForEdit(eq)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Frota e Maquinário</h2>
          <p className="text-muted-foreground text-sm">
            Cadastre e gerencie tratores, veículos e implementos para associar despesas específicas.
          </p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Registrar Equipamento
        </Button>
      </div>

      <EquipmentTable equipments={equipments} onEdit={handleEdit} />

      <EquipmentModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        equipmentToEdit={selectedEquipmentForEdit}
      />
    </div>
  )
}
