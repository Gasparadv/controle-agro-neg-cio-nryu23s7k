import { useState, useRef, useTransition } from 'react'
import { CheckCircle2, ArrowRight, FileSpreadsheet, Loader2 } from 'lucide-react'
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
import { Transaction, TransactionType } from '@/types'
import {
  parseAmount,
  parseDate,
  readExcelFile,
  getSheetData,
  parseCsvFile,
  parseOfxFile,
} from '@/lib/parser'
import * as XLSX from 'xlsx'
import { ImportPreviewTable, PreviewRow } from './ImportPreviewTable'

export function FileImportModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [fileName, setFileName] = useState('')
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [selectedSheet, setSelectedSheet] = useState<string>('')
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [summary, setSummary] = useState<{
    total: number
    debits: number
    credits: number
    undefined: number
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { transactions, addTransactions, addImportBatch } = useAgroStore()
  const { role, userName } = useAuthStore()
  const { toast } = useToast()

  const categorizeDesc = (desc: string) => {
    const d = desc.toLowerCase()
    if (d.includes('posto') || d.includes('combustível') || d.includes('diesel'))
      return 'Combustível'
    if (
      d.includes('oficina') ||
      d.includes('trator') ||
      d.includes('manutenção') ||
      d.includes('peça')
    )
      return 'Manutenção'
    if (
      d.includes('semente') ||
      d.includes('fertilizante') ||
      d.includes('adubo') ||
      d.includes('defensivo') ||
      d.includes('npk')
    )
      return 'Insumos'
    if (
      d.includes('salário') ||
      d.includes('pagamento') ||
      d.includes('diária') ||
      d.includes('mão de obra')
    )
      return 'Mão de Obra'
    if (
      d.includes('venda') ||
      d.includes('recebimento') ||
      d.includes('safra') ||
      d.includes('soja') ||
      d.includes('milho')
    )
      return 'Venda'
    return 'Outros'
  }

  const validateAndPreviewOfx = (data: any[]) => {
    startTransition(() => {
      const p: PreviewRow[] = []

      const existingFitids = new Set(transactions.filter((t) => t.fitid).map((t) => t.fitid))
      const existingTxSet = new Set(
        transactions.map(
          (tx) => `${tx.date}|${Math.abs(tx.amount)}|${tx.type}|${tx.description.toLowerCase()}`,
        ),
      )

      for (let i = 0; i < data.length; i++) {
        const item = data[i]

        const dateMatch = item.rawDate.match(/^(\d{4})(\d{2})(\d{2})/)
        let dateStr = ''
        let isDateValid = false
        if (dateMatch) {
          dateStr = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
          isDateValid = true
        }

        const parsedAmt = parseAmount(item.rawAmt)
        const isAmtValid = !isNaN(parsedAmt) && item.rawAmt !== ''

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

        const detectedType = parsedAmt < 0 ? 'despesa' : 'receita'
        const desc = item.desc || 'Transação OFX'
        const cat = categorizeDesc(desc)
        const descLower = desc.toLowerCase()

        const isDup =
          !isInvalid &&
          ((item.fitid && existingFitids.has(item.fitid)) ||
            existingTxSet.has(`${dateStr}|${Math.abs(parsedAmt)}|${detectedType}|${descLower}`))

        p.push({
          index: i,
          date: isDateValid ? dateStr : String(item.rawDate || 'Vazio'),
          desc,
          amount: parsedAmt,
          cat,
          crop: 'Geral',
          comments: '',
          type: detectedType,
          isDuplicate: isDup,
          isInvalid,
          errorMsg,
          rawAmt: String(item.rawAmt || ''),
          fitid: item.fitid,
        })
      }

      setPreview(p)
      setStep(3)
    })
  }

  const validateAndPreview = (data: string[][]) => {
    startTransition(() => {
      const p: PreviewRow[] = []

      let dateIdx = -1
      let descIdx = -1
      let amtIdx = -1
      let typeIdx = -1
      let catIdx = -1
      let cropIdx = -1
      let commentIdx = -1
      let headerRowIdx = -1

      for (let i = 0; i < Math.min(20, data.length); i++) {
        const rowStr = data[i].map((c) => String(c).toLowerCase().trim())
        if (rowStr.some((c) => c.includes('data') || c.includes('vencimento'))) {
          const d = rowStr.findIndex(
            (c) =>
              c === 'data' || c === 'vencimento' || c.includes('data') || c.includes('vencimento'),
          )
          const de = rowStr.findIndex(
            (c) => c.includes('descri') || c.includes('histórico') || c.includes('historico'),
          )
          const a = rowStr.findIndex(
            (c) => c.includes('valor') || c.includes('quantia') || c.includes('montante'),
          )
          const t = rowStr.findIndex(
            (c) =>
              c === 'tipo' ||
              c === 'natureza' ||
              c === 'd/c' ||
              c === 'situação' ||
              c === 'situacao',
          )
          const cat = rowStr.findIndex((c) => c.includes('categoria') || c.includes('classifica'))
          const crop = rowStr.findIndex(
            (c) => c.includes('cultura') || c.includes('safra') || c === 'crop',
          )
          const cmt = rowStr.findIndex(
            (c) => c.includes('comentário') || c.includes('comentario') || c.includes('obs'),
          )

          if (d !== -1 && a !== -1) {
            dateIdx = d
            descIdx = de
            amtIdx = a
            typeIdx = t
            catIdx = cat
            cropIdx = crop
            commentIdx = cmt
            headerRowIdx = i
            break
          }
        }
      }

      if (headerRowIdx === -1) {
        dateIdx = 0
        descIdx = 1
        amtIdx = 2
      }

      const existingTxSet = new Set(
        transactions.map(
          (tx) => `${tx.date}|${Math.abs(tx.amount)}|${tx.type}|${tx.description.toLowerCase()}`,
        ),
      )

      for (let i = 0; i < data.length; i++) {
        if (i === headerRowIdx) continue

        const row = data[i]
        if (!row || !row.some((c) => c && c.trim() !== '')) continue

        const rawDate = dateIdx !== -1 && dateIdx < row.length ? row[dateIdx] : ''
        const rawDesc = descIdx !== -1 && descIdx < row.length ? row[descIdx] : ''
        const rawAmt = amtIdx !== -1 && amtIdx < row.length ? row[amtIdx] : ''
        const rawTypeMarkerF =
          typeIdx !== -1 && typeIdx < row.length
            ? String(row[typeIdx] || '')
                .trim()
                .toUpperCase()
            : ''
        const rawCat = catIdx !== -1 && catIdx < row.length ? row[catIdx] : ''
        const rawCrop = cropIdx !== -1 && cropIdx < row.length ? row[cropIdx] : ''
        const rawComment = commentIdx !== -1 && commentIdx < row.length ? row[commentIdx] : ''

        if (
          i === 0 &&
          headerRowIdx === -1 &&
          (String(rawDate).toLowerCase().includes('data') ||
            String(rawDesc).toLowerCase().includes('descri') ||
            String(rawAmt).toLowerCase().includes('valor'))
        ) {
          continue
        }

        const dateStr = parseDate(rawDate)
        const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
        const parsedAmt = parseAmount(rawAmt)
        const hasNumbers = /\d/.test(String(rawAmt))
        const isAmtValid = Boolean(rawAmt) && hasNumbers && !isNaN(parsedAmt)

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

        let detectedType: TransactionType | '' = ''

        const debitMarkers = ['D', 'DEBITO', 'DÉBITO', 'DEBIT', 'DESPESA', 'SAÍDA', 'SAIDA', '-']
        const creditMarkers = ['C', 'CREDITO', 'CRÉDITO', 'CREDIT', 'RECEITA', 'ENTRADA', '+']

        if (rawTypeMarkerF && debitMarkers.includes(rawTypeMarkerF)) {
          detectedType = 'despesa'
        } else if (rawTypeMarkerF && creditMarkers.includes(rawTypeMarkerF)) {
          detectedType = 'receita'
        } else {
          if (parsedAmt < 0) {
            detectedType = 'despesa'
          } else if (parsedAmt > 0) {
            detectedType = 'receita'
          } else {
            const hasDebitMarker = row.some((c) =>
              debitMarkers.includes(
                String(c || '')
                  .trim()
                  .toUpperCase(),
              ),
            )
            const hasCreditMarker = row.some((c) =>
              creditMarkers.includes(
                String(c || '')
                  .trim()
                  .toUpperCase(),
              ),
            )

            if (hasDebitMarker) detectedType = 'despesa'
            else if (hasCreditMarker) detectedType = 'receita'
            else detectedType = 'indefinido' // Default to undefined if we can't classify
          }
        }

        const desc = String(rawDesc).trim()
        const cat = rawCat ? String(rawCat).trim() : categorizeDesc(desc)

        const vCrop = String(rawCrop).toLowerCase()
        let crop: 'Soja' | 'Milho' | 'Cana' | 'Geral' = 'Geral'
        if (vCrop.includes('soja')) crop = 'Soja'
        else if (vCrop.includes('milho')) crop = 'Milho'
        else if (vCrop.includes('cana')) crop = 'Cana'

        const descLower = desc.toLowerCase()

        const isDup =
          !isInvalid &&
          detectedType !== '' &&
          existingTxSet.has(`${dateStr}|${Math.abs(parsedAmt)}|${detectedType}|${descLower}`)

        p.push({
          index: i,
          date: isDateValid ? dateStr : String(rawDate || 'Vazio'),
          desc,
          amount: parsedAmt,
          cat,
          crop,
          comments: String(rawComment).trim(),
          type: detectedType as string,
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
    })
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)

    const lowerName = file.name.toLowerCase()

    if (lowerName.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const rows = parseCsvFile(ev.target?.result as string)
        if (rows.length > 0) validateAndPreview(rows)
        else toast({ variant: 'destructive', title: 'Erro', description: 'CSV vazio ou inválido.' })
      }
      reader.readAsText(file)
    } else if (lowerName.endsWith('.ofx')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result as string
        const ofxData = parseOfxFile(content)
        if (ofxData.length > 0) validateAndPreviewOfx(ofxData)
        else
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Arquivo OFX vazio ou inválido. Nenhuma transação (STMTTRN) encontrada.',
          })
      }
      reader.readAsText(file)
    } else if (lowerName.match(/\.(xlsx|xls)$/i)) {
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

    // Optional: Keep the user from importing totally blank types. If they are 'indefinido', we allow it.
    if (validToImport.some((r) => r.type === '')) {
      toast({
        variant: 'destructive',
        title: 'Atenção',
        description: 'Ocorreu um problema ao identificar o tipo de alguns registros.',
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
      // If type is despesa or undefined (but negative amount), set it to negative
      let finalAmt = Math.abs(r.amount)
      if (r.type === 'despesa') {
        finalAmt = -finalAmt
      }

      return {
        id: `imp-${Date.now()}-${i}`,
        date: r.date,
        description: r.desc || 'Importado',
        amount: finalAmt,
        type: r.type as TransactionType,
        category: r.cat || 'Outros',
        comments: r.comments || `Arquivo: ${fileName}`,
        crop: (r.crop as any) || 'Geral',
        status: isCollab ? 'pending' : 'approved',
        collaboratorName: isCollab ? userName : undefined,
        importBatchId: batchId,
        fitid: r.fitid,
      }
    })

    addTransactions(txs)
    addImportBatch({
      id: batchId,
      date: new Date().toISOString(),
      fileName,
      recordCount: txs.length,
    })

    const debits = txs.filter((t) => t.type === 'despesa').length
    const credits = txs.filter((t) => t.type === 'receita').length
    const undef = txs.filter((t) => t.type === 'indefinido').length
    setSummary({ total: txs.length, debits, credits, undefined: undef })
    setStep(4)
  }

  const handleClose = () => {
    setStep(1)
    setFileName('')
    setWorkbook(null)
    setSelectedSheet('')
    setPreview([])
    setSummary(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onOpenChange(false)
  }

  const handleCategoryChange = (index: number, newCat: string) => {
    setPreview((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], cat: newCat }
      return copy
    })
  }

  const handleTypeChange = (index: number, newType: 'receita' | 'despesa' | 'indefinido') => {
    setPreview((prev) => {
      const copy = [...prev]
      const r = { ...copy[index], type: newType }

      if (!r.isInvalid) {
        r.isDuplicate = transactions.some(
          (tx) =>
            (r.fitid && tx.fitid === r.fitid) ||
            (tx.date === r.date &&
              tx.amount === (r.type === 'despesa' ? -Math.abs(r.amount) : Math.abs(r.amount)) &&
              tx.type === r.type &&
              tx.description.toLowerCase() === r.desc.toLowerCase()),
        )
      }
      copy[index] = r
      return copy
    })
  }

  const handleCropChange = (index: number, newCrop: string) => {
    setPreview((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], crop: newCrop }
      return copy
    })
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[750px] overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Importar Extrato (OFX / CSV / Excel)</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Faça o upload do seu arquivo de extrato (.ofx, .csv, .xlsx, .xls).'}
            {step === 2 && 'O arquivo possui múltiplas abas. Selecione qual deseja importar.'}
            {step === 3 && 'Confirme as categorizações e salve seus registros.'}
            {step === 4 && 'Resumo do processamento do lote.'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/10 gap-4 transition-colors hover:bg-muted/30 my-4 relative">
            {isPending && (
              <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
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
              accept=".csv, .xlsx, .xls, .ofx"
              className="hidden"
              onChange={handleFile}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Formatos suportados: OFX, CSV, XLSX, XLS
            </p>
          </div>
        )}

        {step === 2 && workbook && (
          <div className="grid gap-4 py-6">
            <div className="space-y-2">
              <Label>Aba da Planilha</Label>
              <Select value={selectedSheet} onValueChange={setSelectedSheet} disabled={isPending}>
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
          <div className="flex-1 mt-4 relative">
            {isPending && (
              <div className="absolute inset-0 bg-background/50 z-20 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            <ImportPreviewTable
              preview={preview}
              onCategoryChange={handleCategoryChange}
              onTypeChange={handleTypeChange as any}
              onCropChange={handleCropChange}
            />
          </div>
        )}

        {step === 4 && summary && (
          <div className="flex flex-col items-center justify-center py-10 gap-4 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="text-xl font-semibold">Importação Concluída!</h3>
            <div className="flex flex-col gap-3 mt-4 bg-muted/30 p-6 rounded-lg w-full max-w-sm">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Total de Registros</span>
                <span className="font-bold text-lg">{summary.total}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Total de Débitos</span>
                <span className="font-bold text-destructive">{summary.debits}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Total de Créditos</span>
                <span className="font-bold text-green-600 dark:text-green-500">
                  {summary.credits}
                </span>
              </div>
              {summary.undefined > 0 && (
                <div className="flex justify-between items-center pb-1">
                  <span className="text-muted-foreground">Não Definidos</span>
                  <span className="font-bold text-orange-500">{summary.undefined}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
          {step !== 4 && (
            <Button
              variant="outline"
              disabled={isPending}
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
          )}

          {step === 2 && (
            <Button
              onClick={() => processSheet(workbook!, selectedSheet)}
              disabled={isPending}
              className="gap-2"
            >
              Avançar <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {step === 3 && (
            <Button onClick={handleImport} disabled={isPending} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Confirmar Importação
            </Button>
          )}

          {step === 4 && (
            <Button onClick={handleClose} className="w-full">
              Fechar Janela
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
