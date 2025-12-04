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
import { setorService, Setor } from "@/services/setorService";
import { documentoNecessarioService, DocumentoNecessario } from "@/services/documentoNecessarioService";
import { Plus, Pencil, Trash2, Loader2, FileQuestion } from "lucide-react";
import {
    DataTableFilterTrigger,
    DataTableFilterContent,
    useDataTableFilter,
    FilterColumn,
    ActiveFilter
} from "@/components/DataTableFilter";

const Solicitacoes = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

    const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
    const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<Solicitacao[]>([]);
    const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
    const [setores, setSetores] = useState<Setor[]>([]);
    const [documentosNecessarios, setDocumentosNecessarios] = useState<DocumentoNecessario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
    const [descricao, setDescricao] = useState("");
    const [secretariaId, setSecretariaId] = useState<string>("");
    const [setorId, setSetorId] = useState<string>("");
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
            refreshUser();
            loadData();
        }
    }, [isAuthenticated, refreshUser]);

    // Reactive update for Admin secretariat
    useEffect(() => {
        if (isDialogOpen && !selectedSolicitacao && user?.perfil?.descricao === 'Admin' && user?.setor?.secretaria) {
            const adminSecretariaId = user.setor.secretaria.id.toString();
            if (secretariaId !== adminSecretariaId) {
                setSecretariaId(adminSecretariaId);
            }
        }
    }, [user, isDialogOpen, selectedSolicitacao, secretariaId]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [solicitacoesData, secretariasData, setoresData, documentosData] = await Promise.all([
                solicitacaoService.getAll(),
                secretariaService.getAll(),
                setorService.getAll(),
                documentoNecessarioService.getAll(),
            ]);
            setSolicitacoes(solicitacoesData);
            setFilteredSolicitacoes(solicitacoesData);
            setSecretarias(secretariasData);
            setSetores(setoresData);
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

        // Check if user is Admin and restrict Secretaria
        if (user?.perfil?.descricao === 'Admin' && user?.setor?.secretaria) {
            setSecretariaId(user.setor.secretaria.id.toString());
        } else {
            setSecretariaId("");
        }

        setSetorId("");
        setSelectedDocumentos([]);
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (solicitacao: Solicitacao) => {
        setSelectedSolicitacao(solicitacao);
        setDescricao(solicitacao.descricao);

        if (user?.perfil?.descricao === 'Admin' && user?.setor?.secretaria) {
            setSecretariaId(user.setor.secretaria.id.toString());
        } else {
            setSecretariaId(solicitacao.secretaria_id.toString());
        }

        setSetorId(solicitacao.setor_id ? solicitacao.setor_id.toString() : "");
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
                setor_id: setorId ? parseInt(setorId) : undefined,
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

    const getSetorDescricao = (setorId: number) => {
        const setor = setores.find((s) => s.id === setorId);
        return setor?.descricao || "-";
    };

    const filterColumns: FilterColumn[] = [
        { key: "descricao", label: "Descrição", type: "text" },
        { key: "secretaria", label: "Secretaria", type: "text" },
        { key: "setor", label: "Setor", type: "text" },
    ];

    const handleFilterChange = (filters: ActiveFilter[]) => {
        if (filters.length === 0) {
            setFilteredSolicitacoes(solicitacoes);
            return;
        }

        const filtered = solicitacoes.filter((solicitacao) => {
            return filters.every((filter) => {
                let value = "";
                const filterValue = filter.value.toLowerCase();

                if (filter.key === "secretaria") {
                    value = (solicitacao.secretaria?.descricao || getSecretariaDescricao(solicitacao.secretaria_id)).toLowerCase();
                } else if (filter.key === "setor") {
                    value = (solicitacao.setor?.descricao || (solicitacao.setor_id ? getSetorDescricao(solicitacao.setor_id) : "")).toLowerCase();
                } else {
                    value = String(solicitacao[filter.key as keyof Solicitacao] || "").toLowerCase();
                }

                return value.includes(filterValue);
            });
        });

        setFilteredSolicitacoes(filtered);
    };

    const filter = useDataTableFilter({
        columns: filterColumns,
        onFilterChange: handleFilterChange
    });

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
                    <div className="flex gap-2">
                        <DataTableFilterTrigger filter={filter} />
                        <Button onClick={handleOpenCreate} size="icon" title="Nova Solicitação">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="mb-4 flex justify-end">
                    <DataTableFilterContent filter={filter} className="w-full max-w-3xl ml-auto" />
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredSolicitacoes.length === 0 ? (
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
                                    <TableHead>Setor</TableHead>
                                    <TableHead>Documentos</TableHead>
                                    <TableHead className="w-32 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSolicitacoes.map((solicitacao) => (
                                    <TableRow key={solicitacao.id}>
                                        <TableCell className="font-medium">{solicitacao.id}</TableCell>
                                        <TableCell>{solicitacao.descricao}</TableCell>
                                        <TableCell>
                                            {solicitacao.secretaria?.descricao || getSecretariaDescricao(solicitacao.secretaria_id)}
                                        </TableCell>
                                        <TableCell>
                                            {solicitacao.setor?.descricao || (solicitacao.setor_id ? getSetorDescricao(solicitacao.setor_id) : "-")}
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
                        {(!user?.setor?.secretaria || user?.perfil?.descricao !== 'Admin') && (
                            <div className="space-y-2">
                                <Label htmlFor="secretaria">Secretaria</Label>
                                <Select
                                    value={secretariaId}
                                    onValueChange={(value) => {
                                        setSecretariaId(value);
                                        setSetorId(""); // Clear sector when secretariat changes
                                        setErrors((prev) => ({ ...prev, secretaria: undefined }));
                                    }}
                                >
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
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="setor">Setor (Opcional)</Label>
                            <Select
                                value={setorId}
                                onValueChange={setSetorId}
                                disabled={(!secretariaId && !user?.setor?.secretaria) || setores.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={!secretariaId && !user?.setor?.secretaria ? "Selecione uma secretaria primeiro" : "Selecione um setor (opcional)"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {setores
                                        .filter(s => s.secretaria_id.toString() === secretariaId)
                                        .map((setor) => (
                                            <SelectItem key={setor.id} value={setor.id.toString()}>
                                                {setor.descricao}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
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
            </Dialog >

            {/* Delete Confirmation Dialog */}
            < AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} >
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
            </AlertDialog >
        </AdminLayout >
    );
};

export default Solicitacoes;
