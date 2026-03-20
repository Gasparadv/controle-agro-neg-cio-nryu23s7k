import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Transaction } from '@/types'
import { useToast } from '@/hooks/use-toast'
import useEquipmentStore from '@/stores/useEquipmentStore'
import { AttachmentUpload } from './AttachmentUpload'

interface TransactionSheetProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (tx: Transaction) => void
}

export function TransactionSheet({
  transaction,
  open,
  onOpenChange,
  onSave,
}: TransactionSheetProps) {
  const [formData, setFormData] = useState<Transaction | null>(null)
  const { equipments } = useEquipmentStore()
  const { toast } = useToast()

  useEffect(() => {
    if (transaction) {
      setFormData(transaction)
    }
  }, [transaction])

  if (!formData) return null

  const handleSave = () => {
    let finalAmt = Math.abs(formData.amount)
    if (formData.type === 'despesa') {
      finalAmt = -finalAmt
    }

    const payload = { ...formData, amount: finalAmt }
    if (payload.equipmentId === 'none') {
      payload.equipmentId = undefined
    }

    onSave(payload)
    onOpenChange(false)
    toast({
      title: 'Transação Atualizada',
      description: 'Os dados foram salvos com sucesso.',
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar Lançamento</SheetTitle>
          <SheetDescription>
            Categorize e adicione comentários ou vínculos importantes para este registro financeiro.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input disabled value={formData.description} className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Lançamento</Label>
            <Select
              value={formData.type}
              onValueChange={(val: any) => setFormData({ ...formData, type: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita (+)</SelectItem>
                <SelectItem value="despesa">Despesa (-)</SelectItem>
                <SelectItem value="indefinido">Não Definido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(val) => setFormData({ ...formData, category: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Insumos">Insumos</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Peças">Peças</SelectItem>
                <SelectItem value="Combustível">Combustível</SelectItem>
                <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                <SelectItem value="Retirada de Sócios">Retirada de Sócios</SelectItem>
                <SelectItem value="Venda">Venda (Receita)</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Equipamento / Veículo</Label>
            <Select
              value={formData.equipmentId || 'none'}
              onValueChange={(val: any) => setFormData({ ...formData, equipmentId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vincular a um equipamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {equipments.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cultura Relacionada</Label>
            <Select
              value={formData.crop}
              onValueChange={(val: any) => setFormData({ ...formData, crop: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a cultura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Soja">Soja</SelectItem>
                <SelectItem value="Milho">Milho</SelectItem>
                <SelectItem value="Cana">Cana de Açúcar</SelectItem>
                <SelectItem value="Geral">Geral / Não se aplica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <AttachmentUpload
            attachment={formData.attachment}
            attachmentName={formData.attachmentName}
            attachmentType={formData.attachmentType}
            onChange={(att, name, type) =>
              setFormData({
                ...formData,
                attachment: att,
                attachmentName: name,
                attachmentType: type,
              })
            }
          />

          <div className="space-y-2">
            <Label>Comentários</Label>
            <Textarea
              className="min-h-[100px]"
              placeholder="Ex: Referente ao talhão norte, nota fiscal #1234"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            />
          </div>
        </div>
        <SheetFooter>
          <Button onClick={handleSave} className="w-full">
            Salvar Alterações
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
