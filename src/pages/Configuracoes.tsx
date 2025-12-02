import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Configuracoes = () => {
    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold mb-8">Configurações</h1>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Configurações do Sistema</CardTitle>
                        <CardDescription>Gerencie as configurações gerais do sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Em desenvolvimento...</p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Configuracoes;
