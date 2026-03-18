import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sprout } from 'lucide-react'

export function CropStatusWidget() {
  return (
    <Card className="shadow-subtle">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle>Status das Culturas Ativas</CardTitle>
        <Sprout className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span>Soja (Talhão Norte)</span>
            <span className="text-muted-foreground">Mês 4 de 6</span>
          </div>
          <Progress value={(4 / 6) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Fase atual: Desenvolvimento Vegetativo
          </p>
        </div>
        <div>
          <div className="flex justify-between mb-2 text-sm font-medium">
            <span>Cana de Açúcar (Fazenda Sul)</span>
            <span className="text-muted-foreground">Ano 2 de 5</span>
          </div>
          <Progress value={(2 / 5) * 100} className="h-2 [&>div]:bg-secondary" />
          <p className="text-xs text-muted-foreground mt-2">
            Próxima colheita estimada para Agosto.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
