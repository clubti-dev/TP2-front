import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { setorService, Setor, CreateSetorData } from "@/services/setorService";
import { secretariaService, Secretaria } from "@/services/secretariaService";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
    DataTableFilterTrigger,
    DataTableFilterContent,
    useDataTableFilter,
    FilterColumn,
    ActiveFilter
} from "@/components/DataTableFilter";

const formSchema = z.object({
    secretaria_id: z.string().min(1, "Selecione uma secretaria"),
    descricao: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
});

const Setores = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();

    const [setores, setSetores] = useState<Setor[]>([]);
    const [filteredSetores, setFilteredSetores] = useState<Setor[]>([]);
    const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            secretaria_id: "",
            descricao: "",
        },
    });

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/admin");
        }
    }, [isAuthenticated, authLoading, navigate]);

    const fetchData = async () => {
        try {
            const [setoresData, secretariasData] = await Promise.all([
                setorService.getAll(),
                secretariaService.getAll(),
            ]);
            setSetores(setoresData);
            setFilteredSetores(setoresData);
            setSecretarias(secretariasData);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            refreshUser();
            fetchData();
        }
    }, [isAuthenticated, refreshUser]);

    // Reactive update for Admin secretariat
    useEffect(() => {
        if (isModalOpen && !editingId && user?.perfil?.descricao === 'Admin' && user?.setor?.secretaria) {
            const adminSecretariaId = user.setor.secretaria.id.toString();
            const currentVal = form.getValues("secretaria_id");
            if (currentVal !== adminSecretariaId) {
                form.setValue("secretaria_id", adminSecretariaId);
            }
        }
    }, [user, isModalOpen, editingId, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const data: CreateSetorData = {
                secretaria_id: parseInt(values.secretaria_id),
                descricao: values.descricao,
            };

            if (editingId) {
                await setorService.update(editingId, data);
                toast({ title: "Sucesso", description: "Setor atualizado com sucesso." });
            } else {
                await setorService.create(data);
                toast({ title: "Sucesso", description: "Setor criado com sucesso." });
            }
            setIsModalOpen(false);
            fetchData();
            form.reset();
            setEditingId(null);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao salvar setor.",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (setor: Setor) => {
        setEditingId(setor.id);

        let secretariaId = setor.secretaria_id.toString();
        if (user?.perfil?.descricao === 'Admin' && user?.setor?.secretaria) {
            secretariaId = user.setor.secretaria.id.toString();
        }

        form.reset({
            secretaria_id: secretariaId,
            descricao: setor.descricao,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir este setor?")) {
            try {
                await setorService.delete(id);
                toast({ title: "Sucesso", description: "Setor excluído com sucesso." });
                fetchData();
            } catch (error) {
                toast({
                    title: "Erro",
                    description: "Erro ao excluir setor.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleNew = () => {
        setEditingId(null);

        let secretariaId = "";
        if (user?.perfil?.descricao === 'Admin' && user?.setor?.secretaria) {
            secretariaId = user.setor.secretaria.id.toString();
        }

        form.reset({
            secretaria_id: secretariaId,
            descricao: "",
        });
        setIsModalOpen(true);
    };

    const filterColumns: FilterColumn[] = [
        { key: "descricao", label: "Descrição", type: "text" },
        {
            key: "secretaria_id",
            label: "Secretaria",
            type: "select",
            options: secretarias.map(s => ({ label: s.sigla, value: s.sigla })) // Filtering by sigla for easier search
        },
    ];

    const handleFilterChange = (filters: ActiveFilter[]) => {
        if (filters.length === 0) {
            setFilteredSetores(setores);
            return;
        }

        const filtered = setores.filter((setor) => {
            return filters.every((filter) => {
                if (filter.key === "secretaria_id") {
                    // Check against secretaria sigla or descricao
                    const secretaria = secretarias.find(s => s.id === setor.secretaria_id);
                    return secretaria?.sigla === filter.value;
                }
                const value = String(setor[filter.key as keyof Setor] || "").toLowerCase();
                const filterValue = filter.value.toLowerCase();
                return value.includes(filterValue);
            });
        });

        setFilteredSetores(filtered);
    };

    const filter = useDataTableFilter({
        columns: filterColumns,
        onFilterChange: handleFilterChange
    });

    if (authLoading) return null;

    return (
        <AdminLayout>
            <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Setores</h1>
                        <p className="text-gray-500">Gerencie os setores das secretarias</p>
                    </div>
                    <div className="flex gap-2">
                        <DataTableFilterTrigger filter={filter} />
                        <Button onClick={handleNew} size="icon">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="mb-4 flex justify-end">
                    <DataTableFilterContent filter={filter} className="w-full max-w-3xl ml-auto" />
                </div>

                <div className="bg-white rounded-lg border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Secretaria</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredSetores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                                        Nenhum setor encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSetores.map((setor) => (
                                    <TableRow key={setor.id}>
                                        <TableCell className="font-medium">{setor.descricao}</TableCell>
                                        <TableCell>{setor.secretaria?.sigla || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(setor)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(setor.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="p-0 overflow-hidden">
                        <DialogHeader className="bg-primary text-primary-foreground p-6">
                            <DialogTitle className="text-2xl font-bold">{editingId ? "Editar Setor" : "Novo Setor"}</DialogTitle>
                        </DialogHeader>
                        <div className="p-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="secretaria_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Secretaria</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={user?.perfil?.descricao === 'Admin' && !!user?.setor?.secretaria}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione uma secretaria" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {secretarias.map((secretaria) => (
                                                            <SelectItem key={secretaria.id} value={secretaria.id.toString()}>
                                                                {secretaria.sigla} - {secretaria.descricao}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="descricao"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descrição</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Ex: Departamento de TI" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                            Cancelar
                                        </Button>
                                        <Button type="submit">Salvar</Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default Setores;
