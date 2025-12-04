import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { municipioService, Municipio } from "@/services/municipioService";
import { Settings, Upload, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getStorageUrl } from "@/utils/urlUtils";

const formSchema = z.object({
    nome_municipio: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    uf: z.string().length(2, "UF deve ter 2 caracteres"),
    codigo_ibge: z.string().optional(),
    cnpj_prefeitura: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    site: z.string().url("URL inválida").optional().or(z.literal("")),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cep: z.string().optional(),
    cor_primaria: z.string().optional(),
    cor_secundaria: z.string().optional(),
    cor_terciaria: z.string().optional(),
});

const Configuracoes = () => {
    const { toast } = useToast();
    const [municipio, setMunicipio] = useState<Municipio | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMunicipalityModalOpen, setIsMunicipalityModalOpen] = useState(false);
    const [isColorsModalOpen, setIsColorsModalOpen] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome_municipio: "",
            uf: "",
            codigo_ibge: "",
            cnpj_prefeitura: "",
            telefone: "",
            email: "",
            site: "",
            logradouro: "",
            numero: "",
            complemento: "",
            bairro: "",
            cep: "",
            cor_primaria: "#000000",
            cor_secundaria: "#ffffff",
            cor_terciaria: "#f59e0b", // Default accent color (amber-500)
        },
    });

    const fetchMunicipio = async () => {
        try {
            const data = await municipioService.get();
            setMunicipio(data);
            if (data) {
                form.reset({
                    nome_municipio: data.nome_municipio,
                    uf: data.uf,
                    codigo_ibge: data.codigo_ibge || "",
                    cnpj_prefeitura: data.cnpj_prefeitura || "",
                    telefone: data.telefone || "",
                    email: data.email || "",
                    site: data.site || "",
                    logradouro: data.logradouro || "",
                    numero: data.numero || "",
                    complemento: data.complemento || "",
                    bairro: data.bairro || "",
                    cep: data.cep || "",
                    cor_primaria: data.cor_primaria || "#000000",
                    cor_secundaria: data.cor_secundaria || "#ffffff",
                    cor_terciaria: data.cor_terciaria || "#f59e0b",
                });
            }
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível carregar os dados do município.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMunicipio();
    }, []);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value) formData.append(key, value);
            });

            if (logoFile) {
                formData.append("logo_municipio", logoFile);
            }

            await municipioService.save(formData);

            toast({ title: "Sucesso", description: "Dados do município salvos com sucesso." });
            setIsMunicipalityModalOpen(false);
            setIsColorsModalOpen(false);
            fetchMunicipio();
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao salvar dados do município.",
                variant: "destructive",
            });
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-8">Configurações</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Município
                        </CardTitle>
                        <CardDescription>Configure os dados do município.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {municipio ? (
                                    <div className="flex items-center gap-4">
                                        {municipio.logo_municipio ? (
                                            <img
                                                src={getStorageUrl(municipio.logo_municipio) || ''}
                                                alt="Logo Município"
                                                className="h-16 w-16 object-contain rounded-md border"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs text-center p-1">
                                                Sem Logo
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-medium text-lg">{municipio.nome_municipio} - {municipio.uf}</h3>
                                            <p className="text-sm text-muted-foreground">{municipio.cnpj_prefeitura}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Nenhum dado configurado.</p>
                                )}
                                <Button variant="outline" onClick={() => setIsMunicipalityModalOpen(true)}>
                                    {municipio ? "Editar Dados" : "Configurar Município"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Cores do Sistema
                        </CardTitle>
                        <CardDescription>Personalize as cores da interface.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm font-medium mb-2">Cor Primária</p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-10 h-10 rounded-full border shadow-sm"
                                        style={{ backgroundColor: municipio?.cor_primaria || '#000000' }}
                                    />
                                    <span className="text-sm text-muted-foreground">{municipio?.cor_primaria || 'Não definida'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Cor Secundária</p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-10 h-10 rounded-full border shadow-sm"
                                        style={{ backgroundColor: municipio?.cor_secundaria || '#ffffff' }}
                                    />
                                    <span className="text-sm text-muted-foreground">{municipio?.cor_secundaria || 'Não definida'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium mb-2">Cor Terciária</p>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-10 h-10 rounded-full border shadow-sm"
                                        style={{ backgroundColor: municipio?.cor_terciaria || '#f59e0b' }}
                                    />
                                    <span className="text-sm text-muted-foreground">{municipio?.cor_terciaria || 'Não definida'}</span>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setIsColorsModalOpen(true)} className="mt-4">
                            Alterar Cores
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Modal de Município */}
            <Dialog open={isMunicipalityModalOpen} onOpenChange={setIsMunicipalityModalOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Configurar Município</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 p-6 pt-2">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                <div className="space-y-4">
                                    <h4 className="font-medium border-b pb-2">Dados Gerais</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="nome_municipio"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nome do Município</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Ex: São Paulo" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="uf"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>UF</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Ex: SP" maxLength={2} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="codigo_ibge"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Cód. IBGE</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Ex: 3550308" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="cnpj_prefeitura"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>CNPJ da Prefeitura</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="00.000.000/0000-00" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormItem>
                                            <FormLabel>Logo (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoChange}
                                                    className="cursor-pointer"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium border-b pb-2">Contato</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="telefone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Telefone</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="(00) 0000-0000" />
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
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="contato@municipio.sp.gov.br" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="site"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Site</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="https://www.municipio.sp.gov.br" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium border-b pb-2">Endereço</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="cep"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>CEP</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="00000-000" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="logradouro"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Logradouro</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Rua, Avenida..." />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-3 gap-4">
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
                                                name="complemento"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-2">
                                                        <FormLabel>Complemento</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
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
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsMunicipalityModalOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">Salvar</Button>
                                </div>
                            </form>
                        </Form>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Modal de Cores */}
            <Dialog open={isColorsModalOpen} onOpenChange={setIsColorsModalOpen}>
                <DialogContent className="max-w-xl flex flex-col p-0">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle>Configurar Cores do Sistema</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 pt-2">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="cor_primaria"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cor Primária</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <Input type="color" {...field} className="w-12 h-12 p-1 cursor-pointer" />
                                                            <Input {...field} placeholder="#000000" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cor_secundaria"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cor Secundária</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <Input type="color" {...field} className="w-12 h-12 p-1 cursor-pointer" />
                                                            <Input {...field} placeholder="#ffffff" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cor_terciaria"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Cor Terciária</FormLabel>
                                                    <FormControl>
                                                        <div className="flex items-center gap-2">
                                                            <Input type="color" {...field} className="w-12 h-12 p-1 cursor-pointer" />
                                                            <Input {...field} placeholder="#f59e0b" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsColorsModalOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">Salvar Cores</Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

export default Configuracoes;
