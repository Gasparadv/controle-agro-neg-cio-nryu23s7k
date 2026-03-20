import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Tractor, Sprout, Wheat, Leaf } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import useAuthStore from '@/stores/useAuthStore'
import { FarmPlot } from '@/types'

const mockPlots: FarmPlot[] = [
  {
    id: '1',
    name: 'Talhão Norte',
    size: 500,
    currentCrop: 'Soja',
    status: 'growing',
    history: [
      { year: 2023, crop: 'Soja', yield: 65, unit: 'sc/ha' },
      { year: 2022, crop: 'Milho', yield: 110, unit: 'sc/ha' },
      { year: 2021, crop: 'Soja', yield: 62, unit: 'sc/ha' },
    ],
    inputsUsed: [
      { name: 'Semente Soja XPTO', quantity: 1200, unit: 'sc' },
      { name: 'Adubo NPK 10-10-10', quantity: 5000, unit: 'kg' },
      { name: 'Fungicida Azoxistrobina', quantity: 250, unit: 'L' },
    ],
  },
  {
    id: '2',
    name: 'Fazenda Sul (Área 1)',
    size: 800,
    currentCrop: 'Cana',
    status: 'harvesting',
    history: [
      { year: 2023, crop: 'Cana', yield: 85, unit: 'ton/ha' },
      { year: 2022, crop: 'Cana', yield: 92, unit: 'ton/ha' },
      { year: 2021, crop: 'Cana', yield: 105, unit: 'ton/ha' },
    ],
    inputsUsed: [
      { name: 'Herbicida Glifosato', quantity: 800, unit: 'L' },
      { name: 'Fertilizante Foliar', quantity: 400, unit: 'L' },
    ],
  },
  {
    id: '3',
    name: 'Talhão Leste',
    size: 350,
    currentCrop: 'Milho',
    status: 'planting',
    history: [
      { year: 2023, crop: 'Milho', yield: 105, unit: 'sc/ha' },
      { year: 2022, crop: 'Soja', yield: 58, unit: 'sc/ha' },
    ],
    inputsUsed: [
      { name: 'Semente Milho Híbrido', quantity: 700, unit: 'sc' },
      { name: 'Ureia Agrícola', quantity: 3000, unit: 'kg' },
    ],
  },
  {
    id: '4',
    name: 'Área de Pousio',
    size: 150,
    currentCrop: 'Geral',
    status: 'idle',
    history: [{ year: 2023, crop: 'Soja', yield: 55, unit: 'sc/ha' }],
    inputsUsed: [],
  },
]

