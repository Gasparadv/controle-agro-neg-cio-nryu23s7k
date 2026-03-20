import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Paperclip, X, FileText, UploadCloud, Camera, Loader2 } from 'lucide-react'

interface AttachmentUploadProps {
  attachment?: string
  attachmentName?: string
  attachmentType?: string
  onChange: (attachment?: string, name?: string, type?: string) => void
}

export function AttachmentUpload({
  attachment,
  attachmentName,
  attachmentType,
  onChange,
}: AttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [isCompressing, setIsCompressing] = useState(false)

  const compressImage = (base64Str: string, fileType: string, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64Str.startsWith('data:image')) {
        resolve(base64Str)
        return
      }
      const img = new Image()
      img.src = base64Str
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL(fileType, 0.7))
      }
      img.onerror = () => resolve(base64Str)
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsCompressing(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      try {
        const compressed = await compressImage(base64, file.type)
        onChange(compressed, file.name, file.type)
      } catch (error) {
        onChange(base64, file.name, file.type)
      } finally {
        setIsCompressing(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (cameraInputRef.current) cameraInputRef.current.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    onChange(undefined, undefined, undefined)
  }

  const isImage = attachmentType?.startsWith('image/')
  const isPdf = attachmentType === 'application/pdf'

  return (
    <div className="space-y-2">
      <Label>Comprovante / Nota Fiscal</Label>

      {!attachment ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto bg-muted/50 border-dashed border-2 hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
          >
            {isCompressing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4 mr-2 text-muted-foreground" />
            )}
            {isCompressing ? 'Processando...' : 'Anexar Arquivo'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:hidden bg-muted/50 border-dashed border-2 hover:bg-muted"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isCompressing}
          >
            <Camera className="w-4 h-4 mr-2 text-muted-foreground" />
            Tirar Foto
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={handleFileChange}
          />
          <input
            type="file"
            ref={cameraInputRef}
            className="hidden"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/30">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 bg-background border rounded flex items-center justify-center overflow-hidden">
              {isImage ? (
                <img src={attachment} alt="preview" className="w-full h-full object-cover" />
              ) : isPdf ? (
                <FileText className="w-5 h-5 text-red-500" />
              ) : (
                <Paperclip className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate" title={attachmentName}>
                {attachmentName}
              </p>
              <p className="text-xs text-muted-foreground">
                {isImage ? 'Imagem' : isPdf ? 'Documento PDF' : 'Arquivo'}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
