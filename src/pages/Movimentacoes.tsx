
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Movimentacoes = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Movimentações</h1>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Gerenciar Movimentações</CardTitle>
                        <CardDescription>Visualize e gerencie as movimentações dos protocolos.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Em desenvolvimento...</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Movimentacoes;
