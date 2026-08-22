export function formatCPF(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 11)
  let formatted = ''
  if (clean.length > 0) formatted += clean.slice(0, 3)
  if (clean.length > 3) formatted += '.' + clean.slice(3, 6)
  if (clean.length > 6) formatted += '.' + clean.slice(6, 9)
  if (clean.length > 9) formatted += '-' + clean.slice(9, 11)
  return formatted
}

export function formatPhone(val: string): string {
  const clean = val.replace(/\D/g, '').slice(0, 11)
  if (clean.length === 0) return ''
  let f = '(' + clean.slice(0, 2)
  if (clean.length > 2) f += ') ' + clean.slice(2, 7)
  if (clean.length > 7) f += '-' + clean.slice(7, 11)
  return f
}

export function formatCNH(val: string): string {
  return val.replace(/\D/g, '').slice(0, 11)
}
