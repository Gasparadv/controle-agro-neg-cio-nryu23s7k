import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FileText, Download } from 'lucide-react'
import { formatBRL, formatDate } from '@/lib/format'
import { Invoice } from '@/types'
import useInvoiceStore from '@/stores/useInvoiceStore'

interface InvoiceTableProps {
  invoices: Invoice[]
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  const { toggleIrStatus } = useInvoiceStore()

  return (
    <div className="rounded-md border bg-card shadow-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Documento</TableHead>
            <TableHead>Fornecedor</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-center">Incluído no IR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id} className="hover:bg-muted/60 transition-colors">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    {inv.fileName}
                  </span>
                  <span className="text-xs text-muted-foreground ml-6">
                    Emissão: {formatDate(inv.date)}
                  </span>
                </div>
              </TableCell>
              <TableCell>{inv.provider}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {inv.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">{formatBRL(inv.amount)}</TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Switch
                    id={`ir-${inv.id}`}
                    checked={inv.includedInIr}
                    onCheckedChange={() => toggleIrStatus(inv.id)}
                  />
                  <Label htmlFor={`ir-${inv.id}`} className="sr-only">
                    IR
                  </Label>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nenhuma nota fiscal encontrada para este filtro.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
