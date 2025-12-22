import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from "@/components/AudioPlayer";
import { trpc } from "@/lib/trpc";
import {
  FileAudio,
  FileText,
  Image as ImageIcon,
  FileType,
  Calendar,
  Tag,
  Users,
  Clock,
  ArrowLeft,
  Loader2,
  Trash2,
} from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { Link } from "wouter";
import { toast } from "sonner";

export default function MemoryDetail() {
  const { user } = useAuth();
  const [, params] = useRoute("/memoria/:id");
  const [, setLocation] = useLocation();
  const memoryId = params?.id ? parseInt(params.id) : null;

  const { data: memoryData, isLoading } = trpc.memory.getMemoryById.useQuery(
    { memoryId: memoryId! },
    { enabled: !!memoryId }
  );
  
  const memory = memoryData;
  const records = memoryData?.records || [];
  const recordsLoading = isLoading;
  
  const deleteMutation = trpc.memories.deleteMemory.useMutation({
    onSuccess: () => {
      toast.success("Memória excluída com sucesso!");
      setLocation("/minhas-memorias");
    },
    onError: () => {
      toast.error("Erro ao excluir memória");
    },
  });
  
  if (!memoryId) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando memória...</p>
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Memória não encontrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Esta memória não existe ou você não tem permissão para visualizá-la.
            </p>
            <Button asChild>
              <Link href="/minhas-memorias">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Minhas Memórias
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const audioRecords = records?.filter((r: any) => r.recordType === "audio") || [];
  const textRecords = records?.filter((r: any) => r.recordType === "text") || [];
  const photoRecords = records?.filter((r: any) => r.recordType === "photo") || [];
  const documentRecords = records?.filter((r: any) => r.recordType === "document") || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" asChild>
              <Link href="/minhas-memorias">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (confirm("Tem certeza que deseja excluir esta memória? Esta ação não pode ser desfeita.")) {
                  deleteMutation.mutate({ id: memoryId! })
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Memória
            </Button>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{memory.title}</h1>
          
          <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(memory.createdAt).toLocaleDateString('pt-BR')}
            </div>
            <div className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {memory.categoryName}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {records?.length || 0} registro(s)
            </div>
          </div>
        </div>

        {/* Summary */}
        {memory.summary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{memory.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        {(memory.themes || memory.peopleMentioned || memory.periodMentioned) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Informações Extraídas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {memory.themes && memory.themes.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Temas:</p>
                  <div className="flex flex-wrap gap-2">
                    {memory.themes.map((theme: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{theme}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {memory.peopleMentioned && memory.peopleMentioned.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Pessoas Mencionadas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {memory.peopleMentioned.map((person: string, idx: number) => (
                      <Badge key={idx} variant="outline">{person}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {memory.periodMentioned && (
                <div>
                  <p className="text-sm font-medium mb-2">Período:</p>
                  <Badge variant="outline">{memory.periodMentioned}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Original Memory Content */}
        {(audioRecords.length > 0 || textRecords.length > 0 || photoRecords.length > 0 || documentRecords.length > 0) && (
          <Card className="mb-6 border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileAudio className="h-6 w-6 text-primary" />
                Memória Original
              </CardTitle>
              <p className="text-sm text-muted-foreground">Acesse o conteúdo original que você registrou</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Audio Records */}
              {audioRecords.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileAudio className="h-5 w-5" />
                    Áudios ({audioRecords.length})
                  </h3>
                  {audioRecords.map((record: any) => (
                    <div key={record.id}>
                      <AudioPlayer src={record.fileUrl!} />
                      {record.transcription && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium mb-1">Transcrição:</p>
                          <p className="text-sm text-muted-foreground">{record.transcription}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Text Records */}
              {textRecords.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Textos ({textRecords.length})
                  </h3>
                  {textRecords.map((record: any) => (
                    <div key={record.id} className="p-4 bg-muted rounded-lg">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {record.textContent}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Photo Records */}
              {photoRecords.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Fotos ({photoRecords.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {photoRecords.map((record: any) => (
                      <div key={record.id} className="space-y-2">
                        <img
                          src={record.fileUrl!}
                          alt="Foto da memória"
                          className="w-full rounded-lg object-cover"
                        />
                        {record.caption && (
                          <p className="text-sm text-muted-foreground">{record.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Records */}
              {documentRecords.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileType className="h-5 w-5" />
                    Documentos ({documentRecords.length})
                  </h3>
                  <div className="space-y-3">
                    {documentRecords.map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileType className="h-5 w-5 text-muted-foreground" />
                          <span className="text-sm">Documento anexado</span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={record.fileUrl!} target="_blank" rel="noopener noreferrer">
                            Abrir
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
