import { Transaction, ImportBatch, MappingRule, Equipment } from '@/types'

export const fallbackData: Record<string, any[]> = {
  transactions: [
    {
      id: '1',
      date: '2023-10-01',
      description: 'Sementes de Soja XPTO',
      amount: -45000,
      type: 'despesa',
      category: 'Insumos',
      comments: 'Para o talhão 1',
      crop: 'Soja',
      status: 'approved',
    },
    {
      id: '2',
      date: '2023-10-15',
      description: 'Fertilizante NPK',
      amount: -32000,
      type: 'despesa',
      category: 'Insumos',
      comments: '',
      crop: 'Soja',
      status: 'approved',
    },
    {
      id: '3',
      date: '2024-03-20',
      description: 'Venda Safra Soja',
      amount: 150000,
      type: 'receita',
      category: 'Venda',
      comments: 'Cargill',
      crop: 'Soja',
      status: 'approved',
    },
    {
      id: '4',
      date: '2023-01-10',
      description: 'Manutenção Trator JD',
      amount: -8500,
      type: 'despesa',
      category: 'Manutenção',
      comments: 'Troca de óleo',
      crop: 'Geral',
      equipmentId: 'eq1',
      status: 'approved',
    },
    {
      id: '5',
      date: '2024-04-10',
      description: 'Combustível Diesel',
      amount: -12000,
      type: 'despesa',
      category: 'Combustível',
      comments: 'Abastecimento da caminhonete',
      crop: 'Geral',
      equipmentId: 'eq2',
      status: 'pending',
      collaboratorName: 'Carlos Assistente',
    },
    {
      id: '6',
      date: '2024-04-12',
      description: 'Peças de Reposição - Plantadeira',
      amount: -3500,
      type: 'despesa',
      category: 'Peças',
      comments: 'Discos de corte',
      crop: 'Geral',
      equipmentId: 'eq3',
      status: 'pending',
      collaboratorName: 'Maria Silva',
    },
    {
      id: '7',
      date: '2024-04-05',
      description: 'Reparo Cerca',
      amount: -800,
      type: 'despesa',
      category: 'Manutenção',
      comments: 'Materiais sem nota fiscal completa',
      crop: 'Geral',
      status: 'rejected',
      collaboratorName: 'Carlos Assistente',
      rejectionReason: 'Faltou anexar a nota fiscal da compra.',
    },
    {
      id: '8',
      date: '2024-04-14',
      description: 'Pagamento Fornecedor XYZ',
      amount: -5000,
      type: 'despesa',
      category: 'Outros',
      comments: 'Importado',
      crop: 'Geral',
      status: 'approved',
      importBatchId: 'batch-1',
    },
    {
      id: '9',
      date: '2024-04-15',
      description: 'Recebimento Cliente ABC',
      amount: 12000,
      type: 'receita',
      category: 'Venda',
      comments: 'Importado',
      crop: 'Geral',
      status: 'approved',
      importBatchId: 'batch-1',
    },
    {
      id: '10',
      date: '2024-04-16',
      description: 'Retirada João',
      amount: -15400,
      type: 'despesa',
      category: 'Retirada de Sócios',
      comments: 'Distribuição mensal',
      crop: 'Geral',
      status: 'approved',
    },
  ],
  import_batches: [
    {
      id: 'batch-1',
      date: '2024-04-15T10:30:00.000Z',
      fileName: 'extrato_bradesco_abr.csv',
      recordCount: 2,
    },
  ],
  mapping_rules: [
    { id: 'r1', keyword: 'fertilizante', category: 'Insumos', type: 'despesa' },
    { id: 'r2', keyword: 'cargill', category: 'Venda', type: 'receita', crop: 'Soja' },
    { id: 'r3', keyword: 'posto', category: 'Combustível', type: 'despesa' },
  ],
  equipments: [
    {
      id: 'eq1',
      name: 'Trator John Deere 8R',
      type: 'Máquina',
      identifier: 'JD-2023-A1',
      brand: 'John Deere',
      model: '8R 230',
      year: 2023,
      status: 'ativo',
      acquisitionDate: '2023-01-15',
      acquisitionValue: 850000,
    },
    {
      id: 'eq2',
      name: 'Caminhonete Hilux',
      type: 'Veículo',
      identifier: 'ABC-1234',
      brand: 'Toyota',
      model: 'SRV 4x4',
      year: 2022,
      status: 'ativo',
      acquisitionDate: '2022-05-10',
      acquisitionValue: 250000,
    },
    {
      id: 'eq3',
      name: 'Plantadeira 15 Linhas',
      type: 'Implemento',
      identifier: 'PL-5590',
      brand: 'Stara',
      model: 'Princesa',
      year: 2021,
      status: 'ativo',
      acquisitionDate: '2021-08-20',
      acquisitionValue: 120000,
    },
  ],
}

