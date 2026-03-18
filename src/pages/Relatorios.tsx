import { ExpensePieChart } from '@/components/relatorios/ExpensePieChart'
import { RevenueChart } from '@/components/relatorios/RevenueChart'

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Relatórios Financeiros</h2>
        <p className="text-muted-foreground">
          Análise detalhada de rentabilidade e custos operacionais.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ExpensePieChart />
        </div>
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
      </div>

      {/* Spacer to simulate more content down the page if needed */}
      <div className="h-12"></div>
    </div>
  )
}
