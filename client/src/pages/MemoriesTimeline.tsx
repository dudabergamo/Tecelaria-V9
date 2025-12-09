import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EditMemoryDialog } from "@/components/EditMemoryDialog";
import { AudioPlayer } from "@/components/AudioPlayer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  FileAudio,
  FileText,
  Image as ImageIcon,
  FileType,
  Calendar,
  Tag,
  Users,
  Sparkles,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface MemoryCardProps {
  memory: {
    id: number;
    title: string;
    summary: string | null;
    categoryId: number;
    categoryName: string;
    createdAt: Date;
    themes: string[] | null;
    peopleMentioned: string[] | null;
    periodMentioned: string | null;
    recordCount: number;
    recordTypes: string[];
  };
}

function MemoryCard({ memory }: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Fetch memory records (including audio files)
  const { data: records } = trpc.memories.getRecords.useQuery(
    { memoryId: memory.id },
    { enabled: expanded }
  );
  const audioRecords = records?.filter((r: any) => r.recordType === "audio") || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "audio":
        return <FileAudio className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "photo":
        return <ImageIcon className="h-4 w-4" />;
      case "document":
        return <FileType className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-lg">{memory.title}</CardTitle>
              <Badge variant="outline" className="text-xs">
                {memory.categoryName}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(memory.createdAt).toLocaleDateString("pt-BR")}
              </div>
              <div className="flex items-center gap-2">
                {memory.recordTypes.map((type, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1 text-xs">
                    {getTypeIcon(type)}
                    <span className="capitalize">{type === 'audio' ? 'Áudio' : type === 'text' ? 'Texto' : type === 'photo' ? 'Foto' : 'Documento'}</span>
                  </Badge>
                ))}
                <span className="text-xs">({memory.recordCount} registro{memory.recordCount > 1 ? 's' : ''})</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {memory.summary && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Resumo:</h4>
              <p className="text-sm text-muted-foreground">{memory.summary}</p>
            </div>
          )}

          {memory.periodMentioned && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Período:</span>
              <span className="text-muted-foreground">{memory.periodMentioned}</span>
            </div>
          )}

          {memory.peopleMentioned && memory.peopleMentioned.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4" />
                Pessoas Mencionadas:
              </div>
              <div className="flex flex-wrap gap-2">
                {memory.peopleMentioned.map((person, idx) => (
                  <Badge key={idx} variant="secondary">
                    {person}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {memory.themes && memory.themes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Tag className="h-4 w-4" />
                Temas:
              </div>
              <div className="flex flex-wrap gap-2">
                {memory.themes.map((theme, idx) => (
                  <Badge key={idx} variant="outline">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Audio Players */}
          {audioRecords.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FileAudio className="h-4 w-4" />
                Áudios da Memória:
              </div>
              {audioRecords.map((record: any, idx: number) => (
                <AudioPlayer
                  key={record.id}
                  src={record.fileUrl!}
                  title={record.fileName || `Áudio ${idx + 1}`}
                />
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/memoria/${memory.id}`}>Ver Detalhes</Link>
            </Button>
          </div>
          
          <EditMemoryDialog
            memory={{
              id: memory.id,
              title: memory.title,
              summary: memory.summary,
              categoryId: memory.categoryId,
              categoryName: memory.categoryName,
              themes: memory.themes,
              peopleMentioned: memory.peopleMentioned,
              periodMentioned: memory.periodMentioned,
            }}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
          />
        </CardContent>
      )}
    </Card>
  );
}

export default function MemoriesTimeline() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const [selectedTheme, setSelectedTheme] = useState<string>("all");

  const { data: categories } = trpc.memories.getCategories.useQuery();
  const { data: memoriesData, isLoading } = trpc.memories.getUserMemoriesWithDetails.useQuery();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando memórias...</p>
        </div>
      </div>
    );
  }

  if (!memoriesData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar memórias</p>
      </div>
    );
  }

  // Extract unique people and themes for filters
  const allPeople = Array.from(
    new Set(
      memoriesData.memories
        .flatMap((m: any) => m.peopleMentioned || [])
    )
  ) as string[];

  const allThemes = Array.from(
    new Set(
      memoriesData.memories
        .flatMap((m: any) => m.themes || [])
    )
  ) as string[];

  // Filter memories
  const filteredMemories = memoriesData.memories.filter((memory: any) => {
    const matchesSearch =
      searchQuery === "" ||
      memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (memory.summary && memory.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || memory.categoryName === selectedCategory;

    const matchesPerson =
      selectedPerson === "all" ||
      (memory.peopleMentioned && memory.peopleMentioned.includes(selectedPerson));

    const matchesTheme =
      selectedTheme === "all" ||
      (memory.themes && memory.themes.includes(selectedTheme));

    return matchesSearch && matchesCategory && matchesPerson && matchesTheme;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
              <img 
                src="/images/logo-transparent.png" 
                alt="Tecelaria" 
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">← Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-8 space-y-8">
        {/* Page Title */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Minhas Memórias</h2>
          <p className="text-muted-foreground">
            Visualize e explore todas as suas histórias registradas
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou conteúdo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Selects */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Pessoa</label>
                <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as pessoas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as pessoas</SelectItem>
                    {allPeople.map((person, idx) => (
                      <SelectItem key={idx} value={person}>
                        {person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tema</label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os temas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os temas</SelectItem>
                    {allThemes.map((theme, idx) => (
                      <SelectItem key={idx} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(selectedCategory !== "all" || selectedPerson !== "all" || selectedTheme !== "all" || searchQuery) && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {selectedCategory !== "all" && (
                  <Badge variant="secondary">{selectedCategory}</Badge>
                )}
                {selectedPerson !== "all" && (
                  <Badge variant="secondary">{selectedPerson}</Badge>
                )}
                {selectedTheme !== "all" && (
                  <Badge variant="secondary">{selectedTheme}</Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary">"{searchQuery}"</Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedPerson("all");
                    setSelectedTheme("all");
                    setSearchQuery("");
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando <span className="font-semibold">{filteredMemories.length}</span> de{" "}
            <span className="font-semibold">{memoriesData.memories.length}</span> memórias
          </p>
        </div>

        {/* Timeline */}
        {filteredMemories.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center space-y-4">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">Nenhuma memória encontrada</h3>
                <p className="text-sm text-muted-foreground">
                  {memoriesData.memories.length === 0
                    ? "Comece registrando sua primeira história!"
                    : "Tente ajustar os filtros para encontrar o que procura"}
                </p>
              </div>
              {memoriesData.memories.length === 0 && (
                <Button asChild>
                  <Link href="/registrar-memoria">Registrar Primeira Memória</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Timeline Line */}
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block"></div>

              <div className="space-y-6">
                {filteredMemories.map((memory: any, idx: number) => (
                  <div key={memory.id} className="relative md:pl-16">
                    {/* Timeline Marker - Quadradinho/Cantoneira */}
                    <img 
                      src="/images/quadradinho.png" 
                      alt="" 
                      className="absolute left-3.5 top-6 w-4 h-4 hidden md:block"
                    />

                    <MemoryCard memory={memory} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
