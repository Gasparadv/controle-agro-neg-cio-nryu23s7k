import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAgroStore from '@/stores/useAgroStore'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/format'

interface ImportHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportHistoryModal({ open, onOpenChange }: ImportHistoryModalProps) {
  const { importBatches, undoImportBatch } = useAgroStore()
  const { toast } = useToast()
  const [batchToUndo, setBatchToUndo] = useState<string | null>(null)

  const handleUndo = () => {
    if (batchToUndo) {
      const batch = importBatches.find((b) => b.id === batchToUndo)
      undoImportBatch(batchToUndo)
      toast({
        title: 'Importação desfeita',
        description: `${batch?.recordCount} lançamentos removidos com sucesso.`,
      })
      setBatchToUndo(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Histórico de Importações</DialogTitle>
          <DialogDescription>
            Visualize e desfaça importações recentes de extratos bancários e planilhas.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border mt-4 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Data / Hora</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importBatches.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    {formatDate(batch.date.split('T')[0])}{' '}
                    <span className="text-muted-foreground ml-1 text-xs">
                      {batch.date.split('T')[1]?.substring(0, 5)}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate">{batch.fileName}</TableCell>
                  <TableCell>{batch.recordCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setBatchToUndo(batch.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {importBatches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                    Nenhuma importação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>

      <AlertDialog open={!!batchToUndo} onOpenChange={(val) => !val && setBatchToUndo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desfazer Importação?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desfazer esta importação? Todos os lançamentos criados por ela
              serão apagados. Esta ação não afetará os lançamentos manuais.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUndo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Desfazer Importação
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
