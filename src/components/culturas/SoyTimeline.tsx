import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

const months = ['Outubro', 'Novembro', 'Dezembro', 'Janeiro', 'Fevereiro', 'Março']

export function SoyTimeline() {
  const currentMonthIndex = 3 // Simulating January as the 4th month

  return (
    <div className="space-y-6">
      <Card className="shadow-subtle">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Ciclo Atual: Soja (Safra de Verão)</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Talhão Norte - 500ha
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {months.map((month, index) => {
              const isPast = index < currentMonthIndex
              const isCurrent = index === currentMonthIndex
              const isFuture = index > currentMonthIndex

              return (
                <div
                  key={month}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-md text-sm transition-all duration-300',
                    isPast && 'bg-primary/20 text-primary border border-primary/30',
                    isCurrent && 'bg-primary text-primary-foreground shadow-md scale-105',
                    isFuture && 'bg-muted text-muted-foreground border border-transparent',
                  )}
                >
                  <span className="font-semibold">{month}</span>
                  {isPast && <Check className="h-4 w-4 mt-1 opacity-70" />}
                  {isCurrent && <span className="text-[10px] mt-1 opacity-90">Atual</span>}
                </div>
              )
            })}
          </div>
          <div className="mt-6 p-4 rounded-lg bg-muted/50 border flex flex-col md:flex-row gap-4 justify-between">
            <div>
              <h4 className="font-semibold text-sm">Fase: Desenvolvimento Vegetativo</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Aplicação de fungicida recomendada para as próximas semanas.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Previsão de Colheita</span>
              <p className="font-semibold text-sm">20 de Março</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
