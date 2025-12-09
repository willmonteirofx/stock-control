"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/formatters"

type Period = "7days" | "30days" | "365days"

interface ChartDataPoint {
  date: string
  value: number
  label: string
}

export function SalesChart() {
  const [transactions, setTransactions] = useState<string[]>([])
  const [period, setPeriod] = useState<Period>("7days")

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedTransactions = localStorage.getItem('stock_control_transactions')
    setTransactions(storedTransactions ? JSON.parse(storedTransactions) : [])
  }, [])

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return []

    const now = new Date()
    let startDate: Date
    let daysToShow: number
    let labelFormat: (date: Date) => string

    switch (period) {
      case "7days":
        daysToShow = 7
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        labelFormat = (date: Date) => {
          const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
          return days[date.getDay()]
        }
        break
      case "30days":
        daysToShow = 30
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        labelFormat = (date: Date) => {
          return `${date.getDate()}/${date.getMonth() + 1}`
        }
        break
      case "365days":
        daysToShow = 12
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        labelFormat = (date: Date) => {
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
          return months[date.getMonth()]
        }
        break
    }

    // Criar array de datas
    const dataPoints: ChartDataPoint[] = []
    
    if (period === "365days") {
      // Para ano, agrupar por mês - mostrar últimos 12 meses
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1)
        dataPoints.push({
          date: date.toISOString(),
          value: 0,
          label: labelFormat(date)
        })
      }
    } else {
      // Para dias, criar um ponto por dia
      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        dataPoints.push({
          date: date.toISOString(),
          value: 0,
          label: labelFormat(date)
        })
      }
    }

    // Processar transações
    transactions.forEach(transaction => {
      const sellMatch = transaction.match(/VENDA:\s*(.+?),\s*Qtd:\s*(\d+),\s*Preço:\s*R\$\s*([\d,]+)/i)
      if (sellMatch) {
        const quantity = parseInt(sellMatch[2])
        const price = parseFloat(sellMatch[3].replace(',', '.'))
        const total = price * quantity

        // Tentar extrair data da transação
        const dateMatch = transaction.match(/(\d{2}\/\d{2}\/\d{4})/)
        let transactionDate = new Date()
        if (dateMatch) {
          const [day, month, year] = dateMatch[1].split('/')
          transactionDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        }

        // Verificar se a transação está no período
        if (transactionDate >= startDate && transactionDate <= now) {
          if (period === "365days") {
            // Agrupar por mês - encontrar o índice do mês correspondente
            const currentMonth = now.getMonth()
            const currentYear = now.getFullYear()
            const transactionMonth = transactionDate.getMonth()
            const transactionYear = transactionDate.getFullYear()
            
            // Calcular quantos meses atrás foi a transação
            const monthsDiff = (currentYear - transactionYear) * 12 + (currentMonth - transactionMonth)
            const monthIndex = 11 - monthsDiff
            
            if (monthIndex >= 0 && monthIndex < 12) {
              dataPoints[monthIndex].value += total
            }
          } else {
            // Agrupar por dia
            const dayIndex = Math.floor((transactionDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000))
            if (dayIndex >= 0 && dayIndex < daysToShow) {
              dataPoints[dayIndex].value += total
            }
          }
        }
      }
    })

    return dataPoints
  }, [transactions, period])

  const maxValue = Math.max(...chartData.map(d => d.value), 1)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Vendas ao Longo do Tempo</CardTitle>
        <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Último mês</SelectItem>
            <SelectItem value="365days">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-end justify-between gap-2">
          {chartData.length > 0 ? (
            chartData.map((point, index) => {
              const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 relative group"
                      style={{ height: `${height}%`, minHeight: point.value > 0 ? '4px' : '0' }}
                    >
                      {point.value > 0 && (
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {formatCurrency(point.value)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-[#64748B] text-center">{point.label}</span>
                </div>
              )
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#64748B] text-sm">
              Nenhuma venda registrada no período selecionado
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

