import { Transaction } from '@/types'

export const exportToCSV = (transactions: Transaction[]) => {
  const headers = [
    'Data',
    'Descrição',
    'Categoria',
    'Cultura',
    'Tipo',
    'Valor',
    'Status',
    'Comentários',
  ]
  const rows = transactions.map((t) => [
    t.date,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.category,
    t.crop,
    t.type,
    t.amount.toString(),
    t.status || '',
    `"${(t.comments || '').replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
