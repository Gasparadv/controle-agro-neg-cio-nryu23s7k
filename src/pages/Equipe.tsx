import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, ShieldAlert } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import useTeamStore from '@/stores/useTeamStore'
import useAuthStore from '@/stores/useAuthStore'
import { UserFormModal } from '@/components/equipe/UserFormModal'
import { User } from '@/types'
import { useToast } from '@/hooks/use-toast'

export default function Equipe() {
  const { users, deleteUser } = useTeamStore()
  const { user, role } = useAuthStore()
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()

  if (role !== 'owner') {
    return <Navigate to="/" replace />
  }

  const handleAdd = () => {
    setEditingUser(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (u: User) => {
    setEditingUser(u)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (id === user?.id) {
      toast({
        title: 'Ação não permitida',
        description: 'Você não pode excluir o usuário com o qual está logado atualmente.',
        variant: 'destructive',
      })
      return
    }
    deleteUser(id)
    toast({
      title: 'Usuário Removido',
      description: 'O colaborador foi excluído do sistema.',
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Gerenciamento de Equipe</h2>
          <p className="text-muted-foreground text-sm">
            Cadastre colaboradores, defina perfis e controle acessos aos módulos financeiros.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      <div className="hidden md:block rounded-md border bg-card shadow-subtle overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.role === 'owner' ? (
                    <Badge variant="default" className="gap-1 bg-blue-600 hover:bg-blue-700">
                      <ShieldAlert className="h-3 w-3" /> Proprietário
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Assistente</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(u)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-4 md:hidden">
        {users.map((u) => (
          <Card key={u.id} className="shadow-sm">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{u.name}</h4>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                {u.role === 'owner' ? (
                  <Badge variant="default" className="bg-blue-600">
                    Proprietário
                  </Badge>
                ) : (
                  <Badge variant="secondary">Assistente</Badge>
                )}
              </div>
              <div className="flex gap-2 pt-2 border-t justify-end">
                <Button variant="outline" size="sm" onClick={() => handleEdit(u)}>
                  <Pencil className="h-4 w-4 mr-2" /> Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleDelete(u.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <UserFormModal open={isModalOpen} onOpenChange={setIsModalOpen} userToEdit={editingUser} />
    </div>
  )
}
