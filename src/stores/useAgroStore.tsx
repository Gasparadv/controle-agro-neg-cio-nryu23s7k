import React, { createContext, useContext, useState, useEffect } from 'react'
import { Transaction, ImportBatch, MappingRule } from '@/types'
import { fetchFromPB, saveToPB, deleteFromPB } from '@/lib/api'

interface AgroStoreContextType {
  transactions: Transaction[]
  importBatches: ImportBatch[]
  mappingRules: MappingRule[]
  isLoading: boolean
  addTransaction: (tx: Transaction) => void
  addTransactions: (txs: Transaction[]) => void
  updateTransaction: (tx: Transaction) => void
  deleteTransaction: (id: string) => void
  approveTransaction: (id: string) => void
  rejectTransaction: (id: string, reason: string) => void
  addImportBatch: (batch: ImportBatch) => void
  undoImportBatch: (batchId: string) => void
  addMappingRule: (rule: MappingRule) => void
  deleteMappingRule: (id: string) => void
  applyMappingRules: () => void
  bulkUpdateTransactions: (ids: string[], updates: Partial<Transaction>) => void
  bulkDeleteTransactions: (ids: string[]) => void
}

const AgroStoreContext = createContext<AgroStoreContextType | undefined>(undefined)

export function AgroProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([])
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const [txs, batches, rules] = await Promise.all([
        fetchFromPB('transactions'),
        fetchFromPB('import_batches'),
        fetchFromPB('mapping_rules'),
      ])
      setTransactions(txs || [])
      setImportBatches(batches || [])
      setMappingRules(rules || [])
      setIsLoading(false)
    }
    loadData()
  }, [])

  const addTransaction = async (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev])
    const saved = await saveToPB('transactions', tx)
    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? saved : t)))
  }

  const addTransactions = async (txs: Transaction[]) => {
    setTransactions((prev) => [...txs, ...prev])
    const savedTxs = await Promise.all(
      txs.map((tx) => saveToPB('transactions', tx).then((saved) => ({ tempId: tx.id, saved }))),
    )
    setTransactions((prev) =>
      prev.map((p) => {
        const match = savedTxs.find((s) => s.tempId === p.id)
        return match ? match.saved : p
      }),
    )
  }

  const updateTransaction = async (tx: Transaction) => {
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? tx : item)))
    const saved = await saveToPB('transactions', tx)
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? saved : item)))
  }

  const deleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id))
    await deleteFromPB('transactions', id)
  }

  const approveTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id)
    if (!tx) return
    const newTx = { ...tx, status: 'approved' as const, rejectionReason: undefined }
    setTransactions((prev) => prev.map((item) => (item.id === id ? newTx : item)))
    await saveToPB('transactions', newTx)
  }

  const rejectTransaction = async (id: string, reason: string) => {
    const tx = transactions.find((t) => t.id === id)
    if (!tx) return
    const newTx = { ...tx, status: 'rejected' as const, rejectionReason: reason }
    setTransactions((prev) => prev.map((item) => (item.id === id ? newTx : item)))
    await saveToPB('transactions', newTx)
  }

  const addImportBatch = async (batch: ImportBatch) => {
    setImportBatches((prev) => [batch, ...prev])
    const saved = await saveToPB('import_batches', batch)
    setImportBatches((prev) => prev.map((b) => (b.id === batch.id ? saved : b)))
  }

  const undoImportBatch = async (batchId: string) => {
    const txsToRemove = transactions.filter((tx) => tx.importBatchId === batchId)
    setTransactions((prev) => prev.filter((tx) => tx.importBatchId !== batchId))
    setImportBatches((prev) => prev.filter((b) => b.id !== batchId))

    await Promise.all([
      deleteFromPB('import_batches', batchId),
      ...txsToRemove.map((tx) => deleteFromPB('transactions', tx.id)),
    ])
  }

  const addMappingRule = async (rule: MappingRule) => {
    setMappingRules((prev) => [...prev, rule])
    const saved = await saveToPB('mapping_rules', rule)
    setMappingRules((prev) => prev.map((r) => (r.id === rule.id ? saved : r)))
  }

  const deleteMappingRule = async (id: string) => {
    setMappingRules((prev) => prev.filter((r) => r.id !== id))
    await deleteFromPB('mapping_rules', id)
  }

  const applyMappingRules = async () => {
    const updates: Transaction[] = []
    const newTxs = transactions.map((tx) => {
      if (tx.type !== 'indefinido' && tx.category !== 'Outros') return tx

      let newTx = { ...tx }
      const desc = tx.description.toLowerCase()
      let changed = false

      for (const rule of mappingRules) {
        if (desc.includes(rule.keyword.toLowerCase())) {
          if (rule.category && tx.category === 'Outros') {
            newTx.category = rule.category
            changed = true
          }
          if (rule.crop && tx.crop === 'Geral') {
            newTx.crop = rule.crop
            changed = true
          }
          if (rule.type && tx.type === 'indefinido') {
            newTx.type = rule.type
            newTx.amount =
              rule.type === 'despesa' ? -Math.abs(newTx.amount) : Math.abs(newTx.amount)
            changed = true
          }
        }
      }
      if (changed) updates.push(newTx)
      return newTx
    })

    setTransactions(newTxs)
    await Promise.all(updates.map((u) => saveToPB('transactions', u)))
  }

  const bulkUpdateTransactions = async (ids: string[], updates: Partial<Transaction>) => {
    const txUpdates: Transaction[] = []
    setTransactions((prev) =>
      prev.map((tx) => {
        if (!ids.includes(tx.id)) return tx
        const newTx = { ...tx, ...updates }
        if (updates.type) {
          newTx.amount =
            updates.type === 'despesa' ? -Math.abs(newTx.amount) : Math.abs(newTx.amount)
        }
        txUpdates.push(newTx)
        return newTx
      }),
    )
    await Promise.all(txUpdates.map((u) => saveToPB('transactions', u)))
  }

  const bulkDeleteTransactions = async (ids: string[]) => {
    setTransactions((prev) => prev.filter((tx) => !ids.includes(tx.id)))
    await Promise.all(ids.map((id) => deleteFromPB('transactions', id)))
  }

  return (
    <AgroStoreContext.Provider
      value={{
        transactions,
        importBatches,
        mappingRules,
        isLoading,
        addTransaction,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        approveTransaction,
        rejectTransaction,
        addImportBatch,
        undoImportBatch,
        addMappingRule,
        deleteMappingRule,
        applyMappingRules,
        bulkUpdateTransactions,
        bulkDeleteTransactions,
      }}
    >
      {children}
    </AgroStoreContext.Provider>
  )
}

export default function useAgroStore() {
  const context = useContext(AgroStoreContext)
  if (!context) {
    throw new Error('useAgroStore must be used within an AgroProvider')
  }
  return context
}
