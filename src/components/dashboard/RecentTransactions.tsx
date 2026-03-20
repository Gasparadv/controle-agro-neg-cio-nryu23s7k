import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatBRL, formatDate } from '@/lib/format'
import { ArrowRight, Tractor } from 'lucide-react'
import useAgroStore from '@/stores/useAgroStore'
import useEquipmentStore from '@/stores/useEquipmentStore'

export function RecentTransactions() {
  const { transactions } = useAgroStore()
  const { equipments } = useEquipmentStore()

  // Get 5 most recent approved/pending transactions
  const recentTxs = transactions
    .filter((t) => t.status !== 'rejected')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const getEquipmentName = (id?: string) => {
    if (!id) return null
    const eq = equipments.find((e) => e.id === id)
    return eq ? eq.name : 'Equipamento Removido'
  }

  return (
    <Card className="shadow-subtle">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle>Últimos Lançamentos</CardTitle>
          <CardDescription>Acompanhe a movimentação recente do caixa.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="hidden sm:flex gap-1" asChild>
          <Link to="/financeiro">
            Ver Todos <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mt-2">
          {recentTxs.map((tx) => {
            const eqName = getEquipmentName(tx.equipmentId)
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm sm:text-base leading-none">
                    {tx.description}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{formatDate(tx.date)}</span>
                    <span className="hidden sm:inline">•</span>
                    <Badge variant="secondary" className="font-normal px-1.5 h-4 text-[10px]">
                      {tx.category}
                    </Badge>
                    {eqName && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <Tractor className="h-3 w-3" /> {eqName}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div
                  className={`font-semibold text-sm sm:text-base whitespace-nowrap ${tx.type === 'despesa' ? '' : 'text-primary'}`}
                >
                  {tx.type === 'despesa' ? '-' : '+'} {formatBRL(Math.abs(tx.amount))}
                </div>
              </div>
            )
          })}

          {recentTxs.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Nenhum lançamento encontrado.
            </div>
          )}
        </div>
        <Button variant="outline" className="w-full mt-4 sm:hidden" asChild>
          <Link to="/financeiro">Ver Todos Lançamentos</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
