import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { solicitacaoService, Solicitacao, CreateSolicitacaoData } from "@/services/solicitacaoService";
import { secretariaService, Secretaria } from "@/services/secretariaService";
import { documentoNecessarioService, DocumentoNecessario } from "@/services/documentoNecessarioService";
import { Plus, Pencil, Trash2, Loader2, FileQuestion } from "lucide-react";

const Solicitacoes = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
    const [documentosNecessarios, setDocumentosNecessarios] = useState<DocumentoNecessario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
    const [descricao, setDescricao] = useState("");
    const [secretariaId, setSecretariaId] = useState<string>("");
    const [selectedDocumentos, setSelectedDocumentos] = useState<number[]>([]);
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
            const [solicitacoesData, secretariasData, documentosData] = await Promise.all([
                solicitacaoService.getAll(),
                secretariaService.getAll(),
                documentoNecessarioService.getAll(),
            ]);
            setSolicitacoes(solicitacoesData);
            setSecretarias(secretariasData);
            setDocumentosNecessarios(documentosData);
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
        setSelectedSolicitacao(null);
        setDescricao("");
        setSecretariaId("");
        setSelectedDocumentos([]);
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (solicitacao: Solicitacao) => {
        setSelectedSolicitacao(solicitacao);
        setDescricao(solicitacao.descricao);
        setSecretariaId(solicitacao.secretaria_id.toString());
        setSelectedDocumentos(solicitacao.documentos?.map(d => d.id) || []);
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (solicitacao: Solicitacao) => {
        setSelectedSolicitacao(solicitacao);
        setIsDeleteDialogOpen(true);
    };

    const handleDocumentoToggle = (documentoId: number) => {
        setSelectedDocumentos(prev =>
            prev.includes(documentoId)
                ? prev.filter(id => id !== documentoId)
                : [...prev, documentoId]
        );
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

            const data: CreateSolicitacaoData = {
                descricao: descricao.trim(),
                secretaria_id: parseInt(secretariaId),
                documentos_ids: selectedDocumentos,
            };

            if (selectedSolicitacao) {
                await solicitacaoService.update(selectedSolicitacao.id, data);
                toast({
                    title: "Sucesso",
                    description: "Solicitação atualizada com sucesso",
                });
            } else {
                await solicitacaoService.create(data);
                toast({
                    title: "Sucesso",
                    description: "Solicitação criada com sucesso",
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
        if (!selectedSolicitacao) return;

        try {
            setIsSaving(true);
            await solicitacaoService.delete(selectedSolicitacao.id);
            toast({
                title: "Sucesso",
                description: "Solicitação excluída com sucesso",
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
                            <FileQuestion className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Solicitações</h1>
                            <p className="text-muted-foreground">Gerenciar tipos de solicitação</p>
                        </div>
                    </div>
                    <Button onClick={handleOpenCreate} size="icon" title="Nova Solicitação">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : solicitacoes.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Nenhuma solicitação cadastrada
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">ID</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead>Secretaria</TableHead>
                                    <TableHead>Documentos</TableHead>
                                    <TableHead className="w-32 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {solicitacoes.map((solicitacao) => (
                                    <TableRow key={solicitacao.id}>
                                        <TableCell className="font-medium">{solicitacao.id}</TableCell>
                                        <TableCell>{solicitacao.descricao}</TableCell>
                                        <TableCell>
                                            {solicitacao.secretaria?.descricao || getSecretariaDescricao(solicitacao.secretaria_id)}
                                        </TableCell>
                                        <TableCell>
                                            {solicitacao.documentos && solicitacao.documentos.length > 0
                                                ? solicitacao.documentos.map(d => d.descricao).join(", ")
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEdit(solicitacao)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleOpenDelete(solicitacao)}
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
                            {selectedSolicitacao ? "Editar Solicitação" : "Nova Solicitação"}
                        </DialogTitle>
                        <DialogDescription className="text-primary-foreground/80">
                            {selectedSolicitacao
                                ? "Altere os dados da solicitação"
                                : "Preencha os dados para criar uma nova solicitação"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
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
                                placeholder="Ex: Solicitação de Alvará"
                                maxLength={100}
                            />
                            {errors.descricao && <p className="text-sm text-destructive">{errors.descricao}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Documentos Necessários</Label>
                            <div className="border rounded-md p-4 space-y-2">
                                {documentosNecessarios.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nenhum documento cadastrado</p>
                                ) : (
                                    documentosNecessarios.map((documento) => (
                                        <div key={documento.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`doc-${documento.id}`}
                                                checked={selectedDocumentos.includes(documento.id)}
                                                onCheckedChange={() => handleDocumentoToggle(documento.id)}
                                            />
                                            <Label htmlFor={`doc-${documento.id}`} className="text-sm font-normal cursor-pointer">
                                                {documento.descricao}
                                            </Label>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="px-6 pb-6">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {selectedSolicitacao ? "Salvar" : "Criar"}
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
                            Tem certeza que deseja excluir a solicitação "{selectedSolicitacao?.descricao}"?
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
        </AdminLayout>
    );
};

export default Solicitacoes;
