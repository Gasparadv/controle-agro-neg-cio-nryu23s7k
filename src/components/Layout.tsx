import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  Sprout,
  PieChart,
  Boxes,
  FileText,
  Plus,
  Map as MapIcon,
  CheckSquare,
  Users,
} from 'lucide-react'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NotificationBell } from './notifications/NotificationBell'
import { QuickAddModal } from './financeiro/QuickAddModal'
import useAuthStore from '@/stores/useAuthStore'
import useAgroStore from '@/stores/useAgroStore'
import useTeamStore from '@/stores/useTeamStore'

const titleMap: Record<string, string> = {
  '/': 'Visão Geral',
  '/financeiro': 'Controle Financeiro',
  '/estoque': 'Estoque de Insumos',
  '/culturas': 'Gestão de Culturas',
  '/notas-fiscais': 'Notas Fiscais',
  '/relatorios': 'Relatórios Gerenciais',
  '/mapa': 'Mapa da Fazenda',
  '/aprovacoes': 'Aprovações Pendentes',
  '/equipe': 'Gerenciamento de Equipe',
}

export function Layout() {
  const location = useLocation()
  const { user, setActiveUser, role, userName } = useAuthStore()
  const { users } = useTeamStore()
  const { transactions } = useAgroStore()
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)

  const pageTitle = titleMap[location.pathname] || 'AgroFlow'

  const pendingCount = transactions.filter((t) => t.status === 'pending').length

  const navItems = [
    { name: 'Visão Geral', path: '/', icon: LayoutDashboard },
    { name: 'Mapa da Fazenda', path: '/mapa', icon: MapIcon },
    { name: 'Financeiro', path: '/financeiro', icon: Wallet },
    { name: 'Estoque', path: '/estoque', icon: Boxes },
    { name: 'Culturas', path: '/culturas', icon: Sprout },
    { name: 'Notas Fiscais', path: '/notas-fiscais', icon: FileText },
    { name: 'Relatórios', path: '/relatorios', icon: PieChart },
  ]

  if (role === 'owner') {
    navItems.push({ name: 'Aprovações', path: '/aprovacoes', icon: CheckSquare })
    navItems.push({ name: 'Equipe', path: '/equipe', icon: Users })
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground print:hidden">
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-6">
            <div className="flex items-center gap-2 text-primary">
              <Sprout className="h-8 w-8" />
              <span className="text-xl font-bold tracking-tight">AgroFlow</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarGroup>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  const isAprovacoes = item.path === '/aprovacoes'
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                        <Link to={item.path} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </div>
                          {isAprovacoes && pendingCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full p-0"
                            >
                              {pendingCount}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-3 border-r pr-4 mr-2">
                <Label className="text-xs font-medium text-muted-foreground hidden sm:block">
                  Atuando como:
                </Label>
                <Select value={user?.id} onValueChange={setActiveUser}>
                  <SelectTrigger className="w-[180px] h-8 bg-muted/50 border-none">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        <div className="flex items-center gap-2">
                          <span className={u.role === 'owner' ? 'text-primary' : 'text-yellow-600'}>
                            {u.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({u.role === 'owner' ? 'Prop.' : 'Assist.'})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden text-sm font-medium text-muted-foreground lg:block">
                Fazenda Boa Vista
              </div>
              <NotificationBell />
              <Button onClick={() => setIsQuickAddOpen(true)} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Lançamento</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-6xl animate-fade-in-up">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>

      <QuickAddModal open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen} />
    </SidebarProvider>
  )
}

export default Layout
