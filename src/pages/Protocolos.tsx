import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Plus, Pencil, Trash2, Loader2, FileStack, Eye, History } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDataTableFilter, DataTableFilterTrigger, DataTableFilterContent, FilterColumn, ActiveFilter } from "@/components/DataTableFilter";
import { idUtils } from "@/utils/idUtils";

const Protocolos = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [protocolos, setProtocolos] = useState<Protocolo[]>([]);
  const [filteredProtocolos, setFilteredProtocolos] = useState<Protocolo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      const [protocolosData] = await Promise.all([
        protocoloService.getAll(),
      ]);
      setProtocolos(protocolosData);
      setFilteredProtocolos(protocolosData);
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
    navigate(`/admin/protocolos/${idUtils.encode(protocolo.id)}`);
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

  const filterColumns: FilterColumn[] = [
    { key: "numero", label: "Número", type: "text" },
    { key: "solicitante", label: "Requerente", type: "text" },
    { key: "secretaria", label: "Secretaria", type: "text" },
    { key: "setor", label: "Setor", type: "text" },
    { key: "assunto", label: "Assunto", type: "text" },
    { key: "status", label: "Status", type: "text" },
  ];

  const handleFilterChange = (filters: ActiveFilter[]) => {
    if (filters.length === 0) {
      setFilteredProtocolos(protocolos);
      return;
    }

    const filtered = protocolos.filter((protocolo) => {
      return filters.every((filter) => {
        let value = "";
        const filterValue = filter.value.toLowerCase();

        switch (filter.key) {
          case "numero":
            value = String(protocolo.numero).toLowerCase();
            break;
          case "solicitante":
            value = String(protocolo.solicitante?.nome || "").toLowerCase();
            break;
          case "secretaria":
            value = String(protocolo.solicitacao?.secretaria?.descricao || "").toLowerCase();
            break;
          case "setor":
            value = String(protocolo.setor?.descricao || "").toLowerCase();
            break;
          case "assunto":
            value = String(protocolo.solicitacao?.descricao || "").toLowerCase();
            break;
          case "status":
            value = String(protocolo.status?.descricao || "").toLowerCase();
            break;
          default:
            value = String(protocolo[filter.key as keyof Protocolo] || "").toLowerCase();
        }

        return value.includes(filterValue);
      });
    });

    setFilteredProtocolos(filtered);
  };

  const filter = useDataTableFilter({
    columns: filterColumns,
    onFilterChange: handleFilterChange
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-6 max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileStack className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Protocolos</h1>
              <p className="text-muted-foreground">Gerenciar protocolos do sistema</p>
            </div>
          </div>
          <div>
            <DataTableFilterTrigger filter={filter} />
          </div>
        </div>

        <div className="mb-4 flex justify-end">
          <DataTableFilterContent filter={filter} className="w-full max-w-3xl ml-auto" />
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
                  <TableHead>Setor</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-36 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProtocolos.map((protocolo) => (
                  <TableRow key={protocolo.id}>
                    <TableCell className="font-medium">{protocolo.numero}</TableCell>
                    <TableCell>{formatDate(protocolo.data_solicitacao)}</TableCell>
                    <TableCell>{protocolo.solicitante?.nome || "-"}</TableCell>
                    <TableCell>
                      {protocolo.solicitacao?.secretaria?.descricao || "-"}
                    </TableCell>
                    <TableCell>
                      {protocolo.setor?.descricao || "-"}
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
                          onClick={() => navigate(`/admin/protocolos/${idUtils.encode(protocolo.id)}/timeline`)}
                          title="Histórico / Timeline"
                        >
                          <History className="h-4 w-4" />
                        </Button>
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


    </div>
  );
};

export default Protocolos;
