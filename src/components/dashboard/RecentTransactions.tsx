import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatBRL, formatDate } from '@/lib/format'
import useAgroStore from '@/stores/useAgroStore'
import { Badge } from '@/components/ui/badge'

export function RecentTransactions() {
  const { transactions } = useAgroStore()
  const recent = transactions.slice(0, 5)

  return (
    <Card className="shadow-subtle">
      <CardHeader>
        <CardTitle>Últimos Lançamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recent.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{tx.description}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(tx.date)} • {tx.category}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`font-semibold text-sm ${
                    tx.type === 'receita' ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {tx.type === 'despesa' ? '-' : '+'} {formatBRL(tx.amount)}
                </span>
                <Badge
                  variant={tx.type === 'receita' ? 'default' : 'destructive'}
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {tx.type === 'receita' ? 'Receita' : 'Despesa'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
