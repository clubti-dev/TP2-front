import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { Loader2, Upload, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    avatar: z.any().optional(),
});

const passwordSchema = z.object({
    current_password: z.string().min(1, "Senha atual é obrigatória"),
    password: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "As senhas não conferem",
    path: ["password_confirmation"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Perfil = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const formProfile = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
        },
    });

    const formPassword = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    useEffect(() => {
        if (user) {
            formProfile.reset({
                name: user.name,
                email: user.email,
            });
            if (user.avatar) {
                const storageUrl = import.meta.env.VITE_API_URL?.replace('/api', '') + '/storage/';
                setPreviewImage(`${storageUrl}${user.avatar}`);
            }
        }
    }, [user, formProfile]);

    const onProfileSubmit = async (data: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("email", data.email);
            if (data.avatar && data.avatar[0]) {
                formData.append("avatar", data.avatar[0]);
            }

            await authService.updateProfile(formData);

            toast({
                title: "Sucesso",
                description: "Perfil atualizado com sucesso!",
            });

            // Reload to update context
            window.location.reload();

        } catch (error) {
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Erro ao atualizar perfil",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordFormValues) => {
        setIsSubmitting(true);
        try {
            await authService.updatePassword({
                current_password: data.current_password,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });

            toast({
                title: "Sucesso",
                description: "Senha alterada com sucesso!",
            });
            formPassword.reset();
        } catch (error) {
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Erro ao alterar senha",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (

        <div className="w-full">
            <div className="container mx-auto px-4 py-6 max-w-[1600px]">
                <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>

                <Tabs defaultValue="dados" className="w-full max-w-3xl">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
                        <TabsTrigger value="senha">Alterar Senha</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dados">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dados Pessoais</CardTitle>
                                <CardDescription>
                                    Atualize suas informações de perfil e foto.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={formProfile.handleSubmit(onProfileSubmit)} className="space-y-6">

                                    <div className="flex flex-col items-center gap-4 sm:flex-row">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={previewImage || ""} />
                                            <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <Label htmlFor="avatar" className="cursor-pointer">
                                                <div className="flex items-center gap-2 rounded-md border p-2 hover:bg-accent w-fit">
                                                    <Upload className="h-4 w-4" />
                                                    <span>Alterar Foto</span>
                                                </div>
                                                <Input
                                                    id="avatar"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    {...formProfile.register("avatar")}
                                                    onChange={(e) => {
                                                        formProfile.register("avatar").onChange(e);
                                                        handleImageChange(e);
                                                    }}
                                                />
                                            </Label>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                JPG, PNG ou GIF. Máximo 2MB.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome Completo</Label>
                                        <Input id="name" {...formProfile.register("name")} />
                                        {formProfile.formState.errors.name && (
                                            <p className="text-sm text-destructive">{formProfile.formState.errors.name.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-mail</Label>
                                        <Input id="email" type="email" {...formProfile.register("email")} />
                                        {formProfile.formState.errors.email && (
                                            <p className="text-sm text-destructive">{formProfile.formState.errors.email.message}</p>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Salvar Alterações
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="senha">
                        <Card>
                            <CardHeader>
                                <CardTitle>Alterar Senha</CardTitle>
                                <CardDescription>
                                    Digite sua senha atual e a nova senha para atualizar.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={formPassword.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Senha Atual</Label>
                                        <Input id="current_password" type="password" {...formPassword.register("current_password")} />
                                        {formPassword.formState.errors.current_password && (
                                            <p className="text-sm text-destructive">{formPassword.formState.errors.current_password.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Nova Senha</Label>
                                        <Input id="password" type="password" {...formPassword.register("password")} />
                                        {formPassword.formState.errors.password && (
                                            <p className="text-sm text-destructive">{formPassword.formState.errors.password.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                                        <Input id="password_confirmation" type="password" {...formPassword.register("password_confirmation")} />
                                        {formPassword.formState.errors.password_confirmation && (
                                            <p className="text-sm text-destructive">{formPassword.formState.errors.password_confirmation.message}</p>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Alterar Senha
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Perfil;
