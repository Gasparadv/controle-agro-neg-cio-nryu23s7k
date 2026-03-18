import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import useAgroStore from '@/stores/useAgroStore'

const chartConfig = {
  insumos: { label: 'Insumos', color: 'hsl(var(--chart-1))' },
  manutencao: { label: 'Manutenção', color: 'hsl(var(--chart-2))' },
  maodeobra: { label: 'Mão de Obra', color: 'hsl(var(--chart-3))' },
  outros: { label: 'Outros', color: 'hsl(var(--chart-4))' },
}

export function ExpensePieChart() {
  const { transactions } = useAgroStore()

  // Dynamic aggregation
  const expenses = transactions.filter((t) => t.type === 'despesa')
  const aggregated = expenses.reduce(
    (acc, t) => {
      let key = 'outros'
      if (t.category === 'Insumos') key = 'insumos'
      if (t.category === 'Manutenção') key = 'manutencao'
      if (t.category === 'Mão de Obra') key = 'maodeobra'

      acc[key] = (acc[key] || 0) + t.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const data = Object.entries(aggregated).map(([key, value]) => ({
    id: key,
    name: chartConfig[key as keyof typeof chartConfig]?.label || key,
    value,
  }))

  return (
    <Card className="shadow-subtle h-full flex flex-col">
      <CardHeader>
        <CardTitle>Distribuição de Despesas</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="w-full h-[250px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.id} fill={`var(--color-${entry.id})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="text-muted-foreground text-sm">Sem dados suficientes</div>
        )}
      </CardContent>
    </Card>
  )
}
