import { useState } from 'react'
import { Printer, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import useAgroStore from '@/stores/useAgroStore'
import useInvoiceStore from '@/stores/useInvoiceStore'
import { formatBRL, formatDate } from '@/lib/format'

interface AccountantReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountantReportModal({ open, onOpenChange }: AccountantReportModalProps) {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

  const { transactions } = useAgroStore()
  const { invoices } = useInvoiceStore()

  // Filter only approved transactions for the selected year
  const filteredTxs = transactions.filter(
    (t) => t.status === 'approved' && t.date.startsWith(selectedYear),
  )

  const filteredInvoices = invoices.filter((inv) => inv.fiscalYear.toString() === selectedYear)

  const totalReceitas = filteredTxs
    .filter((t) => t.type === 'receita')
    .reduce((a, b) => a + b.amount, 0)
  const totalDespesas = filteredTxs
    .filter((t) => t.type === 'despesa')
    .reduce((a, b) => a + b.amount, 0)

  const handlePrint = () => {
    // Timeout allows dialog to potentially visually update if needed,
    // but the print CSS will take over the whole screen anyway.
    setTimeout(() => {
      window.print()
    }, 100)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* We add print:hidden to the dialog content so it doesn't show up in the print view */}
        <DialogContent className="sm:max-w-[500px] print:hidden">
          <DialogHeader>
            <DialogTitle>Relatório para o Contador</DialogTitle>
            <DialogDescription>
              Gere um resumo financeiro e fiscal completo para exportação.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label>Selecione o Ano Fiscal</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Ano Fiscal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Receitas:</span>
                <span className="font-semibold text-primary">{formatBRL(totalReceitas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Despesas:</span>
                <span className="font-semibold">{formatBRL(totalDespesas)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notas Fiscais Anexadas:</span>
                <span className="font-semibold">{filteredInvoices.length} docs</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              O relatório em PDF incluirá o detalhamento de todas as movimentações e as marcações de
              declaração de IR.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Imprimir / Salvar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print View Portal Container - Only visible during window.print() */}
      {open && (
        <style type="text/css">
          {`
            @media print {
              body * { visibility: hidden; }
              #accountant-print-view, #accountant-print-view * { visibility: visible; }
              #accountant-print-view { 
                position: absolute; left: 0; top: 0; width: 100%; 
                background: white; color: black; z-index: 99999;
                padding: 40px; margin: 0; display: block !important;
              }
              .print-break-inside-avoid { break-inside: avoid; }
            }
          `}
        </style>
      )}

      {open && (
        <div id="accountant-print-view" className="hidden">
          <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-wider mb-1">AgroFlow</h1>
              <h2 className="text-xl text-gray-600">Relatório Contábil e Fiscal</h2>
            </div>
            <div className="text-right">
              <p className="font-semibold text-lg">Exercício: {selectedYear}</p>
              <p className="text-sm text-gray-500">
                Gerado em: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10 print-break-inside-avoid">
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-bold text-lg mb-2">Resumo Financeiro</h3>
              <p className="flex justify-between border-b border-gray-200 py-1">
                <span>Receitas:</span> <strong>{formatBRL(totalReceitas)}</strong>
              </p>
              <p className="flex justify-between border-b border-gray-200 py-1">
                <span>Despesas:</span> <strong>{formatBRL(totalDespesas)}</strong>
              </p>
              <p className="flex justify-between pt-1 text-lg">
                <span>Resultado:</span> <strong>{formatBRL(totalReceitas - totalDespesas)}</strong>
              </p>
            </div>
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-bold text-lg mb-2">Resumo Fiscal</h3>
              <p className="flex justify-between border-b border-gray-200 py-1">
                <span>Notas Fiscais Listadas:</span> <strong>{filteredInvoices.length}</strong>
              </p>
              <p className="flex justify-between pt-1">
                <span>Marcadas para IR:</span>{' '}
                <strong>{filteredInvoices.filter((i) => i.includedInIr).length}</strong>
              </p>
            </div>
          </div>

          <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2">
            Relação de Notas Fiscais
          </h3>
          {filteredInvoices.length > 0 ? (
            <table className="w-full text-sm mb-10 text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="py-2 px-2">Data</th>
                  <th className="py-2 px-2">Fornecedor</th>
                  <th className="py-2 px-2">Categoria</th>
                  <th className="py-2 px-2 text-right">Valor</th>
                  <th className="py-2 px-2 text-center">Incluído IR</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-200">
                    <td className="py-2 px-2">{formatDate(inv.date)}</td>
                    <td className="py-2 px-2 font-medium">{inv.provider}</td>
                    <td className="py-2 px-2">{inv.category}</td>
                    <td className="py-2 px-2 text-right">{formatBRL(inv.amount)}</td>
                    <td className="py-2 px-2 text-center">{inv.includedInIr ? 'Sim' : 'Não'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 mb-10 italic">
              Nenhuma nota fiscal registrada para este exercício.
            </p>
          )}

          <h3 className="text-xl font-bold mb-4 border-b border-gray-300 pb-2 print-break-inside-avoid">
            Fluxo de Caixa (Lançamentos Aprovados)
          </h3>
          {filteredTxs.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="py-2 px-2">Data</th>
                  <th className="py-2 px-2">Descrição</th>
                  <th className="py-2 px-2">Cultura</th>
                  <th className="py-2 px-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-200 print-break-inside-avoid">
                      <td className="py-2 px-2">{formatDate(tx.date)}</td>
                      <td className="py-2 px-2">
                        <span className="font-medium">{tx.description}</span>
                        <span className="block text-xs text-gray-500">{tx.category}</span>
                      </td>
                      <td className="py-2 px-2">{tx.crop}</td>
                      <td className="py-2 px-2 text-right font-medium">
                        {tx.type === 'despesa' ? '-' : '+'} {formatBRL(tx.amount)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">
              Nenhum lançamento encontrado para este exercício.
            </p>
          )}

          <div className="mt-20 pt-10 border-t border-dashed border-gray-400 text-center text-gray-500 text-sm print-break-inside-avoid">
            Este documento é de uso exclusivo da contabilidade. <br />
            Responsável pelas informações: Fazenda Boa Vista.
          </div>
        </div>
      )}
    </>
  )
}