export default function Mapa() {
  const { role } = useAuthStore()
  const [selectedPlot, setSelectedPlot] = useState<FarmPlot | null>(null)

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const getCropColor = (crop: string) => {
    switch (crop) {
      case 'Soja':
        return 'bg-emerald-100 border-emerald-400 text-emerald-800 hover:bg-emerald-200'
      case 'Milho':
        return 'bg-amber-100 border-amber-400 text-amber-800 hover:bg-amber-200'
      case 'Cana':
        return 'bg-purple-100 border-purple-400 text-purple-800 hover:bg-purple-200'
      default:
        return 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
    }
  }

  const getCropIcon = (crop: string) => {
    switch (crop) {
      case 'Soja':
        return <Sprout className="h-6 w-6" />
      case 'Milho':
        return <Wheat className="h-6 w-6" />
      case 'Cana':
        return <Leaf className="h-6 w-6" />
      default:
        return <Tractor className="h-6 w-6 opacity-50" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Mapa da Fazenda (Croqui)</h2>
        <p className="text-muted-foreground text-sm">
          Visualize seus talhões e clique para ver o histórico e consumo de insumos.
        </p>
      </div>

      <Card className="shadow-subtle border-muted/60 bg-muted/10 p-4">
        {/* Farm Map Grid - Abstract Representation */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-3 gap-4 h-[600px] auto-rows-fr p-2 rounded-xl border-2 border-dashed border-muted-foreground/20">
          <div
            className={cn(
              'col-span-1 md:col-span-2 md:row-span-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-sm',
              getCropColor(mockPlots[0].currentCrop),
            )}
            onClick={() => setSelectedPlot(mockPlots[0])}
          >
            <div className="absolute top-4 right-4">{getCropIcon(mockPlots[0].currentCrop)}</div>
            <h3 className="font-bold text-lg">{mockPlots[0].name}</h3>
            <p className="opacity-80">
              {mockPlots[0].size} ha • {mockPlots[0].currentCrop}
            </p>
            <div className="absolute bottom-4 left-4">
              <Badge variant="outline" className="bg-background/50 border-current backdrop-blur-sm">
                Crescimento
              </Badge>
            </div>
          </div>

          <div
            className={cn(
              'col-span-1 md:col-span-2 md:row-span-1 rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-sm',
              getCropColor(mockPlots[2].currentCrop),
            )}
            onClick={() => setSelectedPlot(mockPlots[2])}
          >
            <div className="absolute top-4 right-4">{getCropIcon(mockPlots[2].currentCrop)}</div>
            <h3 className="font-bold text-lg">{mockPlots[2].name}</h3>
            <p className="opacity-80">
              {mockPlots[2].size} ha • {mockPlots[2].currentCrop}
            </p>
            <div className="absolute bottom-4 left-4">
              <Badge variant="outline" className="bg-background/50 border-current backdrop-blur-sm">
                Plantio
              </Badge>
            </div>
          </div>

          <div
            className={cn(
              'col-span-1 md:col-span-1 md:row-span-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-sm',
              getCropColor(mockPlots[3].currentCrop),
            )}
            onClick={() => setSelectedPlot(mockPlots[3])}
          >
            <div className="absolute top-4 right-4">{getCropIcon(mockPlots[3].currentCrop)}</div>
            <h3 className="font-bold text-lg">{mockPlots[3].name}</h3>
            <p className="opacity-80">{mockPlots[3].size} ha • Pousio</p>
            <div className="absolute bottom-4 left-4">
              <Badge variant="outline" className="bg-background/50 border-current backdrop-blur-sm">
                Inativo
              </Badge>
            </div>
          </div>

          <div
            className={cn(
              'col-span-1 md:col-span-1 md:row-span-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group shadow-sm',
              getCropColor(mockPlots[1].currentCrop),
            )}
            onClick={() => setSelectedPlot(mockPlots[1])}
          >
            <div className="absolute top-4 right-4">{getCropIcon(mockPlots[1].currentCrop)}</div>
            <h3 className="font-bold text-lg leading-tight">{mockPlots[1].name}</h3>
            <p className="opacity-80">
              {mockPlots[1].size} ha • {mockPlots[1].currentCrop}
            </p>
            <div className="absolute bottom-4 left-4">
              <Badge variant="outline" className="bg-background/50 border-current backdrop-blur-sm">
                Colheita
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Sheet open={!!selectedPlot} onOpenChange={(open) => !open && setSelectedPlot(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedPlot && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'p-2 rounded-md border',
                      getCropColor(selectedPlot.currentCrop).split(' ')[0],
                      getCropColor(selectedPlot.currentCrop).split(' ')[1],
                    )}
                  >
                    {getCropIcon(selectedPlot.currentCrop)}
                  </div>
                  <div>
                    <SheetTitle className="text-2xl">{selectedPlot.name}</SheetTitle>
                    <SheetDescription>
                      {selectedPlot.size} Hectares • Cultura atual: {selectedPlot.currentCrop}
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    Histórico de Plantio
                  </h4>
                  <div className="space-y-3">
                    {selectedPlot.history.map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card/50"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="font-mono">
                            {h.year}
                          </Badge>
                          <span className="font-medium">{h.crop}</span>
                        </div>
                        <div className="text-sm text-muted-foreground text-right">
                          <span className="font-semibold text-foreground">{h.yield}</span> {h.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    Insumos Utilizados (Safra Atual)
                  </h4>
                  {selectedPlot.inputsUsed.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPlot.inputsUsed.map((input, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center py-2 border-b last:border-0 text-sm"
                        >
                          <span>{input.name}</span>
                          <span className="font-medium">
                            {input.quantity} {input.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Nenhum insumo registrado nesta safra.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
