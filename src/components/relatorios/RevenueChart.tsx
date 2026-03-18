import { Line, LineChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const data = [
  { month: 'Jan', soja: 0, cana: 0 },
  { month: 'Fev', soja: 0, cana: 0 },
  { month: 'Mar', soja: 150000, cana: 0 },
  { month: 'Abr', soja: 0, cana: 0 },
  { month: 'Mai', soja: 0, cana: 0 },
  { month: 'Jun', soja: 0, cana: 0 },
  { month: 'Jul', soja: 0, cana: 0 },
  { month: 'Ago', soja: 0, cana: 280000 },
]

const chartConfig = {
  soja: { label: 'Receita Soja', color: 'hsl(var(--primary))' },
  cana: { label: 'Receita Cana', color: 'hsl(var(--secondary))' },
}

export function RevenueChart() {
  return (
    <Card className="shadow-subtle h-full">
      <CardHeader>
        <CardTitle>Projeção Anual de Receitas</CardTitle>
        <CardDescription>Picos esperados de faturamento por cultura</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="w-full h-[250px]">
          <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="soja"
              stroke="var(--color-soja)"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="cana"
              stroke="var(--color-cana)"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
