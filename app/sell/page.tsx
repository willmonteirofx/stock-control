"use client"

import { useState, useMemo, useEffect } from "react"
import { Settings, LogOut, User, Wallet, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { SettingsModal } from "@/components/dashboard/SettingsModal"
import { ItemFormRow } from "@/components/dashboard/ItemFormRow"
import { TransactionItem } from "@/components/dashboard/TransactionItem"
import { getUserFromToken, isTokenExpired, getTokenExpirationTime, removeToken, getToken } from "@/lib/auth"
import type { User } from "@/types/user"

export default function SellPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [transactions, setTransactions] = useState<string[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
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
      const storedTransactions = localStorage.getItem('stock_control_transactions')
      setTransactions(storedTransactions ? JSON.parse(storedTransactions) : [])
    } catch (err) {
      console.error(err)
      setTransactions([])
    } finally {
      setDataLoading(false)
    }
  }, [])

  // Filtrar transações por busca
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return []
    
    if (!searchQuery.trim()) {
      return transactions
        .filter(tx => !tx.toLowerCase().trim().startsWith('item removido:'))
        .reverse()
    }
    
    const query = searchQuery.toLowerCase()
    return transactions
      .filter(tx => {
        if (tx.toLowerCase().trim().startsWith('item removido:')) return false
        return tx.toLowerCase().includes(query)
      })
      .reverse()
  }, [transactions, searchQuery])

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
                    <User className="h-4 w-4" />
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

        {/* Formulário de Venda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Registrar Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ItemFormRow type="sell" index={0} isFirst onAddRow={() => {}} />
              <Button className="w-full" size="lg">
                <Wallet className="mr-2 h-4 w-4" />
                Confirmar Venda
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Histórico de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
                <Input
                  placeholder="Buscar no histórico..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <ScrollArea className="h-[300px]">
              {filteredTransactions.length > 0 ? (
                <ul>
                  {filteredTransactions.map((transaction, index) => (
                    <TransactionItem key={index} transaction={transaction} />
                  ))}
                </ul>
              ) : (
                <div className="text-center py-10 text-[#64748B]">
                  {searchQuery ? "Nenhuma transação encontrada." : "Nenhuma venda registrada ainda."}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

            {/* Settings Modal */}
            <SettingsModal 
              open={settingsOpen} 
              onOpenChange={setSettingsOpen}
              showTutorial={false}
              onTutorialChange={() => {}}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