export async function fetchFromPB(collection: string) {
  try {
    const res = await fetch(`/api/collections/${collection}/records?perPage=1000`)
    if (!res.ok) throw new Error('PB fetch failed')
    const data = await res.json()
    return data.items
  } catch (err) {
    console.warn(`Failed to fetch ${collection} from PB, using localStorage fallback`)
    let local = localStorage.getItem(`mock_pb_${collection}`)
    if (!local) {
      local = JSON.stringify(fallbackData[collection] || [])
      localStorage.setItem(`mock_pb_${collection}`, local)
    }
    return JSON.parse(local)
  }
}

export async function saveToPB(collection: string, data: any) {
  const isMockId = (id?: string) =>
    !id ||
    id.startsWith('mock-') ||
    id.startsWith('manual-') ||
    id.startsWith('imp-') ||
    id.startsWith('batch-') ||
    id.match(/^(r|eq|u)\d+$/)

  try {
    const isNew = isMockId(data.id)
    let url = `/api/collections/${collection}/records`
    let method = 'POST'

    if (!isNew && data.id) {
      url = `${url}/${data.id}`
      method = 'PATCH'
    }

    const payload = { ...data }
    if (isNew) delete payload.id

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error('PB save failed')
    const saved = await res.json()

    updateLocalFallback(collection, saved)
    return saved
  } catch (err) {
    console.warn(`Failed to save ${collection} to PB, using localStorage fallback`)
    const savedId = isMockId(data.id)
      ? `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      : data.id
    const saved = {
      ...data,
      id: savedId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    }
    updateLocalFallback(collection, saved)
    return saved
  }
}

export async function deleteFromPB(collection: string, id: string) {
  try {
    const isMockId =
      !id ||
      id.startsWith('mock-') ||
      id.startsWith('manual-') ||
      id.startsWith('imp-') ||
      id.startsWith('batch-') ||
      id.match(/^(r|eq|u)\d+$/)

    if (!isMockId) {
      const res = await fetch(`/api/collections/${collection}/records/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('PB delete failed')
    }
    deleteLocalFallback(collection, id)
    return true
  } catch (err) {
    console.warn(`Failed to delete ${collection} from PB, using localStorage fallback`)
    deleteLocalFallback(collection, id)
    return true
  }
}

function updateLocalFallback(collection: string, data: any) {
  const local = localStorage.getItem(`mock_pb_${collection}`)
  let items = local ? JSON.parse(local) : fallbackData[collection] || []
  const idx = items.findIndex((i: any) => i.id === data.id)
  if (idx >= 0) {
    items[idx] = data
  } else {
    items.unshift(data)
  }
  localStorage.setItem(`mock_pb_${collection}`, JSON.stringify(items))
}

function deleteLocalFallback(collection: string, id: string) {
  const local = localStorage.getItem(`mock_pb_${collection}`)
  if (local) {
    let items = JSON.parse(local)
    items = items.filter((i: any) => i.id !== id)
    localStorage.setItem(`mock_pb_${collection}`, JSON.stringify(items))
  }
}
