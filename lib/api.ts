import type { ApiResponse } from '@/types/api'
import type { StockData } from '@/types/stock'
import { getToken } from './auth'

const API_URL_DATA = process.env.NEXT_PUBLIC_API_URL || 'api/api.php'

export async function fetchStockData(): Promise<StockData | null> {
  const token = getToken()
  if (!token) return null

  try {
    const response = await fetch(API_URL_DATA, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.status === 401) {
      return null
    }

    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      // Se não for JSON, retornar dados mock vazios (API não disponível)
      return {
        items: [],
        totalSold: 0,
        totalBought: 0,
        profit: 0,
        transactions: []
      }
    }

    const text = await response.text()
    if (!text || text.trim().startsWith('<')) {
      // Se começar com HTML, retornar dados mock vazios
      return {
        items: [],
        totalSold: 0,
        totalBought: 0,
        profit: 0,
        transactions: []
      }
    }

    const data = JSON.parse(text)
    return data as StockData
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    // Retornar dados mock vazios em caso de erro
    return {
      items: [],
      totalSold: 0,
      totalBought: 0,
      profit: 0,
      transactions: []
    }
  }
}

export async function apiCall<T = any>(
  body: Record<string, any>
): Promise<ApiResponse<T>> {
  const token = getToken()
  if (!token) {
    return { success: false, message: 'Token não encontrado' }
  }

  try {
    const response = await fetch(API_URL_DATA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })

    if (response.status === 401) {
      return { success: false, message: 'Não autorizado' }
    }

    // Verificar se a resposta é JSON válido
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      return { success: false, message: 'API não disponível' }
    }

    const text = await response.text()
    if (!text || text.trim().startsWith('<')) {
      return { success: false, message: 'API não disponível' }
    }

    const data = JSON.parse(text)
    return data as ApiResponse<T>
  } catch (error) {
    console.error('Erro na chamada da API:', error)
    return { success: false, message: 'Erro de conexão' }
  }
}

