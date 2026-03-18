export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}
