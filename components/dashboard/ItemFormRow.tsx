"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface ItemFormRowProps {
  index: number
  type: 'buy' | 'sell'
  itemName?: string
  onRemove?: () => void
  isFirst?: boolean
  onAddRow?: () => void
}

export function ItemFormRow({ 
  index, 
  type, 
  itemName = '', 
  onRemove, 
  isFirst = false,
  onAddRow 
}: ItemFormRowProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end mb-3">
      <div className="md:col-span-4 relative">
        <Label>Item</Label>
        <Input
          placeholder="Nome do item..."
          defaultValue={itemName}
          className="w-full"
        />
        {/* Autocomplete suggestions will go here */}
      </div>
      
      <div className="md:col-span-2">
        <Label>Qtd</Label>
        <Input type="number" placeholder="0" className="w-full" />
      </div>
      
      <div className="md:col-span-2">
        <Label>{type === 'buy' ? 'Custo (R$)' : 'Preço (R$)'}</Label>
        <Input type="number" placeholder="0.00" step="0.01" className="w-full" />
      </div>
      
      <div className="md:col-span-3">
        <Label>Data</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ptBR}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="md:col-span-1">
        <Label className="hidden md:block">&nbsp;</Label>
        {isFirst ? (
          <Button
            variant="outline"
            size="icon"
            onClick={onAddRow}
            className="w-full h-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={onRemove}
            className="w-full h-10 text-[#EF4444] hover:text-[#dc2626]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

