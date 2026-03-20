import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Transaction } from '@/types'
import { FileText, Download } from 'lucide-react'

interface DocumentViewerModalProps {
  tx: Transaction | null
  open: boolean
  onOpenChange: (val: boolean) => void
}

export function DocumentViewerModal({ tx, open, onOpenChange }: DocumentViewerModalProps) {
  if (!tx || !tx.attachment) return null

  const isImage = tx.attachmentType?.startsWith('image/')
  const isPdf = tx.attachmentType === 'application/pdf'

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = tx.attachment!
    link.download = tx.attachmentName || 'comprovante'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[95vh] flex flex-col p-4 sm:p-6 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
          <div className="flex flex-col gap-1 overflow-hidden pr-6">
            <DialogTitle className="truncate">Comprovante / Nota Fiscal</DialogTitle>
            <DialogDescription className="truncate">
              {tx.attachmentName || 'Documento anexado'}
            </DialogDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload} className="shrink-0 gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Baixar</span>
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/30 rounded-md min-h-[400px] relative p-2 mt-4">
          {isImage && (
            <img
              src={tx.attachment}
              alt={tx.attachmentName}
              className="max-w-full h-auto max-h-[70vh] object-contain rounded border bg-background shadow-sm"
            />
          )}
          {isPdf && (
            <iframe
              src={`${tx.attachment}#toolbar=0`}
              className="w-full h-[70vh] rounded border bg-background shadow-sm"
              title={tx.attachmentName}
            />
          )}
          {!isImage && !isPdf && (
            <div className="flex flex-col items-center gap-3 text-muted-foreground p-8">
              <FileText className="w-16 h-16" />
              <p>Formato não suportado para visualização direta.</p>
              <Button variant="secondary" onClick={handleDownload} className="mt-4">
                Fazer Download do Arquivo
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
