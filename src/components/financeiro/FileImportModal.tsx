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
import { useToast } from '@/hooks/use-toast'
import useAgroStore from '@/stores/useAgroStore'
import useAuthStore from '@/stores/useAuthStore'
import { Transaction } from '@/types'
import { parseAmount, parseDate, readExcelFile, getSheetData, parseCsvFile } from '@/lib/parser'
import * as XLSX from 'xlsx'
import { ImportPreviewTable, PreviewRow } from './ImportPreviewTable'

export function FileImportModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [fileName, setFileName] = useState('')
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [preview, setPreview] = useState<PreviewRow[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { transactions, addTransactions, addImportBatch } = useAgroStore()
  const { role, userName } = useAuthStore()
  const { toast } = useToast()

  const validateAndPreview = (data: string[][]) => {
    const p: PreviewRow[] = []

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      if (!row || !row.some((c) => c && c.trim() !== '')) continue

      const rawDate = row[0]
      const rawDesc = row[2] || ''
      const rawAmt = row[4]

      if (i === 0 && String(rawDate).toLowerCase().includes('data')) continue

      const dateStr = parseDate(rawDate)
      const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      const parsedAmt = parseAmount(rawAmt)
      const isAmtValid = Boolean(rawAmt) && (parsedAmt !== 0 || String(rawAmt).includes('0'))

      let isInvalid = false
      let errorMsg = ''

      if (!isDateValid && !isAmtValid) {
        isInvalid = true
        errorMsg = 'Data e Valor inválidos'
      } else if (!isDateValid) {
        isInvalid = true
        errorMsg = 'Data inválida'
      } else if (!isAmtValid) {
        isInvalid = true
        errorMsg = 'Valor inválido'
      }

      let detectedType: 'receita' | 'despesa' | '' = ''
      if (parsedAmt < 0) {
        detectedType = 'despesa'
      } else {
        const hasDebitMarker = row.some((c) => {
          const s = String(c || '')
            .trim()
            .toUpperCase()
          return s === 'D' || s === 'DEBITO' || s === 'DÉBITO'
        })
        const hasCreditMarker = row.some((c) => {
          const s = String(c || '')
            .trim()
            .toUpperCase()
          return s === 'C' || s === 'CREDITO' || s === 'CRÉDITO'
        })
        if (hasDebitMarker) detectedType = 'despesa'
        else if (hasCreditMarker) detectedType = 'receita'
      }

      const desc = String(rawDesc).trim()
      let cat = ''

      const d = desc.toLowerCase()
      if (d.includes('posto') || d.includes('combustível') || d.includes('diesel')) {
        cat = 'Combustível'
      } else if (
        d.includes('oficina') ||
        d.includes('trator') ||
        d.includes('manutenção') ||
        d.includes('peça')
      ) {
        cat = 'Manutenção'
      } else if (
        d.includes('semente') ||
        d.includes('fertilizante') ||
        d.includes('adubo') ||
        d.includes('defensivo') ||
        d.includes('npk') ||
        d.includes('veneno')
      ) {
        cat = 'Insumos'
      } else if (
        d.includes('salário') ||
        d.includes('pagamento') ||
        d.includes('diária') ||
        d.includes('mão de obra') ||
        d.includes('acerto')
      ) {
        cat = 'Mão de Obra'
      } else if (
        d.includes('venda') ||
        d.includes('recebimento') ||
        d.includes('safra') ||
        d.includes('soja') ||
        d.includes('milho')
      ) {
        cat = 'Venda'
      } else {
        cat = 'Outros'
      }

      const isDup =
        !isInvalid &&
        detectedType !== '' &&
        transactions.some(
          (tx) =>
            tx.date === dateStr &&
            tx.amount === Math.abs(parsedAmt) &&
            tx.type === detectedType &&
            tx.description === desc,
        )

      p.push({
        index: i,
        date: isDateValid ? dateStr : String(rawDate || 'Vazio'),
        desc,
        amount: parsedAmt,
        cat,
        type: detectedType,
        isDuplicate: isDup,
        isInvalid,
        errorMsg,
        rawAmt: String(rawAmt || ''),
      })
    }

    if (p.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Formato Inválido',
        description: 'O arquivo não contém dados a serem importados nas colunas corretas.',
      })
      setStep(1)
      return
    }

    setPreview(p)
    setStep(3)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)

    if (file.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const rows = parseCsvFile(ev.target?.result as string)
        if (rows.length > 0) validateAndPreview(rows)
        else toast({ variant: 'destructive', title: 'Erro', description: 'CSV vazio ou inválido.' })
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
    if (rows.length > 0) {
      validateAndPreview(rows)
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'A planilha selecionada está vazia ou é inválida.',
      })
      setStep(1)
    }
  }

  const handleImport = () => {
    const isCollab = role === 'collaborator'
    const batchId = `batch-${Date.now()}`

    const validToImport = preview.filter((r) => !r.isDuplicate && !r.isInvalid)

    if (validToImport.some((r) => r.type === '')) {
      toast({
        variant: 'destructive',
        title: 'Atenção',
        description:
          'Existem lançamentos sem tipo definido (Débito/Crédito). Por favor, classifique-os antes de importar.',
      })
      return
    }

    if (!validToImport.length) {
      toast({
        variant: 'destructive',
        title: 'Aviso',
        description: 'Nenhum lançamento válido para importar.',
      })
      handleClose()
      return
    }

    const txs: Transaction[] = validToImport.map((r, i) => {
      return {
        id: `imp-${Date.now()}-${i}`,
        date: r.date,
        description: r.desc || 'Importado',
        amount: Math.abs(r.amount),
        type: r.type as 'receita' | 'despesa',
        category: r.cat || 'Outros',
        comments: `Arquivo: ${fileName}`,
        crop: 'Geral',
        status: isCollab ? 'pending' : 'approved',
        collaboratorName: isCollab ? userName : undefined,
        importBatchId: batchId,
      }
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
    setFileName('')
    setWorkbook(null)
    setSelectedSheet('')
    setPreview([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    onOpenChange(false)
  }

  const handleCategoryChange = (index: number, newCat: string) => {
    setPreview((prev) => {
      const copy = [...prev]
      copy[index].cat = newCat
      return copy
    })
  }

  const handleTypeChange = (index: number, newType: 'receita' | 'despesa') => {
    setPreview((prev) => {
      const copy = [...prev]
      copy[index].type = newType

      const r = copy[index]
      if (!r.isInvalid) {
        r.isDuplicate = transactions.some(
          (tx) =>
            tx.date === r.date &&
            tx.amount === Math.abs(r.amount) &&
            tx.type === r.type &&
            tx.description === r.desc,
        )
      }
      return copy
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[750px] overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Importar Extrato (CSV / Excel)</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Faça o upload do seu arquivo de extrato (.csv, .xlsx, .xls).'}
            {step === 2 && 'O arquivo possui múltiplas abas. Selecione qual deseja importar.'}
            {step === 3 &&
              'Pré-visualização dos dados importados. Você pode alterar o tipo e as categorias antes de confirmar.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10 gap-4 transition-colors hover:bg-muted/30 my-4">
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
          <div className="flex-1 mt-4">
            <ImportPreviewTable
              preview={preview}
              onCategoryChange={handleCategoryChange}
              onTypeChange={handleTypeChange}
            />
          </div>
        )}

        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={
              step === 1
                ? handleClose
                : step === 3 && workbook && workbook.SheetNames.length > 1
                  ? () => setStep(2)
                  : () => setStep(1)
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
            <Button onClick={handleImport} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Confirmar Importação
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
