import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus, Zap } from 'lucide-react'
import useAgroStore from '@/stores/useAgroStore'
import { CropType, TransactionType } from '@/types'
import { useToast } from '@/hooks/use-toast'

export function MappingRulesModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (val: boolean) => void
}) {
  const { mappingRules, addMappingRule, deleteMappingRule, applyMappingRules } = useAgroStore()
  const { toast } = useToast()

  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState('')
  const [crop, setCrop] = useState<CropType | 'Geral'>('Geral')
  const [type, setType] = useState<TransactionType | ''>('')

  const handleAdd = () => {
    if (!keyword) {
      toast({ title: 'Atenção', description: 'Preencha a palavra-chave', variant: 'destructive' })
      return
    }
    addMappingRule({
      id: Date.now().toString(),
      keyword,
      category: category || undefined,
      crop: crop !== 'Geral' ? crop : undefined,
      type: type || undefined,
    })
    setKeyword('')
    setCategory('')
    setCrop('Geral')
    setType('')
  }

  const handleApply = () => {
    applyMappingRules()
    toast({
      title: 'Regras Aplicadas',
      description: 'Registros pendentes foram atualizados com base nas regras ativas.',
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] print:hidden">
        <DialogHeader>
          <DialogTitle>Regras Inteligentes (De-Para)</DialogTitle>
          <DialogDescription>
            Automatize a classificação de extratos importados. Quando a descrição contiver a
            palavra-chave, a regra será aplicada.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col sm:flex-row items-end gap-2 bg-muted/50 p-4 rounded-lg border">
            <div className="w-full space-y-1">
              <Label className="text-xs">Palavra-chave</Label>
              <Input
                placeholder="Ex: agropecuaria"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="w-full space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-1">
              <Label className="text-xs">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Insumos">Insumos</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                  <SelectItem value="Venda">Venda</SelectItem>
                  <SelectItem value="Combustível">Combustível</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full space-y-1">
              <Label className="text-xs">Cultura</Label>
              <Select value={crop} onValueChange={(v: any) => setCrop(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Soja">Soja</SelectItem>
                  <SelectItem value="Milho">Milho</SelectItem>
                  <SelectItem value="Cana">Cana</SelectItem>
                  <SelectItem value="Geral">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAdd} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>

          <div className="border rounded-md max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Palavra-chave</TableHead>
                  <TableHead>Ação Definida</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappingRules.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">"{r.keyword}"</TableCell>
                    <TableCell className="text-xs text-muted-foreground flex items-center gap-3">
                      {r.type && (
                        <span className="bg-muted px-2 py-0.5 rounded">Tipo: {r.type}</span>
                      )}
                      {r.category && (
                        <span className="bg-muted px-2 py-0.5 rounded">Cat: {r.category}</span>
                      )}
                      {r.crop && (
                        <span className="bg-muted px-2 py-0.5 rounded">Cult: {r.crop}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMappingRule(r.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {mappingRules.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                      Nenhuma regra cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900">
            <p className="text-xs text-blue-800 dark:text-blue-300 max-w-[60%]">
              As regras são aplicadas automaticamente em novas importações. Você também pode
              aplicá-las aos registros pendentes agora.
            </p>
            <Button onClick={handleApply} variant="secondary" className="gap-2 mt-2 sm:mt-0">
              <Zap className="h-4 w-4 text-yellow-500" />
              Aplicar aos Pendentes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
