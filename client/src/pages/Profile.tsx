import { useState, useRef } from "react";
import { useMask } from "@react-input/mask";
import { validateCPF } from "@/lib/cpfValidator";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Save, Key, Camera, Upload } from "lucide-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, loading } = useAuth();
  const utils = trpc.useUtils();

  // Input masks
  const phoneInputRef = useMask({ mask: '(__)_____-____', replacement: { _: /\d/ } });
  const cpfInputRef = useMask({ mask: '___.___.___-__', replacement: { _: /\d/ } });
  const cepInputRef = useMask({ mask: '_____-___', replacement: { _: /\d/ } });

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [cepLoading, setCepLoading] = useState(false);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [cpf, setCpf] = useState("");
  const [cpfError, setCpfError] = useState("");
  const [identityDocument, setIdentityDocument] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>(user?.profilePictureUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const uploadFileMutation = trpc.memories.uploadFile.useMutation();

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(`Erro ao alterar senha: ${error.message}`);
    },
  });

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCep(value);
    
    // Busca endereço quando CEP estiver completo
    const cleanCEP = value.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setStreet(data.logradouro || "");
          setNeighborhood(data.bairro || "");
          setCity(data.localidade || "");
          setState(data.uf || "");
          
          // Monta endereço completo
          const fullAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          setAddress(fullAddress);
          
          toast.success("Endereço encontrado!");
        } else {
          toast.error("CEP não encontrado");
        }
      } catch (error) {
        toast.error("Erro ao buscar CEP");
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCpf(value);
    
    // Valida CPF quando completo
    const cleanCPF = value.replace(/\D/g, '');
    if (cleanCPF.length === 11) {
      if (!validateCPF(value)) {
        setCpfError("CPF inválido");
      } else {
        setCpfError("");
      }
    } else {
      setCpfError("");
    }
  };

  const handleSaveProfile = async () => {
    // Valida CPF antes de salvar
    if (cpf && !validateCPF(cpf)) {
      toast.error("CPF inválido! Verifique os dígitos.");
      return;
    }
    let profilePictureUrl = user?.profilePictureUrl;

    // Upload profile picture if changed
    if (profilePicture) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await uploadFileMutation.mutateAsync({
          fileName: profilePicture.name,
          contentType: profilePicture.type,
          fileData: base64.split(',')[1], // Remove data:image/...;base64, prefix
        });
        profilePictureUrl = result.url;
        
        // Now update profile with new picture URL
        updateProfileMutation.mutate({
          name,
          email,
          phone,
          address,
          cep,
          cpf,
          identityDocument,
          birthDate,
          profilePictureUrl,
        });
      };
      reader.readAsDataURL(profilePicture);
    } else {
      // Update profile without changing picture
      updateProfileMutation.mutate({
        name,
        email,
        phone,
        address,
        cep,
        cpf,
        identityDocument,
        birthDate,
      });
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem!");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres!");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas informações pessoais e configurações de conta
          </p>
        </div>

        <div className="space-y-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize seus dados pessoais para o livro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center space-y-4 pb-6 border-b">
                <div className="relative">
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Foto de perfil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center border-4 border-primary/20">
                      <Camera className="w-12 h-12 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                />
                <p className="text-sm text-muted-foreground text-center">
                  Clique no botão para alterar sua foto de perfil
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    ref={phoneInputRef}
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    ref={cpfInputRef}
                    id="cpf"
                    value={cpf}
                    onChange={handleCPFChange}
                    placeholder="000.000.000-00"
                    className={cpfError ? "border-red-500" : ""}
                  />
                  {cpfError && (
                    <p className="text-sm text-red-500 mt-1">{cpfError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identity">RG / Identidade</Label>
                  <Input
                    id="identity"
                    value={identityDocument}
                    onChange={(e) => setIdentityDocument(e.target.value)}
                    placeholder="00.000.000-0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  ref={cepInputRef}
                  id="cep"
                  value={cep}
                  onChange={handleCEPChange}
                  placeholder="00000-000"
                  disabled={cepLoading}
                />
                {cepLoading && (
                  <p className="text-sm text-muted-foreground mt-1">Buscando endereço...</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, complemento, bairro, cidade, estado"
                />
              </div>

              <Button 
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                className="w-full md:w-auto"
              >
                <Save className="mr-2 h-4 w-4" />
                {updateProfileMutation.isPending ? "Salvando..." : "Salvar Informações"}
              </Button>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Altere sua senha de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a nova senha novamente"
                />
              </div>

              <Button 
                onClick={handleChangePassword}
                disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                variant="secondary"
                className="w-full md:w-auto"
              >
                <Key className="mr-2 h-4 w-4" />
                {changePasswordMutation.isPending ? "Alterando..." : "Alterar Senha"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
