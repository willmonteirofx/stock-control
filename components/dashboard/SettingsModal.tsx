"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  showTutorial: boolean
  onTutorialChange: (show: boolean) => void
}

export function SettingsModal({ open, onOpenChange, showTutorial, onTutorialChange }: SettingsModalProps) {
  const [showInfoDialog, setShowInfoDialog] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Tema */}
            <div className="space-y-2">
              <Label htmlFor="theme">Tema</Label>
              <select 
                id="theme"
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Claro</option>
                <option disabled>Escuro (Em breve)</option>
              </select>
            </div>

            {/* Notificações */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">
                  Ativar sons de notificação
                </Label>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>

            {/* Tutorial */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="tutorial">
                    Mostrar tutorial na próxima vez
                  </Label>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4"
                    onClick={() => setShowInfoDialog(true)}
                  >
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <Switch 
                id="tutorial" 
                checked={showTutorial}
                onCheckedChange={onTutorialChange}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  )
}

