import { useState } from 'react'
import { UploadCloud, CheckCircle2 } from 'lucide-react'
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
import useAuthStore from '@/stores/useAuthStore'
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
  const { role, userName } = useAuthStore()
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      // Simple CSV parsing that handles multiple lines correctly
      const rows = text
        .split('\n')
        .filter((r) => r.trim().length > 0)
        .map((row) => row.split(',').map((cell) => cell.trim()))
      if (rows.length > 1) {
        setCsvData(rows)
        setStep(2)
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Arquivo CSV inválido ou vazio.',
        })
      }
    }
    reader.readAsText(file)
  }

  const handleImport = () => {
    try {
      const isCollaborator = role === 'collaborator'

      const newTransactions: Transaction[] = csvData
        .slice(1)
        .map((row, index) => {
          if (!row[0]) return null

          // Basic date fallback and format handling
          let parsedDate = row[parseInt(mapping.date)]
          if (!parsedDate || parsedDate.length < 4) {
            parsedDate = new Date().toISOString().split('T')[0]
          }

          const rawAmount = parseFloat(row[parseInt(mapping.amount)]) || 0

          return {
            id: `import-${Date.now()}-${index}`,
            date: parsedDate,
            description: row[parseInt(mapping.desc)] || 'Importado',
            amount: Math.abs(rawAmount),
            type: rawAmount < 0 ? 'despesa' : 'receita',
            category: row[parseInt(mapping.cat)] || 'Outros',
            comments: 'Importado via arquivo de histórico',
            crop: 'Geral',
            status: isCollaborator ? 'pending' : 'approved',
            collaboratorName: isCollaborator ? userName : undefined,
          }
        })
        .filter(Boolean) as Transaction[]

      addTransactions(newTransactions)

      toast({
        title: 'Sucesso',
        description: `${newTransactions.length} lançamentos importados. ${isCollaborator ? 'Enviados para aprovação.' : ''}`,
      })

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
          <DialogTitle>Importar Histórico (Excel/CSV)</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Faça o upload de até 3 anos de histórico para alimentar a base de dados. Arquivos suportados: .csv.'
              : 'Mapeie as colunas do seu arquivo para os campos do sistema.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/10 gap-4">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-center text-muted-foreground px-4">
              O sistema processará os dados históricos automaticamente e atualizará seus relatórios.
            </p>
            <Label htmlFor="csv-upload" className="cursor-pointer mt-2">
              <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm">
                Procurar Arquivo CSV
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
            <div className="bg-muted p-3 rounded-md text-xs mb-2">
              <span className="font-semibold">Dica:</span> Selecione as colunas corretas. Os valores
              negativos serão importados como despesas.
            </div>
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
              <CheckCircle2 className="h-4 w-4" />
              {role === 'collaborator' ? 'Enviar para Aprovação' : 'Confirmar Importação'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
