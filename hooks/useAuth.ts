"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUserFromToken, isTokenExpired, getTokenExpirationTime, removeToken } from '@/lib/auth'
import type { User } from '@/types/user'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const tokenData = getUserFromToken()
    
    if (!tokenData) {
      router.push('/')
      return
    }

    const { getToken } = require('@/lib/auth')
    const token = getToken()
    
    if (!token || isTokenExpired(token)) {
      removeToken()
      router.push('/')
      return
    }

    setUser({ username: tokenData.username })
    setLoading(false)

    // Setup auto logout
    const expTime = getTokenExpirationTime(token)
    if (expTime && expTime > 0) {
      setTimeout(() => {
        removeToken()
        router.push('/')
      }, expTime)
    }
  }, [router])

  const logout = () => {
    removeToken()
    router.push('/')
  }

  return { user, loading, logout }
}

