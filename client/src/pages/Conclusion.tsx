import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function Conclusion() {
  const [, setLocation] = useLocation();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedSharing, setAcceptedSharing] = useState(false);

  const activateKit = trpc.user.activateKit.useMutation({
    onSuccess: () => {
      toast.success("Bem-vindo à Tecelaria! Sua jornada começou!");
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao ativar kit");
    },
  });

  const handleContinue = async () => {
    if (!acceptedTerms) {
      toast.error("Você precisa aceitar os termos de serviço");
      return;
    }

    if (!acceptedSharing) {
      toast.error("Você precisa aceitar o compartilhamento de informações");
      return;
    }

    try {
      await activateKit.mutateAsync();
    } catch (error) {
      // Erro já tratado
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="border-2">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl text-center">Bem-vindo à Tecelaria!</CardTitle>
            <p className="text-muted-foreground text-center">
              Antes de começar sua jornada, precisamos de alguns detalhes finais
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* RPG Style Box */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold">📜 Sua Jornada Começa Aqui</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Você está prestes a embarcar em uma jornada de 105 dias de autodescoberta e reflexão. 
                Cada dia traz novas memórias, histórias e aprendizados que moldaram quem você é hoje.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Na Tecelaria, você tecelará a tapeçaria da sua vida, entrelaçando momentos preciosos 
                em uma narrativa única e pessoal.
              </p>
            </div>

            {/* Termos */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  disabled={activateKit.isPending}
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  Eu aceito os{" "}
                  <button className="text-primary hover:underline">
                    termos de serviço
                  </button>{" "}
                  e a{" "}
                  <button className="text-primary hover:underline">
                    política de privacidade
                  </button>{" "}
                  da Tecelaria
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="sharing"
                  checked={acceptedSharing}
                  onCheckedChange={(checked) => setAcceptedSharing(checked as boolean)}
                  disabled={activateKit.isPending}
                />
                <Label
                  htmlFor="sharing"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  Autorizo a Tecelaria a usar minhas informações de forma anônima para melhorar 
                  a experiência e oferecer recomendações personalizadas
                </Label>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground space-y-2">
              <p>
                ✨ <strong>Dica:</strong> Sua jornada será dividida em 105 dias. A cada 15 dias, 
                você receberá perguntas reflexivas para aprofundar suas memórias.
              </p>
              <p>
                🎯 <strong>Objetivo:</strong> Ao final, você terá um livro personalizado com todas 
                as suas histórias e reflexões.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleContinue}
                disabled={activateKit.isPending || !acceptedTerms || !acceptedSharing}
                size="lg"
                className="flex-1"
              >
                {activateKit.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  "Começar Minha Jornada"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                size="lg"
                disabled={activateKit.isPending}
              >
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
