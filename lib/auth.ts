import { parseJwt } from './formatters'
import type { JwtPayload } from '@/types/user'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('stockControl_token')
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('stockControl_token', token)
}

export function removeToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('stockControl_token')
}

export function getUserFromToken(): { username: string; exp: number } | null {
  const token = getToken()
  if (!token) return null
  return parseJwt(token) as JwtPayload | null
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return true
  
  const expTime = payload.exp * 1000
  const currentTime = Date.now()
  return expTime <= currentTime
}

export function getTokenExpirationTime(token: string): number | null {
  const payload = parseJwt(token)
  if (!payload || !payload.exp) return null
  
  const expTime = payload.exp * 1000
  const currentTime = Date.now()
  return expTime - currentTime
}

