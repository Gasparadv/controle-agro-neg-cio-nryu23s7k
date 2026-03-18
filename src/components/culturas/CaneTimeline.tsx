import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Tractor } from 'lucide-react'

const years = [
  { year: 1, title: 'Cana Planta', desc: 'Plantio inicial e primeira colheita.' },
  { year: 2, title: '1ª Soca', desc: 'Primeira rebrota, produtividade alta.' },
  { year: 3, title: '2ª Soca', desc: 'Segunda rebrota, manutenção essencial.' },
  { year: 4, title: '3ª Soca', desc: 'Terceira rebrota, declínio natural.' },
  { year: 5, title: '4ª Soca', desc: 'Último ciclo antes da reforma do canavial.' },
]

export function CaneTimeline() {
  const currentYear = 2

  return (
    <Card className="shadow-subtle">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Ciclo de 5 Anos: Cana de Açúcar</CardTitle>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
            Fazenda Sul - 1200ha
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative border-l-2 border-muted ml-6 space-y-8 pb-4">
          {years.map((y) => {
            const isCurrent = y.year === currentYear
            const isPast = y.year < currentYear

            return (
              <div key={y.year} className="relative pl-8">
                <div
                  className={cn(
                    'absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background',
                    isCurrent
                      ? 'border-secondary text-secondary'
                      : isPast
                        ? 'border-primary text-primary'
                        : 'border-muted text-muted-foreground',
                  )}
                >
                  <span className="text-xs font-bold">{y.year}</span>
                </div>
                <div
                  className={cn(
                    'rounded-lg border p-4 transition-all duration-300',
                    isCurrent ? 'bg-secondary/5 border-secondary/20 shadow-sm' : 'bg-card',
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {y.title}
                        {isCurrent && (
                          <Badge className="bg-secondary hover:bg-secondary">Ano Atual</Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">{y.desc}</p>
                    </div>
                    {isCurrent && (
                      <div className="text-right bg-background p-2 rounded-md border text-xs">
                        <Tractor className="h-4 w-4 inline-block mr-1 text-secondary" />
                        <span className="font-medium">Colheita em Agosto</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
