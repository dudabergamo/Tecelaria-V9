import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"options" | "login" | "signup">("options");

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

        {/* Options View */}
        {view === "options" && (
          <Card className="border-2">
            <CardHeader className="space-y-2">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Bem-vindo à Tecelaria</CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Escolha como você quer continuar
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Fazer Login */}
              <Button
                onClick={() => setView("login")}
                size="lg"
                className="w-full text-lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Fazer Login
              </Button>

              {/* Criar Conta */}
              <Button
                onClick={() => setView("signup")}
                variant="secondary"
                size="lg"
                className="w-full text-lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Criar Conta
              </Button>

              {/* Voltar para Home */}
              <Button
                asChild
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Link href="/">Voltar para Home</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Login View */}
        {view === "login" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Fazer Login</CardTitle>
              <p className="text-sm text-muted-foreground">
                Acesse sua conta na Tecelaria
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setLocation("/login/email")}
                size="lg"
                className="w-full"
              >
                Continuar com Email
              </Button>
              <Button
                variant="outline"
                onClick={() => setView("options")}
                className="w-full"
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Signup View */}
        {view === "signup" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Criar Conta</CardTitle>
              <p className="text-sm text-muted-foreground">
                Comece sua jornada na Tecelaria
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => setLocation("/signup")}
                size="lg"
                className="w-full"
              >
                Continuar com Email
              </Button>
              <Button
                variant="outline"
                onClick={() => setView("options")}
                className="w-full"
              >
                Voltar
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
