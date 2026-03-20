import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import useAgroStore from '@/stores/useAgroStore'

const chartConfig = {
  value: { label: 'Despesas', color: 'hsl(var(--primary))' },
}

export function CropInvestmentChart() {
  const { transactions } = useAgroStore()

  const expenses = transactions.filter((t) => t.type === 'despesa' && t.status !== 'rejected')
  const aggregated = expenses.reduce(
    (acc, t) => {
      acc[t.crop] = (acc[t.crop] || 0) + Math.abs(t.amount)
      return acc
    },
    {} as Record<string, number>,
  )

  const data = Object.entries(aggregated)
    .map(([crop, value]) => ({ crop, value }))
    .sort((a, b) => b.value - a.value)

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ]

  return (
    <Card className="shadow-subtle h-full">
      <CardHeader>
        <CardTitle>Despesas por Cultura</CardTitle>
        <CardDescription>Distribuição de investimentos e custos operacionais</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="w-full h-[300px]">
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="crop" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis
                tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            Sem dados suficientes
          </div>
        )}
      </CardContent>
    </Card>
  )
}
