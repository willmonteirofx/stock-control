import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import type { StockItem as StockItemType } from "@/types/stock"

interface StockItemProps {
  item: StockItemType
  onEdit: (item: StockItemType) => void
  onDelete: (item: StockItemType) => void
}

export function StockItem({ item, onEdit, onDelete }: StockItemProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex-1">
        <span className="font-bold text-[#374e5e] block">{item.name}</span>
        <span className="text-sm text-[#64748B]">
          QTD: <span className="font-semibold">{item.quantity}</span>
        </span>
      </div>
      
      <div className="text-right mr-3">
        <Badge variant="outline" className="mb-1">
          {formatCurrency(item.totalPrice)}
        </Badge>
        <div className="text-xs text-[#64748B]" style={{ fontSize: '0.75rem' }}>
          Média: {formatCurrency(item.averagePrice)}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(item)}
          className="h-11 w-11"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item)}
          className="h-11 w-11 text-[#EF4444] hover:text-[#dc2626]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

