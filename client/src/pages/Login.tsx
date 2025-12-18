import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<"options" | "signin" | "signup" | "forgot">("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");

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

  const forgotPassword = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      toast.success("Instrucoes enviadas para seu email!");
      setForgotEmail("");
      setView("signin");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao enviar instrucoes");
    },
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      await login.mutateAsync({ email, password });
    } catch (error) {
      // Erro já tratado
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setLocation("/")}
            className="hover:opacity-80 transition-opacity"
          >
            <img
              src="/images/logo-transparent.png"
              alt="Tecelaria"
              className="h-24 w-auto"
            />
          </button>
        </div>

        {/* Options View */}
        {view === "options" && (
          <Card className="border-2">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-center">Bem-vindo à Tecelaria</CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Escolha como você quer continuar
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              <Button
                onClick={() => setView("signin")}
                size="lg"
                className="w-full text-lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Fazer Login
              </Button>

              <Button
                onClick={() => setView("signup")}
                variant="secondary"
                size="lg"
                className="w-full text-lg"
              >
                <UserPlus className="mr-2 h-5 w-5" />
                Criar Conta
              </Button>

              <Button
                onClick={() => setLocation("/")}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Voltar para Home
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Sign In View */}
        {view === "signin" && (
          <Card className="border-2">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("options")}
                  className="p-1 hover:bg-muted rounded"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <CardTitle className="text-2xl">Fazer Login</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Acesse sua conta na Tecelaria
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={login.isPending}
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
                    disabled={login.isPending}
                  />
                </div>

                {/* Esqueci Senha */}
                <button
                  type="button"
                  onClick={() => setView("forgot")}
                  className="text-sm text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  disabled={login.isPending}
                  size="lg"
                  className="w-full"
                >
                  {login.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Fazer Sign-In"
                  )}
                </Button>

                {/* Criar Conta Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <button
                    type="button"
                    onClick={() => setView("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Criar conta
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Sign Up View */}
        {view === "signup" && (
          <Card className="border-2">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("options")}
                  className="p-1 hover:bg-muted rounded"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <CardTitle className="text-2xl">Criar Conta</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Comece sua jornada na Tecelaria
              </p>
            </CardHeader>

            <CardContent>
              <SignupForm onSuccess={() => setLocation("/email-confirmation")} />
            </CardContent>
          </Card>
        )}

        {/* Forgot Password View */}
        {view === "forgot" && (
          <Card className="border-2">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView("signin")}
                  className="p-1 hover:bg-muted rounded"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Digite seu email para receber instruções
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu@email.com"
                />
              </div>

              <Button size="lg" className="w-full">
                Enviar Instruções
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setView("signin")}
                  className="text-primary hover:underline"
                >
                  Voltar para login
                </button>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SignupForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  const signup = trpc.auth.signup.useMutation({
    onSuccess: () => {
      toast.success("Cadastro realizado! Verifique seu email para confirmar.");
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      toast.error("As senhas não conferem");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    try {
      await signup.mutateAsync({
        email: formData.email,
        password: formData.password,
        name: "",
        cpf: "",
        birthDate: new Date(),
        address: "",
        howHeardAboutTecelaria: "",
      });
    } catch (error) {
      // Erro já tratado
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 2) return "bg-orange-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-lime-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "Muito fraca";
    if (passwordStrength <= 1) return "Fraca";
    if (passwordStrength <= 2) return "Regular";
    if (passwordStrength <= 3) return "Boa";
    if (passwordStrength <= 4) return "Forte";
    return "Muito forte";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          value={formData.email}
          onChange={handleChange}
          disabled={signup.isPending}
        />
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <Label htmlFor="signup-password">Senha</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          placeholder="Crie uma senha forte"
          value={formData.password}
          onChange={handleChange}
          disabled={signup.isPending}
        />

        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded ${
                    i < passwordStrength ? getStrengthColor() : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Força da senha: <span className="font-semibold">{getStrengthText()}</span>
            </p>
          </div>
        )}
      </div>

      {/* Confirmar Senha */}
      <div className="space-y-2">
        <Label htmlFor="signup-password-confirm">Confirmar Senha</Label>
        <Input
          id="signup-password-confirm"
          name="passwordConfirm"
          type="password"
          placeholder="Repita sua senha"
          value={formData.passwordConfirm}
          onChange={handleChange}
          disabled={signup.isPending}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={signup.isPending}
        size="lg"
        className="w-full"
      >
        {signup.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          "Criar Conta"
        )}
      </Button>
    </form>
  );
}
