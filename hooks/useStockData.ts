"use client"

import { useState, useEffect } from 'react'
import type { StockData, StockItem } from '@/types/stock'
import { useLocalStorage } from './useLocalStorage'

const MOCK_STORAGE_KEY = 'stock_control_mock_items'

export function useStockData() {
  const [mockItems, setMockItems] = useLocalStorage<StockItem[]>(MOCK_STORAGE_KEY, [])
  const [data, setData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Usar apenas dados do localStorage
      setData({
        items: mockItems,
        totalSold: 0,
        totalBought: 0,
        profit: 0,
        transactions: []
      })
    } catch (err) {
      setError('Erro ao carregar dados')
      console.error(err)
      setData({
        items: mockItems,
        totalSold: 0,
        totalBought: 0,
        profit: 0,
        transactions: []
      })
    } finally {
      setLoading(false)
    }
  }

  const addItem = (item: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = {
      ...item,
      id: Date.now(), // ID único baseado em timestamp
      createdAt: new Date().toISOString()
    }
    
    const updatedItems = [...mockItems, newItem]
    setMockItems(updatedItems)
    
    // Atualizar dados imediatamente
    if (data) {
      setData({
        ...data,
        items: [...data.items, newItem]
      })
    }
    
    return newItem
  }

  const updateItem = (id: number, updates: Partial<StockItem>) => {
    const updatedItems = mockItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    setMockItems(updatedItems)
    
    // Atualizar dados imediatamente
    if (data) {
      setData({
        ...data,
        items: data.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      })
    }
  }

  const deleteItem = (id: number) => {
    const updatedItems = mockItems.filter(item => item.id !== id)
    setMockItems(updatedItems)
    
    // Atualizar dados imediatamente
    if (data) {
      setData({
        ...data,
        items: data.items.filter(item => item.id !== id)
      })
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { 
    data, 
    loading, 
    error, 
    reload: loadData,
    addItem,
    updateItem,
    deleteItem
  }
}

