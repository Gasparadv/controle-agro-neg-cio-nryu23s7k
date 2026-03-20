export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateString: string): string {
  if (!dateString) return ''
  const onlyDate = dateString.split('T')[0]
  const [year, month, day] = onlyDate.split('-')
  if (!year || !month || !day) return dateString
  return `${day}/${month}/${year}`
}
