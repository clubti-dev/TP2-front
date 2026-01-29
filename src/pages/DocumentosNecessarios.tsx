import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { documentoNecessarioService, DocumentoNecessario, CreateDocumentoNecessarioData } from "@/services/documentoNecessarioService";
import { Plus, Pencil, Trash2, Loader2, FileText } from "lucide-react";
import {
    DataTableFilterTrigger,
    DataTableFilterContent,
    useDataTableFilter,
    FilterColumn,
    ActiveFilter
} from "@/components/DataTableFilter";

const DocumentosNecessarios = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [documentos, setDocumentos] = useState<DocumentoNecessario[]>([]);
    const [filteredDocumentos, setFilteredDocumentos] = useState<DocumentoNecessario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDocumento, setSelectedDocumento] = useState<DocumentoNecessario | null>(null);
    const [descricao, setDescricao] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<{ descricao?: string }>({});

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
            const data = await documentoNecessarioService.getAll();
            setDocumentos(data);
            setFilteredDocumentos(data);
        } catch (err) {
            toast({
                title: "Erro",
                description: "Não foi possível carregar os documentos",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setSelectedDocumento(null);
        setDescricao("");
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (documento: DocumentoNecessario) => {
        setSelectedDocumento(documento);
        setDescricao(documento.descricao);
        setErrors({});
        setIsDialogOpen(true);
    };

    const handleOpenDelete = (documento: DocumentoNecessario) => {
        setSelectedDocumento(documento);
        setIsDeleteDialogOpen(true);
    };

    const handleSave = async () => {
        const newErrors: { descricao?: string } = {};

        if (!descricao.trim()) {
            newErrors.descricao = "Descrição é obrigatória";
        } else if (descricao.trim().length < 3) {
            newErrors.descricao = "Descrição deve ter pelo menos 3 caracteres";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsSaving(true);
            setErrors({});

            const data: CreateDocumentoNecessarioData = {
                descricao: descricao.trim(),
            };

            if (selectedDocumento) {
                await documentoNecessarioService.update(selectedDocumento.id, data);
                toast({
                    title: "Sucesso",
                    description: "Documento atualizado com sucesso",
                });
            } else {
                await documentoNecessarioService.create(data);
                toast({
                    title: "Sucesso",
                    description: "Documento criado com sucesso",
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
        if (!selectedDocumento) return;

        try {
            setIsSaving(true);
            await documentoNecessarioService.delete(selectedDocumento.id);
            toast({
                title: "Sucesso",
                description: "Documento excluído com sucesso",
                variant: "destructive",
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

    const filterColumns: FilterColumn[] = [
        { key: "descricao", label: "Descrição", type: "text" },
    ];

    const handleFilterChange = (filters: ActiveFilter[]) => {
        if (filters.length === 0) {
            setFilteredDocumentos(documentos);
            return;
        }

        const filtered = documentos.filter((documento) => {
            return filters.every((filter) => {
                const value = String(documento[filter.key as keyof DocumentoNecessario] || "").toLowerCase();
                const filterValue = filter.value.toLowerCase();
                return value.includes(filterValue);
            });
        });

        setFilteredDocumentos(filtered);
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
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Documentos Obrigatórios</h1>
                            <p className="text-muted-foreground">Gerenciar lista de documentos padrão</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <DataTableFilterTrigger filter={filter} />
                        <Button onClick={handleOpenCreate} size="icon" title="Novo Documento">
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
                    ) : filteredDocumentos.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Nenhum documento cadastrado
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">ID</TableHead>
                                    <TableHead>Descrição</TableHead>
                                    <TableHead className="w-32 text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocumentos.map((documento) => (
                                    <TableRow key={documento.id}>
                                        <TableCell className="font-medium">{documento.id}</TableCell>
                                        <TableCell>{documento.descricao}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenEdit(documento)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => handleOpenDelete(documento)}
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
                            {selectedDocumento ? "Editar Documento" : "Novo Documento"}
                        </DialogTitle>
                        <DialogDescription className="text-primary-foreground/80">
                            {selectedDocumento
                                ? "Altere os dados do documento"
                                : "Preencha os dados para criar um novo documento"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Input
                                id="descricao"
                                value={descricao}
                                onChange={(e) => {
                                    setDescricao(e.target.value);
                                    setErrors((prev) => ({ ...prev, descricao: undefined }));
                                }}
                                placeholder="Ex: RG e CPF"
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
                            {selectedDocumento ? "Salvar" : "Criar"}
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
                            Tem certeza que deseja excluir o documento "{selectedDocumento?.descricao}"?
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

export default DocumentosNecessarios;
