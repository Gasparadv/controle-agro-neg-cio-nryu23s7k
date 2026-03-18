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
