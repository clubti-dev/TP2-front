import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { protocoloService, Protocolo } from "@/services/protocoloService";
import { secretariaService, Secretaria } from "@/services/secretariaService";
import { setorService, Setor } from "@/services/setorService";
import { statusService, Status } from "@/services/statusService";
import { movimentacaoService } from "@/services/movimentacaoService";
import { Loader2 } from "lucide-react";
import { idUtils } from "@/utils/idUtils";

// Components
import { ProtocoloHeader } from "@/components/protocolo/ProtocoloHeader";
import { ProtocoloInfo } from "@/components/protocolo/ProtocoloInfo";
import { ProtocoloDocumentos } from "@/components/protocolo/ProtocoloDocumentos";
import { ProtocoloTramitacao } from "@/components/protocolo/ProtocoloTramitacao";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
    const [infoTab, setInfoTab] = useState("dados");
    const [isSaving, setIsSaving] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/admin");
        }
    }, [isAuthenticated, authLoading, navigate]);


    useEffect(() => {
        if (isAuthenticated && id) {
            const decodedId = idUtils.decode(id);
            if (decodedId) {
                loadData(decodedId);
            } else {
                toast({
                    title: "Erro",
                    description: "Protocolo não encontrado",
                    variant: "destructive",
                });
                navigate("/admin/protocolos");
            }
        }
    }, [isAuthenticated, id]);

    const loadData = async (protocoloId: number) => {
        try {
            setIsLoading(true);

            const [protocoloData, secretariasData, statusData] = await Promise.all([
                protocoloService.getById(protocoloId),
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
            toast({
                title: "Erro",
                description: "Erro ao carregar lista de setores.",
                variant: "destructive"
            });
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
            if (file.size > MAX_FILE_SIZE) {
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

                const setorDestino = setores.find(s => s.id.toString() === selectedSetorTransfer)?.descricao || "Desconhecido";
                const secretariaDestino = secretarias.find(s => s.id.toString() === selectedSecretariaTransfer)?.descricao || "Desconhecida";
                const setorOrigem = protocolo.setor?.descricao || "Não informado";

                await movimentacaoService.create(protocolo.id, {
                    status_novo: protocolo.status.descricao,
                    observacao: `Transferência de: ${setorOrigem} para ${setorDestino} (${secretariaDestino}).\nMotivo: ${despacho || "Sem motivo informado"}`,
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
            loadData(protocolo.id);
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!protocolo) return null;

    return (

        <div className="container mx-auto px-4 py-6 max-w-[1600px]">
            <ProtocoloHeader protocolo={protocolo} />

            <div className="space-y-8">
                {/* Dados do Protocolo */}
                <Card>
                    <CardContent className="pt-6">
                        <Tabs value={infoTab} onValueChange={setInfoTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="dados">Dados do Protocolo</TabsTrigger>
                                <TabsTrigger value="anexos">Anexos ({protocolo.anexos?.length || 0})</TabsTrigger>
                            </TabsList>

                            <TabsContent value="dados">
                                <ProtocoloInfo protocolo={protocolo} />
                            </TabsContent>

                            <TabsContent value="anexos">
                                <ProtocoloDocumentos protocolo={protocolo} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                <ProtocoloTramitacao
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    statusList={statusList}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    despacho={despacho}
                    setDespacho={setDespacho}
                    anexoDespacho={anexoDespacho}
                    handleFileChange={handleFileChange}
                    handleRemoveFile={handleRemoveFile}
                    secretarias={secretarias}
                    setores={setores}
                    selectedSecretariaTransfer={selectedSecretariaTransfer}
                    handleSecretariaTransferChange={handleSecretariaTransferChange}
                    selectedSetorTransfer={selectedSetorTransfer}
                    setSelectedSetorTransfer={setSelectedSetorTransfer}
                    onSave={handleSave}
                    isSaving={isSaving}
                    onCancel={() => navigate("/admin/protocolos")}
                    movimentacoes={protocolo.movimentacoes}
                />
            </div>
        </div>
    );
};

export default ProtocoloDetalhes;
