import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
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
import { InvoiceCategory } from '@/types'
import useInvoiceStore from '@/stores/useInvoiceStore'
import { useToast } from '@/hooks/use-toast'

interface InvoiceUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoiceUploadModal({ open, onOpenChange }: InvoiceUploadModalProps) {
  const { addInvoice } = useInvoiceStore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    date: '',
    provider: '',
    amount: '',
    category: 'Insumo' as InvoiceCategory,
    fiscalYear: new Date().getFullYear().toString(),
  })
  const [fileName, setFileName] = useState('')

  const handleSave = () => {
    if (!formData.date || !formData.provider || !formData.amount) {
      return toast({
        variant: 'destructive',
        description: 'Preencha todos os campos obrigatórios.',
      })
    }

    addInvoice({
      id: `nf-${Date.now()}`,
      date: formData.date,
      provider: formData.provider,
      amount: parseFloat(formData.amount),
      category: formData.category,
      fiscalYear: parseInt(formData.fiscalYear),
      includedInIr: false,
      fileName: fileName || 'Documento_Físico.pdf',
    })

    toast({ title: 'Nota Fiscal Salva', description: 'O documento foi adicionado ao repositório.' })
    setFormData({
      date: '',
      provider: '',
      amount: '',
      category: 'Insumo',
      fiscalYear: new Date().getFullYear().toString(),
    })
    setFileName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Anexar Nota Fiscal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/10 gap-4">
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
            <Label
              htmlFor="nf-upload"
              className="cursor-pointer text-sm font-medium text-primary hover:underline"
            >
              {fileName || 'Selecionar PDF/XML'}
              <Input
                id="nf-upload"
                type="file"
                accept=".pdf,.xml,.jpg,.png"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              />
            </Label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Emissão</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Total</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fornecedor / Razão Social</Label>
            <Input
              placeholder="Ex: AgroSul Ltda"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as InvoiceCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Insumo">Insumo</SelectItem>
                  <SelectItem value="Maquinário">Maquinário</SelectItem>
                  <SelectItem value="Serviço">Serviço</SelectItem>
                  <SelectItem value="Venda">Venda</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ano Fiscal</Label>
              <Select
                value={formData.fiscalYear}
                onValueChange={(v) => setFormData({ ...formData, fiscalYear: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Documento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
