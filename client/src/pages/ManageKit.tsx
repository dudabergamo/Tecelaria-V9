import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Crown,
  Eye,
  Edit,
  ArrowLeft,
  Mail,
  Shield
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function ManageKit() {
  const { user, loading } = useAuth();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"collaborator" | "viewer">("collaborator");

  const { data: kits, refetch: refetchKits } = trpc.kits.getUserKits.useQuery();
  const currentKit = kits?.[0]; // For now, assume single kit per user

  const { data: members, refetch: refetchMembers } = trpc.kits.getMembers.useQuery(
    { kitId: currentKit?.id || 0 },
    { enabled: !!currentKit }
  );

  const addMemberMutation = trpc.kits.addMember.useMutation({
    onSuccess: () => {
      toast.success("Colaborador convidado com sucesso!");
      setInviteEmail("");
      refetchMembers();
    },
    onError: (error) => {
      toast.error("Erro ao convidar: " + error.message);
    },
  });

  const removeMemberMutation = trpc.kits.removeMember.useMutation({
    onSuccess: () => {
      toast.success("Membro removido com sucesso!");
      refetchMembers();
    },
    onError: (error) => {
      toast.error("Erro ao remover: " + error.message);
    },
  });

  const handleInvite = () => {
    if (!currentKit) {
      toast.error("Nenhum kit encontrado");
      return;
    }

    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    addMemberMutation.mutate({
      kitId: currentKit.id,
      userEmail: inviteEmail,
      role: inviteRole,
    });
  };

  const handleRemove = (userId: number) => {
    if (!currentKit) return;

    if (confirm("Tem certeza que deseja remover este membro?")) {
      removeMemberMutation.mutate({
        kitId: currentKit.id,
        userId,
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "collaborator":
        return <Edit className="h-4 w-4 text-blue-500" />;
      case "viewer":
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
        return <Badge className="bg-yellow-500">Proprietário</Badge>;
      case "collaborator":
        return <Badge className="bg-blue-500">Colaborador</Badge>;
      case "viewer":
        return <Badge variant="secondary">Visualizador</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!currentKit) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/images/logo-transparent.png" 
                  alt="Tecelaria" 
                  className="h-8 w-auto"
                />
              </Link>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container py-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                Você ainda não possui um kit. Entre em contato com o suporte para ativar seu kit.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img 
                src="/images/logo-transparent.png" 
                alt="Tecelaria" 
                className="h-8 w-auto"
              />
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8 max-w-4xl">
        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gerenciar Kit
          </h2>
          <p className="text-muted-foreground">
            Convide familiares para colaborar nas memórias ou apenas visualizar o progresso
          </p>
        </div>

        {/* Kit Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Kit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-semibold">Nome:</span>
              <span className="text-sm text-muted-foreground">{currentKit.name}</span>
            </div>
            {currentKit.description && (
              <div className="flex justify-between">
                <span className="text-sm font-semibold">Descrição:</span>
                <span className="text-sm text-muted-foreground">{currentKit.description}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-semibold">Status:</span>
              <Badge variant={currentKit.activatedAt ? "default" : "secondary"}>
                {currentKit.activatedAt ? "Ativo" : "Não ativado"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Invite Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Convidar Colaborador
            </CardTitle>
            <CardDescription>
              Convide familiares por email para colaborar ou visualizar as memórias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email do Colaborador</Label>
                <div className="flex gap-2">
                  <Mail className="h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Permissão</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborator">
                      <div className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Colaborador (pode adicionar memórias)
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Visualizador (apenas leitura)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleInvite} 
              disabled={addMemberMutation.isPending}
              className="w-full"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {addMemberMutation.isPending ? "Convidando..." : "Enviar Convite"}
            </Button>

            <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
              <p className="font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sobre as Permissões:
              </p>
              <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                <li><strong>Colaborador:</strong> Pode adicionar, editar e visualizar memórias</li>
                <li><strong>Visualizador:</strong> Pode apenas visualizar memórias, sem editar</li>
                <li><strong>Proprietário:</strong> Você (controle total, incluindo gerenciar membros)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membros do Kit ({members?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!members || members.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum membro ainda. Convide familiares para colaborar!
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead>Convidado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span>Usuário #{member.userId}</span>
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.invitedAt).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.role !== "owner" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(member.userId)}
                            disabled={removeMemberMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
