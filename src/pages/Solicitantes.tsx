import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
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
    DialogTrigger,
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
import { useToast } from "@/components/ui/use-toast";
import { Solicitante, solicitanteService, CreateSolicitanteData } from "@/services/solicitanteService";
import { useDataTableFilter, DataTableFilterTrigger, DataTableFilterContent, FilterColumn, ActiveFilter } from "@/components/DataTableFilter";

const formSchema = z.object({
    cpf_cnpj: z.string().min(1, "CPF/CNPJ é obrigatório"),
    tipo_pessoa: z.enum(["Física", "Jurídica"]),
    nome: z.string().min(1, "Nome é obrigatório"),
    logradouro_tipo: z.string().min(1, "Tipo de logradouro é obrigatório"),
    logradouro_nome: z.string().min(1, "Nome do logradouro é obrigatório"),
    numero: z.string().min(1, "Número é obrigatório"),
    bairro: z.string().min(1, "Bairro é obrigatório"),
    cep: z.string().min(1, "CEP é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    uf: z.string().length(2, "UF deve ter 2 letras"),
    email: z.string().email("E-mail inválido"),
    fone: z.string().min(1, "Telefone é obrigatório"),
    complemento: z.string().optional(),
});



const Solicitantes = () => {
    const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);
    const [filteredSolicitantes, setFilteredSolicitantes] = useState<Solicitante[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cpf_cnpj: "",
            tipo_pessoa: "Física",
            nome: "",
            logradouro_tipo: "",
            logradouro_nome: "",
            numero: "",
            bairro: "",
            cep: "",
            cidade: "",
            uf: "",
            email: "",
            fone: "",
            complemento: "",
        },
    });

    const fetchSolicitantes = async () => {
        try {
            const data = await solicitanteService.getAll();
            setSolicitantes(data);
            setFilteredSolicitantes(data);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível carregar os solicitantes.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSolicitantes();
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (editingId) {
                await solicitanteService.update(editingId, values);
                toast({ title: "Sucesso", description: "Solicitante atualizado com sucesso." });
            } else {
                await solicitanteService.create(values as CreateSolicitanteData);
                toast({ title: "Sucesso", description: "Solicitante criado com sucesso." });
            }
            setIsModalOpen(false);
            fetchSolicitantes();
            form.reset();
            setEditingId(null);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao salvar solicitante. Verifique os dados.",
                variant: "destructive",
            });
        }
    };

    const handleEdit = (solicitante: Solicitante) => {
        setEditingId(solicitante.id);
        form.reset({
            cpf_cnpj: solicitante.cpf_cnpj,
            tipo_pessoa: solicitante.tipo_pessoa,
            nome: solicitante.nome,
            logradouro_tipo: solicitante.logradouro_tipo,
            logradouro_nome: solicitante.logradouro_nome,
            numero: solicitante.numero,
            bairro: solicitante.bairro,
            cep: solicitante.cep,
            cidade: solicitante.cidade,
            uf: solicitante.uf,
            email: solicitante.email,
            fone: solicitante.fone,
            complemento: solicitante.complemento || "",
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir este solicitante?")) {
            try {
                await solicitanteService.delete(id);
                toast({ title: "Sucesso", description: "Solicitante excluído com sucesso." });
                fetchSolicitantes();
            } catch (error) {
                toast({
                    title: "Erro",
                    description: "Erro ao excluir solicitante.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleNew = () => {
        setEditingId(null);
        form.reset({
            cpf_cnpj: "",
            tipo_pessoa: "Física",
            nome: "",
            logradouro_tipo: "",
            logradouro_nome: "",
            numero: "",
            bairro: "",
            cep: "",
            cidade: "",
            uf: "",
            email: "",
            fone: "",
            complemento: "",
        });
        setIsModalOpen(true);
    };

    const filterColumns: FilterColumn[] = [
        { key: "nome", label: "Nome", type: "text" },
        { key: "cpf_cnpj", label: "CPF/CNPJ", type: "text" },
        { key: "email", label: "E-mail", type: "text" },
        { key: "cidade", label: "Cidade", type: "text" },
    ];

    const handleFilterChange = (filters: ActiveFilter[]) => {
        if (filters.length === 0) {
            setFilteredSolicitantes(solicitantes);
            return;
        }

        const filtered = solicitantes.filter((solicitante) => {
            return filters.every((filter) => {
                const value = String(solicitante[filter.key as keyof Solicitante] || "").toLowerCase();
                const filterValue = filter.value.toLowerCase();
                return value.includes(filterValue);
            });
        });

        setFilteredSolicitantes(filtered);
    };

    const filter = useDataTableFilter({
        columns: filterColumns,
        onFilterChange: handleFilterChange
    });

    return (

        <div className="w-full">
            <div className="container mx-auto px-4 py-6 max-w-[1600px]">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Solicitantes</h1>
                        <p className="text-gray-500">Gerencie o cadastro de solicitantes</p>
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
                                <TableHead>Nome</TableHead>
                                <TableHead>CPF/CNPJ</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Cidade/UF</TableHead>
                                <TableHead>Contato</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredSolicitantes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        Nenhum solicitante encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSolicitantes.map((solicitante) => (
                                    <TableRow key={solicitante.id}>
                                        <TableCell className="font-medium">{solicitante.nome}</TableCell>
                                        <TableCell>{solicitante.cpf_cnpj}</TableCell>
                                        <TableCell>{solicitante.tipo_pessoa}</TableCell>
                                        <TableCell>{solicitante.cidade}/{solicitante.uf}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-xs">
                                                <span>{solicitante.email}</span>
                                                <span>{solicitante.fone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(solicitante)}>
                                                    <Pencil className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(solicitante.id)}>
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
                    <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
                        <DialogHeader className="bg-primary text-primary-foreground p-6 shrink-0">
                            <DialogTitle className="text-2xl font-bold">{editingId ? "Editar Solicitante" : "Novo Solicitante"}</DialogTitle>
                        </DialogHeader>
                        <div className="p-6 overflow-y-auto">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="tipo_pessoa"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo de Pessoa</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Física">Física</SelectItem>
                                                            <SelectItem value="Jurídica">Jurídica</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cpf_cnpj"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>CPF/CNPJ</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="nome"
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel>Nome Completo</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>E-mail</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="email" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="fone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Telefone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="col-span-2 border-t pt-4 mt-2">
                                            <h3 className="font-medium mb-4">Endereço</h3>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="cep"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>CEP</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="logradouro_tipo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo (Rua, Av, etc)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="logradouro_nome"
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel>Logradouro</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="numero"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Número</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="bairro"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bairro</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="complemento"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Complemento</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-3 gap-4 col-span-2">
                                            <FormField
                                                control={form.control}
                                                name="cidade"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormLabel>Cidade</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="uf"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>UF</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} maxLength={2} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
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
        </div>
    );
};

export default Solicitantes;
