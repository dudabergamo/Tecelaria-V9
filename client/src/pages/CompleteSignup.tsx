import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CompleteSignup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('signupEmail') || '';
    }
    return '';
  });
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    city: "",
    state: "",
    howHeardAboutTecelaria: "",
  });

  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      // Limpar dados do localStorage
      localStorage.removeItem('signupEmail');
      localStorage.removeItem('signupPassword');
      setLocation("/onboarding");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      toast.success("Cadastro completado! Bem-vindo à Tecelaria!");
      // Fazer login automático
      const storedPassword = localStorage.getItem('signupPassword');
      if (email && storedPassword) {
        await login.mutateAsync({
          email: email,
          password: storedPassword,
        });
      } else {
        setLocation("/onboarding");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao completar cadastro");
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

    if (!formData.name) {
      toast.error("Preencha o nome completo");
      return;
    }

    if (!email.trim()) {
      toast.error("Digite seu email");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        email: email,
        name: formData.name,
        cpf: formData.cpf,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
        city: formData.city,
        state: formData.state,
        howHeardAboutTecelaria: formData.howHeardAboutTecelaria,
      });
    } catch (error) {
      // Erro já tratado
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
          <h1 className="text-4xl font-bold mb-2">Complete seu Cadastro</h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para finalizar seu cadastro na Tecelaria
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={updateProfile.isPending || login.isPending}
                  required
                />
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
                  disabled={updateProfile.isPending || login.isPending}
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
                  disabled={updateProfile.isPending || login.isPending}
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
                  disabled={updateProfile.isPending || login.isPending}
                />
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Sua cidade"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={updateProfile.isPending || login.isPending}
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="UF"
                  maxLength="2"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={updateProfile.isPending || login.isPending}
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
                  disabled={updateProfile.isPending || login.isPending}
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
                disabled={updateProfile.isPending || login.isPending}
                size="lg"
                className="w-full"
              >
                {updateProfile.isPending || login.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completando cadastro...
                  </>
                ) : (
                  "Completar Cadastro"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
