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

export interface PreviewRow {
  index: number
  date: string
  desc: string
  amount: number
  cat: string
  isDuplicate: boolean
}

interface ImportPreviewTableProps {
  preview: PreviewRow[]
  onCategoryChange: (index: number, newCat: string) => void
}

export function ImportPreviewTable({ preview, onCategoryChange }: ImportPreviewTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <ScrollArea className="h-[350px]">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Cat.</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((r, i) => (
              <TableRow key={i} className={r.isDuplicate ? 'bg-muted/30 opacity-60' : ''}>
                <TableCell className="whitespace-nowrap">{r.date}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 items-start">
                    <span className="truncate max-w-[200px] block" title={r.desc}>
                      {r.desc}
                    </span>
                    {r.isDuplicate && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                        Duplicado
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={r.cat}
                    onValueChange={(val) => onCategoryChange(i, val)}
                    disabled={r.isDuplicate}
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
                  <span
                    className={
                      r.amount > 0 ? 'text-primary font-medium' : 'text-destructive font-medium'
                    }
                  >
                    {formatBRL(Math.abs(r.amount))}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
