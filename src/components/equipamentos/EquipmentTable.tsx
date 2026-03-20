import { Edit2, Trash2 } from 'lucide-react'
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
import { Equipment } from '@/types'
import { useToast } from '@/hooks/use-toast'
import useEquipmentStore from '@/stores/useEquipmentStore'

interface EquipmentTableProps {
  equipments: Equipment[]
  onEdit: (eq: Equipment) => void
}

export function EquipmentTable({ equipments, onEdit }: EquipmentTableProps) {
  const { deleteEquipment } = useEquipmentStore()
  const { toast } = useToast()

  const handleDelete = (id: string) => {
    if (
      confirm(
        'Tem certeza que deseja remover este equipamento? O histórico financeiro será mantido.',
      )
    ) {
      deleteEquipment(id)
      toast({ title: 'Equipamento removido com sucesso.' })
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Máquina':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200'
      case 'Veículo':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'
      case 'Implemento':
        return 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200'
      default:
        return ''
    }
  }

  return (
    <div className="rounded-md border bg-card shadow-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Identificação</TableHead>
            <TableHead>Tipo / Marca</TableHead>
            <TableHead>Aquisição</TableHead>
            <TableHead>Venda</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipments.map((eq) => (
            <TableRow key={eq.id}>
              <TableCell>
                <div className="font-medium">{eq.name}</div>
                <div className="text-xs text-muted-foreground">ID: {eq.identifier}</div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 items-start">
                  <Badge variant="outline" className={getTypeColor(eq.type)}>
                    {eq.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{eq.brand}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatDate(eq.acquisitionDate)}</div>
                <div className="text-xs font-medium text-muted-foreground">
                  {formatBRL(eq.acquisitionValue)}
                </div>
              </TableCell>
              <TableCell>
                {eq.saleDate && eq.saleValue ? (
                  <>
                    <div className="text-sm">{formatDate(eq.saleDate)}</div>
                    <div className="text-xs font-medium text-green-600">
                      {formatBRL(eq.saleValue)}
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Ativo</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(eq)}>
                  <Edit2 className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(eq.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {equipments.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                Nenhum equipamento registrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
