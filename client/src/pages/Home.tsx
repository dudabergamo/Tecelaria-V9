import { useAuth } from "@/_core/hooks/useAuth";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { BookOpen, Calendar, Heart, Sparkles, Users, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useState, useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Show welcome modal for first-time users after login
  useEffect(() => {
    if (isAuthenticated) {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true);
        localStorage.setItem('hasSeenWelcome', 'true');
      }
    }
  }, [isAuthenticated]);
  // Removed test login - no longer needed

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-card to-muted py-20 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary organic-shape"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary organic-shape-alt"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/images/logo-transparent.png" 
                alt="Tecelaria" 
                className="h-32 md:h-48 lg:h-56 w-auto animate-fade-in"
              />
            </div>
            
            {/* Tagline */}
            <p className="text-3xl md:text-4xl font-normal text-muted-foreground">
              memórias tecidas com tecnologia e afeto
            </p>
            <p className="text-base md:text-lg text-muted-foreground/80 italic font-medium">
              Em parceria com Cassará Editora
            </p>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transforme em livro suas memórias, em uma jornada guiada de 105 dias de duração. 
              Registre as memórias sem pressa, no seu tempo e do seu jeito. E deixe o restante por nossa conta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {isAuthenticated ? (
                <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl">
                  <Link href="/dashboard">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Ir para Dashboard
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg px-8 py-6 rounded-xl">
                    <a href="/login">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Começar Agora
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 rounded-xl">
                    <a href="#como-funciona">
                      Saiba Mais
                    </a>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Divisor Coral */}
      <div className="coral-divider"></div>

      {/* O que é Tecelaria */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">O que é a Tecelaria?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Tecelaria é uma plataforma que une tecnologia, design, olhar humano e experiência editorial e que nasce para facilitar a criação de livros de histórias de vida. Os registros das histórias podem ser enviados por áudio, texto, imagens e fotografias, tudo de forma livre e espontânea. Os autores-personagens contam também com "caixinhas de perguntas" cuidadosamente selecionadas, que ajudam a destravar e acessar memórias, tudo em uma jornada guidada e leve.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Em parceria com a Cassará Editora e com o uso de agentes de inteligência artificial especializados em geração e revisão de livros bibliogáficos, transformamos essas narrativas e memórias em livros, que podem ser compartilhados com a família e amigos.
            </p>        
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">Liberdade Total</h3>
                  <p className="text-sm text-muted-foreground">
                    Nossos autores-personagens dispõem de liberdade na construção de seus livros, registrando as memórias no seu tempo, e não estão sozinhos nesse percurso, contando com as nossas "caixinhas de perguntas" que os ajudam durante todo o processo.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-bold text-lg">IA Gentil</h3>
                  <p className="text-sm text-muted-foreground">
                    Assistente inteligente que faz perguntas contextuais e organiza suas histórias.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <BookOpen className="h-6 w-6 text-accent book-icon-coral" />
                  </div>
                  <h3 className="font-bold text-lg">Livro Real</h3>
                  <p className="text-sm text-muted-foreground">
                    Ao final, você recebe um livro completo, digital, editável e pronto para impressão. Em breve, teremos também a opção de gerar livros físicos.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Divisor Coral */}
      <div className="coral-divider"></div>

      {/* Cronograma Visual */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Cronograma de 105 Dias</h2>
              <p className="text-lg text-muted-foreground">
                Uma jornada organizada para transformar suas memórias em um livro
              </p>
            </div>
            
            <div className="space-y-6">
              <TimelineItem
                day="Dia 0"
                icon={<Calendar className="h-5 w-5" />}
                title="Início da jornada"
                description="A jornada pode se iniciar de duas formas: com acesso direto à plataforma e ao nosso app ou por meio do recebimento de um kit físico, composto de caixinhas impressas de perguntas, QR Code e link de acesso à plataforma. O kit físico é pensado especialmente para quem quer presentear um familiar ou amigo com esse afetivo projeto."
              />
              
              <TimelineItem
                day="Dia 1"
                icon={<Sparkles className="h-5 w-5" />}
                title="Ativação"
                description="Primeiro login na plataforma. Sistema registra início do programa de 90 dias."
              />
              
              <TimelineItem
                day="Dias 1-90"
                icon={<MessageCircle className="h-5 w-5" />}
                title="Período de Captura e Registro das Memórias"
                description="Registre suas memórias livremente durante 90 dias. Grave áudios diretamente no app, suba áudios, escreva diretamente no aplicativo ou no site, suba documentos, etc."
              />
              
              <TimelineItem
                day="Dia 75-80"
                icon={<Clock className="h-5 w-5" />}
                title="Notificação de Encerramento"
                description="Contador regressivo ativado. Botão 'Gerar Preview' disponível para visualizar seu livro."
              />
              
              <TimelineItem
                day="Dia 90"
                icon={<BookOpen className="h-5 w-5" />}
                title="Processamento"
                description="Fim do período padrão de registros de memórias. Nesse momento, nossos agentes de IA entram em cena e começam a tecer seu livro, organizando suas memórias."
              />
              
              <TimelineItem
                day="Dia 105"
                icon={<CheckCircle2 className="h-5 w-5" />}
                title="Livro Pronto"
                description="Preview disponível para revisão. Edite, aprove e gere versão final (digital ou impressa)."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-20 bg-card">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Como Funciona</h2>
              <p className="text-lg text-muted-foreground">
                Simples, intuitivo e pensado para você
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <StepCard
                number="1"
                title="Receba o Kit"
                description="Kit Físico: Adquira o kit Tecelaria - presente perfeito para você ou alguém especial. Acesso completo à plataforma com app de gravação e materiais digitais. Kit físico inclui 4 caixinhas de perguntas, com 150 perguntas ao todo. Kit Digital: Inscreva-se na versão digital com acesso completo à plataforma e app de gravação."
              />
              
              <StepCard
                number="2"
                title="Faça Login"
                description="Use QR code ou cartão de acesso para fazer login. Sistema registra o Dia 1 do seu programa de 105 dias."
              />
              
              <StepCard
                number="3"
                title="Registre Histórias (90 dias)"
                description="Grave áudios, escreva textos, envie fotos ou documentos. Organize por categorias ou crie suas próprias memórias personalizadas. Ou siga e responda às perguntas das caixinhas previamente selecionadas para ajudá-lo nessa jornada."
              />
              
              <StepCard
                number="4"
                title="IA Processa e Organiza"
                description="Sistema transcreve áudios automaticamente, identifica temas, pessoas e períodos mencionados nas suas memórias."
              />
              
              <StepCard
                number="5"
                title="Gera Preview do Livro (Dia 80+)"
                description="A partir do 80º dia, escolha como organizar seu livro: cronológico ou temático. IA cria capítulos e estrutura completa."
              />
              
              <StepCard
                number="6"
                title="Revise e Edite (Dia 80-105)"
                description="Revise no editor integrado, baixe em Word ou edite com IA para fazer ajustes específicos. Você tem controle total sobre o conteúdo final."
              />
              
              <StepCard
                number="7"
                title="Revisão Especializada Cassará"
                description="Em parceria com agentes de inteligência artificial treinados pela Cassará Editora, faremos a revisão do livro e depois enviaremos para aprovação final."
              />
              
              <StepCard
                number="8"
                title="Aprovação Final"
                description="Revisão final pelo usuário e aprovação, com indicação de gerar o livro digital ou solicitar a impressão do livro."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Por que Tecelaria */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Por que Escolher a Tecelaria?</h2>
              <p className="text-lg text-muted-foreground">
                Uma plataforma pensada para preservar suas memórias com tecnologia e cuidado humano
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl">Tecnologia Avançada</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Inteligência artificial de última geração para transcrever, organizar e estruturar 
                    suas histórias automaticamente, economizando tempo e esforço.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Heart className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="font-bold text-xl">Revisão Especializada</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Parceria com a Cassará Editora no treinamento de agentes de inteligência artificial que farão a revisão profissional do seu livro. Além disso, <strong>leitura e sugestões finais por parte da editora</strong>, combinando automação com o toque humano de especialistas.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="font-bold text-xl">No Seu Ritmo</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Grave suas memórias quando e como quiser. Sem pressão, sem prazos rígidos. 
                    A plataforma se adapta ao seu tempo e estilo.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl">Legado Duradouro</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Transforme suas experiências em um livro físico ou digital que atravessará 
                    gerações, preservando sua história para sempre.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Preços */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Escolha Seu Plano</h2>
              <p className="text-lg text-muted-foreground">
                Tudo que você precisa para começar sua jornada
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Kit Digital */}
              <Card className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Kit Digital</h3>
                    <p className="text-5xl font-bold text-primary">R$ 350</p>
                    <p className="text-muted-foreground">Pagamento único</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-bold text-lg">O que está incluído:</h4>
                    <ul className="custom-bullet-list">
                      <PriceItem text="3 meses para enviar memórias" />
                      <PriceItem text="Até 1 ano para gerar e imprimir" />
                      <PriceItem text="App de gravação de áudio" />
                      <PriceItem text="Até 80 páginas no livro final digital" />
                      <PriceItem text="Até 20 imagens no livro" />
                      <PriceItem text="Análise e comentários finais do livro pela Cassará Editora" />
                      <PriceItem text="Impressão física disponível mediante custo a ser confirmado (disponível em breve)" />
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <Button asChild size="lg" variant="outline" className="w-full text-lg py-6 rounded-xl">
                      <a href="/login">
                        Adquirir Kit Digital
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Kit Físico */}
              <Card className="border-4 border-primary relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                  Mais Completo
                </div>
                <CardContent className="pt-8 space-y-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">Kit Físico</h3>
                    <p className="text-5xl font-bold text-primary">R$ 480</p>
                    <p className="text-muted-foreground">Pagamento único</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-bold text-lg">O que está incluído:</h4>
                    <ul className="custom-bullet-list">
                      <PriceItem text="Tudo do Kit Digital +" />
                      <PriceItem text="4 caixinhas de perguntas impressas, com 150 perguntas ao todo" />
                      <PriceItem text="Manual ilustrado" />
                      <PriceItem text="Ideal para presente" />
                    </ul>
                  </div>
                  
                  <div className="pt-4">
                    <Button asChild size="lg" className="w-full text-lg py-6 rounded-xl">
                      <a href="/login">
                        Adquirir Kit Físico
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-center space-y-4 pt-8">
              <p className="text-sm text-muted-foreground">
                * Páginas e imagens extras têm custo adicional
              </p>
              <div className="bg-muted/50 p-6 rounded-xl max-w-2xl mx-auto">
                <h4 className="font-bold text-lg mb-2">Impressão Física do Livro</h4>
                <p className="text-muted-foreground text-sm">
                  Após aprovar seu livro, você poderá solicitar a impressão física. 
                  Valor estimado a partir de R$ 80,00 (varia conforme número de páginas e acabamento). 
                  Em breve, integração com Amazon KDP para publicação sob demanda.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold">Perguntas Frequentes</h2>
            </div>
            
            <div className="space-y-6">
              <FAQItem
                question="Preciso ter conhecimento técnico para usar?"
                answer="Não! A plataforma foi projetada para ser extremamente simples. Se você consegue enviar uma mensagem no WhatsApp, consegue usar a Tecelaria."
              />
              
              <FAQItem
                question="E se eu não conseguir gravar tudo em 3 meses?"
                answer="Você tem 3 meses para enviar suas memórias. Se precisar de mais tempo para continuar enviando conteúdo, pode adquirir uma prorrogação por R$ 97,00/mês adicional, por até 12 meses. Após o período de envio, você tem até 1 ano para gerar e finalizar seu livro."
              />
              
              <FAQItem
                question="Posso editar o livro?"
                answer="Sim, você terá controle total. A partir do dia 80, você poderá editar na plataforma, baixar em Word ou usar IA para fazer ajustes específicos."
              />
              
              <FAQItem
                question="Como funciona a impressão do livro?"
                answer="Após aprovar a versão final, você pode gerar um PDF de alta qualidade para impressão. Em breve, teremos a possibilidade de impressão de livros físicos."
              />
              
              <FAQItem
                question="Posso criar um livro para outra pessoa?"
                answer="Sim! O Kit Tecelaria é um presente perfeito. A pessoa receberá o kit e poderá gravar suas próprias histórias."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Comece sua jornada hoje
            </h2>
            <p className="text-xl text-muted-foreground">
              Transforme suas memórias em um legado que atravessará gerações.
            </p>
            <Button asChild size="lg" className="text-lg px-12 py-6 rounded-xl">
             <a href="/login">
                <Sparkles className="mr-2 h-5 w-5" />
                Começar Agora
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <img 
              src="/images/logo-transparent.png" 
              alt="Tecelaria" 
              className="h-20 w-auto mx-auto"
            />
            <p className="text-muted-foreground"></p>
            <p className="text-base text-muted-foreground italic font-medium">
              
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 Tecelaria. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Welcome Modal */}
      <WelcomeModal open={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
    </div>
  );
}

// Helper Components
function TimelineItem({ day, icon, title, description }: { 
  day: string; 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-24 pt-1">
        <p className="font-bold text-primary">{day}</p>
      </div>
      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function StepCard({ number, title, description }: { 
  number: string; 
  title: string; 
  description: string;
}) {
  return (
    <Card className="border-2 hover:border-primary transition-colors">
      <CardContent className="pt-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
            {number}
          </div>
          <h3 className="font-bold text-xl">{title}</h3>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function PriceItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card className="border-2">
      <CardContent className="pt-6 space-y-3">
        <h3 className="font-bold text-lg">{question}</h3>
        <p className="text-muted-foreground">{answer}</p>
      </CardContent>
    </Card>
  );
}


