import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Users, HardDrive, Download, Plus, Pencil, Trash2, ShieldAlert, Shield } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import useTeamStore from '@/stores/useTeamStore'
import useAuthStore from '@/stores/useAuthStore'
import useAgroStore from '@/stores/useAgroStore'
import useEquipmentStore from '@/stores/useEquipmentStore'
import { UserFormModal } from '@/components/equipe/UserFormModal'
import { useToast } from '@/hooks/use-toast'
import { exportReportToCSV, exportToCSV, exportAllToJSON } from '@/lib/export'
import { User } from '@/types'

export default function Configuracoes() {
  const { role, user } = useAuthStore()
  const { users, deleteUser } = useTeamStore()
  const { transactions } = useAgroStore()
  const { equipments } = useEquipmentStore()
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const handleAddUser = () => {
    setEditingUser(undefined)
    setIsModalOpen(true)
  }

  const handleEditUser = (u: User) => {
    setEditingUser(u)
    setIsModalOpen(true)
  }

  const handleDeleteUser = (id: string) => {
    if (id === user?.id) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode excluir o usuário com o qual está logado atualmente.',
        variant: 'destructive',
      })
      return
    }
    deleteUser(id)
    toast({ title: 'Usuário Removido', description: 'O colaborador foi excluído do sistema.' })
  }

  const handleExportAll = () => {
    const data = {
      transactions,
      equipments,
      exportedAt: new Date().toISOString(),
    }
    exportAllToJSON(data, 'agroflow_backup')
    toast({
      title: 'Backup concluído',
      description: 'Arquivo JSON consolidado gerado com sucesso.',
    })
  }

  const handleExportFinances = () => {
    exportToCSV(transactions, equipments)
    toast({
      title: 'Exportação concluída',
      description: 'Arquivo CSV do histórico financeiro gerado.',
    })
  }

  const handleExportEquipment = () => {
    exportReportToCSV(equipments, 'frota_equipamentos')
    toast({ title: 'Exportação concluída', description: 'Arquivo CSV da frota gerado.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Configurações e Segurança</h2>
        <p className="text-muted-foreground text-sm">
          Gerencie o acesso ao sistema e faça backup de toda a operação de forma segura.
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users" className="gap-2 px-6">
            <Users className="h-4 w-4" /> Gestão de Usuários
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2 px-6">
            <HardDrive className="h-4 w-4" /> Backup e Exportação
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="animate-fade-in-up space-y-4">
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
            <div>
              <h3 className="font-semibold">Colaboradores</h3>
              <p className="text-sm text-muted-foreground">
                Adicione e remova pessoas da sua equipe.
              </p>
            </div>
            <Button onClick={handleAddUser} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Usuário
            </Button>
          </div>

          <div className="rounded-md border bg-card shadow-subtle overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Nível de Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {u.role === 'admin' ? (
                        <Badge className="gap-1 bg-blue-600 hover:bg-blue-700 text-white">
                          <ShieldAlert className="h-3 w-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" /> Visualizador
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(u)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HardDrive className="h-5 w-5 text-primary" /> Exportação Consolidada
                </CardTitle>
                <CardDescription>
                  Gere um arquivo JSON com todos os dados do sistema. Ideal para backup seguro e
                  retenção de longo prazo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleExportAll}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4" /> Baixar Backup Completo (JSON)
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-subtle">
              <CardHeader>
                <CardTitle className="text-lg">Exportações Parciais (CSV)</CardTitle>
                <CardDescription>
                  Baixe planilhas separadas de cada módulo do sistema para análises externas em
                  ferramentas como Excel ou PowerBI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleExportFinances}
                  variant="outline"
                  className="w-full gap-2 justify-start hover:bg-muted/50"
                >
                  <Download className="h-4 w-4 text-muted-foreground" /> Histórico Financeiro
                </Button>
                <Button
                  onClick={handleExportEquipment}
                  variant="outline"
                  className="w-full gap-2 justify-start hover:bg-muted/50"
                >
                  <Download className="h-4 w-4 text-muted-foreground" /> Frota de Equipamentos
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <UserFormModal open={isModalOpen} onOpenChange={setIsModalOpen} userToEdit={editingUser} />
    </div>
  )
}
