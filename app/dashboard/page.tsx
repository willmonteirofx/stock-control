"use client"

import { useState, useMemo, useEffect } from "react"
import { Settings, LogOut, User as UserIcon, TrendingUp, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { SummaryWidget } from "@/components/dashboard/SummaryWidget"
import { SalesChart } from "@/components/dashboard/SalesChart"
import { Tutorial } from "@/components/dashboard/Tutorial"
import { SettingsModal } from "@/components/dashboard/SettingsModal"
import { formatCurrency } from "@/lib/formatters"
import { getUserFromToken, isTokenExpired, getTokenExpirationTime, removeToken, getToken } from "@/lib/auth"
import type { User } from "@/types/user"
import type { StockData, StockItem } from "@/types/stock"

const TUTORIAL_CLOSED_KEY = 'stockcontrol_tutorial_closed'
const MOCK_STORAGE_KEY = 'stock_control_mock_items'

interface ProductSale {
  name: string
  quantity: number
  totalRevenue: number
  profit: number
}

interface DaySale {
  day: string
  quantity: number
  totalProducts: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Lógica de autenticação
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const tokenData = getUserFromToken()
    
    if (!tokenData) {
      router.push('/')
      return
    }

    const token = getToken()
    
    if (!token || isTokenExpired(token)) {
      removeToken()
      router.push('/')
      return
    }

    setUser({ username: tokenData.username })
    setAuthLoading(false)

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

  // Lógica de stock data
  useEffect(() => {
    if (typeof window === 'undefined') return

    setDataLoading(true)
    try {
      const storedItems = localStorage.getItem(MOCK_STORAGE_KEY)
      const mockItems: StockItem[] = storedItems ? JSON.parse(storedItems) : []
      
      // Calcular totais das transações
      const storedTransactions = localStorage.getItem('stock_control_transactions')
      const transactions: string[] = storedTransactions ? JSON.parse(storedTransactions) : []
      
      let totalSold = 0
      let totalBought = 0
      let profit = 0

      transactions.forEach(transaction => {
        const sellMatch = transaction.match(/VENDA:\s*(.+?),\s*Qtd:\s*(\d+),\s*Preço:\s*R\$\s*([\d,]+)/i)
        if (sellMatch) {
          const quantity = parseInt(sellMatch[2])
          const price = parseFloat(sellMatch[3].replace(',', '.'))
          totalSold += price * quantity
          profit += price * quantity
        }
        
        const buyMatch = transaction.match(/COMPRA:\s*(.+?),\s*Qtd:\s*(\d+),\s*Preço:\s*R\$\s*([\d,]+)/i)
        if (buyMatch) {
          const quantity = parseInt(buyMatch[2])
          const price = parseFloat(buyMatch[3].replace(',', '.'))
          totalBought += price * quantity
        }
      })

      setStockData({
        items: mockItems,
        totalSold,
        totalBought,
        profit,
        transactions
      })
    } catch (err) {
      console.error(err)
      setStockData({
        items: [],
        totalSold: 0,
        totalBought: 0,
        profit: 0,
        transactions: []
      })
    } finally {
      setDataLoading(false)
    }
  }, [])
  
  // Gerenciar tutorial no localStorage
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const item = window.localStorage.getItem(TUTORIAL_CLOSED_KEY)
      return item ? !JSON.parse(item) : true
    } catch {
      return true
    }
  })

  const hideTutorial = () => {
    setShowTutorial(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TUTORIAL_CLOSED_KEY, JSON.stringify(true))
    }
  }

  const showTutorialAgain = () => {
    setShowTutorial(true)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TUTORIAL_CLOSED_KEY, JSON.stringify(false))
    }
  }

  // Calcular produtos mais vendidos (top 10)
  const topProducts = useMemo(() => {
    if (!stockData?.transactions) return []
    
    const productMap = new Map<string, { quantity: number, revenue: number, profit: number }>()
    
    stockData.transactions.forEach(transaction => {
      // Parse transactions like "VENDA: Item X, Qtd: Y, Preço: R$ Z"
      const sellMatch = transaction.match(/VENDA:\s*(.+?),\s*Qtd:\s*(\d+),\s*Preço:\s*R\$\s*([\d,]+)/i)
      if (sellMatch) {
        const name = sellMatch[1].trim()
        const quantity = parseInt(sellMatch[2])
        const price = parseFloat(sellMatch[3].replace(',', '.'))
        
        const existing = productMap.get(name) || { quantity: 0, revenue: 0, profit: 0 }
        productMap.set(name, {
          quantity: existing.quantity + quantity,
          revenue: existing.revenue + (price * quantity),
          profit: existing.profit + (price * quantity) // Simplified - would need item cost for real profit
        })
      }
    })
    
    return Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        quantity: data.quantity,
        totalRevenue: data.revenue,
        profit: data.profit
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
  }, [stockData?.transactions])

  // Calcular dias da semana com mais vendas (top 7)
  const topDays = useMemo(() => {
    if (!stockData?.transactions) return []
    
    const dayMap = new Map<string, { quantity: number, products: Set<string> }>()
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    
    stockData.transactions.forEach(transaction => {
      const sellMatch = transaction.match(/VENDA:\s*(.+?),\s*Qtd:\s*(\d+)/i)
      if (sellMatch) {
        const name = sellMatch[1].trim()
        const quantity = parseInt(sellMatch[2])
        
        // Try to extract date from transaction or use current date
        const dateMatch = transaction.match(/(\d{2}\/\d{2}\/\d{4})/)
        let date = new Date()
        if (dateMatch) {
          const [day, month, year] = dateMatch[1].split('/')
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }
        
        const dayName = dayNames[date.getDay()]
        const existing = dayMap.get(dayName) || { quantity: 0, products: new Set<string>() }
        existing.quantity += quantity
        existing.products.add(name)
        dayMap.set(dayName, existing)
      }
    })
    
    return Array.from(dayMap.entries())
      .map(([day, data]) => ({
        day,
        quantity: data.quantity,
        totalProducts: data.products.size
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7)
  }, [stockData?.transactions])

  // Calcular produtos com maior margem de lucro (top 10)
  const topProfitProducts = useMemo(() => {
    if (!stockData?.transactions || !stockData?.items) return []
    
    const productMap = new Map<string, { revenue: number, cost: number, profit: number }>()
    
    stockData.transactions.forEach(transaction => {
      const sellMatch = transaction.match(/VENDA:\s*(.+?),\s*Qtd:\s*(\d+),\s*Preço:\s*R\$\s*([\d,]+)/i)
      if (sellMatch) {
        const name = sellMatch[1].trim()
        const quantity = parseInt(sellMatch[2])
        const price = parseFloat(sellMatch[3].replace(',', '.'))
        
        // Find item in stock to get average price
        const item = stockData.items.find(i => i.name.toLowerCase() === name.toLowerCase())
        const cost = item ? item.averagePrice : 0
        
        const existing = productMap.get(name) || { revenue: 0, cost: 0, profit: 0 }
        productMap.set(name, {
          revenue: existing.revenue + (price * quantity),
          cost: existing.cost + (cost * quantity),
          profit: existing.profit + ((price - cost) * quantity)
        })
      }
    })
    
    return Array.from(productMap.entries())
      .map(([name, data]) => ({
        name,
        profit: data.profit,
        margin: data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 10)
  }, [stockData?.transactions, stockData?.items])

  // Verificações condicionais após todos os hooks
  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#374e5e] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-[#f1f5f9] pb-8">
          <div className="container max-w-7xl mx-auto px-6">
            {/* Navbar */}
            <nav className="flex items-center justify-between py-6">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    <span>{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* Summary Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <SummaryWidget type="sold" value={stockData?.totalSold || 0} label="Vendido" />
              <SummaryWidget type="profit" value={stockData?.profit || 0} label="Lucro" />
              <SummaryWidget type="bought" value={stockData?.totalBought || 0} label="Comprado" />
            </div>

            {/* Tutorial */}
            {showTutorial && <Tutorial onClose={hideTutorial} />}

            {/* Gráfico de Vendas */}
            <div className="mb-6">
              <SalesChart />
            </div>

        {/* Insights Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Produtos Mais Vendidos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Produtos Mais Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#374e5e]">{product.name}</p>
                          <p className="text-xs text-[#64748B]">{product.quantity} unidades</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(product.totalRevenue)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#64748B] text-sm py-4">Nenhuma venda registrada ainda</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dias da Semana com Mais Vendas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dias da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDays.length > 0 ? (
                  topDays.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#374e5e]">{day.day}</p>
                          <p className="text-xs text-[#64748B]">{day.totalProducts} produtos diferentes</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-purple-600">{day.quantity} unidades</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#64748B] text-sm py-4">Nenhuma venda registrada ainda</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Produtos com Maior Margem de Lucro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Maior Margem de Lucro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProfitProducts.length > 0 ? (
                  topProfitProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[#374e5e]">{product.name}</p>
                          <p className="text-xs text-[#64748B]">{product.margin.toFixed(1)}% margem</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{formatCurrency(product.profit)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-[#64748B] text-sm py-4">Nenhuma venda registrada ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
          </div>

          {/* Settings Modal */}
          <SettingsModal 
            open={settingsOpen} 
            onOpenChange={setSettingsOpen}
            showTutorial={showTutorial}
            onTutorialChange={(show) => show ? showTutorialAgain() : hideTutorial()}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
