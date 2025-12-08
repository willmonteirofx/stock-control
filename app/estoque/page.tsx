"use client"

import { useState, useMemo } from "react"
import { Box, Settings, LogOut, User, Package, ArrowLeft, Search, Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { useAuth } from "@/hooks/useAuth"
import { useStockData } from "@/hooks/useStockData"
import { formatCurrency } from "@/lib/formatters"
import type { StockItem } from "@/types/stock"

export default function EstoquePage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const { data: stockData, loading: dataLoading, addItem, updateItem, deleteItem } = useStockData()
  const [searchQuery, setSearchQuery] = useState("")
  const [editItemOpen, setEditItemOpen] = useState(false)
  const [deleteItemOpen, setDeleteItemOpen] = useState(false)
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [editName, setEditName] = useState("")
  const [editQuantity, setEditQuantity] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editImage, setEditImage] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  // Filtrar itens por busca
  const filteredItems = useMemo(() => {
    if (!stockData?.items) return []
    
    if (!searchQuery.trim()) {
      return [...stockData.items].reverse()
    }
    
    const query = searchQuery.toLowerCase()
    return stockData.items
      .filter(item => item.name.toLowerCase().includes(query))
      .reverse()
  }, [stockData?.items, searchQuery])

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

  const handleEditClick = (item: StockItem) => {
    setSelectedItem(item)
    setEditName(item.name)
    setEditQuantity(item.quantity.toString())
    setEditPrice(item.averagePrice.toString())
    setEditImagePreview(item.imageUrl || "")
    setEditImage(null)
    setEditItemOpen(true)
  }

  const handleDeleteClick = (item: StockItem) => {
    setSelectedItem(item)
    setDeleteItemOpen(true)
  }

  const handleAddClick = () => {
    setSelectedItem(null)
    setEditName("")
    setEditQuantity("")
    setEditPrice("")
    setEditImage(null)
    setEditImagePreview("")
    setAddItemOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEditImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveItem = async () => {
    // Validação básica
    if (!editName.trim()) {
      alert("Por favor, informe o nome do produto.")
      return
    }

    const quantity = parseInt(editQuantity)
    const price = parseFloat(editPrice)

    if (isNaN(quantity) || quantity <= 0) {
      alert("Por favor, informe uma quantidade válida.")
      return
    }

    if (isNaN(price) || price < 0) {
      alert("Por favor, informe um preço válido.")
      return
    }

    setIsSaving(true)

    try {
      const totalPrice = quantity * price
      const imageUrl = editImagePreview || undefined

      if (selectedItem) {
        // Editar item existente
        updateItem(selectedItem.id, {
          name: editName.trim(),
          quantity,
          averagePrice: price,
          totalPrice,
          imageUrl
        })
      } else {
        // Adicionar novo item
        addItem({
          name: editName.trim(),
          quantity,
          averagePrice: price,
          totalPrice,
          imageUrl
        })
      }

      // Limpar formulário e fechar modal
      setEditName("")
      setEditQuantity("")
      setEditPrice("")
      setEditImage(null)
      setEditImagePreview("")
      setSelectedItem(null)
      setEditItemOpen(false)
      setAddItemOpen(false)
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      alert("Erro ao salvar produto. Tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleConfirmDelete = () => {
    if (selectedItem) {
      deleteItem(selectedItem.id)
      setDeleteItemOpen(false)
      setSelectedItem(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-8">
      <div className="container max-w-7xl mx-auto px-6">
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

        {/* Header com Busca e Botão Adicionar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Buscar produtos no estoque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleAddClick} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>

        {/* Grid de Produtos */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-[#64748B] mx-auto mb-2" />
                      <p className="text-sm text-[#64748B]">Sem imagem</p>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg text-[#374e5e] mb-2">{item.name}</h3>
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Quantidade:</span>
                      <span className="font-semibold">{item.quantity} unidades</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Preço Médio:</span>
                      <span className="font-semibold">{formatCurrency(item.averagePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Valor Total:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditClick(item)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 text-[#64748B] mx-auto mb-4" />
              <p className="text-[#64748B] text-lg mb-2">
                {searchQuery ? "Nenhum produto encontrado." : "Nenhum produto em estoque ainda."}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddClick} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Produto
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal de Adicionar/Editar Item */}
        <Dialog open={editItemOpen || addItemOpen} onOpenChange={(open) => {
          if (!open) {
            setEditItemOpen(false)
            setAddItemOpen(false)
            setSelectedItem(null)
            setEditImage(null)
            setEditImagePreview("")
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedItem ? "Editar Produto" : "Adicionar Produto"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome do Produto</Label>
                <Input
                  placeholder="Nome do produto"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Preço Médio (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Imagem do Produto</Label>
                <div className="mt-2 space-y-2">
                  {editImagePreview && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={editImagePreview} 
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditItemOpen(false)
                  setAddItemOpen(false)
                  setEditName("")
                  setEditQuantity("")
                  setEditPrice("")
                  setEditImage(null)
                  setEditImagePreview("")
                  setSelectedItem(null)
                }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveItem} disabled={isSaving}>
                {isSaving ? "Salvando..." : selectedItem ? "Salvar Alterações" : "Adicionar Produto"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmar Exclusão */}
        <AlertDialog open={deleteItemOpen} onOpenChange={setDeleteItemOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex justify-center mb-4">
                <div className="text-4xl text-yellow-500">⚠️</div>
              </div>
              <AlertDialogTitle className="text-center">Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                Tem certeza que deseja excluir o produto <strong>{selectedItem?.name}</strong>?
                <br />
                <span className="text-sm">Esta ação não pode ser desfeita.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:justify-center">
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir Produto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
