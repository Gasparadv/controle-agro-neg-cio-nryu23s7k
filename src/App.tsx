import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TeamProvider } from '@/stores/useTeamStore'
import { AuthProvider } from '@/stores/useAuthStore'
import { AgroProvider } from '@/stores/useAgroStore'
import { InventoryProvider } from '@/stores/useInventoryStore'
import { InvoiceProvider } from '@/stores/useInvoiceStore'
import { EquipmentProvider } from '@/stores/useEquipmentStore'
import Layout from './components/Layout'
import Index from './pages/Index'
import Financeiro from './pages/Financeiro'
import Culturas from './pages/Culturas'
import Estoque from './pages/Estoque'
import NotasFiscais from './pages/NotasFiscais'
import Relatorios from './pages/Relatorios'
import Mapa from './pages/Mapa'
import Aprovacoes from './pages/Aprovacoes'
import Configuracoes from './pages/Configuracoes'
import Equipamentos from './pages/Equipamentos'
import NotFound from './pages/NotFound'

const App = () => (
  <TeamProvider>
    <AuthProvider>
      <AgroProvider>
        <EquipmentProvider>
          <InventoryProvider>
            <InvoiceProvider>
              <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route element={<Layout />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/mapa" element={<Mapa />} />
                      <Route path="/financeiro" element={<Financeiro />} />
                      <Route path="/estoque" element={<Estoque />} />
                      <Route path="/culturas" element={<Culturas />} />
                      <Route path="/equipamentos" element={<Equipamentos />} />
                      <Route path="/notas-fiscais" element={<NotasFiscais />} />
                      <Route path="/relatorios" element={<Relatorios />} />
                      <Route path="/aprovacoes" element={<Aprovacoes />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </BrowserRouter>
            </InvoiceProvider>
          </InventoryProvider>
        </EquipmentProvider>
      </AgroProvider>
    </AuthProvider>
  </TeamProvider>
)

export default App
