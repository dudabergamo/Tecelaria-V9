import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Mic } from "lucide-react";
import { Link } from "wouter";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">🎉 Bem-vindo(a) à Tecelaria!</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Estamos felizes em tê-lo(a) conosco nesta jornada de preservar suas memórias.
            Você tem <strong>90 dias</strong> para registrar suas histórias e criar um legado inesquecível.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          <p className="text-sm text-muted-foreground">
            Por onde você gostaria de começar?
          </p>

          <div className="grid gap-3">
            <Button
              asChild
              size="lg"
              className="w-full justify-start"
              onClick={onClose}
            >
              <Link href="/dashboard">
                <BookOpen className="h-5 w-5 mr-2" />
                Ir para Dashboard
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full justify-start"
              onClick={onClose}
            >
              <Link href="/registrar-memoria">
                <Mic className="h-5 w-5 mr-2" />
                Registrar Primeira Memória
              </Link>
            </Button>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              💡 <strong>Dica:</strong> Comece explorando as <Link href="/caixinhas" className="underline">caixinhas de perguntas</Link> para se inspirar!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
