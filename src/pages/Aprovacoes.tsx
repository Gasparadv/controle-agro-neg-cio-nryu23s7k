import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Check, X, AlertCircle, CheckSquare, History, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const pendingTx = transactions.filter((t) => t.status === 'pending')
  const historyTx = transactions.filter(
    (t) => t.collaboratorName && (t.status === 'approved' || t.status === 'rejected'),
  )

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

  const getStatusBadge = (status?: string) => {
    switch (status) {
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
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Aprovações de Lançamentos</h2>
        <p className="text-muted-foreground text-sm">
          Revise os lançamentos pendentes antes de integrá-los ao fluxo financeiro.
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="gap-2">
            <AlertCircle className="h-4 w-4" />
            Pendentes
            {pendingTx.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 min-w-5 flex items-center justify-center"
              >
                {pendingTx.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="animate-fade-in-up">
          {pendingTx.length > 0 ? (
            <>
              <div className="hidden md:block rounded-md border bg-card shadow-subtle overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Data</TableHead>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria / Cultura</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTx.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                        <TableCell className="font-medium">
                          {tx.collaboratorName || 'Desconhecido'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{tx.description}</div>
                          {tx.comments && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {tx.comments}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant="outline" className="text-xs font-normal">
                              {tx.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{tx.crop}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span
                            className={`font-semibold ${tx.type === 'receita' ? 'text-primary' : ''}`}
                          >
                            {tx.type === 'despesa' ? '-' : '+'} {formatBRL(tx.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => openRejectDialog(tx.id)}
                              title="Rejeitar"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                              onClick={() => handleApprove(tx.id)}
                              title="Aprovar"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 md:hidden">
                {pendingTx.map((tx) => (
                  <Card key={tx.id} className="shadow-sm">
                    <CardContent className="p-4 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{tx.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.date)} • {tx.collaboratorName || 'Desconhecido'}
                          </p>
                        </div>
                        <div
                          className={`text-right font-bold ${tx.type === 'receita' ? 'text-primary' : ''}`}
                        >
                          {tx.type === 'despesa' ? '-' : '+'} {formatBRL(tx.amount)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {tx.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-muted">
                          {tx.crop}
                        </Badge>
                      </div>

                      {tx.comments && (
                        <p className="text-sm italic text-muted-foreground bg-muted/50 p-2 rounded">
                          "{tx.comments}"
                        </p>
                      )}

                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          className="flex-1"
                          variant="outline"
                          onClick={() => openRejectDialog(tx.id)}
                        >
                          <X className="h-4 w-4 mr-2" /> Rejeitar
                        </Button>
                        <Button className="flex-1" onClick={() => handleApprove(tx.id)}>
                          <Check className="h-4 w-4 mr-2" /> Aprovar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Nenhuma aprovação pendente no momento.</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Todos os lançamentos foram revisados.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="animate-fade-in-up">
          {historyTx.length > 0 ? (
            <>
              <div className="hidden md:block rounded-md border bg-card shadow-subtle overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Data</TableHead>
                      <TableHead>Colaborador</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyTx.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">{formatDate(tx.date)}</TableCell>
                        <TableCell className="font-medium">
                          {tx.collaboratorName || 'Desconhecido'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{tx.description}</div>
                          {tx.status === 'rejected' && tx.rejectionReason && (
                            <div className="text-xs text-destructive mt-1">
                              Motivo: {tx.rejectionReason}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(tx.status)}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <span
                            className={`font-semibold ${tx.type === 'receita' ? 'text-primary' : ''}`}
                          >
                            {tx.type === 'despesa' ? '-' : '+'} {formatBRL(tx.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="grid gap-4 md:hidden">
                {historyTx.map((tx) => (
                  <Card
                    key={tx.id}
                    className={`shadow-sm ${tx.status === 'rejected' ? 'border-red-200 bg-red-50/10' : ''}`}
                  >
                    <CardContent className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{tx.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.date)} • {tx.collaboratorName || 'Desconhecido'}
                          </p>
                        </div>
                        <div
                          className={`text-right font-bold ${tx.type === 'receita' ? 'text-primary' : ''}`}
                        >
                          {tx.type === 'despesa' ? '-' : '+'} {formatBRL(tx.amount)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {tx.category}
                          </Badge>
                        </div>
                        {getStatusBadge(tx.status)}
                      </div>

                      {tx.status === 'rejected' && tx.rejectionReason && (
                        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded border border-destructive/20">
                          <span className="font-semibold">Motivo:</span> {tx.rejectionReason}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="border-dashed bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Nenhum histórico encontrado.</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Aprovações e rejeições aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
