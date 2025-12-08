"use client"

import { useState, useMemo } from "react"
import { Box, Settings, LogOut, User, Wallet, Package, TrendingUp, Calendar, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useStockData } from "@/hooks/useStockData"
import { SummaryWidget } from "@/components/dashboard/SummaryWidget"
import { formatCurrency } from "@/lib/formatters"

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
  const { user, loading: authLoading, logout } = useAuth()
  const { data: stockData, loading: dataLoading } = useStockData()

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
    <div className="min-h-screen bg-[#f1f5f9] pb-8">
      <div className="container max-w-7xl mx-auto px-6">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <Box className="h-6 w-6 text-[#374e5e]" />
            <span className="text-xl font-bold text-[#374e5e]">StockControl</span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-full">
                <User className="h-4 w-4" />
                <span>{user.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
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

        {/* Botões de Navegação Grandes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link href="/vender">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <Wallet className="h-16 w-16 text-blue-500 mb-4" />
                <h3 className="text-2xl font-bold text-[#374e5e] mb-2">Vender</h3>
                <p className="text-[#64748B]">Registre suas vendas rapidamente</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/estoque">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <Package className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-[#374e5e] mb-2">Estoque</h3>
                <p className="text-[#64748B]">Gerencie seu catálogo de produtos</p>
              </CardContent>
            </Card>
          </Link>
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
    </div>
  )
}
