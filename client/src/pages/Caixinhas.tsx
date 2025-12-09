import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  BookOpen, 
  Mic, 
  Package,
  CheckCircle2,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import MemoryDetailDialog from "@/components/MemoryDetailDialog";

export default function Caixinhas() {
  const { user, loading } = useAuth();
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: allQuestions, isLoading } = trpc.questions.getAllQuestions.useQuery();
  const { data: progress } = trpc.questions.getProgress.useQuery();
  const { data: answeredIds, refetch: refetchAnsweredIds } = trpc.questions.getAnsweredQuestionIds.useQuery();
  
  const handleViewMemory = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setIsDialogOpen(true);
  };
  
  const handleMemoryDeleted = () => {
    refetchAnsweredIds();
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando caixinhas...</p>
        </div>
      </div>
    );
  }

  // Group questions by box
  const questionsByBox = allQuestions?.reduce((acc, question) => {
    if (!acc[question.box]) {
      acc[question.box] = [];
    }
    acc[question.box].push(question);
    return acc;
  }, {} as Record<number, typeof allQuestions>);

  const boxes = [
    { 
      number: 1, 
      name: "Comece Por Aqui", 
      description: "Perguntas básicas e cadastrais para começar sua jornada",
      color: "from-green-500/10 to-green-500/5 border-green-500/20",
      icon: "🌱"
    },
    { 
      number: 2, 
      name: "Siga Por Aqui", 
      description: "Perguntas desejáveis sobre gostos, preferências e cotidiano",
      color: "from-blue-500/10 to-blue-500/5 border-blue-500/20",
      icon: "🧭"
    },
    { 
      number: 3, 
      name: "Lembranças Profundas", 
      description: "Perguntas amplas e reflexivas sobre momentos marcantes",
      color: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
      icon: "💭"
    },
    { 
      number: 4, 
      name: "Detalhes que Contam", 
      description: "Perguntas específicas sobre lugares, pessoas e detalhes",
      color: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
      icon: "🔍"
    },
  ];

  const getProgressBadge = (boxNumber: number) => {
    const boxProgress = progress?.find(p => p.box === boxNumber);
    if (!boxProgress) return null;

    const { answeredQuestions, totalQuestions, percentage } = boxProgress;
    const isComplete = answeredQuestions === totalQuestions;

    return (
      <Badge 
        variant={isComplete ? "default" : "secondary"}
        className={isComplete ? "bg-green-500" : ""}
      >
        {answeredQuestions}/{totalQuestions} {isComplete && "✓"}
      </Badge>
    );
  };

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
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8 max-w-5xl">
        {/* Title */}
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            As 4 Caixinhas de Perguntas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            150 perguntas cuidadosamente selecionadas para despertar suas memórias. 
            Use-as como "abridoras de caixinhas" - você não precisa responder todas, nem seguir uma ordem.
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <h3 className="font-bold mb-2">💡 Como usar as caixinhas</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>As perguntas são sugestões, não obrigações</li>
              <li>Você pode pular perguntas que não fazem sentido para você</li>
              <li>Sinta-se livre para gravar memórias sobre qualquer assunto</li>
              <li>Ao gravar, diga "Estou respondendo pergunta X da caixinha Y" para facilitar a organização</li>
            </ul>
          </CardContent>
        </Card>

        {/* Boxes */}
        <div className="space-y-6">
          {boxes.map((box) => {
            const questions = questionsByBox?.[box.number] || [];
            
            return (
              <Card key={box.number} className={`border-2 bg-gradient-to-br ${box.color}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-3xl">{box.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>Caixinha {box.number}: {box.name}</span>
                        <span className="text-sm font-normal text-muted-foreground">
                          ({questions.length} perguntas)
                        </span>
                        {getProgressBadge(box.number)}
                      </div>
                      <p className="text-sm font-normal text-muted-foreground mt-1">
                        {box.description}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {questions.map((question) => {
                      const isAnswered = answeredIds?.includes(question.id);
                      return (
                        <AccordionItem key={question.id} value={`question-${question.id}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center gap-2 flex-1">
                              {isAnswered && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                              )}
                              <span className="font-semibold">#{question.number}</span>
                              <span className={isAnswered ? "text-muted-foreground" : ""}>
                                {question.question}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="flex gap-2 pt-2">
                              {isAnswered ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleViewMemory(question.id)}
                                  className="flex items-center gap-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  Ver Resposta
                                </Button>
                              ) : (
                                <Button size="sm" variant="default" asChild>
                                  <Link href={`/registrar-memoria-caixinha?questionId=${question.id}`}>
                                    <Mic className="mr-2 h-4 w-4" />
                                    Responder Agora
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <Card className="border-2 border-primary">
          <CardContent className="pt-6 text-center space-y-4">
            <h3 className="text-xl font-bold">Pronto para começar?</h3>
            <p className="text-muted-foreground">
              Escolha uma pergunta acima ou registre uma memória livre
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" variant="default" asChild>
                <Link href="/sortear-pergunta">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Sortear Pergunta Aleatória
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/registrar-memoria">
                  <Mic className="mr-2 h-5 w-5" />
                  Registrar Memória Livre
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Memory Detail Dialog */}
      {selectedQuestionId && (
        <MemoryDetailDialog
          questionId={selectedQuestionId}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onMemoryDeleted={handleMemoryDeleted}
        />
      )}
    </div>
  );
}
