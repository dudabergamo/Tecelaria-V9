import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { BookOpen, Mail } from "lucide-react";

export default function EmailConfirmation() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(() => {
    // Get email from URL params or localStorage
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || localStorage.getItem('signupEmail') || '';
  });

  const confirmEmail = trpc.auth.confirmEmail.useMutation({
    onSuccess: () => {
      toast.success("Email confirmado! Agora complete seu cadastro.");
      setLocation("/complete-signup");
    },
    onError: (error: any) => {
      toast.error(error.message || "Código inválido ou expirado");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.error("Digite o código de confirmação");
      return;
    }

    setIsLoading(true);
    try {
      if (!email) {
        toast.error("Email não encontrado. Por favor, faça signup novamente.");
        setLocation("/signup");
        return;
      }
      await confirmEmail.mutateAsync({
        email: email,
        code: code.trim(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Confirmar Email</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enviamos um código de confirmação para seu email
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">
              Verifique sua caixa de entrada e copie o código que recebeu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código de Confirmação</Label>
              <Input
                id="code"
                type="text"
                placeholder="Digite o código aqui"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isLoading}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || confirmEmail.isPending}
              size="lg"
            >
              {isLoading || confirmEmail.isPending ? "Confirmando..." : "Confirmar Email"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Não recebeu o código?{" "}
              <button
                type="button"
                onClick={() => toast.info("Funcionalidade em desenvolvimento")}
                className="text-primary hover:underline font-medium"
              >
                Reenviar código
              </button>
            </p>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setLocation("/login")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Voltar para login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
