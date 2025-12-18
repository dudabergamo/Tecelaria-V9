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
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    address: "",
    howHeardAboutTecelaria: "",
  });

  const updateProfile = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Cadastro completado! Bem-vindo à Tecelaria!");
      setLocation("/onboarding");
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

    try {
      await updateProfile.mutateAsync({
        name: formData.name,
        cpf: formData.cpf,
        birthDate: formData.birthDate,
        address: formData.address,
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
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={updateProfile.isPending}
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
                  disabled={updateProfile.isPending}
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
                  disabled={updateProfile.isPending}
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
                  disabled={updateProfile.isPending}
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
                  disabled={updateProfile.isPending}
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
                disabled={updateProfile.isPending}
                size="lg"
                className="w-full"
              >
                {updateProfile.isPending ? (
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
