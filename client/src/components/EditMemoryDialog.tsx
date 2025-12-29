import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { X, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface EditMemoryDialogProps {
  memory: {
    id: number;
    title: string;
    summary: string | null;
    categoryId: number;
    categoryName: string;
    themes: string[] | null;
    peopleMentioned: string[] | null;
    periodMentioned: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditMemoryDialog({
  memory,
  open,
  onOpenChange,
  onSuccess,
}: EditMemoryDialogProps) {
  const [title, setTitle] = useState(memory.title);
  const [summary, setSummary] = useState(memory.summary || "");
  const [categoryId, setCategoryId] = useState(memory.categoryId.toString());
  const [period, setPeriod] = useState(memory.periodMentioned || "");
  const [people, setPeople] = useState<string[]>(memory.peopleMentioned || []);
  const [themes, setThemes] = useState<string[]>(memory.themes || []);
  const [newPerson, setNewPerson] = useState("");
  const [newTheme, setNewTheme] = useState("");

  const { data: categories } = trpc.memories.getCategories.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.memories.updateMemory.useMutation({
    onSuccess: () => {
      toast.success("Memória atualizada com sucesso!");
      utils.memories.getUserMemoriesWithDetails.invalidate();
      utils.memories.list.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar memória: ${error.message}`);
    },
  });

  // Reset form when memory changes
  useEffect(() => {
    setTitle(memory.title);
    setSummary(memory.summary || "");
    setCategoryId(memory.categoryId.toString());
    setPeriod(memory.periodMentioned || "");
    setPeople(memory.peopleMentioned || []);
    setThemes(memory.themes || []);
  }, [memory]);

  const handleAddPerson = () => {
    if (newPerson.trim() && !people.includes(newPerson.trim())) {
      setPeople([...people, newPerson.trim()]);
      setNewPerson("");
    }
  };

  const handleRemovePerson = (person: string) => {
    setPeople(people.filter((p) => p !== person));
  };

  const handleAddTheme = () => {
    if (newTheme.trim() && !themes.includes(newTheme.trim())) {
      setThemes([...themes, newTheme.trim()]);
      setNewTheme("");
    }
  };

  const handleRemoveTheme = (theme: string) => {
    setThemes(themes.filter((t) => t !== theme));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    updateMutation.mutate({
      id: memory.id,
      title: title.trim(),
      summary: summary.trim() || undefined,
      categoryId: parseInt(categoryId),
      periodMentioned: period.trim() || undefined,
      peopleMentioned: people.length > 0 ? people : undefined,
      themes: themes.length > 0 ? themes : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Memória</DialogTitle>
          <DialogDescription>
            Atualize as informações da sua memória
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Minha primeira viagem ao exterior"
              required
            />
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Resumo</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Breve resumo desta memória..."
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">Período Mencionado</Label>
            <Input
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="Ex: Década de 1980, Verão de 2010"
            />
          </div>

          {/* People Mentioned */}
          <div className="space-y-2">
            <Label>Pessoas Mencionadas</Label>
            <div className="flex gap-2">
              <Input
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                placeholder="Nome da pessoa"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPerson();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddPerson}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {people.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {people.map((person, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {person}
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(person)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Themes */}
          <div className="space-y-2">
            <Label>Temas</Label>
            <div className="flex gap-2">
              <Input
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                placeholder="Ex: Família, Aventura, Superação"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTheme();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTheme}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {themes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {themes.map((theme, idx) => (
                  <Badge key={idx} variant="outline" className="gap-1">
                    {theme}
                    <button
                      type="button"
                      onClick={() => handleRemoveTheme(theme)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
