import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatBRL, formatDate } from '@/lib/format'
import { Transaction } from '@/types'
import { Clock, CheckCircle2, XCircle, AlertCircle, Trash2, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransactionTableProps {
  transactions: Transaction[]
  onSelect: (tx: Transaction) => void
  onUpdate?: (tx: Transaction, updates: Partial<Transaction>) => void
  onDelete?: (tx: Transaction) => void
  emptyStateMessage?: string
  selectedIds?: string[]
  onSelectAll?: (checked: boolean) => void
  onSelectRow?: (id: string, checked: boolean) => void
}

export function TransactionTable({
  transactions,
  onSelect,
  onUpdate,
  onDelete,
  emptyStateMessage,
  selectedIds = [],
  onSelectAll,
  onSelectRow,
}: TransactionTableProps) {
  const [editId, setEditId] = useState<string | null>(null)
  const [editField, setEditField] = useState<'category' | 'crop' | 'comments' | null>(null)
  const [editValue, setEditValue] = useState('')

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

  const startEdit = (
    e: React.MouseEvent,
    tx: Transaction,
    field: 'category' | 'crop' | 'comments',
  ) => {
    e.stopPropagation()
    setEditId(tx.id)
    setEditField(field)
    setEditValue(tx[field] || '')
  }

  const saveEdit = (tx: Transaction, newValue: string) => {
    if (onUpdate && tx[editField!] !== newValue) {
      onUpdate(tx, { [editField!]: newValue })
    }
    setEditId(null)
    setEditField(null)
  }

  const allSelected = transactions.length > 0 && selectedIds.length === transactions.length

  return (
    <div className="rounded-md border bg-card shadow-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[40px] print:hidden">
              {onSelectAll && (
                <Checkbox checked={allSelected} onCheckedChange={(c) => onSelectAll(c === true)} />
              )}
            </TableHead>
            <TableHead className="w-[100px]">Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria / Status</TableHead>
            <TableHead>Cultura</TableHead>
            <TableHead className="text-right">Valor / Tipo</TableHead>
            <TableHead className="hidden md:table-cell">Comentários</TableHead>
            <TableHead className="w-[50px] print:hidden"></TableHead>
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
                selectedIds.includes(tx.id) && 'bg-primary/5',
              )}
            >
              <TableCell className="w-[40px] print:hidden" onClick={(e) => e.stopPropagation()}>
                {onSelectRow && (
                  <Checkbox
                    checked={selectedIds.includes(tx.id)}
                    onCheckedChange={(c) => onSelectRow(tx.id, c === true)}
                  />
                )}
              </TableCell>
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
                  {editId === tx.id && editField === 'category' ? (
                    <div onClick={(e) => e.stopPropagation()} className="w-[130px]">
                      <Select
                        defaultOpen
                        value={editValue}
                        onValueChange={(v) => saveEdit(tx, v)}
                        onOpenChange={(o) => {
                          if (!o) {
                            setEditId(null)
                            setEditField(null)
                          }
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs">
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
                    </div>
                  ) : (
                    <div
                      className="group flex items-center gap-1 cursor-pointer"
                      onClick={(e) => startEdit(e, tx, 'category')}
                    >
                      <Badge
                        variant="outline"
                        className="font-normal border-muted-foreground/30 hover:bg-muted"
                      >
                        {tx.category}
                      </Badge>
                      <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground print:hidden" />
                    </div>
                  )}
                  {getStatusBadge(tx.status)}
                </div>
              </TableCell>
              <TableCell>
                {editId === tx.id && editField === 'crop' ? (
                  <div onClick={(e) => e.stopPropagation()} className="w-[120px]">
                    <Select
                      defaultOpen
                      value={editValue}
                      onValueChange={(v) => saveEdit(tx, v)}
                      onOpenChange={(o) => {
                        if (!o) {
                          setEditId(null)
                          setEditField(null)
                        }
                      }}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Soja">Soja</SelectItem>
                        <SelectItem value="Milho">Milho</SelectItem>
                        <SelectItem value="Cana">Cana</SelectItem>
                        <SelectItem value="Geral">Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div
                    className="group flex items-center gap-1 cursor-pointer"
                    onClick={(e) => startEdit(e, tx, 'crop')}
                  >
                    <span>{tx.crop}</span>
                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground print:hidden" />
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {tx.type === 'indefinido' ? (
                  <div className="flex flex-col items-end gap-1.5 print:hidden">
                    <span className="font-medium text-muted-foreground">
                      {formatBRL(Math.abs(tx.amount))}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px] bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdate?.(tx, { type: 'receita' })
                        }}
                      >
                        Receita
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-[10px] bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdate?.(tx, { type: 'despesa' })
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
              <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px]">
                {editId === tx.id && editField === 'comments' ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 w-full"
                  >
                    <Input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(tx, editValue)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(tx, editValue)}
                      className="h-7 text-xs w-full"
                    />
                  </div>
                ) : (
                  <div
                    className="group flex items-center gap-1 cursor-pointer truncate"
                    onClick={(e) => startEdit(e, tx, 'comments')}
                  >
                    <span className="truncate" title={tx.comments}>
                      {tx.comments || '-'}
                    </span>
                    <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 text-muted-foreground shrink-0 print:hidden" />
                  </div>
                )}
              </TableCell>
              <TableCell className="text-right pr-4 print:hidden">
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
              <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                {emptyStateMessage || 'Nenhum lançamento encontrado.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
