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
import { Transaction, TransactionType, CropType } from '@/types'
import { formatBRL, formatDate } from '@/lib/format'
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
    imported: number
    duplicates: number
    errors: number
    debits: number
    credits: number
    undefined: number
    debitsAmount: number
    creditsAmount: number
  } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isImporting, setIsImporting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { transactions, addTransactions, addImportBatch, mappingRules } = useAgroStore()
  const { role } = useAuthStore()
  const { toast } = useToast()

  const buildExistingTxMap = () => {
    const map = new Map<string, Transaction>()
    transactions.forEach((tx) => {
      if (tx.fitid) map.set(`fitid:${tx.fitid}`, tx)
      map.set(
        `val:${tx.date}|${Math.abs(tx.amount)}|${tx.type}|${(tx.description || '').toLowerCase()}`,
        tx,
      )
    })
    return map
  }

  const categorizeDescWithRules = (desc: string) => {
    let cat = 'Outros'
    let crop: CropType | 'Geral' = 'Geral'
    let type: TransactionType | '' = ''

    if (!desc || typeof desc !== 'string') return { cat, crop, type }

    const d = desc.toLowerCase()
    if (d.includes('posto') || d.includes('combustível') || d.includes('diesel'))
      cat = 'Combustível'
    else if (
      d.includes('oficina') ||
      d.includes('trator') ||
      d.includes('manutenção') ||
      d.includes('peça')
    )
      cat = 'Manutenção'
    else if (
      d.includes('semente') ||
      d.includes('fertilizante') ||
      d.includes('adubo') ||
      d.includes('defensivo') ||
      d.includes('npk')
    )
      cat = 'Insumos'
    else if (
      d.includes('salário') ||
      d.includes('pagamento') ||
      d.includes('diária') ||
      d.includes('mão de obra')
    )
      cat = 'Mão de Obra'
    else if (
      d.includes('venda') ||
      d.includes('recebimento') ||
      d.includes('safra') ||
      d.includes('soja') ||
      d.includes('milho')
    )
      cat = 'Venda'

    for (const rule of mappingRules) {
      if (d.includes(rule.keyword.toLowerCase())) {
        if (rule.category) cat = rule.category
        if (rule.crop) crop = rule.crop
        if (rule.type) type = rule.type
      }
    }
    return { cat, crop, type }
  }

  const validateAndPreviewOfx = (data: any[]) => {
    if (!data || !Array.isArray(data)) return

    startTransition(() => {
      const p: PreviewRow[] = []
      const existingMap = buildExistingTxMap()

      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (!item) continue

        const dateMatch = (item.rawDate || '').match(/^(\d{4})(\d{2})(\d{2})/)
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

        const desc = item.desc || 'Transação OFX'
        const mapped = categorizeDescWithRules(desc)
        const detectedType = mapped.type || (parsedAmt < 0 ? 'despesa' : 'receita')
        const cat = mapped.cat
        const crop = mapped.crop

        const descLower = typeof desc === 'string' ? desc.toLowerCase() : ''

        const dupByFitid = item.fitid ? existingMap.get(`fitid:${item.fitid}`) : undefined
        const dupByVal = existingMap.get(
          `val:${dateStr}|${Math.abs(parsedAmt)}|${detectedType}|${descLower}`,
        )
        const dupTx = dupByFitid || dupByVal

        const isDup = !isInvalid && !!dupTx
        const duplicateReason = dupTx
          ? `Idêntico a: ${dupTx.description} (${formatDate(dupTx.date)})`
          : undefined

        p.push({
          index: i,
          date: isDateValid ? dateStr : String(item.rawDate || 'Vazio'),
          desc,
          amount: parsedAmt,
          cat,
          crop,
          comments: '',
          type: detectedType,
          isDuplicate: isDup,
          isInvalid,
          errorMsg,
          rawAmt: String(item.rawAmt || ''),
          fitid: item.fitid,
          duplicateReason,
        })
      }

      setPreview(p)
      setStep(3)
    })
  }

  const validateAndPreview = (data: string[][]) => {
    if (!data || !Array.isArray(data)) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Dados inválidos para importação.',
      })
      setStep(1)
      return
    }

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
        const row = data[i]
        if (!row || !Array.isArray(row)) continue

        const rowStr = row.map((c) =>
          c !== undefined && c !== null ? String(c).toLowerCase().trim() : '',
        )

        const hasDateOrVenc = rowStr.some(
          (c) => c && typeof c === 'string' && (c.includes('data') || c.includes('vencimento')),
        )

        if (hasDateOrVenc) {
          const d = rowStr.findIndex(
            (c) =>
              c &&
              typeof c === 'string' &&
              (c === 'data' ||
                c === 'vencimento' ||
                c.includes('data') ||
                c.includes('vencimento')),
          )
          const de = rowStr.findIndex(
            (c) =>
              c &&
              typeof c === 'string' &&
              (c.includes('descri') || c.includes('histórico') || c.includes('historico')),
          )
          const a = rowStr.findIndex(
            (c) =>
              c &&
              typeof c === 'string' &&
              (c.includes('valor') || c.includes('quantia') || c.includes('montante')),
          )
          const t = rowStr.findIndex(
            (c) =>
              c &&
              typeof c === 'string' &&
              (c === 'tipo' ||
                c === 'natureza' ||
                c === 'd/c' ||
                c === 'situação' ||
                c === 'situacao'),
          )
          const cat = rowStr.findIndex(
            (c) =>
              c && typeof c === 'string' && (c.includes('categoria') || c.includes('classifica')),
          )
          const crop = rowStr.findIndex(
            (c) =>
              c &&
              typeof c === 'string' &&
              (c.includes('cultura') || c.includes('safra') || c === 'crop'),
          )
          const cmt = rowStr.findIndex(
            (c) =>
              c &&
              typeof c === 'string' &&
              (c.includes('comentário') || c.includes('comentario') || c.includes('obs')),
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

      const existingMap = buildExistingTxMap()

      for (let i = 0; i < data.length; i++) {
        if (i === headerRowIdx) continue

        const row = data[i]
        if (!row || !Array.isArray(row) || !row.some((c) => c && String(c).trim() !== '')) continue

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

        const rawDateStr = String(rawDate || '').toLowerCase()
        const rawDescStr = String(rawDesc || '').toLowerCase()
        const rawAmtStr = String(rawAmt || '').toLowerCase()

        if (
          i === 0 &&
          headerRowIdx === -1 &&
          (rawDateStr.includes('data') ||
            rawDescStr.includes('descri') ||
            rawAmtStr.includes('valor'))
        ) {
          continue
        }

        const dateStr = parseDate(rawDate)
        const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
        const parsedAmt = parseAmount(rawAmt)
        const hasNumbers = /\d/.test(String(rawAmt || ''))
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

        const desc = String(rawDesc || '').trim()
        const mapped = categorizeDescWithRules(desc)

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
            const hasDebitMarker = row.some((c) => {
              const str = String(c || '')
                .trim()
                .toUpperCase()
              return str && typeof str === 'string' && debitMarkers.includes(str)
            })
            const hasCreditMarker = row.some((c) => {
              const str = String(c || '')
                .trim()
                .toUpperCase()
              return str && typeof str === 'string' && creditMarkers.includes(str)
            })

            if (hasDebitMarker) detectedType = 'despesa'
            else if (hasCreditMarker) detectedType = 'receita'
            else detectedType = mapped.type || 'indefinido'
          }
        }

        const cat = rawCat ? String(rawCat).trim() : mapped.cat

        let vCrop = String(rawCrop || '').toLowerCase()
        let crop = 'Geral'
        if (vCrop && typeof vCrop === 'string' && vCrop.trim() !== '') {
          if (vCrop.includes('soja')) crop = 'Soja'
          else if (vCrop.includes('milho')) crop = 'Milho'
          else if (vCrop.includes('cana')) crop = 'Cana'
        } else {
          crop = mapped.crop
        }

        const descLower = typeof desc === 'string' ? desc.toLowerCase() : ''

        const dupTx =
          detectedType !== ''
            ? existingMap.get(`val:${dateStr}|${Math.abs(parsedAmt)}|${detectedType}|${descLower}`)
            : undefined

        const isDup = !isInvalid && !!dupTx
        const duplicateReason = dupTx
          ? `Idêntico a: ${dupTx.description} (${formatDate(dupTx.date)})`
          : undefined

        p.push({
          index: i,
          date: isDateValid ? dateStr : String(rawDate || 'Vazio'),
          desc,
          amount: parsedAmt,
          cat,
          crop,
          comments: String(rawComment || '').trim(),
          type: detectedType as string,
          isDuplicate: isDup,
          isInvalid,
          errorMsg,
          rawAmt: String(rawAmt || ''),
          duplicateReason,
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

    const lowerName = file.name ? file.name.toLowerCase() : ''

    if (lowerName.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result
        if (typeof content === 'string') {
          const rows = parseCsvFile(content)
          if (rows && rows.length > 0) validateAndPreview(rows)
          else
            toast({ variant: 'destructive', title: 'Erro', description: 'CSV vazio ou inválido.' })
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível ler o CSV.',
          })
        }
      }
      reader.readAsText(file)
    } else if (lowerName.endsWith('.ofx')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result
        if (typeof content === 'string') {
          const ofxData = parseOfxFile(content)
          if (ofxData && ofxData.length > 0) validateAndPreviewOfx(ofxData)
          else
            toast({
              variant: 'destructive',
              title: 'Erro',
              description: 'Arquivo OFX vazio ou inválido. Nenhuma transação (STMTTRN) encontrada.',
            })
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível ler o OFX.',
          })
        }
      }
      reader.readAsText(file)
    } else if (lowerName.match(/\.(xlsx|xls)$/i)) {
      try {
        const wb = await readExcelFile(file)
        if (!wb.SheetNames || !wb.SheetNames.length) throw new Error('Empty')
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
    if (rows && rows.length > 0) {
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

  const handleImport = async () => {
    const validToImport = preview.filter((r) => !r.isDuplicate && !r.isInvalid)
    const duplicatesCount = preview.filter((r) => r.isDuplicate).length
    const errorsCount = preview.filter((r) => r.isInvalid).length

    if (validToImport.some((r) => r.type === '')) {
      toast({
        variant: 'destructive',
        title: 'Atenção',
        description: 'Ocorreu um problema ao identifying o tipo de alguns registros.',
      })
      return
    }

    if (!validToImport.length) {
      toast({
        variant: 'destructive',
        title: 'Aviso',
        description: 'Nenhum lançamento válido para importar. Verifique os erros ou duplicados.',
      })
      handleClose()
      return
    }

    setIsImporting(true)
    // Simulate processing time for UI feedback
    await new Promise((r) => setTimeout(r, 1000))

    const batchId = `batch-${Date.now()}`

    const txs: Transaction[] = validToImport.map((r, i) => {
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
        status: 'pending',
        collaboratorName: undefined,
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
      transactions: txs,
    })

    const debitsTxs = txs.filter((t) => t.type === 'despesa')
    const creditsTxs = txs.filter((t) => t.type === 'receita')
    const undef = txs.filter((t) => t.type === 'indefinido').length

    const debitsAmount = debitsTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const creditsAmount = creditsTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)

    setSummary({
      total: preview.length,
      imported: txs.length,
      duplicates: duplicatesCount,
      errors: errorsCount,
      debits: debitsTxs.length,
      credits: creditsTxs.length,
      undefined: undef,
      debitsAmount,
      creditsAmount,
    })
    setIsImporting(false)
    setStep(4)
  }

  const handleClose = () => {
    setStep(1)
    setFileName('')
    setWorkbook(null)
    setSelectedSheet('')
    setPreview([])
    setSummary(null)
    setIsImporting(false)
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
        const dup = transactions.find(
          (tx) =>
            (r.fitid && tx.fitid === r.fitid) ||
            (tx.date === r.date &&
              Math.abs(tx.amount) === Math.abs(r.amount) &&
              tx.type === r.type &&
              (tx.description || '').toLowerCase() === (r.desc || '').toLowerCase()),
        )
        r.isDuplicate = !!dup
        r.duplicateReason = dup
          ? `Idêntico a: ${dup.description} (${formatDate(dup.date)})`
          : undefined
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
      <DialogContent className="sm:max-w-[850px] overflow-hidden flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Importar Extrato (OFX / CSV / Excel)</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Faça o upload do seu arquivo de extrato (.ofx, .csv, .xlsx, .xls).'}
            {step === 2 && 'O arquivo possui múltiplas abas. Selecione qual deseja importar.'}
            {step === 3 && 'Revise os dados antes de importar. Erros e duplicados serão ignorados.'}
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
            {(isPending || isImporting) && (
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
          <div className="flex flex-col items-center justify-center py-6 gap-2 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-2" />
            <h3 className="text-xl font-semibold">Importação Concluída!</h3>
            <div className="flex flex-col gap-3 mt-4 bg-muted/30 p-6 rounded-lg w-full max-w-md border shadow-sm">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Total de Linhas Lidas</span>
                <span className="font-bold text-lg">{summary.total}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-muted-foreground font-medium">
                  Registros Pendentes Criados
                </span>
                <span className="font-bold text-green-600 dark:text-green-500 text-lg">
                  {summary.imported}
                </span>
              </div>
              {summary.duplicates > 0 && (
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Ignorados (Duplicados)</span>
                  <span className="font-bold text-orange-500">{summary.duplicates}</span>
                </div>
              )}
              {summary.errors > 0 && (
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Ignorados (Erros de Formato)</span>
                  <span className="font-bold text-destructive">{summary.errors}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground text-sm">Total Despesas</span>
                <span className="font-semibold text-destructive text-sm">
                  {formatBRL(summary.debitsAmount)} ({summary.debits} un)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Total Receitas</span>
                <span className="font-semibold text-green-600 dark:text-green-500 text-sm">
                  {formatBRL(summary.creditsAmount)} ({summary.credits} un)
                </span>
              </div>
              {summary.undefined > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-border/50 mt-1">
                  <span className="text-muted-foreground text-sm">Não Definidos (Atenção)</span>
                  <span className="font-bold text-orange-500 text-sm">{summary.undefined}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Os registros foram adicionados com status "Pendente".
              <br />
              Vá em <strong>Histórico</strong> para revisá-los e realizar a sincronização final.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-4">
          {step !== 4 && (
            <Button
              variant="outline"
              disabled={isPending || isImporting}
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
            <div className="flex w-full justify-between items-center">
              <span className="text-xs text-muted-foreground ml-2 hidden sm:block">
                Linhas identificadas com erros ou já existentes serão ignoradas.
              </span>
              <Button
                onClick={handleImport}
                disabled={isPending || isImporting}
                className="gap-2 ml-auto"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isImporting ? 'Processando Lote...' : 'Confirmar Importação'}
              </Button>
            </div>
          )}

          {step === 4 && (
            <Button onClick={handleClose} className="w-full">
              Fechar e Atualizar Lista
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
