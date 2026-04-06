export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function parseDateStr(dateString: string): Date {
  if (!dateString) return new Date(NaN)

  if (dateString.includes('/')) {
    const parts = dateString.split('/')
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY/MM/DD
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      }
      if (parts[2].length === 4) {
        // DD/MM/YYYY
        return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
      }
    }
  }

  if (dateString.includes('-')) {
    const onlyDate = dateString.split('T')[0]
    const parts = onlyDate.split('-')
    if (parts.length === 3) {
      // YYYY-MM-DD
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    }
  }

  return new Date(dateString)
}

export function formatDate(dateString: string): string {
  if (!dateString) return ''

  const d = parseDateStr(dateString)
  if (isNaN(d.getTime())) return dateString

  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}
