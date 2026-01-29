
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Movimentacoes = () => {
    return (
        <div className="w-full">
            <div className="container mx-auto px-4 py-6 max-w-[1600px]">
                <h1 className="text-3xl font-bold mb-6">Movimentações</h1>
                <div className="grid gap-6">
                    <Card>
                        <CardHeader className="p-4 pb-2">
                            <CardTitle>Gerenciar Movimentações</CardTitle>
                            <CardDescription>Visualize e gerencie as movimentações dos protocolos.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-muted-foreground">Em desenvolvimento...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Movimentacoes;
