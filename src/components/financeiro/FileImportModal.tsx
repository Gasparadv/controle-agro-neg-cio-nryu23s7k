import { useState, useRef } from 'react'
import { CheckCircle2, ArrowRight, FileSpreadsheet } from 'lucide-react'
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
import { parseAmount, parseDate, readExcelFile, getSheetData, parseCsvFile } from '@/lib/parser'
import * as XLSX from 'xlsx'

export function FileImportModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [fileData, setFileData] = useState<string[][]>([])
  const [fileName, setFileName] = useState('')
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [mapping, setMapping] = useState({ date: '0', desc: '1', amount: '2', cat: '3' })
  const [preview, setPreview] = useState<any[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { addTransactions, addImportBatch } = useAgroStore()
  const { role, userName } = useAuthStore()
  const { toast } = useToast()

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)

    if (file.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const rows = parseCsvFile(ev.target?.result as string)
        if (rows.length > 1) {
          setFileData(rows)
          setStep(3)
        } else
          toast({ variant: 'destructive', title: 'Erro', description: 'CSV vazio ou inválido.' })
      }
      reader.readAsText(file)
    } else if (file.name.match(/\.(xlsx|xls)$/i)) {
      try {
        const wb = await readExcelFile(file)
        if (!wb.SheetNames.length) throw new Error('Empty')
        setWorkbook(wb)
        if (wb.SheetNames.length > 1) {
          setSelectedSheet(wb.SheetNames[0])
          setStep(2)
        } else processSheet(wb, wb.SheetNames[0])
      } catch {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Erro ao ler arquivo. Arquivo corrompido ou protegido por senha.',
        })
      }
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: 'Formato não suportado.' })
    }
  }

  const processSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const rows = getSheetData(wb, sheetName)
    if (rows.length > 1) {
      setFileData(rows)
      setStep(3)
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'A planilha selecionada está vazia ou é inválida.',
      })
      setStep(1)
    }
  }

  const validate = () => {
    let valid = true
    const p = []
    const validRows = fileData.slice(1).filter((r) => r.some((c) => c.trim() !== ''))

    for (let i = 0; i < Math.min(validRows.length, 5); i++) {
      const row = validRows[i]
      const rawAmt = row[parseInt(mapping.amount)]
      const rawDate = row[parseInt(mapping.date)]
      const parsedAmt = parseAmount(rawAmt)

      if (rawAmt && isNaN(parsedAmt)) valid = false
      if (!rawDate || rawDate.length < 4) valid = false

      p.push({
        date: parseDate(rawDate),
        desc: row[parseInt(mapping.desc)] || '',
        amount: parsedAmt,
        cat: row[parseInt(mapping.cat)] || '',
      })
    }

    if (!valid || p.length === 0) {
      return toast({
        variant: 'destructive',
        title: 'Mapeamento Inválido',
        description: 'Verifique se as colunas de Valor (numérico) e Data estão corretas.',
      })
    }
    setPreview(p)
    setStep(4)
  }

  const handleImport = () => {
    const isCollab = role === 'collaborator'
    const batchId = `batch-${Date.now()}`
    const validRows = fileData.slice(1).filter((r) => r.some((c) => c.trim() !== ''))

    const txs: Transaction[] = validRows
      .map((row, i) => {
        const rawDate = row[parseInt(mapping.date)]
        if (!rawDate) return null
        const amt = parseAmount(row[parseInt(mapping.amount)])
        if (isNaN(amt)) return null

        return {
          id: `imp-${Date.now()}-${i}`,
          date: parseDate(rawDate),
          description: row[parseInt(mapping.desc)] || 'Importado',
          amount: Math.abs(amt),
          type: amt < 0 ? 'despesa' : 'receita',
          category: row[parseInt(mapping.cat)] || 'Outros',
          comments: `Arquivo: ${fileName}`,
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
        description: 'Nenhum lançamento válido encontrado.',
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
    setFileData([])
    setFileName('')
    setWorkbook(null)
    setSelectedSheet('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importar Extrato (CSV / Excel)</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Faça o upload do seu arquivo de extrato (.csv, .xlsx, .xls).'}
            {step === 2 && 'O arquivo possui múltiplas abas. Selecione qual deseja importar.'}
            {step === 3 && 'Mapeie as colunas do seu arquivo para os campos do sistema.'}
            {step === 4 && 'Pré-visualização dos dados importados. Confirme se está tudo correto.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10 gap-4 transition-colors hover:bg-muted/30">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            <Label
              htmlFor="file-upload"
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm"
            >
              Procurar Arquivo
            </Label>
            <Input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls"
              className="hidden"
              onChange={handleFile}
            />
            <p className="text-xs text-muted-foreground">Formatos suportados: CSV, XLSX, XLS</p>
          </div>
        )}

        {step === 2 && workbook && (
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <Label>Aba da Planilha</Label>
              <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma aba" />
                </SelectTrigger>
                <SelectContent>
                  {workbook.SheetNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 py-4">
            <div className="bg-muted/50 p-3 rounded-md mb-2">
              <p className="text-sm text-muted-foreground">
                <strong>Arquivo:</strong> {fileName} {selectedSheet && `(Aba: ${selectedSheet})`}
              </p>
            </div>
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
                    {(fileData[0] || []).map((c, i) => (
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

        {step === 4 && (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Cat.</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="truncate max-w-[150px]">{r.desc}</TableCell>
                    <TableCell>{r.cat || '-'}</TableCell>
                    <TableCell className="text-right">
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
            onClick={
              step === 1
                ? handleClose
                : () => {
                    if (step === 3 && workbook && workbook.SheetNames.length > 1) setStep(2)
                    else if (step === 3) setStep(1)
                    else setStep((s) => (s - 1) as any)
                  }
            }
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </Button>
          {step === 2 && (
            <Button onClick={() => processSheet(workbook!, selectedSheet)} className="gap-2">
              Avançar <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {step === 3 && (
            <Button onClick={validate} className="gap-2">
              Avançar <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {step === 4 && (
            <Button onClick={handleImport} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Confirmar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
