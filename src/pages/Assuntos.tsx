import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { assuntoService, Assunto } from "@/services/assuntoService";
import { secretariaService, Secretaria } from "@/services/secretariaService";
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";

const Assuntos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAssunto, setSelectedAssunto] = useState<Assunto | null>(null);
  const [descricao, setDescricao] = useState("");
  const [secretariaId, setSecretariaId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ descricao?: string; secretaria?: string }>({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [assuntosData, secretariasData] = await Promise.all([
        assuntoService.getAll(),
        secretariaService.getAll(),
      ]);
      setAssuntos(assuntosData);
      setSecretarias(secretariasData);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedAssunto(null);
    setDescricao("");
    setSecretariaId("");
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (assunto: Assunto) => {
    setSelectedAssunto(assunto);
    setDescricao(assunto.descricao);
    setSecretariaId(assunto.secretaria_id.toString());
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (assunto: Assunto) => {
    setSelectedAssunto(assunto);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    const newErrors: { descricao?: string; secretaria?: string } = {};

    if (!descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
    } else if (descricao.trim().length < 3) {
      newErrors.descricao = "Descrição deve ter pelo menos 3 caracteres";
    }

    if (!secretariaId) {
      newErrors.secretaria = "Secretaria é obrigatória";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSaving(true);
      setErrors({});

      const data = {
        descricao: descricao.trim(),
        secretaria_id: parseInt(secretariaId),
      };

      if (selectedAssunto) {
        await assuntoService.update(selectedAssunto.id, data);
        toast({
          title: "Sucesso",
          description: "Assunto atualizado com sucesso",
        });
      } else {
        await assuntoService.create(data);
        toast({
          title: "Sucesso",
          description: "Assunto criado com sucesso",
        });
      }

      setIsDialogOpen(false);
      loadData();
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao salvar",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAssunto) return;

    try {
      setIsSaving(true);
      await assuntoService.delete(selectedAssunto.id);
      toast({
        title: "Sucesso",
        description: "Assunto excluído com sucesso",
      });
      setIsDeleteDialogOpen(false);
      loadData();
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao excluir",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSecretariaDescricao = (secretariaId: number) => {
    const secretaria = secretarias.find((s) => s.id === secretariaId);
    return secretaria?.descricao || "-";
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Assuntos</h1>
              <p className="text-muted-foreground">Gerenciar assuntos do sistema</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Assunto
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : assuntos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum assunto cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Secretaria</TableHead>
                  <TableHead className="w-32 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assuntos.map((assunto) => (
                  <TableRow key={assunto.id}>
                    <TableCell className="font-medium">{assunto.id}</TableCell>
                    <TableCell>{assunto.descricao}</TableCell>
                    <TableCell>
                      {assunto.secretaria?.descricao || getSecretariaDescricao(assunto.secretaria_id)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(assunto)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDelete(assunto)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="bg-primary text-primary-foreground p-6">
            <DialogTitle className="text-2xl font-bold">
              {selectedAssunto ? "Editar Assunto" : "Novo Assunto"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              {selectedAssunto
                ? "Altere os dados do assunto"
                : "Preencha os dados para criar um novo assunto"}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretaria">Secretaria</Label>
              <Select value={secretariaId} onValueChange={(value) => {
                setSecretariaId(value);
                setErrors((prev) => ({ ...prev, secretaria: undefined }));
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma secretaria" />
                </SelectTrigger>
                <SelectContent>
                  {secretarias.map((secretaria) => (
                    <SelectItem key={secretaria.id} value={secretaria.id.toString()}>
                      {secretaria.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.secretaria && <p className="text-sm text-destructive">{errors.secretaria}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={descricao}
                onChange={(e) => {
                  setDescricao(e.target.value);
                  setErrors((prev) => ({ ...prev, descricao: undefined }));
                }}
                placeholder="Ex: Solicitação de Licença"
                maxLength={100}
              />
              {errors.descricao && <p className="text-sm text-destructive">{errors.descricao}</p>}
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedAssunto ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o assunto "{selectedAssunto?.descricao}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Assuntos;
