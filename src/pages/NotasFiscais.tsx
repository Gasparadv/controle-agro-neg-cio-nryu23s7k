import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Upload, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InvoiceTable } from '@/components/notas/InvoiceTable'
import { InvoiceUploadModal } from '@/components/notas/InvoiceUploadModal'
import useInvoiceStore from '@/stores/useInvoiceStore'
import useAuthStore from '@/stores/useAuthStore'

export default function NotasFiscais() {
  const { role } = useAuthStore()
  const { invoices } = useInvoiceStore()

  const currentYear = new Date().getFullYear().toString()
  const [filterYear, setFilterYear] = useState<string>(currentYear)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  if (role !== 'admin') {
    return <Navigate to="/" replace />
  }

  const filteredInvoices = invoices.filter(
    (inv) => filterYear === 'Todos' || inv.fiscalYear.toString() === filterYear,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight">Repositório Fiscal</h2>
          <p className="text-muted-foreground text-sm">
            Centralize suas Notas Fiscais para declaração de Imposto de Renda.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Ano Fiscal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os Anos</SelectItem>
                <SelectItem value="2024">Exercício 2024</SelectItem>
                <SelectItem value="2023">Exercício 2023</SelectItem>
                <SelectItem value="2022">Exercício 2022</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Anexar Documento
          </Button>
        </div>
      </div>

      <InvoiceTable invoices={filteredInvoices} />

      <InvoiceUploadModal open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen} />
    </div>
  )
}
