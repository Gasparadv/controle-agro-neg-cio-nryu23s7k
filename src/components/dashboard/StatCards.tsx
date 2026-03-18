import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react'
import { formatBRL } from '@/lib/format'
import useAgroStore from '@/stores/useAgroStore'

export function StatCards() {
  const { transactions } = useAgroStore()

  const receitas = transactions
    .filter((t) => t.type === 'receita')
    .reduce((acc, t) => acc + t.amount, 0)

  const despesas = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((acc, t) => acc + t.amount, 0)

  const saldo = receitas - despesas

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-subtle hover:shadow-elevation transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receita Total (Safra)
          </CardTitle>
          <ArrowUpRight className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBRL(receitas)}</div>
          <p className="text-xs text-muted-foreground mt-1">+12% em relação à safra anterior</p>
        </CardContent>
      </Card>
      <Card className="shadow-subtle hover:shadow-elevation transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas Totais
          </CardTitle>
          <ArrowDownRight className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBRL(despesas)}</div>
          <p className="text-xs text-muted-foreground mt-1">Foco em insumos e manutenção</p>
        </CardContent>
      </Card>
      <Card className="shadow-subtle hover:shadow-elevation transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
          <DollarSign className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBRL(saldo)}</div>
          <p className="text-xs text-muted-foreground mt-1">Projetado até o fim do semestre</p>
        </CardContent>
      </Card>
    </div>
  )
}
