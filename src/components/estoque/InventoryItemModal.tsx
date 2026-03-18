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
import { InventoryItem, InventoryType, InventoryUnit } from '@/types'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'

interface InventoryItemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  itemToEdit?: InventoryItem | null
}

export function InventoryItemModal({ open, onOpenChange, itemToEdit }: InventoryItemModalProps) {
  const { addItem, updateItem } = useInventoryStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    type: 'Semente',
    quantity: 0,
    unit: 'kg',
    minStock: 0,
  })

  useEffect(() => {
    if (itemToEdit) setFormData(itemToEdit)
    else setFormData({ name: '', type: 'Semente', quantity: 0, unit: 'kg', minStock: 0 })
  }, [itemToEdit, open])

  const handleSave = () => {
    if (!formData.name) return toast({ variant: 'destructive', description: 'Nome obrigatório' })

    if (itemToEdit && formData.id) {
      updateItem(formData as InventoryItem)
      toast({ description: 'Insumo atualizado com sucesso.' })
    } else {
      addItem({ ...formData, id: `inv-${Date.now()}` } as InventoryItem)
      toast({ description: 'Insumo cadastrado com sucesso.' })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? 'Editar Insumo' : 'Novo Insumo'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Nome do Insumo</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as InventoryType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semente">Semente</SelectItem>
                  <SelectItem value="Fertilizante">Fertilizante</SelectItem>
                  <SelectItem value="Defensivo">Defensivo</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select
                value={formData.unit}
                onValueChange={(v) => setFormData({ ...formData, unit: v as InventoryUnit })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Quilos (kg)</SelectItem>
                  <SelectItem value="sc">Sacas (sc)</SelectItem>
                  <SelectItem value="L">Litros (L)</SelectItem>
                  <SelectItem value="un">Unidade (un)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantidade Inicial</Label>
              <Input
                type="number"
                value={formData.quantity}
                disabled={!!itemToEdit}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estoque Mínimo</Label>
              <Input
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
              />
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
