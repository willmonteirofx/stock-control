"use client"

import { Wallet, Package, TrendingUp, BarChart3, Check } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TutorialProps {
  onClose: () => void
}

export function Tutorial({ onClose }: TutorialProps) {
  const handleClose = () => {
    onClose()
  }

  const tutorialItems = [
    {
      icon: BarChart3,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-50",
      title: "Métricas",
      description: "No topo do dashboard você encontra as métricas principais: Vendido, Lucro e Comprado. Esses valores são atualizados automaticamente conforme você registra vendas."
    },
    {
      icon: Wallet,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-50",
      title: "Vender",
      description: "Registre suas vendas informando o item, quantidade e preço de venda. O sistema calcula automaticamente o lucro e atualiza as métricas."
    },
    {
      icon: Package,
      iconColor: "text-green-500",
      iconBg: "bg-green-50",
      title: "Estoque",
      description: "Visualize todos os seus itens em estoque, com quantidade e preço médio. Você pode editar ou excluir itens diretamente daqui."
    },
    {
      icon: TrendingUp,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-50",
      title: "Insights",
      description: "Abaixo dos botões principais, você encontra insights valiosos: Produtos Mais Vendidos, Dias da Semana com mais vendas e produtos com Maior Margem de Lucro."
    }
  ]

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="mb-2">
          <h4 className="text-xl font-bold text-[#374e5e]">Bem-vindo ao StockControl!</h4>
          <p className="text-[#64748B] mt-1">Aqui está um guia rápido para você começar a usar o sistema.</p>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-3">
            {tutorialItems.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={index}
                  className="p-4 bg-[#f8fafc] rounded-xl border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.iconBg}`}>
                      <Icon className={`h-5 w-5 ${item.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-[#374e5e] mb-1">{item.title}</h5>
                      <p className="text-sm text-[#64748B]">{item.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button 
            onClick={handleClose}
            className="w-full"
          >
            <Check className="mr-2 h-4 w-4" />
            Entendi como usar, pode fechar.
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

