import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
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
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { protocoloService, Protocolo } from "@/services/protocoloService";
import { secretariaService, Secretaria } from "@/services/secretariaService";
import { setorService, Setor } from "@/services/setorService";
import { statusService, Status } from "@/services/statusService";
import { movimentacaoService } from "@/services/movimentacaoService";
import { FileStack, Eye, Upload, X, ArrowLeft, Loader2, Save, Send, Hash, Calendar, User, Building2, MessageSquare, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ProtocoloDetalhes = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [protocolo, setProtocolo] = useState<Protocolo | null>(null);
    const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [statusList, setStatusList] = useState<Status[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Transfer/Edit states
    const [despacho, setDespacho] = useState("");
    const [anexoDespacho, setAnexoDespacho] = useState<File | null>(null);
    const [selectedSecretariaTransfer, setSelectedSecretariaTransfer] = useState<string>("");
    const [selectedSetorTransfer, setSelectedSetorTransfer] = useState<string>("");
    const [activeTab, setActiveTab] = useState("responder");
    const [isSaving, setIsSaving] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/admin");
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        if (isAuthenticated && id) {
            loadData();
        }
    }, [isAuthenticated, id]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            if (!id) return;

            const [protocoloData, secretariasData, statusData] = await Promise.all([
                protocoloService.getById(Number(id)),
                secretariaService.getAll(),
                statusService.getAll(),
            ]);

            setProtocolo(protocoloData);
            setSecretarias(secretariasData);
            setStatusList(statusData);

            // Initialize states
            setSelectedStatus(protocoloData.status?.id.toString() || "");

        } catch (err) {
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados do protocolo",
                variant: "destructive",
            });
            navigate("/admin/protocolos");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSetores = async (secretariaId: number) => {
        try {
            const data = await setorService.getAll();
            const setoresDaSecretaria = data.filter(s => s.secretaria_id === secretariaId);
            setSetores(setoresDaSecretaria);
        } catch (error) {
            console.error("Erro ao carregar setores:", error);
        }
    };

    const handleSecretariaTransferChange = (value: string) => {
        setSelectedSecretariaTransfer(value);
        setSelectedSetorTransfer("");
        if (value) {
            loadSetores(Number(value));
        } else {
            setSetores([]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: "Erro",
                    description: "O arquivo deve ter no máximo 10MB",
                    variant: "destructive",
                });
                return;
            }
            setAnexoDespacho(file);
        }
    };

    const handleRemoveFile = () => {
        setAnexoDespacho(null);
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

    const handleSave = async () => {
        if (!protocolo) return;

        setIsSaving(true);
        try {
            if (activeTab === "responder") {
                if (!selectedStatus) {
                    toast({
                        title: "Erro",
                        description: "Selecione um status",
                        variant: "destructive",
                    });
                    setIsSaving(false);
                    return;
                }

                if (!despacho.trim()) {
                    toast({
                        title: "Erro",
                        description: "O campo Resposta / Despacho é obrigatório",
                        variant: "destructive",
                    });
                    setIsSaving(false);
                    return;
                }

                if (selectedStatus !== protocolo.status.id.toString()) {
                    await protocoloService.update(protocolo.id, {
                        data_solicitacao: protocolo.data_solicitacao,
                        solicitante_id: protocolo.solicitante.id,
                        solicitacao_id: protocolo.solicitacao.id,
                        status_id: parseInt(selectedStatus),
                        setor_id: protocolo.setor?.id,
                    });
                }

                if (despacho) {
                    const statusDesc = statusList.find(s => s.id.toString() === selectedStatus)?.descricao || "Em Análise";
                    await movimentacaoService.create(protocolo.id, {
                        status_novo: statusDesc,
                        observacao: despacho,
                    });
                }
            } else if (activeTab === "transferir") {
                if (!selectedSecretariaTransfer || !selectedSetorTransfer) {
                    toast({
                        title: "Erro",
                        description: "Selecione a secretaria e o setor de destino",
                        variant: "destructive",
                    });
                    setIsSaving(false);
                    return;
                }

                if (!despacho.trim()) {
                    toast({
                        title: "Erro",
                        description: "O motivo da transferência é obrigatório",
                        variant: "destructive",
                    });
                    setIsSaving(false);
                    return;
                }

                await protocoloService.update(protocolo.id, {
                    data_solicitacao: protocolo.data_solicitacao,
                    solicitante_id: protocolo.solicitante.id,
                    solicitacao_id: protocolo.solicitacao.id,
                    status_id: protocolo.status.id,
                    setor_id: parseInt(selectedSetorTransfer),
                });

                await movimentacaoService.create(protocolo.id, {
                    status_novo: protocolo.status.descricao,
                    observacao: `Transferência de setor. Motivo: ${despacho || "Sem motivo informado"}`,
                });
            }

            if (anexoDespacho) {
                await protocoloService.uploadAnexo(protocolo.id, anexoDespacho);
            }

            toast({
                title: "Sucesso",
                description: "Operação realizada com sucesso",
            });

            setDespacho("");
            setAnexoDespacho(null);
            loadData();
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao salvar alterações",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    if (!protocolo) return null;

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8 max-w-[1600px]">
                <div className="mb-6 flex justify-end">
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



                <div className="space-y-8">
                    {/* Dados do Protocolo - Compacto e em Linha */}
                    <Card>
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="text-xl">Dados do Protocolo</CardTitle>
                            <CardDescription>Informações da solicitação</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                        <p className="text-base font-medium text-foreground">{formatDate(protocolo.data_solicitacao)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 min-w-[250px] flex-1">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <Label className="text-muted-foreground text-xs uppercase font-bold">Requerente</Label>
                                        <p className="text-base font-medium text-foreground truncate" title={protocolo.solicitante?.nome}>
                                            {protocolo.solicitante?.nome || "-"}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{protocolo.solicitante?.cpf_cnpj}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 min-w-[250px] flex-1">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <Label className="text-muted-foreground text-xs uppercase font-bold">Secretaria Atual</Label>
                                        <p className="text-base font-medium text-foreground truncate" title={protocolo.solicitacao?.secretaria?.descricao}>
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
                                        <p className="text-base font-medium text-foreground truncate" title={protocolo.setor?.descricao}>
                                            {protocolo.setor?.descricao || "-"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 pt-2 border-t">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                                    <MessageSquare className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <Label className="text-muted-foreground text-xs uppercase font-bold">Assunto</Label>
                                    <p className="text-base font-medium text-foreground mt-1">
                                        {protocolo.solicitacao?.descricao || "-"}
                                    </p>
                                </div>
                            </div>

                            {protocolo.anexos && protocolo.anexos.length > 0 && (
                                <div className="pt-2 border-t">
                                    <Label className="text-muted-foreground text-xs uppercase font-bold mb-3 block">Anexos</Label>
                                    <div className="flex flex-wrap gap-3">
                                        {protocolo.anexos.map((anexo) => (
                                            <a
                                                key={anexo.id}
                                                href={`${(import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api").replace(/\/api$/, '')}/storage/${anexo.caminho}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted transition-colors group"
                                            >
                                                <FileStack className="h-4 w-4 text-primary" />
                                                <span className="text-sm font-medium truncate max-w-[150px]">
                                                    Anexo {anexo.id}
                                                </span>
                                                <Eye className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Ações e Tramitação */}
                    <Card className="border-primary/20 shadow-md">
                        <CardHeader className="bg-muted/30 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Send className="h-5 w-5 text-primary" />
                                Tramitação e Resposta
                            </CardTitle>
                            <CardDescription>Selecione a ação desejada</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="responder">Responder</TabsTrigger>
                                    <TabsTrigger value="transferir">Transferir</TabsTrigger>
                                </TabsList>

                                <TabsContent value="responder" className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold">Status do Protocolo</Label>
                                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                                    <SelectTrigger className="w-full h-12 text-base bg-background">
                                                        <SelectValue placeholder="Selecione o status..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {statusList.map((status) => (
                                                            <SelectItem key={status.id} value={status.id.toString()}>
                                                                <div className="flex items-center gap-3">
                                                                    <div
                                                                        className="w-4 h-4 rounded-full shadow-sm"
                                                                        style={{ backgroundColor: status.cor }}
                                                                    />
                                                                    <span className="text-base">{status.descricao}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="anexo" className="text-base font-semibold">Anexar Arquivo</Label>
                                                {!anexoDespacho ? (
                                                    <div className="border-2 border-dashed rounded-xl p-4 hover:border-primary/50 transition-colors bg-muted/10">
                                                        <label
                                                            htmlFor="anexo"
                                                            className="flex items-center justify-center gap-4 cursor-pointer py-2"
                                                        >
                                                            <Upload className="h-6 w-6 text-muted-foreground" />
                                                            <div className="text-center sm:text-left">
                                                                <p className="text-base text-muted-foreground font-medium">
                                                                    Clique para anexar
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    PDF, DOC, JPG (máx. 10MB)
                                                                </p>
                                                            </div>
                                                            <Input
                                                                id="anexo"
                                                                type="file"
                                                                className="hidden"
                                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                                onChange={handleFileChange}
                                                            />
                                                        </label>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 p-3 rounded-xl border bg-background">
                                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border">
                                                            <FileStack className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-base font-medium truncate">{anexoDespacho.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {(anexoDespacho.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={handleRemoveFile}
                                                            className="h-10 w-10 text-destructive hover:text-destructive"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="despacho" className="text-base font-semibold">Resposta / Despacho</Label>
                                            <Textarea
                                                id="despacho"
                                                value={despacho}
                                                onChange={(e) => setDespacho(e.target.value)}
                                                placeholder="Digite a resposta ou observações..."
                                                rows={8}
                                                className="resize-none text-base p-4 bg-background focus-visible:ring-primary h-full min-h-[200px]"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="transferir" className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold">Secretaria de Destino</Label>
                                                <Select value={selectedSecretariaTransfer} onValueChange={handleSecretariaTransferChange}>
                                                    <SelectTrigger className="w-full h-12 text-base bg-background">
                                                        <SelectValue placeholder="Selecione a secretaria..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {secretarias.map((secretaria) => (
                                                            <SelectItem key={secretaria.id} value={secretaria.id.toString()}>
                                                                {secretaria.descricao}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-base font-semibold">Setor de Destino</Label>
                                                <Select
                                                    value={selectedSetorTransfer}
                                                    onValueChange={setSelectedSetorTransfer}
                                                    disabled={!selectedSecretariaTransfer}
                                                >
                                                    <SelectTrigger className="w-full h-12 text-base bg-background">
                                                        <SelectValue placeholder="Selecione o setor..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {setores.map((setor) => (
                                                            <SelectItem key={setor.id} value={setor.id.toString()}>
                                                                {setor.descricao}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label htmlFor="motivo-transferencia" className="text-base font-semibold">Motivo da Transferência</Label>
                                            <Textarea
                                                id="motivo-transferencia"
                                                value={despacho}
                                                onChange={(e) => setDespacho(e.target.value)}
                                                placeholder="Justifique a transferência..."
                                                rows={8}
                                                className="resize-none text-base p-4 bg-background focus-visible:ring-primary h-full min-h-[200px]"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-base font-semibold">Anexar Arquivo (Opcional)</Label>
                                            <div className="border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors text-center cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                />
                                                {!anexoDespacho ? (
                                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                        <Upload className="h-8 w-8" />
                                                        <span className="text-sm font-medium">Clique ou arraste para anexar</span>
                                                        <span className="text-xs">PDF, Word ou Imagens (max 10MB)</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4 w-full">
                                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                            <FileStack className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0 text-left">
                                                            <p className="text-base font-medium truncate">{anexoDespacho.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {(anexoDespacho.size / 1024).toFixed(2)} KB
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveFile();
                                                            }}
                                                            className="h-10 w-10 text-destructive hover:text-destructive z-10"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                        <CardFooter className="bg-muted/30 p-6 flex justify-end gap-4">
                            <Button variant="outline" size="lg" onClick={() => navigate("/admin/protocolos")}>
                                Cancelar
                            </Button>
                            <Button size="lg" className="min-w-[140px]" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ProtocoloDetalhes;
