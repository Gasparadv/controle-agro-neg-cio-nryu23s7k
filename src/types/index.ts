export type TransactionType = 'receita' | 'despesa'

export type CropType = 'Soja' | 'Milho' | 'Cana' | 'Geral'

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: TransactionType
  category: string
  comments: string
  crop: CropType
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
