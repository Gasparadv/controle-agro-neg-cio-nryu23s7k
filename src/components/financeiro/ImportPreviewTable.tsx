import { AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatBRL } from '@/lib/format'

export interface PreviewRow {
  index: number
  date: string
  desc: string
  amount: number
  cat: string
  crop: string
  comments: string
  type: string
  isDuplicate: boolean
  isInvalid: boolean
  errorMsg?: string
  rawAmt?: string
  fitid?: string
}

interface ImportPreviewTableProps {
  preview: PreviewRow[]
  onCategoryChange: (index: number, newCat: string) => void
  onTypeChange: (index: number, newType: 'receita' | 'despesa' | 'indefinido') => void
  onCropChange: (index: number, newCrop: string) => void
}

export function ImportPreviewTable({
  preview,
  onCategoryChange,
  onTypeChange,
  onCropChange,
}: ImportPreviewTableProps) {
  return (
    <div className="rounded-md border h-full overflow-hidden flex flex-col max-h-[400px]">
      <div className="overflow-auto flex-1">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead className="min-w-[200px]">Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Cultura</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.map((row, i) => (
              <TableRow
                key={i}
                className={
                  row.isInvalid
                    ? 'bg-red-50/50'
                    : row.isDuplicate
                      ? 'bg-orange-50/50 opacity-60'
                      : ''
                }
              >
                <TableCell className="whitespace-nowrap text-xs">
                  {row.isInvalid ? (
                    <span className="text-destructive font-medium">{row.date}</span>
                  ) : (
                    row.date
                  )}
                </TableCell>
                <TableCell className="text-xs font-medium max-w-[200px] truncate" title={row.desc}>
                  {row.desc}
                </TableCell>
                <TableCell>
                  {!row.isInvalid && (
                    <Select value={row.type} onValueChange={(val: any) => onTypeChange(i, val)}>
                      <SelectTrigger
                        className={`h-7 text-[10px] w-[100px] ${row.type === 'indefinido' ? 'border-orange-500 ring-orange-500 ring-1' : ''}`}
                      >
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="despesa">Despesa</SelectItem>
                        <SelectItem value="receita">Receita</SelectItem>
                        <SelectItem value="indefinido">Indefinido</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {!row.isInvalid && (
                    <Select value={row.cat} onValueChange={(val) => onCategoryChange(i, val)}>
                      <SelectTrigger className="h-7 text-[10px] w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Insumos">Insumos</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Peças">Peças</SelectItem>
                        <SelectItem value="Combustível">Combustível</SelectItem>
                        <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                        <SelectItem value="Retirada de Sócios">Retirada</SelectItem>
                        <SelectItem value="Venda">Venda</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  {!row.isInvalid && (
                    <Select value={row.crop} onValueChange={(val) => onCropChange(i, val)}>
                      <SelectTrigger className="h-7 text-[10px] w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Soja">Soja</SelectItem>
                        <SelectItem value="Milho">Milho</SelectItem>
                        <SelectItem value="Cana">Cana</SelectItem>
                        <SelectItem value="Geral">Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap text-xs font-medium">
                  {row.isInvalid ? (
                    <span className="text-destructive" title={`Valor original: ${row.rawAmt}`}>
                      {row.rawAmt || 'Vazio'}
                    </span>
                  ) : (
                    <span
                      className={
                        row.type === 'receita'
                          ? 'text-green-600 dark:text-green-500'
                          : row.type === 'despesa'
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      }
                    >
                      {row.type === 'despesa' ? '-' : row.type === 'receita' ? '+' : ''}{' '}
                      {formatBRL(Math.abs(row.amount))}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {row.isInvalid ? (
                    <Badge variant="destructive" className="text-[10px] h-5 gap-1">
                      <AlertCircle className="h-3 w-3" /> Erro: {row.errorMsg}
                    </Badge>
                  ) : row.isDuplicate ? (
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-800 border-orange-300 text-[10px] h-5"
                    >
                      Duplicado (ignorado)
                    </Badge>
                  ) : row.type === 'indefinido' ? (
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 border-yellow-300 text-[10px] h-5"
                    >
                      Requer Atenção
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300 text-[10px] h-5"
                    >
                      Ok
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
