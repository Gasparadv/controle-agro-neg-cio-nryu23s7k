import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBRL, formatDate } from '@/lib/format'
import { Transaction } from '@/types'
import { Clock, CheckCircle2, XCircle, AlertCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionTableProps {
  transactions: Transaction[]
  onSelect: (tx: Transaction) => void
  onUpdateType?: (tx: Transaction, type: 'receita' | 'despesa') => void
  onDelete?: (tx: Transaction) => void
  emptyStateMessage?: string
}

export function TransactionTable({
  transactions,
  onSelect,
  onUpdateType,
  onDelete,
  emptyStateMessage,
}: TransactionTableProps) {
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
            <TableHead className="text-right">Valor / Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Comentários</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow
              key={tx.id}
              onClick={() => onSelect(tx)}
              className={cn(
                'cursor-pointer hover:bg-muted/60 transition-colors',
                tx.status === 'rejected' && 'opacity-60',
                tx.type === 'indefinido' &&
                  'bg-orange-500/5 hover:bg-orange-500/10 border-l-2 border-l-orange-500',
              )}
            >
              <TableCell className="font-medium whitespace-nowrap">{formatDate(tx.date)}</TableCell>
              <TableCell>
                <div className="font-medium flex items-center gap-2">
                  {tx.type === 'indefinido' && (
                    <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
                  )}
                  {tx.description}
                </div>
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
                {tx.type === 'indefinido' ? (
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-medium text-muted-foreground">
                      {formatBRL(Math.abs(tx.amount))}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px] bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdateType?.(tx, 'receita')
                        }}
                      >
                        Receita
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px] bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdateType?.(tx, 'despesa')
                        }}
                      >
                        Despesa
                      </Button>
                    </div>
                  </div>
                ) : (
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
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                {tx.comments || '-'}
              </TableCell>
              <TableCell className="text-right pr-4">
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(tx)
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                {emptyStateMessage || 'Nenhum lançamento encontrado.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
