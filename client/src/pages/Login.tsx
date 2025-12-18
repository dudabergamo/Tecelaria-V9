import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LogIn } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const handleAuth0Login = () => {
    // Redirecionar para Auth0
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img
              src="/images/logo-transparent.png"
              alt="Tecelaria"
              className="h-24 w-auto"
            />
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border-2">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Acessar sua Conta</CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Faça login para continuar sua jornada na Tecelaria
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Auth0 Login Button */}
            <Button
              onClick={handleAuth0Login}
              size="lg"
              className="w-full text-lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Fazer Login
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">ou</span>
              </div>
            </div>

            {/* Back to Home */}
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full text-lg"
            >
              <Link href="/">
                <BookOpen className="mr-2 h-5 w-5" />
                Voltar para Home
              </Link>
            </Button>

            {/* Info Text */}
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <p>
                Você será redirecionado para autenticar. Se não tiver uma conta, 
                poderá criar uma durante o processo de autenticação.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Precisa de ajuda?</p>
          <Link href="/" className="text-primary hover:underline">
            Volte para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
