import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { BookOpen } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const login = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data.firstLogin) {
        toast.success("Login realizado! Bem-vindo ao onboarding.");
        setLocation("/onboarding");
      } else {
        toast.success("Bem-vindo de volta!");
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Email ou senha incorretos");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      await login.mutateAsync({
        email,
        password,
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
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Fazer Login</CardTitle>
          <p className="text-sm text-muted-foreground">
            Acesse sua conta na Tecelaria
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || login.isPending}
              size="lg"
            >
              {isLoading || login.isPending ? "Entrando..." : "Fazer Login"}
            </Button>

            {/* Link para Signup */}
            <p className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <button
                type="button"
                onClick={() => setLocation("/signup")}
                className="text-primary hover:underline font-medium"
              >
                Criar conta
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
