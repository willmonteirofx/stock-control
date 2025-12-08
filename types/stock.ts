export interface StockItem {
  id: number
  name: string
  quantity: number
  totalPrice: number
  averagePrice: number
  imageUrl?: string
  createdAt?: string
}

export interface Transaction {
  id?: number
  description: string
  createdAt?: string
}

export interface StockData {
  items: StockItem[]
  totalSold: number
  totalBought: number
  profit: number
  transactions: string[]
}

export interface ChartData {
  date: string
  total: number
}

