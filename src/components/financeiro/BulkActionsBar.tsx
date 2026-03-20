import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Trash2, X } from 'lucide-react'
import { Transaction, TransactionType, CropType } from '@/types'

interface BulkActionsBarProps {
  selectedCount: number
  onUpdate: (updates: Partial<Transaction>) => void
  onDelete: () => void
  onCancel: () => void
}

export function BulkActionsBar({
  selectedCount,
  onUpdate,
  onDelete,
  onCancel,
}: BulkActionsBarProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background/95 backdrop-blur border shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-10 print:hidden">
      <span className="text-sm font-medium whitespace-nowrap">{selectedCount} selecionados</span>

      <div className="h-6 w-px bg-border mx-2" />

      <Select onValueChange={(val: TransactionType) => onUpdate({ type: val })}>
        <SelectTrigger className="w-[120px] h-8 text-xs bg-muted border-none">
          <SelectValue placeholder="Definir Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="receita">Receita (+)</SelectItem>
          <SelectItem value="despesa">Despesa (-)</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(val) => onUpdate({ category: val })}>
        <SelectTrigger className="w-[150px] h-8 text-xs bg-muted border-none">
          <SelectValue placeholder="Definir Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Insumos">Insumos</SelectItem>
          <SelectItem value="Manutenção">Manutenção</SelectItem>
          <SelectItem value="Peças">Peças</SelectItem>
          <SelectItem value="Combustível">Combustível</SelectItem>
          <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
          <SelectItem value="Retirada de Sócios">Retirada de Sócios</SelectItem>
          <SelectItem value="Venda">Venda</SelectItem>
          <SelectItem value="Outros">Outros</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(val: CropType) => onUpdate({ crop: val })}>
        <SelectTrigger className="w-[130px] h-8 text-xs bg-muted border-none">
          <SelectValue placeholder="Definir Cultura" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Soja">Soja</SelectItem>
          <SelectItem value="Milho">Milho</SelectItem>
          <SelectItem value="Cana">Cana</SelectItem>
          <SelectItem value="Geral">Geral</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-6 w-px bg-border mx-2" />

      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
