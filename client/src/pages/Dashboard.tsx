import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CountdownTimer } from "@/components/CountdownTimer";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Calendar,
  Clock,
  FileAudio,
  FileText,
  FileType,
  Image as ImageIcon,
  Lightbulb,
  LogOut,
  Plus,
  Sparkles,
  Users
} from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { data: dashboardData, isLoading } = trpc.user.getDashboardData.useQuery();
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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando seu espaço...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar dados</p>
      </div>
    );
  }

  const { daysRemaining, programDay, stats, inspiration, memories } = dashboardData;
  const progressPercentage = Math.min(100, (programDay / 90) * 100);
  const canGeneratePreview = programDay >= 80;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img 
                src="/images/logo-transparent.png" 
                alt="Tecelaria" 
                className="h-10 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Olá, <span className="font-semibold text-foreground">{user?.name?.split(' ')[0]}</span>
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/minhas-memorias">Minhas Memórias</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/gerenciar-kit">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Kit
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/perfil">Perfil</Link>
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Welcome Message */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Seu Espaço de Memórias</h2>
            <p className="text-muted-foreground">
              Bem-vindo de volta! Continue registrando suas histórias.
            </p>
          </div>
          <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl">
            <Link href="/registrar-memoria">
              <Plus className="mr-2 h-5 w-5" />
              Registrar Memória
            </Link>
          </Button>
        </div>

        {/* Countdown Timers */}
        <div className="grid md:grid-cols-2 gap-6">
          {user?.memoryPeriodEndDate && (
            <CountdownTimer
              title="Período de Envio de Memórias"
              description="Tempo para gravar e enviar suas histórias"
              startDate={user.kitActivatedAt || new Date()}
              endDate={new Date(user.memoryPeriodEndDate)}
              totalDays={90}
              showExtendButton
              onExtend={() => {
                // TODO: Implementar modal de prorrogação
                alert("Em breve: sistema de prorrogação por R$ 97/mês");
              }}
            />
          )}
          {user?.bookFinalizationEndDate && (
            <CountdownTimer
              title="Prazo para Finalizar o Livro"
              description="Tempo para gerar, revisar e aprovar seu livro"
              startDate={user.kitActivatedAt || new Date()}
              endDate={new Date(user.bookFinalizationEndDate)}
              totalDays={365}
              notStartedMessage="Prazo ainda não iniciado"
              startAfterDays={80}
            />
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard
            icon={<FileAudio className="h-5 w-5" />}
            label="Histórias Gravadas"
            value={stats.memoriesCount}
            color="primary"
          />
          <StatCard
            icon={<ImageIcon className="h-5 w-5" />}
            label="Fotos Adicionadas"
            value={stats.photoCount}
            color="secondary"
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Tempo Restante"
            value={`${Math.max(0, daysRemaining)} dias`}
            color="accent"
          />
          <StatCard
            icon={<ImageIcon className="h-5 w-5" />}
            label="Imagens"
            value={`${stats.estimatedImages} / 20`}
            color="primary"
          />
        </div>

        {/* Question Boxes Section */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Perguntas das Caixinhas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Use as perguntas como "abridoras de caixinhas" para despertar memórias.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/caixinhas">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Ver Todas as Caixinhas
                </Link>
              </Button>
              <Button variant="default" className="w-full" asChild>
                <Link href="/sortear-pergunta">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sortear Pergunta Aleatória
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Register Memory */}
          <Card className="border-2 hover:border-primary transition-colors cursor-pointer group">
            <CardContent className="pt-6">
              <Button 
                size="lg" 
                className="w-full text-lg py-6 rounded-xl group-hover:scale-105 transition-transform"
                asChild
              >
                <Link href="/registrar-memoria">
                  <Plus className="mr-2 h-5 w-5" />
                  Registrar Memória
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Grave áudio, escreva texto, ou envie fotos e documentos
              </p>
            </CardContent>
          </Card>

          {/* Generate Preview */}
          <Card className={`border-2 ${canGeneratePreview ? 'hover:border-accent border-accent/20' : 'opacity-50'} transition-colors`}>
            <CardContent className="pt-6">
              <Button 
                size="lg" 
                variant={canGeneratePreview ? "default" : "outline"}
                className="w-full text-lg py-6 rounded-xl"
                disabled={!canGeneratePreview}
                asChild={canGeneratePreview}
              >
                {canGeneratePreview ? (
                  <Link href="/gerar-preview">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Preview do Livro
                  </Link>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Preview do Livro
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center mt-4">
                {canGeneratePreview 
                  ? "Visualize como seu livro está ficando" 
                  : `Disponível a partir do Dia 80 (faltam ${Math.max(0, 80 - programDay)} dias)`
                }
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inspiration of the Day */}
        {inspiration && (
          <Card className="border-2 border-secondary/20 bg-gradient-to-br from-secondary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-secondary" />
                Inspiração do Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg italic text-muted-foreground">
                "{inspiration.question}"
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/registrar-memoria">
                  Responder Agora
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Recent Memories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Suas Memórias</span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/memorias">Ver Todas</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {memories.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Você ainda não registrou nenhuma memória.
                </p>
                <Button asChild>
                  <Link href="/registrar-memoria">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Primeira Memória
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {memories.slice(0, 5).map((memory) => (
                  <div
                    key={memory.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{memory.title}</h3>
                      {memory.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {memory.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {memory.recordTypes && memory.recordTypes.map((type: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="flex items-center gap-1 text-xs">
                            {type === 'audio' && <FileAudio className="h-3 w-3" />}
                            {type === 'text' && <FileText className="h-3 w-3" />}
                            {type === 'photo' && <ImageIcon className="h-3 w-3" />}
                            {type === 'document' && <FileType className="h-3 w-3" />}
                            <span className="capitalize">
                              {type === 'audio' ? 'Áudio' : 
                               type === 'text' ? 'Texto' : 
                               type === 'photo' ? 'Foto' : 'Documento'}
                            </span>
                          </Badge>
                        ))}
                        {memory.recordCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({memory.recordCount} registro{memory.recordCount > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(memory.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/memoria/${memory.id}`}>Ver</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper Component
function StatCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  color: "primary" | "secondary" | "accent";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
