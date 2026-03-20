import { AlertCircle, HelpCircle } from 'lucide-react'
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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
  duplicateReason?: string
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
        <TooltipProvider delayDuration={150}>
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
              <TableRow>
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead className="min-w-[200px]">Descrição</TableHead>
                <TableHead className="w-[120px]">Tipo</TableHead>
                <TableHead className="w-[130px]">Categoria</TableHead>
                <TableHead className="w-[110px]">Cultura</TableHead>
                <TableHead className="text-right w-[110px]">Valor</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.map((row, i) => (
                <TableRow
                  key={i}
                  className={
                    row.isInvalid
                      ? 'bg-red-50/50 hover:bg-red-50/80 dark:bg-red-950/20'
                      : row.isDuplicate
                        ? 'bg-orange-50/50 hover:bg-orange-50/80 opacity-75 dark:bg-orange-950/20'
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
                  <TableCell
                    className="text-xs font-medium max-w-[200px] truncate"
                    title={row.desc}
                  >
                    {row.desc}
                  </TableCell>
                  <TableCell>
                    {!row.isInvalid && (
                      <Select value={row.type} onValueChange={(val: any) => onTypeChange(i, val)}>
                        <SelectTrigger
                          className={`h-7 text-[10px] w-full ${row.type === 'indefinido' ? 'border-orange-500 ring-orange-500 ring-1' : ''}`}
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
                        <SelectTrigger className="h-7 text-[10px] w-full">
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
                        <SelectTrigger className="h-7 text-[10px] w-full">
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="destructive"
                            className="text-[10px] h-5 gap-1 cursor-help truncate max-w-[120px]"
                          >
                            <AlertCircle className="h-3 w-3 shrink-0" /> Erro
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="bg-destructive text-destructive-foreground">
                          <p>{row.errorMsg}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : row.isDuplicate ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="bg-orange-100 text-orange-800 border-orange-300 text-[10px] h-5 cursor-help gap-1 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800"
                          >
                            <HelpCircle className="h-3 w-3 shrink-0" /> Duplicado
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px]">
                          <p className="text-sm font-semibold mb-1">Registro Ignorado</p>
                          <p className="text-xs text-muted-foreground">
                            {row.duplicateReason || 'Já existe um registro idêntico no sistema.'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ) : row.type === 'indefinido' ? (
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800 border-yellow-300 text-[10px] h-5 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
                      >
                        Requer Atenção
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-300 text-[10px] h-5 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                      >
                        Pronto
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  )
}
