import { Button } from "@/components/ui/button";
import { Printer, History, ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { idUtils } from "@/utils/idUtils";
import { Protocolo, protocoloService } from "@/services/protocoloService";
import { useToast } from "@/hooks/use-toast";

interface ProtocoloHeaderProps {
    protocolo: Protocolo;
}

export function ProtocoloHeader({ protocolo }: ProtocoloHeaderProps) {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handlePrint = async () => {
        if (!protocolo) return;
        try {
            const blob = await protocoloService.downloadCompletoPdf(protocolo.id);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            toast({
                title: "Erro",
                description: "Erro ao gerar PDF",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="mb-6 flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold">Dados do Protocolo</h1>
                <p className="text-sm text-muted-foreground">Informações da solicitação</p>
            </div>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-accent/20 hover:bg-accent/40 border-accent/50 text-primary"
                    onClick={handlePrint}
                    title="Imprimir Protocolo"
                >
                    <Printer className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-accent/20 hover:bg-accent/40 border-accent/50 text-primary"
                    onClick={() => navigate(`/admin/protocolos/${idUtils.encode(protocolo?.id)}/timeline`)}
                    title="Ver Histórico"
                >
                    <History className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-accent/20 hover:bg-accent/40 border-accent/50 text-primary"
                    onClick={() => navigate("/admin/protocolos")}
                    title="Voltar para lista"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
