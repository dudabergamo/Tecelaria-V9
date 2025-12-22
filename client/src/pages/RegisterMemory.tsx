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
import axios from "axios";

export default function RegisterMemory() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useContext();

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

  const createMemory = trpc.memory.create.useMutation();
  const addRecord = trpc.memory.addRecord.useMutation();

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
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File, memoryId: string) => {
    if (!user) throw new Error("Usuário não autenticado.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);
    formData.append("memoryId", memoryId);

    const response = await axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Digite um título para a memória");
      return;
    }

    if (!category) {
      toast.error("Selecione uma categoria");
      return;
    }

    if (!textContent.trim() && selectedFiles.length === 0 && !recordedAudio) {
      toast.error("Adicione pelo menos um conteúdo (texto, áudio ou arquivo)");
      return;
    }

    setIsSubmitting(true);

    try {
      const memoryResult = await createMemory.mutateAsync({
        title,
        categoryId: category,
      });

      const memoryId = memoryResult.memoryId;

      // Add text record
      if (textContent.trim()) {
        await addRecord.mutateAsync({
          memoryId,
          type: "text",
          content: textContent,
        });
      }

      // Add audio record
      if (recordedAudio) {
        const audioFile = new File([recordedAudio], "audio_gravado.webm", { type: "audio/webm" });
        const fileUrl = await uploadFile(audioFile, memoryId);
        await addRecord.mutateAsync({
          memoryId,
          type: "audio",
          fileUrl,
          fileName: "audio_gravado.webm",
          mimeType: "audio/webm",
        });
      }

      // Add file records
      for (const file of selectedFiles) {
        const fileUrl = await uploadFile(file, memoryId);
        const type = file.type.startsWith("image/") ? "photo" : "document";

        await addRecord.mutateAsync({
          memoryId,
          type: type as "photo" | "document",
          fileUrl,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        });
      }

      toast.success("Memória registrada com sucesso!");
      // Reset form state
      setTitle("");
      setTextContent("");
      setSelectedFiles([]);
      setRecordedAudio(null);
      utils.memory.getMemories.invalidate();
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
                <Label htmlFor="category">Categoria *</Label>
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
                        {isRecording ? "Parar Gravação..." : "Iniciar Gravação"}
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

                {/* Image & Files Tab */}
                <TabsContent value="image">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">
                        Arraste e solte imagens ou clique para selecionar
                      </p>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Selecionar Imagens
                      </Button>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium">Arquivos selecionados:</p>
                        <ul className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-muted p-2 rounded-md"
                            >
                              <span className="truncate text-sm">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="files">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">
                        Arraste e solte documentos ou clique para selecionar
                      </p>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Selecionar Documentos
                      </Button>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-medium">Arquivos selecionados:</p>
                        <ul className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between bg-muted p-2 rounded-md"
                            >
                              <span className="truncate text-sm">{file.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Registrar Memória
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}

