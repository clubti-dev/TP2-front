import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { protocoloService, Movimentacao, Protocolo } from "@/services/protocoloService";
import { statusService, Status } from "@/services/statusService";
import { Loader2, Circle, CheckCircle2, Clock, XCircle, User, ArrowLeft, Calendar, Hash, Building2, MapPin, MessageSquare, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { Label } from "@/components/ui/label";



import { idUtils } from "@/utils/idUtils";

const ProtocoloTimeline = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [protocolo, setProtocolo] = useState<Protocolo | null>(null);
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [statusList, setStatusList] = useState<Status[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const decodedId = idUtils.decode(id);
            if (decodedId) {
                loadData(decodedId);
            } else {
                navigate("/admin/protocolos");
            }
        }
    }, [id]);

    const loadData = async (protocoloId: number) => {
        try {
            setIsLoading(true);
            const [protocoloData, movimentacoesData, statusData] = await Promise.all([
                protocoloService.getById(protocoloId),
                protocoloService.getMovimentacoes(protocoloId),
                statusService.getAll()
            ]);
            setProtocolo(protocoloData);
            setMovimentacoes(movimentacoesData);
            setStatusList(statusData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (statusDesc: string) => {
        const status = statusList.find(s => s.descricao === statusDesc);
        return status ? status.cor : "#6b7280"; // Default gray if not found
    };

    // ... existing getStatusIcon ...

    // ... inside render ...


    const getStatusIcon = (status: string) => {
        const s = status?.toLowerCase() || "";
        if (s.includes("concluído") || s.includes("concluido")) return <CheckCircle2 className="h-6 w-6 text-green-500" />;
        if (s.includes("cancelado") || s.includes("indeferido")) return <XCircle className="h-6 w-6 text-red-500" />;
        if (s.includes("andamento") || s.includes("análise")) return <Clock className="h-6 w-6 text-yellow-500" />;
        return <Circle className="h-6 w-6 text-blue-500" />;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        try {
            if (dateString.includes('T')) {
                return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
            }
            return format(new Date(dateString + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR });
        } catch {
            return dateString;
        }
    };

    const handleDownloadPdf = async () => {
        if (!protocolo) return;
        try {
            setIsLoading(true);
            const blob = await protocoloService.downloadTimelinePdf(protocolo.id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            // Cleanup after a delay to ensure it loads
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error("Erro ao abrir PDF:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!protocolo) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-muted-foreground">Protocolo não encontrado.</p>
                <Button onClick={() => navigate("/admin/protocolos")}>Voltar</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-[1600px]">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold">Dados do Protocolo</h1>
                    <p className="text-sm text-muted-foreground">Informações da solicitação</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={handleDownloadPdf}
                    >
                        <Download className="h-4 w-4" />
                        Baixar PDF
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-accent/20 hover:bg-accent/40 border-accent/50 text-primary"
                        onClick={() => navigate("/admin/protocolos")}
                        title="Voltar para lista"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Top Card: Protocol Details (Matching ProtocoloDetalhes layout) */}
                <Card>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex flex-wrap gap-6 items-start">
                            <div className="flex items-center gap-3 min-w-[200px]">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Hash className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase font-bold">Número</Label>
                                    <p className="text-base font-bold text-foreground">{protocolo.numero}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 min-w-[200px]">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase font-bold">Data de Abertura</Label>
                                    <p className="text-base font-bold text-foreground">{formatDate(protocolo.data_solicitacao)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 min-w-[250px] flex-1">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <Label className="text-muted-foreground text-xs uppercase font-bold">Requerente</Label>
                                    <p className="text-base font-bold text-foreground truncate" title={protocolo.solicitante?.nome}>
                                        {protocolo.solicitante?.nome || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 min-w-[250px] flex-1">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <Label className="text-muted-foreground text-xs uppercase font-bold">Secretaria Atual</Label>
                                    <p className="text-base font-bold text-foreground truncate" title={protocolo.solicitacao?.secretaria?.descricao}>
                                        {protocolo.solicitacao?.secretaria?.descricao || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 min-w-[250px] flex-1">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0">
                                    <Label className="text-muted-foreground text-xs uppercase font-bold">Setor Atual</Label>
                                    <p className="text-base font-bold text-foreground truncate" title={protocolo.setor?.descricao}>
                                        {protocolo.setor?.descricao || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 pt-2 border-t">
                            <div className="flex items-start gap-3 flex-1">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase font-bold">Assunto</Label>
                                    <p className="text-base font-bold text-foreground mt-1">
                                        {protocolo.solicitacao?.descricao || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bottom Card: Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Linha do Tempo</CardTitle>
                        <CardDescription>Histórico completo de tramitações e atualizações</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative space-y-8 p-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                            {movimentacoes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground ml-8">
                                    Nenhuma movimentação registrada além da criação.
                                </div>
                            ) : (
                                movimentacoes.map((mov) => (
                                    <div key={mov.id} className="relative flex gap-6">
                                        <div className="absolute left-0 top-1 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border ring-4 ring-background">
                                            {getStatusIcon(mov.status_novo)}
                                        </div>
                                        <div className="flex flex-col gap-2 pl-12 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    {format(new Date(mov.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                                </span>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full w-fit">
                                                    <Avatar className="h-5 w-5">
                                                        <AvatarImage src={mov.usuario?.avatar} />
                                                        <AvatarFallback className="text-[10px]"><User className="h-3 w-3" /></AvatarFallback>
                                                    </Avatar>
                                                    <span>{mov.usuario?.name || "Sistema"}</span>
                                                </div>
                                            </div>

                                            <div className="rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className="font-semibold text-muted-foreground">Status:</span>
                                                    <span
                                                        className="text-base font-bold"
                                                        style={{
                                                            color: getStatusColor(mov.status_novo)
                                                        }}
                                                    >
                                                        {mov.status_novo}
                                                    </span>
                                                    {mov.status_anterior && (
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            (anterior: {mov.status_anterior})
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                                    {mov.observacao}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Creation Node */}
                            <div className="relative flex gap-6">
                                <div className="absolute left-0 top-1 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border ring-4 ring-background">
                                    <Circle className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex flex-col gap-2 pl-12 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {protocolo.created_at ? format(new Date(protocolo.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR }) : "-"}
                                        </span>
                                        <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary w-fit">
                                            Início
                                        </span>
                                    </div>
                                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                                        <p className="text-sm text-muted-foreground">
                                            Protocolo criado no sistema.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProtocoloTimeline;
