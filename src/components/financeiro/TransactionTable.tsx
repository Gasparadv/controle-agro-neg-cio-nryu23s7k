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

interface TransactionTableProps {
  transactions: Transaction[]
  onSelect: (tx: Transaction) => void
}

export function TransactionTable({ transactions, onSelect }: TransactionTableProps) {
  return (
    <div className="rounded-md border bg-card shadow-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
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
              className="cursor-pointer hover:bg-muted/60 transition-colors"
            >
              <TableCell className="font-medium whitespace-nowrap">{formatDate(tx.date)}</TableCell>
              <TableCell>{tx.description}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {tx.category}
                </Badge>
              </TableCell>
              <TableCell>{tx.crop}</TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <span className={tx.type === 'receita' ? 'text-primary font-medium' : ''}>
                  {tx.type === 'despesa' ? '-' : '+'} {formatBRL(tx.amount)}
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
