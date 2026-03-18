import { useState, useEffect } from 'react'
import { Bell, AlertCircle, CalendarClock, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import useAgroStore from '@/stores/useAgroStore'
import { formatDate } from '@/lib/format'

interface Alert {
  id: string
  type: 'Agricultural' | 'Financial'
  title: string
  description: string
  icon: React.ReactNode
}

export function NotificationBell() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const { transactions } = useAgroStore()

  useEffect(() => {
    const newAlerts: Alert[] = []
    const today = new Date()

    // Agricultural Alert: Sugarcane Harvest in August
    if (today.getMonth() === 7) {
      // 0-indexed, 7 is August
      newAlerts.push({
        id: 'cane-harvest',
        type: 'Agricultural',
        title: 'Alerta de Colheita',
        description: 'A colheita da cana-de-açúcar está programada para este mês.',
        icon: <CalendarClock className="h-4 w-4 text-amber-500" />,
      })
    }

    // Financial Alert: Upcoming or overdue payments
    const upcomingPayments = transactions.filter((t) => {
      if (t.type !== 'despesa') return false
      const txDate = new Date(t.date)
      const diffTime = txDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= -5 && diffDays <= 5 // Overdue by up to 5 days, or upcoming in 5 days
    })

    upcomingPayments.forEach((tx) => {
      newAlerts.push({
        id: `fin-${tx.id}`,
        type: 'Financial',
        title: 'Aviso de Pagamento',
        description: `${tx.description} - Vencimento: ${formatDate(tx.date)}`,
        icon: <AlertCircle className="h-4 w-4 text-destructive" />,
      })
    })

    setAlerts(newAlerts)
  }, [transactions])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {alerts.length > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
          <span className="font-semibold text-sm">Notificações</span>
          <Badge variant="secondary">{alerts.length}</Badge>
        </div>
        <div className="flex flex-col max-h-[300px] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Info className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma notificação no momento.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 border-b p-4 last:border-0 hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5 rounded-full bg-background p-1 shadow-sm border">
                  {alert.icon}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{alert.title}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-normal">
                      {alert.type === 'Agricultural' ? 'Agrícola' : 'Financeiro'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground leading-snug">
                    {alert.description}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
