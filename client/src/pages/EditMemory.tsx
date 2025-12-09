import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, X, Plus, Mic, FileText, Image as ImageIcon, FileIcon } from "lucide-react";
import { toast } from "sonner";

export default function EditMemory() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const memoryId = params.id ? parseInt(params.id) : undefined;

  const { data: memory, isLoading } = trpc.memories.getById.useQuery(
    { id: memoryId! },
    { enabled: !!memoryId }
  );

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [themes, setThemes] = useState<string[]>([]);
  const [peopleMentioned, setPeopleMentioned] = useState<string[]>([]);
  const [periodMentioned, setPeriodMentioned] = useState("");
  const [newTheme, setNewTheme] = useState("");
  const [newPerson, setNewPerson] = useState("");

  const updateMemoryMutation = trpc.memories.update.useMutation({
    onSuccess: () => {
      toast.success("Memória atualizada com sucesso!");
      setLocation("/minhas-memorias");
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar memória: ${error.message}`);
    },
  });

  useEffect(() => {
    if (memory) {
      setTitle(memory.title || "");
      setSummary(memory.summary || "");
      setThemes(memory.themes || []);
      setPeopleMentioned(memory.peopleMentioned || []);
      setPeriodMentioned(memory.periodMentioned || "");
    }
  }, [memory]);

  const handleAddTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      setThemes([...themes, newTheme.trim()]);
      setNewTheme("");
    }
  };

  const handleRemoveTheme = (theme: string) => {
    setThemes(themes.filter(t => t !== theme));
  };

  const handleAddPerson = () => {
    if (newPerson.trim() && !peopleMentioned.includes(newPerson.trim())) {
      setPeopleMentioned([...peopleMentioned, newPerson.trim()]);
      setNewPerson("");
    }
  };

  const handleRemovePerson = (person: string) => {
    setPeopleMentioned(peopleMentioned.filter(p => p !== person));
  };

  const handleSave = () => {
    if (!memoryId) return;

    updateMemoryMutation.mutate({
      id: memoryId,
      title,
      summary,
      themes,
      peopleMentioned,
      periodMentioned: periodMentioned || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Memória não encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os detalhes desta memória.
            </p>
            <Button onClick={() => setLocation("/minhas-memorias")}>
              Voltar para Minhas Memórias
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const audioRecords = memory.records?.filter((r: any) => r.type === 'audio') || [];
  const photoRecords = memory.records?.filter((r: any) => r.type === 'photo') || [];
  const documentRecords = memory.records?.filter((r: any) => r.type === 'document') || [];
  const textRecords = memory.records?.filter((r: any) => r.type === 'text') || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/minhas-memorias")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold">Editar Memória</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column: Edit Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Memória</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Título
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da memória"
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Resumo
                  </label>
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Resumo da memória"
                    rows={6}
                  />
                </div>

                {/* Period Mentioned */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Período Mencionado
                  </label>
                  <Input
                    value={periodMentioned}
                    onChange={(e) => setPeriodMentioned(e.target.value)}
                    placeholder="Ex: 1980s, infância, adolescência"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Themes */}
            <Card>
              <CardHeader>
                <CardTitle>Temas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {themes.map((theme) => (
                    <Badge key={theme} variant="secondary" className="gap-1">
                      {theme}
                      <button
                        onClick={() => handleRemoveTheme(theme)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    placeholder="Adicionar tema"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTheme()}
                  />
                  <Button onClick={handleAddTheme} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* People Mentioned */}
            <Card>
              <CardHeader>
                <CardTitle>Pessoas Mencionadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {peopleMentioned.map((person) => (
                    <Badge key={person} variant="secondary" className="gap-1">
                      {person}
                      <button
                        onClick={() => handleRemovePerson(person)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newPerson}
                    onChange={(e) => setNewPerson(e.target.value)}
                    placeholder="Adicionar pessoa"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPerson()}
                  />
                  <Button onClick={handleAddPerson} size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={updateMemoryMutation.isPending}
              className="w-full gap-2"
              size="lg"
            >
              <Save className="h-4 w-4" />
              {updateMemoryMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>

          {/* Right Column: Original Content (Read-only) */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo Original</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Referência (somente leitura)
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Category and Date */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{memory.categoryName}</span>
                  <span>•</span>
                  <span>{new Date(memory.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>

                <Separator />

                {/* Audio Records */}
                {audioRecords.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Áudios ({audioRecords.length})
                    </h3>
                    <div className="space-y-2">
                      {audioRecords.map((record: any) => (
                        <audio key={record.id} controls className="w-full">
                          <source src={record.fileUrl!} type={record.mimeType || 'audio/mpeg'} />
                        </audio>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Records */}
                {textRecords.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Textos ({textRecords.length})
                    </h3>
                    <div className="space-y-2">
                      {textRecords.map((record: any) => (
                        <div key={record.id} className="p-3 bg-muted rounded-md text-sm">
                          {record.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Records */}
                {photoRecords.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Fotos ({photoRecords.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {photoRecords.map((record: any) => (
                        <img
                          key={record.id}
                          src={record.fileUrl!}
                          alt="Foto da memória"
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Records */}
                {documentRecords.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileIcon className="h-4 w-4" />
                      Documentos ({documentRecords.length})
                    </h3>
                    <div className="space-y-2">
                      {documentRecords.map((record: any) => (
                        <a
                          key={record.id}
                          href={record.fileUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                        >
                          <FileIcon className="h-4 w-4" />
                          <span className="text-sm truncate">{record.fileName || 'Documento'}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
