import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Equipment, EquipmentType, EquipmentStatus } from '@/types'
import useEquipmentStore from '@/stores/useEquipmentStore'
import { useToast } from '@/hooks/use-toast'

interface EquipmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipmentToEdit?: Equipment | null
}

const initialFormState: Partial<Equipment> = {
  name: '',
  type: 'Máquina',
  identifier: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  status: 'ativo',
  acquisitionDate: '',
  acquisitionValue: 0,
  saleDate: '',
  saleValue: 0,
}

export function EquipmentModal({ open, onOpenChange, equipmentToEdit }: EquipmentModalProps) {
  const { addEquipment, updateEquipment } = useEquipmentStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<Equipment>>(initialFormState)

  useEffect(() => {
    if (equipmentToEdit && open) {
      setFormData(equipmentToEdit)
    } else if (open) {
      setFormData(initialFormState)
    }
  }, [equipmentToEdit, open])

  const handleSave = () => {
    if (!formData.name || !formData.type || !formData.identifier || !formData.acquisitionDate) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome, tipo, identificador e data de aquisição.',
        variant: 'destructive',
      })
      return
    }

    const payload: Equipment = {
      id: formData.id || `eq-${Date.now()}`,
      name: formData.name,
      type: formData.type as EquipmentType,
      identifier: formData.identifier,
      brand: formData.brand || '',
      model: formData.model || '',
      year: formData.year ? Number(formData.year) : undefined,
      status: formData.status || 'ativo',
      acquisitionDate: formData.acquisitionDate,
      acquisitionValue: Number(formData.acquisitionValue) || 0,
      saleDate: formData.saleDate || undefined,
      saleValue: formData.saleValue ? Number(formData.saleValue) : undefined,
    }

    if (equipmentToEdit) {
      updateEquipment(payload)
      toast({ title: 'Equipamento atualizado com sucesso.' })
    } else {
      addEquipment(payload)
      toast({ title: 'Equipamento registrado com sucesso.' })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>
            {equipmentToEdit ? 'Editar Equipamento' : 'Registrar Novo Equipamento'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Nome / Apelido</Label>
              <Input
                placeholder="Ex: Trator MF 4292"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(val: EquipmentType) => setFormData({ ...formData, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Máquina">Máquina</SelectItem>
                  <SelectItem value="Veículo">Veículo</SelectItem>
                  <SelectItem value="Implemento">Implemento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Placa / Chassi / ID</Label>
              <Input
                placeholder="Ex: ABC-1234"
                value={formData.identifier || ''}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(val: EquipmentStatus) => setFormData({ ...formData, status: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  <SelectItem value="vendido">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Input
                placeholder="Ex: Massey Ferguson"
                value={formData.brand || ''}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Input
                placeholder="Ex: 4292"
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Ano</Label>
              <Input
                type="number"
                placeholder="Ex: 2020"
                value={formData.year || ''}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-3">Dados de Aquisição</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Compra</Label>
                <Input
                  type="date"
                  value={formData.acquisitionDate || ''}
                  onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={formData.acquisitionValue || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, acquisitionValue: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              Dados de Venda (Opcional)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Venda</Label>
                <Input
                  type="date"
                  value={formData.saleDate || ''}
                  onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={formData.saleValue || ''}
                  onChange={(e) => setFormData({ ...formData, saleValue: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
