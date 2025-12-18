import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: "",
    cpf: "",
    birthDate: "",
    address: "",
    howHeardAboutTecelaria: "",
  });

  const signup = trpc.auth.signup.useMutation({
    onSuccess: () => {
      // Save email to localStorage for confirmation page
      localStorage.setItem('signupEmail', formData.email);
      toast.success("Cadastro realizado! Verifique seu email para confirmar.");
      setLocation("/email-confirmation");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.email || !formData.password || !formData.name) {
      toast.error("Preencha todos os campos obrigatórios");
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
        name: formData.name,
        cpf: formData.cpf,
        birthDate: new Date(formData.birthDate),
        address: formData.address,
        howHeardAboutTecelaria: formData.howHeardAboutTecelaria,
      });
    } catch (error) {
      // Erro já tratado pelo mutation
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/login")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-2">Criar Conta</h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para começar sua jornada na Tecelaria
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={signup.isPending}
                  required
                />
              </div>

              {/* Senha */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={signup.isPending}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Confirmar Senha *</Label>
                  <Input
                    id="passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    disabled={signup.isPending}
                    required
                  />
                </div>
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={signup.isPending}
                  required
                />
              </div>

              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  disabled={signup.isPending}
                />
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleChange}
                  disabled={signup.isPending}
                />
              </div>

              {/* Endereço */}
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Rua, número, cidade"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={signup.isPending}
                />
              </div>

              {/* Como ficou sabendo */}
              <div className="space-y-2">
                <Label htmlFor="howHeardAboutTecelaria">Como ficou sabendo da Tecelaria?</Label>
                <select
                  id="howHeardAboutTecelaria"
                  name="howHeardAboutTecelaria"
                  value={formData.howHeardAboutTecelaria}
                  onChange={handleChange}
                  disabled={signup.isPending}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Selecione uma opção</option>
                  <option value="google">Google</option>
                  <option value="redes_sociais">Redes Sociais</option>
                  <option value="amigo">Recomendação de Amigo</option>
                  <option value="publicidade">Publicidade</option>
                  <option value="outro">Outro</option>
                </select>
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
                  "Concluir Cadastro"
                )}
              </Button>

              {/* Login Link */}
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
    </div>
  );
}
