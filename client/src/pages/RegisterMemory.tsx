import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  FileAudio,
  FileText,
  Image as ImageIcon,
  Mic,
  Upload,
  ArrowLeft,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterMemory() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("text");
  const [isRecording, setIsRecording] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [textContent, setTextContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);

  const audioRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = trpc.memory.getCategories.useQuery();

  const createMemory = trpc.memory.create.useMutation({
    onSuccess: () => {
      toast.success("Memória registrada com sucesso!");
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao registrar memória");
    },
  });

  const addRecord = trpc.memory.addRecord.useMutation({
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar conteúdo");
    },
  });

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setRecordedAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      audioRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      toast.error("Erro ao acessar microfone");
    }
  };

  const handleStopRecording = () => {
    if (audioRef.current) {
      audioRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Digite um título para a memória");
      return;
    }

    if (
      !textContent.trim() &&
      selectedFiles.length === 0 &&
      !recordedAudio
    ) {
      toast.error("Adicione pelo menos um conteúdo (texto, áudio ou arquivo)");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create memory
      if (!category) {
        toast.error("Selecione uma categoria");
        setIsSubmitting(false);
        return;
      }

      const memoryResult = await createMemory.mutateAsync({
        title,
        categoryId: category,
      });

      // Add text record if present
      if (textContent.trim()) {
        await addRecord.mutateAsync({
          memoryId: memoryResult.memoryId,
          type: "text",
          content: textContent,
        });
      }

      // Add audio record if present
      if (recordedAudio) {
        // TODO: Upload audio to storage and get URL
        // For now, we'll just save the blob reference
        const audioUrl = URL.createObjectURL(recordedAudio);
        await addRecord.mutateAsync({
          memoryId: memoryResult.memoryId,
          type: "audio",
          fileUrl: audioUrl,
          fileName: "audio_gravado.webm",
          mimeType: "audio/webm",
        });
      }

      // Add file records if present
      for (const file of selectedFiles) {
        // TODO: Upload files to storage and get URLs
        const fileUrl = URL.createObjectURL(file);
        const type = file.type.startsWith("image/") ? "image" : "document";

        await addRecord.mutateAsync({
          memoryId: memoryResult.memoryId,
          type: type as "photo" | "document",
          fileUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
      }

      toast.success("Memória registrada com sucesso!");
      setLocation("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar memória");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">Registrar Memória</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Memória *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Meu primeiro dia de escola"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria (opcional)</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo da Memória *</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="text" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Texto</span>
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <span className="hidden sm:inline">Áudio</span>
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Imagem</span>
                  </TabsTrigger>
                  <TabsTrigger value="files" className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4" />
                    <span className="hidden sm:inline">Arquivos</span>
                  </TabsTrigger>
                </TabsList>

                {/* Text Tab */}
                <TabsContent value="text" className="space-y-4">
                  <Textarea
                    placeholder="Escreva sua história aqui..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    disabled={isSubmitting}
                    className="min-h-64"
                  />
                </TabsContent>

                {/* Audio Tab */}
                <TabsContent value="audio" className="space-y-4">
                  <div className="space-y-4">
                    {!recordedAudio ? (
                      <Button
                        type="button"
                        onClick={
                          isRecording ? handleStopRecording : handleStartRecording
                        }
                        disabled={isSubmitting}
                        size="lg"
                        className="w-full"
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        {isRecording ? "Parar Gravação" : "Iniciar Gravação"}
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm text-muted-foreground mb-2">
                            Áudio gravado com sucesso!
                          </p>
                          <audio
                            controls
                            src={URL.createObjectURL(recordedAudio)}
                            className="w-full"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={() => setRecordedAudio(null)}
                          variant="outline"
                          className="w-full"
                        >
                          Gravar Novamente
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Image Tab */}
                <TabsContent value="image" className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Selecionar Imagens
                  </Button>
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value="files" className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Selecionar Arquivos
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium">Arquivos selecionados:</p>
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || createMemory.isPending}
            size="lg"
            className="w-full"
          >
            {isSubmitting || createMemory.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Registrar Memória
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
