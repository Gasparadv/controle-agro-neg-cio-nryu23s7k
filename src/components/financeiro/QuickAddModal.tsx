import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAgroStore from '@/stores/useAgroStore'
import useAuthStore from '@/stores/useAuthStore'
import useEquipmentStore from '@/stores/useEquipmentStore'
import { Transaction, TransactionType, CropType } from '@/types'
import { useToast } from '@/hooks/use-toast'
import { AttachmentUpload } from './AttachmentUpload'

interface QuickAddModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const { addTransaction } = useAgroStore()
  const { role } = useAuthStore()
  const { equipments } = useEquipmentStore()
  const { toast } = useToast()

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('despesa')
  const [category, setCategory] = useState('Outros')
  const [crop, setCrop] = useState<CropType>('Geral')
  const [equipmentId, setEquipmentId] = useState<string>('none')
  const [comments, setComments] = useState('')

  const [attachment, setAttachment] = useState<string | undefined>()
  const [attachmentName, setAttachmentName] = useState<string | undefined>()
  const [attachmentType, setAttachmentType] = useState<string | undefined>()

  const handleSave = () => {
    if (!date || !description || !amount) {
      toast({
        title: 'Erro de Validação',
        description: 'Preencha a data, descrição e o valor.',
        variant: 'destructive',
      })
      return
    }

    let normalized = amount.replace(/\s/g, '')
    if (normalized.includes('.') && normalized.includes(',')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.')
    } else if (normalized.includes(',')) {
      normalized = normalized.replace(',', '.')
    }
    const numAmount = parseFloat(normalized)

    if (isNaN(numAmount)) {
      toast({
        title: 'Valor Inválido',
        description: 'Por favor, insira um valor numérico válido.',
        variant: 'destructive',
      })
      return
    }

    let finalAmt = Math.abs(numAmount)
    if (type === 'despesa') {
      finalAmt = -finalAmt
    }

    const newTx: Transaction = {
      id: `manual-${Date.now()}`,
      date,
      description,
      amount: finalAmt,
      type,
      category,
      crop,
      equipmentId: equipmentId !== 'none' ? equipmentId : undefined,
      comments,
      status: 'approved',
      attachment,
      attachmentName,
      attachmentType,
    }

    addTransaction(newTx)

    toast({
      title: 'Lançamento Adicionado',
      description: 'O registro foi adicionado com sucesso.',
    })

    setDescription('')
    setAmount('')
    setComments('')
    setEquipmentId('none')
    setDate(new Date().toISOString().split('T')[0])
    setAttachment(undefined)
    setAttachmentName(undefined)
    setAttachmentType(undefined)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Lançamento Rápido</DialogTitle>
          <DialogDescription>Insira os dados do lançamento financeiro.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(val: TransactionType) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: Compra de sementes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
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
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cultura (Opcional)</Label>
              <Select value={crop} onValueChange={(val: CropType) => setCrop(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soja">Soja</SelectItem>
                  <SelectItem value="Milho">Milho</SelectItem>
                  <SelectItem value="Cana">Cana</SelectItem>
                  <SelectItem value="Geral">Geral / Não se aplica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipamento/Veículo (Opcional)</Label>
              <Select value={equipmentId} onValueChange={setEquipmentId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {equipments.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name} ({eq.identifier})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <AttachmentUpload
            attachment={attachment}
            attachmentName={attachmentName}
            attachmentType={attachmentType}
            onChange={(att, name, type) => {
              setAttachment(att)
              setAttachmentName(name)
              setAttachmentType(type)
            }}
          />

          <div className="space-y-2">
            <Label>Comentários</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Lançamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
