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
import { ArrowRightLeft, Edit } from 'lucide-react'
import { InventoryItem } from '@/types'

interface InventoryTableProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onMovement: (item: InventoryItem) => void
}

export function InventoryTable({ items, onEdit, onMovement }: InventoryTableProps) {
  return (
    <div className="rounded-md border bg-card shadow-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Insumo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isLowStock = item.quantity <= item.minStock
            return (
              <TableRow key={item.id} className="hover:bg-muted/60 transition-colors">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell className="text-right font-medium">
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell className="text-center">
                  {isLowStock ? (
                    <Badge variant="destructive" className="font-normal">
                      Estoque Baixo
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="font-normal bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
                    >
                      Normal
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMovement(item)}
                      title="Registrar Movimentação"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nenhum insumo cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
