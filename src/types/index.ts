export type TransactionType = 'receita' | 'despesa'

export type CropType = 'Soja' | 'Milho' | 'Cana' | 'Geral'

export type TransactionStatus = 'pending' | 'approved' | 'rejected'

export type Role = 'owner' | 'collaborator'

export interface User {
  id: string
  name: string
  email: string
  password?: string
  role: Role
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: TransactionType
  category: string
  comments: string
  crop: CropType
  status?: TransactionStatus
  rejectionReason?: string
  collaboratorName?: string
}

export type InventoryType = 'Semente' | 'Fertilizante' | 'Defensivo' | 'Outros'

export type InventoryUnit = 'kg' | 'sc' | 'L' | 'un'

export interface InventoryItem {
  id: string
  name: string
  type: InventoryType
  quantity: number
  unit: InventoryUnit
  minStock: number
}

export type InvoiceCategory = 'Insumo' | 'Maquinário' | 'Serviço' | 'Venda' | 'Outros'

export interface Invoice {
  id: string
  date: string
  provider: string
  amount: number
  category: InvoiceCategory
  fiscalYear: number
  includedInIr: boolean
  fileName?: string
}

export interface FarmPlotHistory {
  year: number
  crop: CropType
  yield: number
  unit: string
}

export interface FarmPlotInput {
  name: string
  quantity: number
  unit: string
}

export interface FarmPlot {
  id: string
  name: string
  size: number // in hectares
  currentCrop: CropType
  status: 'planting' | 'growing' | 'harvesting' | 'idle'
  history: FarmPlotHistory[]
  inputsUsed: FarmPlotInput[]
}
