import { Navigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SoyTimeline } from '@/components/culturas/SoyTimeline'
import { CaneTimeline } from '@/components/culturas/CaneTimeline'
import useAuthStore from '@/stores/useAuthStore'

export default function Culturas() {
  const { role } = useAuthStore()

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Monitoramento de Safras</h2>
        <p className="text-muted-foreground">
          Acompanhe o desenvolvimento e os prazos das suas culturas ativas.
        </p>
      </div>

      <Tabs defaultValue="soja" className="w-full">
        <TabsList className="mb-4 bg-muted/50 p-1">
          <TabsTrigger value="soja" className="px-8">
            Soja e Milho (6 Meses)
          </TabsTrigger>
          <TabsTrigger value="cana" className="px-8">
            Cana de Açúcar (5 Anos)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="soja" className="animate-fade-in-up">
          <SoyTimeline />
        </TabsContent>
        <TabsContent value="cana" className="animate-fade-in-up">
          <CaneTimeline />
        </TabsContent>
      </Tabs>
    </div>
  )
}
