import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Check, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatBRL, formatDate } from '@/lib/format'
import useAgroStore from '@/stores/useAgroStore'
import useAuthStore from '@/stores/useAuthStore'
import { Transaction } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function Aprovacoes() {
  const { role } = useAuthStore()
  const { transactions, approveTransaction, rejectTransaction } = useAgroStore()
  const { toast } = useToast()

  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; txId: string }>({
    open: false,
    txId: '',
  })
  const [rejectionReason, setRejectionReason] = useState('')

  // Protect route
  if (role !== 'owner') {
    return <Navigate to="/" replace />
  }

  const pendingTx = transactions.filter((t) => t.status === 'pending')

  const handleApprove = (id: string) => {
    approveTransaction(id)
    toast({
      title: 'Lançamento Aprovado',
      description: 'O registro foi incluído no fluxo financeiro oficial.',
    })
  }

  const openRejectDialog = (id: string) => {
    setRejectionReason('')
    setRejectDialog({ open: true, txId: id })
  }

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      toast({ title: 'Erro', description: 'Informe o motivo da rejeição.', variant: 'destructive' })
      return
    }
    rejectTransaction(rejectDialog.txId, rejectionReason)
    setRejectDialog({ open: false, txId: '' })
    toast({
      title: 'Lançamento Rejeitado',
      description: 'O colaborador poderá ver o motivo e corrigir.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Aprovações Pendentes</h2>
        <p className="text-muted-foreground text-sm">
          Revise os lançamentos enviados por colaboradores antes de integrá-los ao livro-caixa.
        </p>
      </div>

      <Card className="shadow-subtle border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Aguardando sua Revisão
            <Badge variant="secondary" className="ml-2">
              {pendingTx.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Estes registros não afetam os relatórios até serem aprovados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingTx.length > 0 ? (
            <div className="space-y-4">
              {pendingTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg bg-muted/20 gap-4"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{tx.description}</span>
                      <Badge variant="outline" className="text-xs uppercase">
                        {tx.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
                        {tx.crop}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span>
                        Enviado por: <strong>{tx.collaboratorName || 'Colaborador'}</strong>
                      </span>
                    </div>
                    {tx.comments && (
                      <p className="text-sm italic text-muted-foreground mt-2">"{tx.comments}"</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <span
                      className={`text-lg font-bold ${tx.type === 'receita' ? 'text-primary' : ''}`}
                    >
                      {tx.type === 'despesa' ? '-' : '+'} {formatBRL(tx.amount)}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => openRejectDialog(tx.id)}
                      >
                        <X className="h-4 w-4 mr-1" /> Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => handleApprove(tx.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Aprovar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center">
              <CheckSquare className="h-12 w-12 text-muted/50 mb-4" />
              <p>Não há lançamentos pendentes de aprovação no momento.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={rejectDialog.open}
        onOpenChange={(val) => !val && setRejectDialog({ open: false, txId: '' })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Lançamento</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <p className="text-sm text-muted-foreground mb-2">
              Informe ao colaborador o motivo da recusa ou o que precisa ser corrigido.
            </p>
            <Textarea
              placeholder="Ex: Faltou anexar a nota fiscal, ou o valor está divergente..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, txId: '' })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmReject}>
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
