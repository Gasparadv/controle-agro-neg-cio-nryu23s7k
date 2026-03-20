import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatBRL } from '@/lib/format'
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PreviewRow {
  index: number
  date: string
  desc: string
  amount: number
  cat: string
  crop: string
  comments: string
  type: 'receita' | 'despesa' | ''
  isDuplicate: boolean
  isInvalid?: boolean
  errorMsg?: string
  rawAmt?: string
  fitid?: string
}

interface ImportPreviewTableProps {
  preview: PreviewRow[]
  onCategoryChange: (index: number, newCat: string) => void
  onTypeChange: (index: number, newType: 'receita' | 'despesa') => void
  onCropChange: (index: number, newCrop: string) => void
}

export function ImportPreviewTable({
  preview,
  onCategoryChange,
  onTypeChange,
  onCropChange,
}: ImportPreviewTableProps) {
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  const invalidCount = preview.filter((r) => r.isInvalid).length
  const missingTypeCount = preview.filter(
    (r) => !r.isDuplicate && !r.isInvalid && r.type === '',
  ).length
  const debitCount = preview.filter(
    (r) => r.type === 'despesa' && !r.isInvalid && !r.isDuplicate,
  ).length
  const creditCount = preview.filter(
    (r) => r.type === 'receita' && !r.isInvalid && !r.isDuplicate,
  ).length

  const totalPages = Math.max(1, Math.ceil(preview.length / ITEMS_PER_PAGE))
  const paginatedPreview = preview.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="rounded-md border overflow-hidden flex flex-col h-[400px]">
      <div className="bg-muted p-3 text-xs text-muted-foreground border-b flex flex-col sm:flex-row sm:items-center justify-between font-medium gap-3">
        <div className="flex items-center gap-3">
          <span>Pré-visualização: {preview.length} registros</span>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-red-50/50 text-red-700 border-red-200">
              {debitCount} {debitCount === 1 ? 'Débito' : 'Débitos'}
            </Badge>
            <Badge variant="outline" className="bg-green-50/50 text-green-700 border-green-200">
              {creditCount} {creditCount === 1 ? 'Crédito' : 'Créditos'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-4">
          {missingTypeCount > 0 && (
            <span className="text-destructive font-semibold">
              {missingTypeCount}{' '}
              {missingTypeCount === 1 ? 'registro sem tipo' : 'registros sem tipo'}
            </span>
          )}
          {invalidCount > 0 && (
            <span className="text-destructive font-semibold">
              {invalidCount} {invalidCount === 1 ? 'registro inválido' : 'registros inválidos'}
            </span>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição / Comentário</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria / Cultura</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPreview.map((r, localIdx) => {
              const actualIdx = (page - 1) * ITEMS_PER_PAGE + localIdx
              return (
                <TableRow
                  key={actualIdx}
                  className={cn(
                    r.isDuplicate && 'bg-muted/30 opacity-60',
                    r.isInvalid && 'bg-destructive/10 hover:bg-destructive/20',
                  )}
                >
                  <TableCell className="whitespace-nowrap">
                    {r.date}
                    {r.isInvalid && r.errorMsg?.includes('Data') && (
                      <AlertCircle className="inline h-3 w-3 ml-1 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <span className="truncate max-w-[200px] block font-medium" title={r.desc}>
                        {r.desc || '-'}
                      </span>
                      {r.comments && (
                        <span
                          className="text-[10px] text-muted-foreground truncate max-w-[200px]"
                          title={r.comments}
                        >
                          {r.comments}
                        </span>
                      )}
                      <div className="flex gap-1">
                        {r.isDuplicate && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 bg-background"
                          >
                            Duplicado
                          </Badge>
                        )}
                        {r.isInvalid && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] px-1.5 py-0 h-4 bg-destructive text-destructive-foreground"
                          >
                            {r.errorMsg}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={r.type}
                      onValueChange={(val: 'receita' | 'despesa') => onTypeChange(actualIdx, val)}
                      disabled={r.isDuplicate || r.isInvalid}
                    >
                      <SelectTrigger
                        className={cn(
                          'h-8 text-xs w-[110px]',
                          r.type === '' &&
                            !r.isInvalid &&
                            !r.isDuplicate &&
                            'border-yellow-500 ring-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-500',
                        )}
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="despesa">Débito (D)</SelectItem>
                        <SelectItem value="receita">Crédito (C)</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <Select
                        value={r.cat}
                        onValueChange={(val) => onCategoryChange(actualIdx, val)}
                        disabled={r.isDuplicate || r.isInvalid}
                      >
                        <SelectTrigger className="h-7 text-xs w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Insumos">Insumos</SelectItem>
                          <SelectItem value="Manutenção">Manutenção</SelectItem>
                          <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                          <SelectItem value="Combustível">Combustível</SelectItem>
                          <SelectItem value="Venda">Venda</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={r.crop}
                        onValueChange={(val) => onCropChange(actualIdx, val)}
                        disabled={r.isDuplicate || r.isInvalid}
                      >
                        <SelectTrigger className="h-7 text-xs w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Soja">Soja</SelectItem>
                          <SelectItem value="Milho">Milho</SelectItem>
                          <SelectItem value="Cana">Cana de Açúcar</SelectItem>
                          <SelectItem value="Geral">Geral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {r.isInvalid && r.errorMsg?.includes('Valor') ? (
                      <span className="text-destructive font-medium text-xs">
                        {r.rawAmt || 'Vazio'}
                      </span>
                    ) : (
                      <span
                        className={cn(
                          'font-medium',
                          r.type === 'receita' && 'text-green-600 dark:text-green-500',
                          r.type === 'despesa' && 'text-destructive',
                          r.type === '' && 'text-muted-foreground',
                        )}
                      >
                        {r.type === 'despesa' ? '- ' : r.type === 'receita' ? '+ ' : ''}
                        {formatBRL(Math.abs(r.amount))}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t p-2 bg-muted/30 text-sm">
          <span className="text-muted-foreground ml-2">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
