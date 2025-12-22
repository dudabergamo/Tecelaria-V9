import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  LogOut,
  Plus,
  Sparkles,
  Users,
  Settings,
  Clock,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { data: memories, isLoading: memoriesLoading } = trpc.memory.getMemories.useQuery(
    undefined,
    { enabled: !!user?.id }
  );

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  useEffect(() => {
    // Redirect to onboarding if kit not activated
    if (user && !user.kitActivatedAt) {
      setLocation("/onboarding");
    }
  }, [user, setLocation]);

  if (loading || memoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando seu espaço...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Erro ao carregar usuário</p>
      </div>
    );
  }

  // Calculate days remaining
  let daysRemaining = 90;
  let programDay = 0;
  if (user.kitActivatedAt && user.programEndDate) {
    const now = new Date();
    const endDate = new Date(user.programEndDate);
    const startDate = new Date(user.kitActivatedAt);

    const diffTime = endDate.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const elapsedTime = now.getTime() - startDate.getTime();
    programDay = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
  }

  const progressPercentage = Math.min(100, (programDay / 90) * 100);
  const memoriesCount = memories?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/images/logo-transparent.png"
                alt="Tecelaria"
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Olá, <span className="font-semibold text-foreground">{user.name?.split(" ")[0]}</span>
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link href="/gerenciar-kit">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Kit
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/perfil">
                  <Settings className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bem-vindo de volta!</h1>
          <p className="text-muted-foreground">
            Você está no dia {programDay} de 90 da sua jornada na Tecelaria
          </p>
        </div>

        {/* Progress Section */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Days Remaining */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dias Restantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{daysRemaining}</div>
              <p className="text-xs text-muted-foreground mt-1">de 90 dias</p>
            </CardContent>
          </Card>

          {/* Memories Count */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Memórias Registradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{memoriesCount}</div>
              <p className="text-xs text-muted-foreground mt-1">histórias guardadas</p>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progresso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
              <Progress value={progressPercentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Register Memory */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Registrar Memória
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Grave uma história, escreva um texto, envie uma foto ou documento
              </p>
              <Button asChild className="w-full">
                <Link href="/registrar-memoria">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Começar
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* View Memories */}
          <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-secondary" />
                Minhas Memórias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Veja todas as histórias que você já registrou
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/minhas-memorias">
                  Ver Todas ({memoriesCount})
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Memories */}
        {memoriesCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Memórias Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {memories?.slice(0, 5).map((memory: any) => (
                  <div
                    key={memory.id}
                    className="flex items-start justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{memory.title || "Sem título"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {memory.category && `Categoria: ${memory.category}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="inline mr-1 h-3 w-3" />
                        {new Date(memory.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/memoria/${memory.id}`}>Ver</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {memoriesCount === 0 && (
          <Card className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma memória registrada</h3>
            <p className="text-muted-foreground mb-6">
              Comece a registrar suas histórias agora
            </p>
            <Button asChild>
              <Link href="/registrar-memoria">
                <Plus className="mr-2 h-4 w-4" />
                Registrar Primeira Memória
              </Link>
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
