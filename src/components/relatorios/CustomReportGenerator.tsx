import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Download, Printer, Filter } from 'lucide-react'
import useAgroStore from '@/stores/useAgroStore'
import useEquipmentStore from '@/stores/useEquipmentStore'
import { formatBRL, formatDate } from '@/lib/format'
import { exportReportToCSV } from '@/lib/export'

export function CustomReportGenerator() {
  const { transactions } = useAgroStore()
  const { equipments } = useEquipmentStore()

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [equipmentFilter, setEquipmentFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredData = useMemo(() => {
    return transactions
      .filter((t) => {
        // Keep approved and historically relevant txs
        if (t.status === 'rejected') return false

        if (dateFrom && t.date < dateFrom) return false
        if (dateTo && t.date > dateTo) return false
        if (equipmentFilter !== 'all') {
          if (equipmentFilter === 'none' && t.equipmentId) return false
          if (equipmentFilter !== 'none' && t.equipmentId !== equipmentFilter) return false
        }
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
        if (typeFilter !== 'all' && t.type !== typeFilter) return false

        return true
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [transactions, dateFrom, dateTo, equipmentFilter, categoryFilter, typeFilter])

  const totalDebits = filteredData
    .filter((t) => t.type === 'despesa')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)
  const totalCredits = filteredData
    .filter((t) => t.type === 'receita')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0)
  const netTotal = totalCredits - totalDebits

  const handleExportCSV = () => {
    const dataToExport = filteredData.map((t) => {
      const eq = t.equipmentId
        ? equipments.find((e) => e.id === t.equipmentId)?.name || 'Equipamento Removido'
        : '-'
      return {
        Data: formatDate(t.date),
        Descrição: t.description,
        Equipamento: eq,
        Categoria: t.category,
        Tipo: t.type === 'despesa' ? 'Saída' : 'Entrada',
        Valor: Math.abs(t.amount),
      }
    })
    exportReportToCSV(dataToExport, 'relatorio_customizado')
  }

  return (
    <>
      <style type="text/css">
        {`
          @media print {
            body * { visibility: hidden; }
            #custom-report-print, #custom-report-print * { visibility: visible; }
            #custom-report-print { 
              position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; background: white; color: black; z-index: 99999;
            }
            .print-hide { display: none !important; }
          }
        `}
      </style>

      <Card className="shadow-subtle mt-8">
        <CardHeader className="print-hide">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Motor de Relatórios Customizados
          </CardTitle>
          <CardDescription>
            Filtre por período, categoria, equipamento ou tipo para extrair análises aprofundadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 print-hide">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Equipamento</Label>
              <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="none">Sem equipamento</SelectItem>
                  {equipments.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Peças">Peças</SelectItem>
                  <SelectItem value="Combustível">Combustível</SelectItem>
                  <SelectItem value="Retirada de Sócios">Retirada de Sócios</SelectItem>
                  <SelectItem value="Insumos">Insumos</SelectItem>
                  <SelectItem value="Mão de Obra">Mão de Obra</SelectItem>
                  <SelectItem value="Venda">Venda</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="despesa">Apenas Saídas (-)</SelectItem>
                  <SelectItem value="receita">Apenas Entradas (+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div id="custom-report-print">
            <div className="hidden print:block mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold">Relatório Financeiro Detalhado</h1>
              <p className="text-gray-500 mt-2 text-sm">
                Filtros aplicados: Período: {dateFrom ? formatDate(dateFrom) : 'Início'} até{' '}
                {dateTo ? formatDate(dateTo) : 'Atual'} | Categoria: {categoryFilter} | Equipamento:{' '}
                {equipmentFilter !== 'all' && equipmentFilter !== 'none'
                  ? equipments.find((e) => e.id === equipmentFilter)?.name
                  : equipmentFilter}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/30 p-4 rounded-lg border flex flex-col justify-center items-center text-center">
                <span className="text-sm text-muted-foreground">Total Entradas</span>
                <span className="text-lg font-bold text-green-600">{formatBRL(totalCredits)}</span>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border flex flex-col justify-center items-center text-center">
                <span className="text-sm text-muted-foreground">Total Saídas</span>
                <span className="text-lg font-bold text-destructive">{formatBRL(totalDebits)}</span>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg border flex flex-col justify-center items-center text-center">
                <span className="text-sm text-muted-foreground">Saldo no Período</span>
                <span
                  className={`text-lg font-bold ${netTotal >= 0 ? 'text-primary' : 'text-destructive'}`}
                >
                  {formatBRL(netTotal)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4 print-hide">
              <div className="text-sm text-muted-foreground">
                {filteredData.length} registros encontrados
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                  <Download className="h-4 w-4" /> Exportar CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTimeout(() => window.print(), 100)}
                  className="gap-2"
                >
                  <Printer className="h-4 w-4" /> Exportar PDF
                </Button>
              </div>
            </div>

            <div className="border rounded-md max-h-[400px] overflow-y-auto print:max-h-none print:overflow-visible">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10 print:static">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((t) => {
                    const eq = t.equipmentId
                      ? equipments.find((e) => e.id === t.equipmentId)?.name ||
                        'Equipamento Removido'
                      : '-'
                    return (
                      <TableRow key={t.id} className="print:break-inside-avoid">
                        <TableCell className="whitespace-nowrap">{formatDate(t.date)}</TableCell>
                        <TableCell className="font-medium">{t.description}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{eq}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            {t.category}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium whitespace-nowrap ${t.type === 'despesa' ? 'text-destructive' : 'text-green-600'}`}
                        >
                          {t.type === 'despesa' ? '-' : '+'} {formatBRL(Math.abs(t.amount))}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        Nenhum registro encontrado para os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
