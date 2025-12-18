import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { BookOpen } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    cpf: "",
    birthDate: "",
    address: "",
    howHeardAboutTecelaria: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const signup = trpc.auth.signup.useMutation({
    onSuccess: () => {
      toast.success("Cadastro realizado! Verifique seu email para confirmar.");
      setLocation("/email-confirmation");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email é obrigatório";
    if (!formData.email.includes("@")) newErrors.email = "Email inválido";

    if (!formData.password) newErrors.password = "Senha é obrigatória";
    if (formData.password.length < 8) newErrors.password = "Senha deve ter no mínimo 8 caracteres";

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não correspondem";
    }

    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.cpf) newErrors.cpf = "CPF é obrigatório";
    if (!formData.birthDate) newErrors.birthDate = "Data de nascimento é obrigatória";
    if (!formData.address) newErrors.address = "Endereço é obrigatório";
    if (!formData.howHeardAboutTecelaria) newErrors.howHeardAboutTecelaria = "Este campo é obrigatório";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signup.mutateAsync({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        cpf: formData.cpf,
        birthDate: new Date(formData.birthDate),
        address: formData.address,
        howHeardAboutTecelaria: formData.howHeardAboutTecelaria,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
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
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <p className="text-sm text-muted-foreground">
            Comece sua jornada na Tecelaria
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Repetir Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repita sua senha"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* CPF */}
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.cpf && <p className="text-sm text-red-500">{errors.cpf}</p>}
            </div>

            {/* Data de Nascimento */}
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.birthDate && <p className="text-sm text-red-500">{errors.birthDate}</p>}
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                name="address"
                placeholder="Rua, número, complemento"
                value={formData.address}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            {/* Como ficou sabendo */}
            <div className="space-y-2">
              <Label htmlFor="howHeardAboutTecelaria">Como ficou sabendo do Tecelaria?</Label>
              <select
                id="howHeardAboutTecelaria"
                name="howHeardAboutTecelaria"
                value={formData.howHeardAboutTecelaria}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">Selecione uma opção</option>
                <option value="amigo">Indicação de amigo</option>
                <option value="familia">Indicação de família</option>
                <option value="redes-sociais">Redes sociais</option>
                <option value="google">Google</option>
                <option value="publicidade">Publicidade</option>
                <option value="outro">Outro</option>
              </select>
              {errors.howHeardAboutTecelaria && (
                <p className="text-sm text-red-500">{errors.howHeardAboutTecelaria}</p>
              )}
            </div>

            {/* Botão de Cadastro */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || signup.isPending}
              size="lg"
            >
              {isLoading || signup.isPending ? "Criando conta..." : "Concluir Cadastro"}
            </Button>

            {/* Link para Login */}
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <button
                type="button"
                onClick={() => setLocation("/login")}
                className="text-primary hover:underline font-medium"
              >
                Fazer login
              </button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
