import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Tag, 
  Users, 
  FileText, 
  Mic, 
  Image as ImageIcon, 
  FileIcon,
  Edit,
  Trash2,
  X
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MemoryDetailDialogProps {
  questionId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMemoryDeleted?: () => void;
}

export default function MemoryDetailDialog({ 
  questionId, 
  open, 
  onOpenChange,
  onMemoryDeleted 
}: MemoryDetailDialogProps) {
  const [, setLocation] = useLocation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { data: memory, isLoading } = trpc.memories.getByQuestionId.useQuery(
    { questionId },
    { enabled: open }
  );
  
  const deleteMemoryMutation = trpc.memories.deleteMemory.useMutation({
    onSuccess: () => {
      toast.success("Memória excluída com sucesso!");
      onOpenChange(false);
      if (onMemoryDeleted) {
        onMemoryDeleted();
      }
    },
    onError: (error) => {
      toast.error(`Erro ao excluir memória: ${error.message}`);
    },
  });

  const handleEdit = () => {
    if (memory) {
      setLocation(`/editar-memoria/${memory.id}`);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (memory) {
      deleteMemoryMutation.mutate({ id: memory.id });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Carregando...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!memory) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Memória não encontrada</DialogTitle>
            <DialogDescription>
              Não foi possível carregar os detalhes desta memória.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogContent>
      </Dialog>
    );
  }

  const audioRecords = memory.records?.filter(r => r.type === 'audio') || [];
  const photoRecords = memory.records?.filter(r => r.type === 'photo') || [];
  const documentRecords = memory.records?.filter(r => r.type === 'document') || [];
  const textRecords = memory.records?.filter(r => r.type === 'text') || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl mb-2">{memory.title}</DialogTitle>
                <DialogDescription className="text-base">
                  {memory.summary}
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(memory.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>{memory.categoryName}</span>
              </div>
            </div>

            {/* Themes and People */}
            {(memory.themes && memory.themes.length > 0) || (memory.peopleMentioned && memory.peopleMentioned.length > 0) ? (
              <div className="space-y-3">
                {memory.themes && memory.themes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Temas
                    </p>
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
                      Pessoas Mencionadas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {memory.peopleMentioned.map((person: string, idx: number) => (
                        <Badge key={idx} variant="outline">{person}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {memory.periodMentioned && (
              <div>
                <p className="text-sm font-medium mb-1">Período Mencionado</p>
                <p className="text-sm text-muted-foreground">{memory.periodMentioned}</p>
              </div>
            )}

            <Separator />

            {/* Audio Records */}
            {audioRecords.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Áudios ({audioRecords.length})
                </h3>
                {audioRecords.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-4">
                      <audio controls className="w-full mb-2">
                        <source src={record.fileUrl || ''} type="audio/mpeg" />
                        Seu navegador não suporta o elemento de áudio.
                      </audio>
                      {record.content && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">Transcrição:</p>
                          <p className="text-sm whitespace-pre-wrap">{record.content}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Text Records */}
            {textRecords.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Textos ({textRecords.length})
                </h3>
                {textRecords.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-4">
                      <p className="text-sm whitespace-pre-wrap">{record.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Photo Records */}
            {photoRecords.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Fotos ({photoRecords.length})
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {photoRecords.map((record) => (
                    <Card key={record.id} className="overflow-hidden">
                      <img 
                        src={record.fileUrl || ''} 
                        alt={record.fileName || 'Foto'} 
                        className="w-full h-48 object-cover"
                      />
                      {record.content && (
                        <CardContent className="pt-3">
                          <p className="text-sm text-muted-foreground">{record.content}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Document Records */}
            {documentRecords.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileIcon className="h-5 w-5" />
                  Documentos ({documentRecords.length})
                </h3>
                {documentRecords.map((record) => (
                  <Card key={record.id}>
                    <CardContent className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileIcon className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{record.fileName || 'Documento'}</p>
                          {record.content && (
                            <p className="text-sm text-muted-foreground">{record.content}</p>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={record.fileUrl || ''} target="_blank" rel="noopener noreferrer">
                          Baixar
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A memória "{memory.title}" e todos os seus registros (áudios, fotos, textos) serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
