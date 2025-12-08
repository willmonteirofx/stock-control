"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, MessageCircle, BarChart3, Calculator, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { setToken } from "@/lib/auth"

export default function Home() {
  const router = useRouter()
  const [loginOpen, setLoginOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loginError, setLoginError] = useState("")

  // Função para criar um token JWT mock simples
  const createMockToken = (username: string): string => {
    const header = {
      alg: "HS256",
      typ: "JWT"
    }
    
    // Token expira em 24 horas
    const exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60)
    
    const payload = {
      username: username,
      exp: exp,
      iat: Math.floor(Date.now() / 1000)
    }
    
    // Base64 encode simples (apenas para frontend mock)
    const base64Header = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    const base64Payload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    // Para um token mock simples, não precisamos de assinatura real
    const signature = btoa('mock-signature').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
    
    return `${base64Header}.${base64Payload}.${signature}`
  }

  const handleLogin = async () => {
    setLoginError("")
    
    // Validação simples: usuário "will" e senha "123"
    if (username.toLowerCase().trim() === "will" && password === "123") {
      // Criar token mock e salvar
      const token = createMockToken("will")
      setToken(token)
      
      // Fechar modal e redirecionar
      setLoginOpen(false)
      router.push("/dashboard")
    } else {
      setLoginError("Usuário ou senha incorretos")
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-white via-white to-[#f1f5f9] pointer-events-none -z-10" />
      
      <div className="container max-w-6xl mx-auto px-6">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-2">
            <Box className="h-6 w-6 text-[#374e5e]" />
            <span className="text-2xl font-bold text-[#374e5e]">StockControl</span>
          </div>
          
          <Separator orientation="vertical" className="h-6 mx-6" />
          
          <div className="hidden md:flex items-center gap-8 flex-1 ml-6">
            <a href="#features" className="text-[#64748B] font-medium hover:text-[#374e5e] transition-colors">
              Funcionalidades
            </a>
            <a href="#pricing" className="text-[#64748B] font-medium hover:text-[#374e5e] transition-colors">
              Preço
            </a>
            <a href="#faq" className="text-[#64748B] font-medium hover:text-[#374e5e] transition-colors">
              Dúvidas
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="rounded-full"
              onClick={() => setLoginOpen(true)}
            >
              Login
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="grid md:grid-cols-2 gap-10 py-20 items-center">
          {/* Left Side: Content */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight text-[#374e5e] mb-6">
              Seu controle de vendas inteligente.
            </h1>
            <p className="text-xl text-[#64748B] mb-10 max-w-[90%]">
              Gerencie seu estoque, vendas e lucros em uma interface moderna e simples. Sistema completo de ponto de venda.
            </p>
            
            <Link 
              href="https://wa.me/5584999948854?text=Olá!%20Tenho%20interesse%20no%20StockControl." 
              target="_blank"
            >
              <Button 
                size="lg" 
                className="bg-[#25D366] hover:bg-[#1fa851] text-white rounded-lg text-lg px-8 py-6 shadow-lg"
              >
                <MessageCircle className="h-5 w-5" />
                Assinar via WhatsApp
              </Button>
            </Link>
          </div>

          {/* Right Side: Visual Composition */}
          <div className="relative h-[500px] hidden md:block">
            <div className="absolute top-0 left-0 w-[300px] z-20">
              <Card className="bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <p className="text-xs text-[#64748B] uppercase font-semibold">Financeiro</p>
                  <CardTitle className="text-xl">Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-50 p-2 rounded-xl">
                      <p className="text-xs text-[#64748B] mb-1">Lucro</p>
                      <p className="text-lg font-bold text-green-600">+R$ 2.500</p>
                    </div>
                    <div className="bg-orange-50 p-2 rounded-xl">
                      <p className="text-xs text-[#64748B] mb-1">Comprado</p>
                      <p className="text-lg font-bold text-orange-500">R$ 1.500</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="absolute top-44 right-0 w-[260px] z-30">
              <Card className="bg-white/80 backdrop-blur-md">
                <CardHeader>
                  <p className="text-xs text-[#64748B] uppercase font-semibold">Inventário</p>
                  <CardTitle className="text-xl">Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">D</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Dragão</p>
                        <p className="text-xs text-[#64748B]">5 unidades</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">S</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">Sorveteira</p>
                        <p className="text-xs text-[#64748B]">12 unidades</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            <div className="absolute right-20 top-36 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg z-40 animate-bounce">
              Lucro +R$ 2.500
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#374e5e] mb-4">Tudo que um lucrador precisa</h2>
            <p className="text-[#64748B] text-lg">Ferramentas essenciais para escalar suas negociações.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 justify-center">
            <Card className="bg-white/60 backdrop-blur-md border-white/60">
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <BarChart3 className="h-6 w-6 text-[#374e5e]" />
                </div>
                <CardTitle>Controle de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Controle completo do seu estoque com preço médio de compra, quantidade disponível e valor total.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-md border-white/60">
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <Calculator className="h-6 w-6 text-[#374e5e]" />
                </div>
                <CardTitle>Gestão de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Registre vendas rapidamente e acompanhe o lucro em tempo real. Sistema intuitivo e eficiente.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-md border-white/60">
              <CardHeader>
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <TrendingUp className="h-6 w-6 text-[#374e5e]" />
                </div>
                <CardTitle>Histórico de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Registre cada negociação e visualize gráficos detalhados de crescimento do seu patrimônio.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Pricing CTA */}
        <section id="pricing" className="py-16 mb-16">
          <Card className="bg-[#374e5e] text-white border-0 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#4a6274]/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="relative z-10 text-center py-16 px-8">
              <h2 className="text-4xl font-bold mb-2">Acesso Premium</h2>
              <p className="text-[#CBD5E1] text-xl mb-10 font-medium">
                Tenha controle total do seu negócio com uma ferramenta profissional.
              </p>
              
              <div className="text-6xl font-bold mb-2">R$ 4,90</div>
              <p className="text-lg text-[#94A3B8] mb-8">mensais</p>
              
              <Link 
                href="https://wa.me/5584999948854?text=Olá!%20Tenho%20interesse%20no%20StockControl." 
                target="_blank"
              >
                <Button 
                  size="lg" 
                  className="bg-[#25D366] hover:bg-[#1fa851] text-white rounded-full text-lg px-8 py-6 shadow-lg"
                >
                  <MessageCircle className="h-5 w-5" />
                  Assinar via WhatsApp
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#374e5e] mb-4">Perguntas Frequentes</h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="bg-white/60 backdrop-blur-md border-white/60 rounded-xl px-6">
              <AccordionTrigger className="font-semibold">Como funciona o pagamento?</AccordionTrigger>
              <AccordionContent className="text-[#64748B]">
                O pagamento é feito diretamente via Pix ao entrar em contato pelo WhatsApp. Após a confirmação, seu acesso é liberado imediatamente.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white/60 backdrop-blur-md border-white/60 rounded-xl px-6">
              <AccordionTrigger className="font-semibold">Preciso colocar minha senha do Jogo?</AccordionTrigger>
              <AccordionContent className="text-[#64748B]">
                Não! O StockControl é uma ferramenta externa de gerenciamento financeiro. Nunca pediremos sua senha do jogo.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white/60 backdrop-blur-md border-white/60 rounded-xl px-6">
              <AccordionTrigger className="font-semibold">Funciona no celular?</AccordionTrigger>
              <AccordionContent className="text-[#64748B]">
                Sim, nossa interface é responsiva e se adapta a qualquer tamanho de tela, permitindo que você gerencie suas vendas de onde estiver.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Footer */}
        <footer className="py-16 mt-16 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-[#374e5e]" />
              <span className="text-xl font-bold text-[#374e5e]">StockControl</span>
            </div>
            <div className="text-[#64748B] text-sm">
              &copy; 2025{" "}
              <Link href="https://imersa.art" target="_blank" className="font-semibold hover:underline">
                Imersa Studios
              </Link>
              . Todos os direitos reservados.
            </div>
          </div>
        </footer>
      </div>

      {/* Login Modal */}
      <Dialog open={loginOpen} onOpenChange={(open) => {
        setLoginOpen(open)
        if (!open) {
          setLoginError("")
          setUsername("")
          setPassword("")
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Entrar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {loginError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                placeholder="Usuário"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setLoginError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin()
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setLoginError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin()
                  }
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                Lembrar meu acesso
              </Label>
            </div>
            <Button onClick={handleLogin} className="w-full">
              Acessar Sistema
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
