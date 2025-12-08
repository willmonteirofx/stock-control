import { Card, CardContent } from "@/components/ui/card"
import { Wallet, TrendingUp, ShoppingBag } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface SummaryWidgetProps {
  type: 'sold' | 'profit' | 'bought'
  value: number
  label: string
}

const widgetConfig = {
  sold: {
    icon: Wallet,
    iconColor: 'text-[#3B82F6]',
    iconBg: 'bg-[rgba(59,130,246,0.1)]',
    label: 'Vendido'
  },
  profit: {
    icon: TrendingUp,
    iconColor: 'text-[#10B981]',
    iconBg: 'bg-[rgba(16,185,129,0.1)]',
    label: 'Lucro'
  },
  bought: {
    icon: ShoppingBag,
    iconColor: 'text-[#F59E0B]',
    iconBg: 'bg-[rgba(245,158,11,0.1)]',
    label: 'Comprado'
  }
}

export function SummaryWidget({ type, value, label }: SummaryWidgetProps) {
  const config = widgetConfig[type]
  const Icon = config.icon

  return (
    <Card className="h-full">
      <CardContent className="p-5 flex flex-col justify-center gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", config.iconBg)}>
          <Icon className={cn("h-5 w-5", config.iconColor)} />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
            {label || config.label}
          </span>
          <div className="text-xl font-bold text-[#374e5e] text-right">
            {formatCurrency(value)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

