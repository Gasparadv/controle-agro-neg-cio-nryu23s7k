import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AgroProvider } from '@/stores/useAgroStore'
import Layout from './components/Layout'
import Index from './pages/Index'
import Financeiro from './pages/Financeiro'
import Culturas from './pages/Culturas'
import Relatorios from './pages/Relatorios'
import NotFound from './pages/NotFound'

const App = () => (
  <AgroProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/financeiro" element={<Financeiro />} />
            <Route path="/culturas" element={<Culturas />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AgroProvider>
)

export default App
