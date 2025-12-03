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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { secretariaService, Secretaria, CreateSecretariaData } from "@/services/secretariaService";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  DataTableFilterTrigger,
  DataTableFilterContent,
  useDataTableFilter,
  FilterColumn,
  ActiveFilter
} from "@/components/DataTableFilter";

const formSchema = z.object({
  sigla: z.string().min(1, "Sigla é obrigatória").max(10, "Sigla deve ter no máximo 10 caracteres"),
  descricao: z.string().min(3, "Descrição deve ter pelo menos 3 caracteres"),
});

const Secretarias = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [filteredSecretarias, setFilteredSecretarias] = useState<Secretaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sigla: "",
      descricao: "",
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchSecretarias = async () => {
    try {
      const data = await secretariaService.getAll();
      console.log("Secretarias loaded:", data);
      setSecretarias(data);
      setFilteredSecretarias(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as secretarias.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchSecretarias();
    }
  }, [isAuthenticated]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingId) {
        await secretariaService.update(editingId, values);
        toast({ title: "Sucesso", description: "Secretaria atualizada com sucesso." });
      } else {
        await secretariaService.create(values as CreateSecretariaData);
        toast({ title: "Sucesso", description: "Secretaria criada com sucesso." });
      }
      setIsModalOpen(false);
      fetchSecretarias();
      form.reset();
      setEditingId(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar secretaria.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (secretaria: Secretaria) => {
    setEditingId(secretaria.id);
    form.reset({
      sigla: secretaria.sigla,
      descricao: secretaria.descricao,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta secretaria?")) {
      try {
        await secretariaService.delete(id);
        toast({ title: "Sucesso", description: "Secretaria excluída com sucesso." });
        fetchSecretarias();
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir secretaria.",
          variant: "destructive",
        });
      }
    }
  };

  const handleNew = () => {
    setEditingId(null);
    form.reset({
      sigla: "",
      descricao: "",
    });
    setIsModalOpen(true);
  };

  const filterColumns: FilterColumn[] = [
    { key: "sigla", label: "Sigla", type: "text" },
    { key: "descricao", label: "Descrição", type: "text" },
  ];

  const handleFilterChange = (filters: ActiveFilter[]) => {
    if (filters.length === 0) {
      setFilteredSecretarias(secretarias);
      return;
    }

    const filtered = secretarias.filter((secretaria) => {
      return filters.every((filter) => {
        const value = String(secretaria[filter.key as keyof Secretaria] || "").toLowerCase();
        const filterValue = filter.value.toLowerCase();
        return value.includes(filterValue);
      });
    });

    setFilteredSecretarias(filtered);
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
            <h1 className="text-3xl font-bold text-gray-900">Secretarias</h1>
            <p className="text-gray-500">Gerencie as secretarias municipais</p>
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
                <TableHead>Sigla</TableHead>
                <TableHead>Descrição</TableHead>
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
              ) : filteredSecretarias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    Nenhuma secretaria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSecretarias.map((secretaria) => (
                  <TableRow key={secretaria.id}>
                    <TableCell className="font-medium">{secretaria.sigla || "-"}</TableCell>
                    <TableCell>{secretaria.descricao}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(secretaria)}>
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(secretaria.id)}>
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
              <DialogTitle className="text-2xl font-bold">{editingId ? "Editar Secretaria" : "Nova Secretaria"}</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sigla"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sigla</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ex: SEMED" />
                        </FormControl>
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
                          <Input {...field} placeholder="Ex: Secretaria Municipal de Educação" />
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

export default Secretarias;
