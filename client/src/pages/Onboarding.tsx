import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, Calendar, Heart, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const activateKit = trpc.user.activateKit.useMutation({
    onSuccess: () => {
      toast.success("Kit ativado com sucesso! Bem-vindo à Tecelaria!");
      // Refresh user data
      setTimeout(() => {
        setLocation("/dashboard");
      }, 500);
    },
    onError: (error: any) => {
      console.error("Erro ao ativar kit:", error);
      toast.error(error.message || "Erro ao ativar kit");
    },
  });

  useEffect(() => {
    // Se usuário já ativou o kit, redireciona para dashboard
    if (user?.kitActivatedAt) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const handleActivate = () => {
    if (!user?.id) {
      toast.error("Usuário não identificado");
      return;
    }
    activateKit.mutate();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-primary/10 rounded-full">
            <BookOpen className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Bem-vindo à Tecelaria, {user.name?.split(' ')[0] || 'amigo'}!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nos próximos 90 dias, este será seu espaço para guardar suas histórias. 
            Grave quando quiser, do jeito que quiser. Estamos aqui para ajudar.
          </p>
        </div>

        {/* Como Funciona */}
        <Card className="border-2">
          <CardContent className="pt-8 space-y-6">
            <h2 className="text-2xl font-bold text-center">Como Funciona</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold">Liberdade Total</h3>
                  <p className="text-sm text-muted-foreground">
                    Não há ordem certa ou errada. Grave as memórias que vierem à sua mente, 
                    quando elas vierem.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold">IA Gentil</h3>
                  <p className="text-sm text-muted-foreground">
                    A cada 15 dias, faremos perguntas personalizadas baseadas no que você já contou, 
                    para enriquecer suas histórias.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold">90 Dias</h3>
                  <p className="text-sm text-muted-foreground">
                    Você tem 90 dias para registrar suas memórias. Mas não se preocupe, 
                    não precisa gravar todos os dias!
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold">Seu Livro</h3>
                  <p className="text-sm text-muted-foreground">
                    Ao final, transformaremos suas memórias em um livro completo, 
                    que você poderá editar e aprovar.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* O que você pode fazer */}
        <Card className="border-2">
          <CardContent className="pt-8 space-y-4">
            <h2 className="text-2xl font-bold text-center">O que você pode fazer</h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm">Gravar áudios usando seu gravador ou direto no sistema</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm">Escrever textos diretamente na plataforma</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm">Enviar fotos e documentos para ilustrar suas histórias</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm">Organizar por categorias (Infância, Família, Viagens, etc.)</p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <p className="text-sm">Criar até 5 memórias personalizadas com seus próprios temas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            Ao clicar em "Começar Minha Jornada", seu período de 90 dias será iniciado.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-12 py-6 rounded-xl"
            onClick={handleActivate}
          >
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Começar Minha Jornada
            </>
          </Button>
        </div>
      </div>
    </div>
  );
}
