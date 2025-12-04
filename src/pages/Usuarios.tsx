import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/AdminLayout";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usuarioService, Usuario, UsuarioInput } from "@/services/usuarioService";
import { Loader2, Plus, Pencil, Trash2, Users } from "lucide-react";
import { useDataTableFilter, DataTableFilterTrigger, DataTableFilterContent, FilterColumn, ActiveFilter } from "@/components/DataTableFilter";

import { secretariaService, Secretaria } from "@/services/secretariaService";
import { setorService, Setor } from "@/services/setorService";
import { perfilService, Perfil } from "@/services/perfilService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Usuarios = () => {
  const { user: currentUser, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [secretarias, setSecretarias] = useState<Secretaria[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [selectedSecretaria, setSelectedSecretaria] = useState<string>("");
  const [selectedSetor, setSelectedSetor] = useState<string>("");
  const [selectedPerfil, setSelectedPerfil] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Helper function to get badge class based on profile
  const getPerfilBadgeClass = (descricao: string) => {
    const lower = descricao.toLowerCase();
    if (lower.includes('master')) {
      return 'bg-orange-500 text-white hover:bg-orange-600';
    }
    if (lower.includes('admin')) {
      return 'bg-black text-white hover:bg-gray-800';
    }
    if (lower.includes('usuário') || lower.includes('usuario')) {
      return 'bg-yellow-500 text-black hover:bg-yellow-600';
    }
    return 'bg-gray-200 text-gray-800';
  };

  const loadUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await usuarioService.getAll();
      setUsuarios(data);
      setFilteredUsuarios(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecretarias = async () => {
    try {
      const data = await secretariaService.getAll();
      setSecretarias(data);
    } catch (error) {
      console.error("Erro ao carregar secretarias:", error);
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

  const loadPerfis = async () => {
    try {
      const data = await perfilService.getAll();
      setPerfis(data);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    }
  };

  useEffect(() => {
    loadSecretarias();
    loadPerfis();
  }, []);

  const handleSecretariaChange = (value: string) => {
    setSelectedSecretaria(value);
    setSelectedSetor(""); // Reset setor when secretaria changes
    if (value) {
      loadSetores(Number(value));
    } else {
      setSetores([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshUser();
      loadUsuarios();
    }
  }, [isAuthenticated, refreshUser]);

  // Reactive update for Admin secretariat
  // Reactive update for Admin secretariat and profile
  useEffect(() => {
    console.log("Usuarios.tsx: Reactive Effect Triggered");
    console.log("currentUser:", currentUser);
    console.log("isDialogOpen:", isDialogOpen);
    console.log("selectedUsuario:", selectedUsuario);
    console.log("currentUser?.perfil?.descricao:", currentUser?.perfil?.descricao);
    console.log("currentUser?.setor?.secretaria:", currentUser?.setor?.secretaria);

    if (isDialogOpen && !selectedUsuario && currentUser?.perfil?.descricao === 'Admin') {
      console.log("Usuarios.tsx: Admin condition met");

      // Set Secretariat
      if (currentUser?.setor?.secretaria) {
        const secretariaId = currentUser.setor.secretaria.id.toString();
        console.log("Usuarios.tsx: Setting Secretariat ID:", secretariaId);
        if (selectedSecretaria !== secretariaId) {
          setSelectedSecretaria(secretariaId);
          loadSetores(Number(secretariaId));
        }
      } else {
        console.warn("Usuarios.tsx: Admin user missing secretaria!");
      }

      // Set Default Profile (Usuario)
      if (!selectedPerfil && perfis.length > 0) {
        const usuarioPerfil = perfis.find(p => p.descricao.toLowerCase().includes('usuário') || p.descricao.toLowerCase().includes('usuario'));
        if (usuarioPerfil) {
          console.log("Usuarios.tsx: Setting Default Profile:", usuarioPerfil.descricao);
          setSelectedPerfil(usuarioPerfil.id.toString());
        }
      }
    }
  }, [currentUser, isDialogOpen, selectedUsuario, selectedSecretaria, selectedPerfil, perfis]);

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const extractCPFNumbers = (value: string) => {
    return value.replace(/\D/g, "");
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const filterColumns: FilterColumn[] = [
    { key: "name", label: "Nome", type: "text" },
    { key: "cpf", label: "CPF", type: "text" },
    { key: "email", label: "E-mail", type: "text" },
  ];

  const handleFilterChange = (filters: ActiveFilter[]) => {
    if (filters.length === 0) {
      setFilteredUsuarios(usuarios);
      return;
    }

    const filtered = usuarios.filter((usuario) => {
      return filters.every((filter) => {
        const value = String(usuario[filter.key as keyof Usuario]).toLowerCase();
        const filterValue = filter.value.toLowerCase();
        return value.includes(filterValue);
      });
    });

    setFilteredUsuarios(filtered);
    setFilteredUsuarios(filtered);
  };

  const filter = useDataTableFilter({
    columns: filterColumns,
    onFilterChange: handleFilterChange
  });

  const handleOpenCreate = () => {
    setSelectedUsuario(null);
    setFormData({
      name: "",
      cpf: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    // Check if user is Admin and restrict Secretaria
    if (currentUser?.perfil?.descricao === 'Admin' && currentUser?.setor?.secretaria) {
      const secretariaId = currentUser.setor.secretaria.id.toString();
      setSelectedSecretaria(secretariaId);
      loadSetores(Number(secretariaId));

      // Auto-select "Usuário" profile
      const usuarioPerfil = perfis.find(p => p.descricao.toLowerCase().includes('usuário') || p.descricao.toLowerCase().includes('usuario'));
      if (usuarioPerfil) {
        setSelectedPerfil(usuarioPerfil.id.toString());
      }
    } else {
      setSelectedSecretaria("");
      setSetores([]);
    }

    setSelectedSetor("");
    setSelectedPerfil("");
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenEdit = async (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      name: usuario.name,
      cpf: formatCPF(usuario.cpf),
      email: usuario.email,
      password: "",
      confirmPassword: "",
    });

    // If user has a sector, we need to find the corresponding secretaria
    if (usuario.setor_id) {
      try {
        const allSetores = await setorService.getAll();
        const userSetor = allSetores.find(s => s.id === usuario.setor_id);

        if (userSetor) {
          setSelectedSecretaria(userSetor.secretaria_id.toString());
          await loadSetores(userSetor.secretaria_id);
          setSelectedSetor(userSetor.id.toString());
        }
      } catch (error) {
        console.error("Erro ao carregar dados do setor do usuário", error);
      }
    } else {
      // If editing a user without sector, check if current user is Admin to enforce restriction
      if (currentUser?.perfil?.descricao === 'Admin' && currentUser?.setor?.secretaria) {
        const secretariaId = currentUser.setor.secretaria.id.toString();
        setSelectedSecretaria(secretariaId);
        loadSetores(Number(secretariaId));
      } else {
        setSelectedSecretaria("");
        setSetores([]);
      }
      setSelectedSetor("");
    }

    // Set perfil if user has one
    if (usuario.perfil_id) {
      setSelectedPerfil(usuario.perfil_id.toString());
    } else {
      setSelectedPerfil("");
    }

    setErrors({});
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "cpf") {
      value = formatCPF(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    const cpfNumbers = extractCPFNumbers(formData.cpf);
    if (!cpfNumbers) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (cpfNumbers.length !== 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    // Senha obrigatória apenas para novo usuário
    if (!selectedUsuario) {
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (formData.password.length < 6) {
        newErrors.password = "Senha deve ter pelo menos 6 caracteres";
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não conferem";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const data: any = {
        name: formData.name.trim(),
        cpf: extractCPFNumbers(formData.cpf),
        email: formData.email.trim().toLowerCase(),
        setor_id: selectedSetor ? Number(selectedSetor) : null,
        perfil_id: selectedPerfil ? Number(selectedPerfil) : null,
      };

      // Incluir senha apenas se preenchida
      if (formData.password) {
        data.password = formData.password;
      }

      if (selectedUsuario) {
        await usuarioService.update(selectedUsuario.id, data);
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso",
        });
      } else {
        await usuarioService.create(data);
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso",
        });
      }

      setIsDialogOpen(false);
      loadUsuarios();
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
    if (!selectedUsuario) return;

    // Não permitir excluir o próprio usuário
    if (currentUser && selectedUsuario.id === currentUser.id) {
      toast({
        title: "Erro",
        description: "Você não pode excluir seu próprio usuário",
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      setIsSaving(true);
      await usuarioService.delete(selectedUsuario.id);
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso",
      });
      setIsDeleteDialogOpen(false);
      loadUsuarios();
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
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
              <p className="text-muted-foreground">Gerenciar usuários do sistema</p>
            </div>
          </div>
          <div className="flex gap-2">
            <DataTableFilterTrigger filter={filter} />
            <Button onClick={handleOpenCreate} size="icon" title="Novo Usuário">
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
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum usuário cadastrado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>SECRETARIA</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead className="w-32 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.id}</TableCell>
                    <TableCell>{usuario.name}</TableCell>
                    <TableCell>{formatCPF(usuario.cpf)}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      {usuario.setor?.secretaria?.sigla ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <span className="cursor-help underline decoration-dotted">
                              {usuario.setor.secretaria.sigla}
                            </span>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-2">
                            <p className="text-sm">{usuario.setor.secretaria.descricao}</p>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{usuario.setor?.descricao || '-'}</TableCell>
                    <TableCell>
                      {usuario.perfil ? (
                        <Badge className={getPerfilBadgeClass(usuario.perfil.descricao)}>
                          {usuario.perfil.descricao}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(usuario)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDelete(usuario)}
                          disabled={currentUser?.id === usuario.id}
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
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="bg-primary text-primary-foreground p-6">
            <DialogTitle className="text-2xl font-bold">
              {selectedUsuario ? "Editar Usuário" : "Novo Usuário"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              {selectedUsuario
                ? "Altere os dados do usuário. Deixe a senha em branco para manter a atual."
                : "Preencha os dados para criar um novo usuário"}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nome completo"
                maxLength={100}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => handleInputChange("cpf", e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@exemplo.com"
                maxLength={255}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Senha {selectedUsuario && "(deixe em branco para manter)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder={selectedUsuario ? "Nova senha" : "Senha"}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                placeholder="Confirme a senha"
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Secretaria</Label>
                <Select
                  value={selectedSecretaria}
                  onValueChange={handleSecretariaChange}
                  disabled={currentUser?.perfil?.descricao === 'Admin'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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

              <div className="space-y-2">
                <Label>Setor</Label>
                <Select
                  value={selectedSetor}
                  onValueChange={setSelectedSetor}
                  disabled={!selectedSecretaria}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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

            {currentUser?.perfil?.descricao !== 'Admin' && (
              <div className="space-y-2">
                <Label>Perfil</Label>
                <Select value={selectedPerfil} onValueChange={setSelectedPerfil}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis.map((perfil) => (
                      <SelectItem key={perfil.id} value={perfil.id.toString()}>
                        {perfil.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedUsuario ? "Salvar" : "Criar"}
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
              Tem certeza que deseja excluir o usuário "{selectedUsuario?.name}"?
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
      {/* Debug Info - Temporary */}
      <div className="mt-8 p-4 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-60">
        <p className="font-bold mb-2">Debug Info (Envie um print disso se houver erro):</p>
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
      </div>
    </AdminLayout>
  );
};

export default Usuarios;
