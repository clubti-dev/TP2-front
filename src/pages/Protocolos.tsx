import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { protocoloService, Protocolo, statusColors } from "@/services/protocoloService";
import { secretariaService, Secretaria } from "@/services/secretariaService";
import { Plus, Pencil, Trash2, Loader2, FileStack, Eye, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProtocoloHistorico from "@/components/ProtocoloHistorico";

const Protocolos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isHistoricoOpen, setIsHistoricoOpen] = useState(false);
  const [selectedProtocolo, setSelectedProtocolo] = useState<Protocolo | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const [protocolosData, secretariasData] = await Promise.all([
        protocoloService.getAll(),
        secretariaService.getAll(),
      ]);
      setProtocolos(protocolosData);
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

  const handleOpenView = (protocolo: Protocolo) => {
    setSelectedProtocolo(protocolo);
    setIsViewDialogOpen(true);
  };

  const handleOpenDelete = (protocolo: Protocolo) => {
    setSelectedProtocolo(protocolo);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProtocolo) return;

    try {
      setIsSaving(true);
      await protocoloService.delete(selectedProtocolo.id);
      toast({
        title: "Sucesso",
        description: "Protocolo excluído com sucesso",
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      // If it looks like an ISO string (has T), parse directly
      if (dateString.includes('T')) {
        return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
      }
      // Otherwise assume YYYY-MM-DD and append time to ensure local parsing
      return format(new Date(dateString + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getSecretariaDescricao = (id: number) => {
    return secretarias.find((s) => s.id === id)?.descricao || "-";
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileStack className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Protocolos</h1>
              <p className="text-muted-foreground">Gerenciar protocolos do sistema</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : protocolos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum protocolo cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Número</TableHead>
                  <TableHead className="w-28">Data</TableHead>
                  <TableHead>Requerente</TableHead>
                  <TableHead>Secretaria</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-36 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {protocolos.map((protocolo) => (
                  <TableRow key={protocolo.id}>
                    <TableCell className="font-medium">{protocolo.numero}</TableCell>
                    <TableCell>{formatDate(protocolo.data_solicitacao)}</TableCell>
                    <TableCell>{protocolo.solicitante?.nome || "-"}</TableCell>
                    <TableCell>
                      {protocolo.solicitacao?.secretaria?.descricao || "-"}
                    </TableCell>
                    <TableCell>
                      {protocolo.solicitacao?.descricao || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[protocolo.status?.descricao] || "bg-gray-100 text-gray-800"}>
                        {protocolo.status?.descricao || "Desconhecido"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenView(protocolo)}
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg p-0 overflow-hidden">
          <DialogHeader className="bg-primary text-primary-foreground p-6">
            <DialogTitle className="text-2xl font-bold">Detalhes do Protocolo</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            {selectedProtocolo && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Número</Label>
                    <p className="font-medium">{selectedProtocolo.numero}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Data</Label>
                    <p className="font-medium">{formatDate(selectedProtocolo.data_solicitacao)}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedProtocolo.status?.descricao] || "bg-gray-100 text-gray-800"}>
                      {selectedProtocolo.status?.descricao || "Desconhecido"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requerente</Label>
                  <p className="font-medium">{selectedProtocolo.solicitante?.nome || "-"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Secretaria</Label>
                  <p className="font-medium">
                    {selectedProtocolo.solicitacao?.secretaria?.descricao || "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assunto</Label>
                  <p className="font-medium">
                    {selectedProtocolo.solicitacao?.descricao || "-"}
                  </p>
                </div>

                {selectedProtocolo.anexos && selectedProtocolo.anexos.length > 0 && (
                  <div className="col-span-2">
                    <Label className="text-muted-foreground mb-2 block">Anexos</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedProtocolo.anexos.map((anexo) => (
                        <a
                          key={anexo.id}
                          href={`http://localhost:8000/storage/${anexo.caminho}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors group"
                        >
                          <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border group-hover:border-primary/50 transition-colors">
                            <FileStack className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              Anexo {anexo.id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(anexo.created_at)}
                            </p>
                          </div>
                          <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o protocolo "{selectedProtocolo?.numero}"?
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

      {/* Historico Dialog */}
      {selectedProtocolo && (
        <ProtocoloHistorico
          protocolo={selectedProtocolo}
          open={isHistoricoOpen}
          onOpenChange={setIsHistoricoOpen}
          onStatusChange={loadData}
        />
      )}
    </AdminLayout>
  );
};

export default Protocolos;
