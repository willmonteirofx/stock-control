"use client"

import { useState, useEffect } from "react"
import { Box, Settings, LogOut, User, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Info } from "lucide-react"
import { getUserFromToken, isTokenExpired, getTokenExpirationTime, removeToken, getToken } from "@/lib/auth"
import type { User } from "@/types/user"

const TUTORIAL_CLOSED_KEY = 'stockcontrol_tutorial_closed'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [showInfoDialog, setShowInfoDialog] = useState(false)

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
  
  const [showTutorial, setShowTutorial] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      const item = window.localStorage.getItem(TUTORIAL_CLOSED_KEY)
      return item ? !JSON.parse(item) : true
    } catch {
      return true
    }
  })

  const handleTutorialSwitchChange = (checked: boolean) => {
    setShowTutorial(checked)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TUTORIAL_CLOSED_KEY, JSON.stringify(!checked))
    }
  }

  if (authLoading) {
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
      <div className="container max-w-4xl mx-auto px-6">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Box className="h-6 w-6 text-[#374e5e]" />
              <span className="text-xl font-bold text-[#374e5e]">StockControl</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <User className="h-4 w-4" />
                <span>{user.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                <Settings className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tema */}
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <select 
                id="theme"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#374e5e] focus:outline-none focus:ring-2 focus:ring-[#374e5e]"
              >
                <option>Claro</option>
                <option disabled>Escuro (Em breve)</option>
              </select>
            </div>

            {/* Notificações */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-[#374e5e]">
                  Ativar sons de notificação
                </Label>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>

            {/* Tutorial */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="tutorial" className="text-[#374e5e]">
                    Mostrar tutorial na próxima vez
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => setShowInfoDialog(true)}
                  >
                    <Info className="h-3 w-3 text-[#64748B]" />
                  </Button>
                </div>
              </div>
              <Switch 
                id="tutorial" 
                checked={showTutorial}
                onCheckedChange={handleTutorialSwitchChange}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Informação */}
      <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tutorial</DialogTitle>
            <DialogDescription>
              Quando ativado, o tutorial será exibido na página inicial do dashboard na próxima vez que você acessar.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}

