import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import useAgroStore from '@/stores/useAgroStore'
import { formatBRL } from '@/lib/format'

const chartConfig = {
  balance: {
    label: 'Saldo',
    color: 'hsl(var(--primary))',
  },
}

export function CurrentMonthProjectedChart() {
  const { transactions } = useAgroStore()

  const data = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    const currentMonthTxs = transactions.filter((tx) => {
      if (tx.status === 'rejected') return false
      const [y, m] = tx.date.split('-').map(Number)
      return y === currentYear && m - 1 === currentMonth
    })

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    let cumulativeBalance = 0
    const pastTxs = transactions.filter((tx) => {
      if (tx.status === 'rejected') return false
      const [y, m, d] = tx.date.split('-').map(Number)
      const txDate = new Date(y, m - 1, d)
      return txDate < new Date(currentYear, currentMonth, 1)
    })

    cumulativeBalance = pastTxs.reduce((acc, tx) => {
      return acc + (tx.type === 'receita' ? tx.amount : -tx.amount)
    }, 0)

    const dailyData = []

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

      const dayTxs = currentMonthTxs.filter((tx) => tx.date === dateStr)
      const dailyNet = dayTxs.reduce((acc, tx) => {
        return acc + (tx.type === 'receita' ? tx.amount : -tx.amount)
      }, 0)

      cumulativeBalance += dailyNet

      dailyData.push({
        day: String(day).padStart(2, '0'),
        balance: cumulativeBalance,
      })
    }

    return dailyData
  }, [transactions])

  const currentBalance = data[data.length - 1]?.balance || 0

  return (
    <Card className="shadow-subtle">
      <CardHeader>
        <CardTitle>Saldo Projetado do Mês Atual</CardTitle>
        <CardDescription>
          Evolução diária considerando lançamentos confirmados e pendentes. Saldo final estimado:{' '}
          <strong className="text-foreground font-semibold">{formatBRL(currentBalance)}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="var(--color-balance)"
              fillOpacity={1}
              fill="url(#fillBalance)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
