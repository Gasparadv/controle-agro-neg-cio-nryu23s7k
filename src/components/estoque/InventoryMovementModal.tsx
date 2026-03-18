import { useState } from 'react'
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
import { InventoryItem } from '@/types'
import useInventoryStore from '@/stores/useInventoryStore'
import { useToast } from '@/hooks/use-toast'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'

interface InventoryMovementModalProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InventoryMovementModal({ item, open, onOpenChange }: InventoryMovementModalProps) {
  const [amount, setAmount] = useState<number>(0)
  const [type, setType] = useState<'in' | 'out'>('out')
  const { recordMovement } = useInventoryStore()
  const { toast } = useToast()

  if (!item) return null

  const handleSave = () => {
    if (amount <= 0) return toast({ variant: 'destructive', description: 'Valor inválido' })
    if (type === 'out' && amount > item.quantity) {
      return toast({ variant: 'destructive', description: 'Estoque insuficiente para esta saída.' })
    }

    recordMovement(item.id, amount, type)
    toast({
      title: 'Movimentação Registrada',
      description: `${amount}${item.unit} ${type === 'in' ? 'adicionados' : 'retirados'}.`,
    })
    setAmount(0)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Movimentação: {item.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex gap-4">
            <Button
              type="button"
              variant={type === 'in' ? 'default' : 'outline'}
              className="w-full gap-2"
              onClick={() => setType('in')}
            >
              <ArrowDownToLine className="h-4 w-4" /> Entrada
            </Button>
            <Button
              type="button"
              variant={type === 'out' ? 'destructive' : 'outline'}
              className="w-full gap-2"
              onClick={() => setType('out')}
            >
              <ArrowUpFromLine className="h-4 w-4" /> Saída
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Quantidade ({item.unit})</Label>
            <Input
              type="number"
              placeholder="0"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <p className="text-xs text-muted-foreground text-right mt-1">
              Estoque atual: {item.quantity}
              {item.unit}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
