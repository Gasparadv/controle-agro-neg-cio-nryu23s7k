import { Transaction, Equipment } from '@/types'

export const exportToCSV = (transactions: Transaction[], equipments: Equipment[] = []) => {
  const headers = [
    'Data',
    'Descrição',
    'Categoria',
    'Cultura',
    'Equipamento',
    'Tipo',
    'Valor',
    'Status',
    'Comentários',
  ]
  const rows = transactions.map((t) => {
    const eq = t.equipmentId
      ? equipments.find((e) => e.id === t.equipmentId)?.name || 'Equipamento Removido'
      : ''

    return [
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.category,
      t.crop,
      `"${eq.replace(/"/g, '""')}"`,
      t.type,
      t.amount.toString(),
      t.status || '',
      `"${(t.comments || '').replace(/"/g, '""')}"`,
    ]
  })

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

export const exportReportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return

  const headers = Object.keys(data[0])
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h]
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`
        return val
      })
      .join(','),
  )

  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
