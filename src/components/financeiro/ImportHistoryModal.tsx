import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import useAgroStore from '@/stores/useAgroStore'
import { Trash2, RefreshCw, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/format'
import { ImportBatch } from '@/types'

interface ImportHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportHistoryModal({ open, onOpenChange }: ImportHistoryModalProps) {
  const { importBatches, transactions, undoImportBatch, addTransactions } = useAgroStore()
  const { toast } = useToast()
  const [batchToUndo, setBatchToUndo] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)

  const handleUndo = () => {
    if (batchToUndo) {
      const batch = importBatches.find((b) => b.id === batchToUndo)
      undoImportBatch(batchToUndo)
      toast({
        title: 'Importação desfeita',
        description: `${batch?.recordCount || 0} lançamentos removidos com sucesso.`,
      })
      setBatchToUndo(null)
    }
  }

  const getStatus = (batch: ImportBatch) => {
    const batchTxs = transactions.filter((t) => t.importBatchId === batch.id)
    if (batchTxs.length === 0) return 'pending'
    if (batchTxs.length < batch.recordCount) return 'partial'
    return 'completed'
  }

  const handleSync = async (batch: ImportBatch) => {
    setSyncingId(batch.id)

    // Build map of existing transactions to check for duplicates
    const existingMap = new Set(
      transactions.map(
        (t) => `${t.date}|${Math.abs(t.amount)}|${t.type}|${(t.description || '').toLowerCase()}`,
      ),
    )
    const existingIds = new Set(transactions.map((t) => t.id))

    const missingTxs = (batch.transactions || []).filter((t) => {
      const key = `${t.date}|${Math.abs(t.amount)}|${t.type}|${(t.description || '').toLowerCase()}`
      return !existingIds.has(t.id) && !existingMap.has(key)
    })

    // Simulate batch processing for UI feedback
    await new Promise((resolve) => setTimeout(resolve, 1200))

    if (missingTxs.length > 0) {
      addTransactions(missingTxs)
      toast({
        title: 'Sincronização Concluída',
        description: `${missingTxs.length} registros foram integrados com sucesso.`,
      })
    } else {
      toast({
        title: 'Nenhum registro pendente',
        description: 'Todos os registros válidos deste lote já estão integrados.',
      })
    }

    setSyncingId(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
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
                <TableHead className="w-[130px]">Data / Hora</TableHead>
                <TableHead className="min-w-[150px]">Arquivo</TableHead>
                <TableHead className="w-[80px] text-center">Registros</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead className="text-right w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importBatches.map((batch) => {
                const status = getStatus(batch)
                const canSync =
                  status !== 'completed' && batch.transactions && batch.transactions.length > 0

                return (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium whitespace-nowrap text-xs">
                      {formatDate(batch.date.split('T')[0])}
                      <span className="text-muted-foreground ml-1">
                        {batch.date.split('T')[1]?.substring(0, 5)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-xs" title={batch.fileName}>
                      {batch.fileName}
                    </TableCell>
                    <TableCell className="text-center text-xs">{batch.recordCount}</TableCell>
                    <TableCell>
                      {status === 'pending' && (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 font-medium text-[10px] whitespace-nowrap"
                        >
                          Integração Pendente
                        </Badge>
                      )}
                      {status === 'partial' && (
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 font-medium text-[10px] whitespace-nowrap"
                        >
                          Integração Parcial
                        </Badge>
                      )}
                      {status === 'completed' && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 font-medium text-[10px] whitespace-nowrap"
                        >
                          Totalmente Integrado
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-1">
                      {canSync && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(batch)}
                          disabled={syncingId === batch.id}
                          className="h-7 gap-1.5 text-[10px] text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900 px-2"
                        >
                          {syncingId === batch.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          <span className="hidden sm:inline">Sincronizar</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setBatchToUndo(batch.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7"
                        title="Desfazer Importação"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
              {importBatches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
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
