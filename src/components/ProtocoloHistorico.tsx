import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { movimentacaoService, Movimentacao } from "@/services/movimentacaoService";
import { Protocolo, statusColors } from "@/services/protocoloService";
import { Loader2, Plus, History, ArrowRight, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProtocoloHistoricoProps {
  protocolo: Protocolo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

const statusLabels: Record<string, string> = {
  "Aberto": "Aberto",
  "Em Análise": "Em Análise",
  "Concluído": "Concluído",
  "Indeferido": "Indeferido",
};

const ProtocoloHistorico = ({ protocolo, open, onOpenChange, onStatusChange }: ProtocoloHistoricoProps) => {
  const { toast } = useToast();
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingOpen, setIsAddingOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(protocolo.status.descricao);
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && protocolo) {
      loadMovimentacoes();
      setNewStatus(protocolo.status.descricao);
    }
  }, [open, protocolo]);

  const loadMovimentacoes = async () => {
    try {
      setIsLoading(true);
      const data = await movimentacaoService.getByProtocolo(protocolo.id);
      setMovimentacoes(data);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setNewStatus(protocolo.status.descricao);
    setObservacao("");
    setError("");
    setIsAddingOpen(true);
  };

  const handleSaveMovimentacao = async () => {
    if (!observacao.trim()) {
      setError("Observação é obrigatória");
      return;
    }

    if (observacao.trim().length < 5) {
      setError("Observação deve ter pelo menos 5 caracteres");
      return;
    }

    try {
      setIsSaving(true);
      setError("");

      await movimentacaoService.create(protocolo.id, {
        status_novo: newStatus,
        observacao: observacao.trim(),
      });

      toast({
        title: "Sucesso",
        description: "Movimentação registrada com sucesso",
      });

      setIsAddingOpen(false);
      loadMovimentacoes();

      if (newStatus !== protocolo.status.descricao && onStatusChange) {
        onStatusChange();
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao registrar",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Movimentações
            </DialogTitle>
            <DialogDescription>
              Protocolo {protocolo.numero} - {protocolo.solicitante?.nome}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-between items-center py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status atual:</span>
              <Badge className={statusColors[protocolo.status.descricao] || "bg-gray-100 text-gray-800"}>
                {protocolo.status.descricao}
              </Badge>
            </div>
            <Button size="sm" onClick={handleOpenAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Nova Movimentação
            </Button>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : movimentacoes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma movimentação registrada
              </div>
            ) : (
              <div className="space-y-4">
                {movimentacoes.map((mov, index) => (
                  <div
                    key={mov.id}
                    className="relative pl-6 pb-4 border-l-2 border-muted last:border-transparent"
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />

                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      {/* Status change */}
                      <div className="flex flex-wrap items-center gap-2">
                        {mov.status_anterior ? (
                          <>
                            <Badge variant="outline" className={statusColors[mov.status_anterior] || "bg-gray-100 text-gray-800"}>
                              {mov.status_anterior}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Criação:</span>
                        )}
                        <Badge className={statusColors[mov.status_novo] || "bg-gray-100 text-gray-800"}>
                          {mov.status_novo}
                        </Badge>
                      </div>

                      {/* Observation */}
                      <p className="text-sm whitespace-pre-wrap">{mov.observacao}</p>

                      {/* Meta info */}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {mov.usuario?.name || "Sistema"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(mov.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Movimentacao Dialog */}
      <Dialog open={isAddingOpen} onOpenChange={setIsAddingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma alteração de status ou observação para o protocolo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Novo Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newStatus !== protocolo.status.descricao && (
                <p className="text-sm text-muted-foreground">
                  Status será alterado de "{protocolo.status.descricao}" para "{newStatus}"
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacao">Observação *</Label>
              <Textarea
                id="observacao"
                value={observacao}
                onChange={(e) => {
                  setObservacao(e.target.value);
                  setError("");
                }}
                placeholder="Descreva a movimentação ou observação..."
                rows={4}
                maxLength={500}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <p className="text-xs text-muted-foreground text-right">
                {observacao.length}/500 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveMovimentacao} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProtocoloHistorico;
