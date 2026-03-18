import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Wallet, Sprout, PieChart, Plus } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'

const navItems = [
  { name: 'Visão Geral', path: '/', icon: LayoutDashboard },
  { name: 'Financeiro', path: '/financeiro', icon: Wallet },
  { name: 'Culturas', path: '/culturas', icon: Sprout },
  { name: 'Relatórios', path: '/relatorios', icon: PieChart },
]

const titleMap: Record<string, string> = {
  '/': 'Visão Geral',
  '/financeiro': 'Controle Financeiro',
  '/culturas': 'Gestão de Culturas',
  '/relatorios': 'Relatórios Gerenciais',
}

export function Layout() {
  const location = useLocation()
  const { toast } = useToast()
  const pageTitle = titleMap[location.pathname] || 'AgroFlow'

  const handleQuickAdd = () => {
    toast({
      title: 'Novo Lançamento',
      description: 'Esta funcionalidade abrirá um modal de cadastro rápido em breve.',
    })
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
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
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                        <Link to={item.path}>
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
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
            <div className="flex items-center gap-4">
              <div className="hidden text-sm font-medium text-muted-foreground md:block">
                Fazenda Boa Vista
              </div>
              <Button onClick={handleQuickAdd} size="sm" className="gap-2">
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
    </SidebarProvider>
  )
}

export default Layout
