import { useState } from 'react'
import { UploadCloud, CheckCircle2, ArrowRight } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import useAgroStore from '@/stores/useAgroStore'
import { Transaction } from '@/types'

interface CsvImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CsvImportModal({ open, onOpenChange }: CsvImportModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [mapping, setMapping] = useState({ date: '0', desc: '1', amount: '2', cat: '3' })
  const { addTransactions } = useAgroStore()
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const rows = text.split('\n').map((row) => row.split(',').map((cell) => cell.trim()))
      if (rows.length > 1) {
        setCsvData(rows)
        setStep(2)
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: 'Arquivo CSV inválido.' })
      }
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    try {
      const newTransactions: Transaction[] = csvData
        .slice(1)
        .map((row, index) => {
          if (!row[0]) return null
          return {
            id: `import-${Date.now()}-${index}`,
            date: row[parseInt(mapping.date)] || new Date().toISOString().split('T')[0],
            description: row[parseInt(mapping.desc)] || 'Importado',
            amount: Math.abs(parseFloat(row[parseInt(mapping.amount)]) || 0),
            type: (parseFloat(row[parseInt(mapping.amount)]) || 0) < 0 ? 'despesa' : 'receita',
            category: row[parseInt(mapping.cat)] || 'Outros',
            comments: 'Importado via CSV',
            crop: 'Geral',
          }
        })
        .filter(Boolean) as Transaction[]

      addTransactions(newTransactions)
      toast({ title: 'Sucesso', description: `${newTransactions.length} lançamentos importados.` })
      handleClose()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro na importação',
        description: 'Verifique o mapeamento das colunas.',
      })
    }
  }

  const handleClose = () => {
    setStep(1)
    setCsvData([])
    onOpenChange(false)
  }

  const columns = csvData[0] || []

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Extrato Bancário</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Selecione um arquivo CSV para importar.'
              : 'Mapeie as colunas do seu arquivo.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/10 gap-4">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <Label htmlFor="csv-upload" className="cursor-pointer">
              <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm">
                Procurar Arquivo
              </div>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </Label>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            {Object.entries({
              date: 'Data',
              desc: 'Descrição',
              amount: 'Valor',
              cat: 'Categoria',
            }).map(([key, label]) => (
              <div key={key} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">{label}</Label>
                <Select
                  value={(mapping as any)[key]}
                  onValueChange={(val) => setMapping((prev) => ({ ...prev, [key]: val }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col, idx) => (
                      <SelectItem key={idx} value={idx.toString()}>
                        {col || `Coluna ${idx + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {step === 2 && (
            <Button onClick={handleImport} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Confirmar Importação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
