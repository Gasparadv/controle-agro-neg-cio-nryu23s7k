import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { month: 'Out', receita: 40000, despesa: 24000 },
  { month: 'Nov', receita: 30000, despesa: 13900 },
  { month: 'Dez', receita: 20000, despesa: 9800 },
  { month: 'Jan', receita: 27800, despesa: 39000 },
  { month: 'Fev', receita: 18900, despesa: 4800 },
  { month: 'Mar', receita: 150000, despesa: 3800 },
]

const chartConfig = {
  receita: {
    label: 'Receitas',
    color: 'hsl(var(--primary))',
  },
  despesa: {
    label: 'Despesas',
    color: 'hsl(var(--destructive))',
  },
}

export function CashFlowChart() {
  return (
    <Card className="shadow-subtle">
      <CardHeader>
        <CardTitle>Fluxo de Caixa (Últimos 6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesa" fill="var(--color-despesa)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
