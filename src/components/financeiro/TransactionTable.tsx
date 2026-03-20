import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatBRL, formatDate } from '@/lib/format'
import { Transaction } from '@/types'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'

interface TransactionTableProps {
  transactions: Transaction[]
  onSelect: (tx: Transaction) => void
}

export function TransactionTable({ transactions, onSelect }: TransactionTableProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-300 gap-1"
          >
            <Clock className="h-3 w-3" /> Pendente
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 gap-1">
            <XCircle className="h-3 w-3" /> Rejeitado
          </Badge>
        )
      case 'approved':
      default:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Aprovado
          </Badge>
        )
    }
  }

  return (
    <div className="rounded-md border bg-card shadow-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria / Status</TableHead>
            <TableHead>Cultura</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="hidden md:table-cell">Comentários</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              onClick={() => onSelect(tx)}
              className={`cursor-pointer hover:bg-muted/60 transition-colors ${tx.status === 'rejected' ? 'opacity-60' : ''}`}
            >
              <TableCell className="font-medium whitespace-nowrap">{formatDate(tx.date)}</TableCell>
              <TableCell>
                <div className="font-medium">{tx.description}</div>
                {tx.status === 'rejected' && tx.rejectionReason && (
                  <div className="text-xs text-destructive mt-1">
                    Motivo recusa: {tx.rejectionReason}
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-1">
                  <Badge variant="outline" className="font-normal border-muted-foreground/30">
                    {tx.category}
                  </Badge>
                  {getStatusBadge(tx.status)}
                </div>
              </TableCell>
              <TableCell>{tx.crop}</TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <span
                  className={
                    tx.type === 'receita'
                      ? 'text-green-600 dark:text-green-500 font-medium'
                      : 'text-destructive'
                  }
                >
                  {tx.type === 'despesa' ? '- ' : '+ '}
                  {formatBRL(Math.abs(tx.amount))}
                </span>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                {tx.comments || '-'}
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nenhum lançamento encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
