import { Badge } from "@/components/ui/badge"
import { Wallet, ShoppingBag, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TransactionItemProps {
  transaction: string
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const lowerTx = transaction.toLowerCase().trim()
  
  let icon = 'circle'
  let wrapperStyle = 'bg-[#f1f5f9] text-[#64748B]'
  let typeLabel = ''
  let typeColor = ''

  if (lowerTx.startsWith('c:')) {
    icon = 'shopping-bag'
    wrapperStyle = 'bg-[rgba(245,158,11,0.1)] text-[#F59E0B]'
    typeLabel = 'COMPRA'
    typeColor = '#F59E0B'
  } else if (lowerTx.startsWith('v:')) {
    icon = 'wallet'
    wrapperStyle = 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6]'
    typeLabel = 'VENDA'
    typeColor = '#3B82F6'
  }

  const parseTransaction = (str: string) => {
    const cleanStr = str.replace(/^(c|v):\s*/i, '').trim()
    
    const qtyMatch = cleanStr.match(/^(\d+)x\s*/i)
    const quantity = qtyMatch ? qtyMatch[1] : ''
    const afterQty = qtyMatch ? cleanStr.substring(qtyMatch[0].length) : cleanStr
    
    const priceMatch = afterQty.match(/por\s+R\$\s*([\d.,]+)/i) || afterQty.match(/por\s+([\d.,]+)c/i)
    const price = priceMatch ? priceMatch[1].replace(',', '.') : ''
    const beforePrice = priceMatch ? afterQty.substring(0, priceMatch.index).trim() : afterQty
    
    const itemName = beforePrice.trim()
    
    const dateMatch = str.match(/em\s+([^,]+,\s*\d{1,2}\/\d{1,2})/i)
    const dateTime = dateMatch ? dateMatch[1] : ''
    
    return { quantity, itemName, price, dateTime }
  }
  
  const parsed = parseTransaction(transaction)

  return (
    <li className="flex items-center gap-3 py-3 border-b last:border-b-0">
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
        wrapperStyle
      )}>
        {icon === 'wallet' && <Wallet className="h-5 w-5" />}
        {icon === 'shopping-bag' && <ShoppingBag className="h-5 w-5" />}
      </div>
      
      <div className="flex-1 flex items-center gap-3 flex-wrap min-w-0">
        {typeLabel && (
          <Badge 
            className="text-xs font-bold px-2.5 py-1"
            style={{ backgroundColor: typeColor, color: 'white' }}
          >
            {typeLabel}
          </Badge>
        )}
        
        {parsed.quantity && (
          <span className="text-sm font-semibold text-[#64748B] flex-shrink-0">
            {parsed.quantity}x
          </span>
        )}
        
        <div className="text-sm font-semibold text-[#374e5e] flex-1 min-w-[150px] truncate">
          {parsed.itemName || transaction.replace(/^(c|v):\s*/i, '').split(' por ')[0].trim()}
        </div>
        
        {parsed.price && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-xs text-[#64748B]">Preço:</span>
            <span className="text-sm font-bold text-[#374e5e]">
              R$ {parseFloat(parsed.price.replace(',', '.')).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
        
        {parsed.dateTime && (
          <div className="flex items-center gap-1 flex-shrink-0 text-[#64748B]">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{parsed.dateTime}</span>
          </div>
        )}
      </div>
    </li>
  )
}

