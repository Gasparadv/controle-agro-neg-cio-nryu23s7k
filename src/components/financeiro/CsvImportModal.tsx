import { useState } from 'react'
import { UploadCloud, CheckCircle2, ArrowRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import useAgroStore from '@/stores/useAgroStore'
import useAuthStore from '@/stores/useAuthStore'
import { Transaction } from '@/types'
import { formatBRL } from '@/lib/format'

export function CsvImportModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [csvData, setCsvData] = useState<string[][]>([])
  const [fileName, setFileName] = useState('')
  const [mapping, setMapping] = useState({ date: '0', desc: '1', amount: '2', cat: '3' })
  const [preview, setPreview] = useState<any[]>([])

  const { addTransactions, addImportBatch } = useAgroStore()
  const { role, userName } = useAuthStore()
  const { toast } = useToast()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const rows = (ev.target?.result as string)
        .split('\n')
        .filter((r) => r.trim())
        .map((r) => r.split(',').map((c) => c.trim().replace(/^"|"$/g, '')))
      if (rows.length > 1) {
        setCsvData(rows)
        setStep(2)
      } else toast({ variant: 'destructive', title: 'Erro', description: 'CSV vazio ou inválido.' })
    }
    reader.readAsText(file)
  }

  const validate = () => {
    let valid = true
    const p = []
    for (let i = 1; i < csvData.length; i++) {
      const row = csvData[i]
      if (!row || !row.length) continue
      const rawAmt = row[parseInt(mapping.amount)]
      const rawDate = row[parseInt(mapping.date)]
      if (i <= 5) {
        if (!rawAmt || isNaN(parseFloat(rawAmt.replace(',', '.')))) valid = false
        if (!rawDate || rawDate.length < 4) valid = false
        p.push({
          date: rawDate,
          desc: row[parseInt(mapping.desc)],
          amount: parseFloat(rawAmt?.replace(',', '.') || '0'),
          cat: row[parseInt(mapping.cat)],
        })
      }
    }
    if (!valid)
      return toast({
        variant: 'destructive',
        title: 'Mapeamento Inválido',
        description: 'Coluna de Valor não numérica ou Data inválida.',
      })
    setPreview(p)
    setStep(3)
  }

  const handleImport = () => {
    const isCollab = role === 'collaborator'
    const batchId = `batch-${Date.now()}`
    const txs: Transaction[] = csvData
      .slice(1)
      .map((row, i) => {
        if (!row || !row[parseInt(mapping.date)]) return null
        let d = row[parseInt(mapping.date)]
        if (!d || d.length < 4) d = new Date().toISOString().split('T')[0]
        else if (d.includes('/')) {
          const p = d.split('/')
          if (p.length === 3) d = `${p[2]}-${p[1]}-${p[0]}`
        }
        const amt = parseFloat(row[parseInt(mapping.amount)]?.replace(',', '.') || '0') || 0
        return {
          id: `imp-${Date.now()}-${i}`,
          date: d,
          description: row[parseInt(mapping.desc)] || 'Importado',
          amount: Math.abs(amt),
          type: amt < 0 ? 'despesa' : 'receita',
          category: row[parseInt(mapping.cat)] || 'Outros',
          comments: 'Importado em lote',
          crop: 'Geral',
          status: isCollab ? 'pending' : 'approved',
          collaboratorName: isCollab ? userName : undefined,
          importBatchId: batchId,
        }
      })
      .filter(Boolean) as Transaction[]
    if (!txs.length)
      return toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Nenhum lançamento válido.',
      })
    addTransactions(txs)
    addImportBatch({
      id: batchId,
      date: new Date().toISOString(),
      fileName,
      recordCount: txs.length,
    })
    toast({ title: 'Sucesso', description: `${txs.length} registros importados com sucesso.` })
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setCsvData([])
    setFileName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importar Extrato (CSV)</DialogTitle>
          <DialogDescription>
            {step === 1
              ? 'Faça o upload do seu arquivo de extrato.'
              : step === 2
                ? 'Mapeie as colunas do seu arquivo para os campos do sistema.'
                : 'Pré-visualização dos dados importados. Confirme se está tudo correto.'}
          </DialogDescription>
        </DialogHeader>
        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10 gap-4">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <Label
              htmlFor="csv-upload"
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm"
            >
              Procurar Arquivo CSV
            </Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-4 py-4">
            {Object.entries({
              date: 'Data',
              desc: 'Descrição',
              amount: 'Valor',
              cat: 'Categoria',
            }).map(([k, l]) => (
              <div key={k} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right text-sm">{l}</Label>
                <Select
                  value={(mapping as any)[k]}
                  onValueChange={(v) => setMapping((p) => ({ ...p, [k]: v }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    {(csvData[0] || []).map((c, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {c || `Coluna ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        )}
        {step === 3 && (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="truncate max-w-[150px]">{r.desc}</TableCell>
                    <TableCell>{r.cat}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <span className={r.amount > 0 ? 'text-primary' : 'text-destructive'}>
                        {formatBRL(Math.abs(r.amount))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={step === 1 ? handleClose : () => setStep((s) => (s - 1) as any)}
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>
          {step === 2 && (
            <Button onClick={validate} className="gap-2">
              Avançar <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {step === 3 && (
            <Button onClick={handleImport} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Confirmar Importação
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
