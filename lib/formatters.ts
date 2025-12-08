export function formatNumber(num: number): string {
  return Number.isInteger(num) ? num.toString() : num.toFixed(2)
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDate(date?: Date): string {
  const now = date || new Date()
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: '2-digit', 
    day: '2-digit' 
  }
  const dateString = now.toLocaleDateString('pt-BR', options).replace('.', '').trim()
  const timeString = now.toTimeString().slice(0, 5)
  return `${dateString}, ${timeString}`
}

export function formatSelectedDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00')
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: '2-digit', 
    day: '2-digit' 
  }
  return date.toLocaleDateString('pt-BR', options).replace('.', '').trim()
}

export function parseJwt(token: string): { username: string; exp: number; iat?: number } | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}

