import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExpensePieChart } from '@/components/relatorios/ExpensePieChart'
import { RevenueChart } from '@/components/relatorios/RevenueChart'
import { AccountantReportModal } from '@/components/relatorios/AccountantReportModal'
import { CropInvestmentChart } from '@/components/relatorios/CropInvestmentChart'

export default function Relatorios() {
  const [isAccountantModalOpen, setIsAccountantModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h2>
          <p className="text-muted-foreground">
            Análise detalhada de rentabilidade e custos operacionais.
          </p>
        </div>
        <Button onClick={() => setIsAccountantModalOpen(true)} className="gap-2">
          <FileDown className="h-4 w-4" />
          Gerar Relatório Contador (PDF)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpensePieChart />
        </div>
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CropInvestmentChart />
      </div>

      {/* Spacer to simulate more content down the page if needed */}
      <div className="h-12"></div>

      <AccountantReportModal open={isAccountantModalOpen} onOpenChange={setIsAccountantModalOpen} />
    </div>
  )
}
