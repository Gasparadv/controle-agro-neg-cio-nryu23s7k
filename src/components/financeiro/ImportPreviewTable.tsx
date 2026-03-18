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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatBRL } from '@/lib/format'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PreviewRow {
  index: number
  date: string
  desc: string
  amount: number
  cat: string
  isDuplicate: boolean
  isInvalid?: boolean
  errorMsg?: string
  rawAmt?: string
}

interface ImportPreviewTableProps {
  preview: PreviewRow[]
  onCategoryChange: (index: number, newCat: string) => void
}

export function ImportPreviewTable({ preview, onCategoryChange }: ImportPreviewTableProps) {
  const invalidCount = preview.filter((r) => r.isInvalid).length

  return (
    <div className="rounded-md border overflow-hidden flex flex-col h-[400px]">
      <div className="bg-muted p-3 text-xs text-muted-foreground border-b flex items-center justify-between font-medium">
        <span>Colunas mapeadas: A (Data), C (Descrição), E (Valor).</span>
        {invalidCount > 0 && (
          <span className="text-destructive font-semibold">
            {invalidCount} {invalidCount === 1 ? 'registro inválido' : 'registros inválidos'}{' '}
            detectados
          </span>
        )}
      </div>
      <ScrollArea className="flex-1">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((r, i) => (
              <TableRow
                key={i}
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
                    <div className="flex gap-1">
                      {r.isDuplicate && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
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
                    value={r.cat}
                    onValueChange={(val) => onCategoryChange(i, val)}
                    disabled={r.isDuplicate || r.isInvalid}
                  >
                    <SelectTrigger className="h-8 text-xs w-[130px]">
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
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {r.isInvalid && r.errorMsg?.includes('Valor') ? (
                    <span className="text-destructive font-medium text-xs">
                      {r.rawAmt || 'Vazio'}
                    </span>
                  ) : (
                    <span
                      className={
                        r.amount > 0 ? 'text-primary font-medium' : 'text-destructive font-medium'
                      }
                    >
                      {formatBRL(Math.abs(r.amount))}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
