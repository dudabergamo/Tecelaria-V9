import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Sparkles
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function RegisterMemory() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Extract questionId and categoryId from URL
  const params = new URLSearchParams(location.split('?')[1] || '');
  const questionId = params.get('questionId') ? parseInt(params.get('questionId')!) : undefined;
  const categoryIdFromUrl = params.get('categoryId') ? parseInt(params.get('categoryId')!) : undefined;
  
  console.log('[RegisterMemory] URL params:', { questionId, categoryIdFromUrl, fullUrl: location });
  
  const [activeTab, setActiveTab] = useState("audio");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryIdFromUrl?.toString() || "");
  const [customTitle, setCustomTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  
  const audioRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: dashboardData } = trpc.user.getDashboardData.useQuery();
  const categories = dashboardData?.categories || [];
  const canCreateCustom = (user?.customMemoryCount || 0) < 5;
  
  // Fetch question details if questionId is present
  const { data: questionData } = trpc.questions.getQuestionById.useQuery(
    { id: questionId! },
    { enabled: !!questionId }
  );
  
  console.log('[RegisterMemory] Question data:', questionData);

  // Update selectedCategory when categoryIdFromUrl changes or questionData loads
  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategory(categoryIdFromUrl.toString());
      console.log('[RegisterMemory] Category pre-selected from URL:', categoryIdFromUrl);
    } else if (questionData?.categoryId) {
      setSelectedCategory(questionData.categoryId.toString());
      console.log('[RegisterMemory] Category pre-selected from question data:', questionData.categoryId);
    }
  }, [categoryIdFromUrl, questionData]);

  const utils = trpc.useUtils();
  
  const uploadFileMutation = trpc.memories.uploadFile.useMutation();
  const extractTextMutation = trpc.memories.extractTextFromImage.useMutation();
  const processMemoryMutation = trpc.memories.processMemory.useMutation({
    onSuccess: async () => {
      toast.success("Memória processada com sucesso!");
      // Invalidate queries to update answered questions and progress
      await utils.questions.getAnsweredQuestionIds.invalidate();
      await utils.questions.getProgress.invalidate();
      await utils.questions.getAllQuestionsWithStatus.invalidate();
      setIsUploading(false);
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Erro ao processar memória: " + error.message);
      setIsUploading(false);
    },
  });

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFiles([file]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Gravação iniciada");
    } catch (error) {
      toast.error("Erro ao acessar microfone. Verifique as permissões.");
    }
  };

  const handleStopRecording = () => {
    if (audioRef.current && audioRef.current.state === "recording") {
      audioRef.current.stop();
      setIsRecording(false);
      toast.success("Gravação finalizada");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleProcessOCR = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Selecione uma foto primeiro");
      return;
    }

    const file = selectedFiles[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    setIsProcessingOCR(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const fileData = await base64Promise;

      // Upload image first
      const uploadResult = await uploadFileMutation.mutateAsync({
        fileName: file.name,
        fileData,
        contentType: file.type,
      });

      // Extract text using OCR
      const ocrResult = await extractTextMutation.mutateAsync({
        imageUrl: uploadResult.url,
      });

      // Set extracted text
      setTextContent(ocrResult.text);
      setActiveTab("text"); // Switch to text tab
      toast.success("✨ Texto extraído com sucesso! Revise e edite se necessário.");
    } catch (error: any) {
      toast.error("Erro ao processar OCR: " + error.message);
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast.error("Selecione uma categoria");
      return;
    }

    if (activeTab === "text" && !textContent.trim()) {
      toast.error("Digite o conteúdo da memória");
      return;
    }

    if (activeTab === "audio" && selectedFiles.length === 0) {
      toast.error("Selecione um arquivo de áudio");
      return;
    }

    setIsUploading(true);

    try {
      const categoryId = parseInt(selectedCategory);

      if (activeTab === "text") {
        // Process text directly
        processMemoryMutation.mutate({
          categoryId,
          type: "text",
          textContent: textContent.trim(),
          questionId,
        });
      } else if (activeTab === "audio" && selectedFiles.length > 0) {
        // Upload audio file first
        const file = selectedFiles[0];
        const reader = new FileReader();
        
        reader.onload = async () => {
          const base64 = (reader.result as string).split(',')[1];
          
          try {
            // Upload to S3
            const uploadResult = await uploadFileMutation.mutateAsync({
              fileName: file.name,
              fileData: base64,
              contentType: file.type,
            });
            
            // Process with Whisper + LLM
            processMemoryMutation.mutate({
              categoryId,
              type: "audio",
              fileUrl: uploadResult.url,
              questionId,
            });
          } catch (error) {
            toast.error("Erro ao fazer upload do arquivo");
            setIsUploading(false);
          }
        };
        
        reader.onerror = () => {
          toast.error("Erro ao ler arquivo");
          setIsUploading(false);
        };
        
        reader.readAsDataURL(file);
      } else {
        toast.info("Tipo de memória ainda não suportado. Use texto ou áudio.");
        setIsUploading(false);
      }
    } catch (error) {
      toast.error("Erro ao processar memória");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Registrar Memória</h1>
          </div>
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {/* Display selected question if present */}
        {questionData && (
          <Card className="mb-6 border-2 border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Pergunta Selecionada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-medium">{questionData.question}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Caixinha {questionData.box} - Pergunta {questionData.number}
              </p>
            </CardContent>
          </Card>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recording Protocol Instructions */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mic className="h-5 w-5 text-primary" />
                🎙️ Protocolo de Gravação (Importante!)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-semibold">
                  Para facilitar a organização do seu livro, siga este protocolo ao gravar:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>
                    <strong>Comece dizendo:</strong> "Estou respondendo a pergunta [número] da caixinha [nome]"
                  </li>
                  <li>
                    <strong>Exemplo:</strong> "Estou respondendo a pergunta 5 da caixinha Comece Por Aqui: Qual é o nome completo dos seus pais?"
                  </li>
                  <li>
                    <strong>Depois:</strong> Conte sua história livremente, no seu ritmo
                  </li>
                  <li>
                    <strong>Dica:</strong> Fale naturalmente, como se estivesse conversando com alguém querido
                  </li>
                </ol>
                <div className="mt-3 p-3 bg-background rounded-md border">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Por que isso é importante?</strong> Ao mencionar a pergunta no início, 
                    facilitamos a organização automática das suas memórias no livro final. 
                    Mas não se preocupe: você também pode gravar memórias livres, sem pergunta específica!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Escolha uma Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria {categoryIdFromUrl && "(Pré-selecionada pela pergunta)"}</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!!categoryIdFromUrl}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-custom" disabled={!canCreateCustom}>
                      ✨ Nova Memória Personalizada {!canCreateCustom && "(Limite atingido)"}
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!canCreateCustom && (
                  <p className="text-sm text-muted-foreground">
                    Você já criou 5 memórias personalizadas. Use as categorias pré-definidas.
                  </p>
                )}
              </div>

              {selectedCategory === "new-custom" && (
                <div className="space-y-2">
                  <Label htmlFor="custom-title">Título da Memória Personalizada</Label>
                  <Input
                    id="custom-title"
                    placeholder="Ex: Minha viagem inesquecível"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Type Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Como deseja registrar?</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 bg-[#8B9D83]/20 p-1">
                  <TabsTrigger 
                    value="audio"
                    className="data-[state=active]:bg-[#8B9D83] data-[state=active]:text-white"
                  >
                    <FileAudio className="h-4 w-4 mr-2" />
                    Áudio
                  </TabsTrigger>
                  <TabsTrigger 
                    value="text"
                    className="data-[state=active]:bg-[#8B9D83] data-[state=active]:text-white"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Texto
                  </TabsTrigger>
                  <TabsTrigger 
                    value="document"
                    className="data-[state=active]:bg-[#8B9D83] data-[state=active]:text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Documento
                  </TabsTrigger>
                  <TabsTrigger 
                    value="photo"
                    className="data-[state=active]:bg-[#8B9D83] data-[state=active]:text-white"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Foto
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="audio" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      {!isRecording ? (
                        <Button
                          type="button"
                          onClick={handleStartRecording}
                          variant="outline"
                          className="flex-1"
                        >
                          <Mic className="h-4 w-4 mr-2" />
                          Gravar Áudio
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={handleStopRecording}
                          variant="destructive"
                          className="flex-1"
                        >
                          <Mic className="h-4 w-4 mr-2 animate-pulse" />
                          Parar Gravação
                        </Button>
                      )}
                      
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload de Áudio
                    </Button>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a,.webm"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {selectedFiles.length > 0 && (
                      <div className="p-4 bg-muted rounded-lg relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => setSelectedFiles([])}
                        >
                          <span className="sr-only">Remover arquivo</span>
                          ×
                        </Button>
                        <p className="text-sm font-medium">Arquivo selecionado:</p>
                        <p className="text-sm text-muted-foreground">{selectedFiles[0].name}</p>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: MP3, WAV, M4A, WebM
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="text-content">Escreva sua memória</Label>
                    <Textarea
                      id="text-content"
                      placeholder="Conte sua história aqui..."
                      rows={10}
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      className="resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="document" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Selecionar Documento
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {selectedFiles.length > 0 && (
                      <div className="p-4 bg-muted rounded-lg relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => setSelectedFiles([])}
                        >
                          <span className="sr-only">Remover arquivo</span>
                          ×
                        </Button>
                        <p className="text-sm font-medium">Documento selecionado:</p>
                        <p className="text-sm text-muted-foreground">{selectedFiles[0].name}</p>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: PDF, Word (.doc, .docx)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="photo" className="space-y-4 mt-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        📝 OCR para Cadernos Manuscritos
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Se você tirou foto de um caderno escrito à mão, podemos extrair o texto automaticamente! 
                        Basta fazer upload da foto e clicar em "Extrair Texto".
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="w-full"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Selecionar Foto
                    </Button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {selectedFiles.length > 0 && (
                      <div className="space-y-3">
                        <div className="p-4 bg-muted rounded-lg relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => setSelectedFiles([])}
                          >
                            <span className="sr-only">Remover arquivo</span>
                            ×
                          </Button>
                          <p className="text-sm font-medium">Foto selecionada:</p>
                          <p className="text-sm text-muted-foreground">{selectedFiles[0].name}</p>
                        </div>
                        
                        <Button
                          type="button"
                          onClick={handleProcessOCR}
                          disabled={isProcessingOCR}
                          className="w-full"
                          variant="default"
                        >
                          {isProcessingOCR ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processando OCR...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              ✨ Extrair Texto da Foto
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground">
                      Formatos aceitos: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              asChild
            >
              <Link href="/dashboard">Cancelar</Link>
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isUploading || !selectedCategory}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                "Registrar Memória"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
