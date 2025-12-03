import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const forgotPasswordSchema = z.object({
    email: z.string().email("E-mail inválido"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const EsqueciSenha = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const form = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsSubmitting(true);
        try {
            await authService.forgotPassword(data.email);
            setIsSent(true);
            toast({
                title: "E-mail enviado",
                description: "Verifique sua caixa de entrada para redefinir sua senha.",
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: error instanceof Error ? error.message : "Erro ao enviar e-mail",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Recuperar Senha</CardTitle>
                    <CardDescription className="text-center">
                        Digite seu e-mail para receber um link de redefinição de senha.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isSent ? (
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <Mail className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Enviamos um link de recuperação para o seu e-mail. Por favor, verifique sua caixa de entrada e spam.
                            </p>
                            <Button asChild className="w-full" variant="outline">
                                <Link to="/admin">Voltar para o Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    {...form.register("email")}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enviar Link
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link
                        to="/admin"
                        className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar para o Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default EsqueciSenha;
