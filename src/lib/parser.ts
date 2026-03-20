import * as XLSX from 'xlsx'

export const parseAmount = (val: string | number | undefined | null): number => {
  if (val === undefined || val === null || val === '') return 0
  if (typeof val === 'number') return val

  const strVal = String(val).trim()
  const isNegative =
    strVal.includes('-') || /^\(.*\)$/.test(strVal) || /([0-9.,]+)\s*D/i.test(strVal)

  let clean = strVal.replace(/[^0-9.,]/g, '')
  if (!clean) return 0

  const hasComma = clean.includes(',')
  const hasDot = clean.includes('.')

  if (hasComma && hasDot) {
    const lastComma = clean.lastIndexOf(',')
    const lastDot = clean.lastIndexOf('.')
    if (lastComma > lastDot) {
      clean = clean.replace(/\./g, '').replace(',', '.')
    } else {
      clean = clean.replace(/,/g, '')
    }
  } else if (hasComma) {
    const parts = clean.split(',')
    if (parts.length > 2) {
      clean = clean.replace(/,/g, '')
    } else {
      clean = clean.replace(',', '.')
    }
  } else if (hasDot) {
    const parts = clean.split('.')
    if (parts.length > 2) {
      clean = clean.replace(/\./g, '')
    } else if (parts.length === 2 && parts[1].length === 3) {
      clean = clean.replace(/\./g, '')
    }
  }

  let num = parseFloat(clean) || 0
  if (isNegative && num !== 0) {
    num = -Math.abs(num)
  }
  return num
}

export const parseDate = (d: string | number | Date | undefined | null): string => {
  if (d === undefined || d === null || d === '') return ''
  if (d instanceof Date) return d.toISOString().split('T')[0]
  let str = String(d).trim()

  if (str.match(/^\d{1,2}[-.]\d{1,2}[-.]\d{2,4}$/)) {
    str = str.replace(/[-.]/g, '/')
  }

  if (str.includes('/')) {
    const p = str.split('/')
    if (p.length === 3) {
      if (p[2].length === 4) return `${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`
      if (p[0].length === 4) return `${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`
      if (p[2].length === 2) return `20${p[2]}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`
    }
  }
  const match = str.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (match) return match[0]

  const timestamp = Date.parse(str)
  if (!isNaN(timestamp)) {
    return new Date(timestamp).toISOString().split('T')[0]
  }

  return str
}

export const readExcelFile = async (file: File) => {
  const data = await file.arrayBuffer()
  return XLSX.read(data, { type: 'array', cellDates: true })
}

export const getSheetData = (wb: XLSX.WorkBook, sheetName: string): string[][] => {
  const ws = wb.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' })
  return rows.map((row) => row.map((cell) => String(cell ?? '')))
}

export const parseCsvFile = (content: string): string[][] => {
  const delimiter = content.includes(';') ? ';' : ','
  return content
    .split('\n')
    .map((r) => r.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, '')))
}

export const parseOfxFile = (content: string): any[] => {
  const transactions: any[] = []

  const blocks = content.split(/<STMTTRN>/i).slice(1)

  for (const block of blocks) {
    const trnamtMatch = block.match(/<TRNAMT>([^<\r\n]+)/i)
    const dtpostedMatch = block.match(/<DTPOSTED>([^<\r\n]+)/i)
    const nameMatch = block.match(/<NAME>([^<\r\n]+)/i)
    const memoMatch = block.match(/<MEMO>([^<\r\n]+)/i)
    const fitidMatch = block.match(/<FITID>([^<\r\n]+)/i)

    if (trnamtMatch && dtpostedMatch) {
      const rawAmt = trnamtMatch[1].trim()
      const rawDate = dtpostedMatch[1].trim()
      const name = nameMatch ? nameMatch[1].trim() : ''
      const memo = memoMatch ? memoMatch[1].trim() : ''
      const fitid = fitidMatch ? fitidMatch[1].trim() : ''

      transactions.push({
        rawAmt,
        rawDate,
        desc: name || memo || 'Transação OFX',
        fitid,
      })
    }
  }

  return transactions
}
