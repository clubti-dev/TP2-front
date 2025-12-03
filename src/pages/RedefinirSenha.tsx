import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const resetPasswordSchema = z.object({
    password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
    password_confirmation: z.string().min(1, "Confirmação de senha é obrigatória"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "As senhas não conferem",
    path: ["password_confirmation"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const RedefinirSenha = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const token = searchParams.get("token");
    const email = searchParams.get("email");

    const form = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (!token || !email) {
            toast({
                title: "Link inválido",
                description: "O link de redefinição de senha é inválido ou expirou.",
                variant: "destructive",
            });
        }
    }, [token, email, toast]);

    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!token || !email) return;

        setIsSubmitting(true);
        try {
            await authService.resetPassword({
                token,
                email,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });
            setIsSuccess(true);
            toast({
                title: "Senha redefinida",
                description: "Sua senha foi alterada com sucesso.",
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Erro ao redefinir senha",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token || !email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Link Inválido</CardTitle>
                        <CardDescription>
                            O link que você acessou é inválido ou está incompleto.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link to="/esqueci-senha">Solicitar novo link</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Redefinir Senha</CardTitle>
                    <CardDescription className="text-center">
                        Crie uma nova senha para sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSuccess ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Sua senha foi redefinida com sucesso! Você já pode fazer login com a nova senha.
                            </p>
                            <Button asChild className="w-full">
                                <Link to="/admin">Ir para o Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Nova Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...form.register("password")}
                                />
                                {form.formState.errors.password && (
                                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirmar Nova Senha</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    {...form.register("password_confirmation")}
                                />
                                {form.formState.errors.password_confirmation && (
                                    <p className="text-sm text-destructive">{form.formState.errors.password_confirmation.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Redefinir Senha
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!isSuccess && (
                    <CardFooter className="flex justify-center">
                        <Link
                            to="/admin"
                            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Cancelar
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default RedefinirSenha;
