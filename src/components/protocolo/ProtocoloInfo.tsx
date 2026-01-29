import { Label } from "@/components/ui/label";
import { Hash, Calendar, User, Building2, MessageSquare, MapPin } from "lucide-react";
import { Protocolo } from "@/services/protocoloService";
import { formatDate } from "@/utils/dateUtils";

interface ProtocoloInfoProps {
    protocolo: Protocolo;
}

export function ProtocoloInfo({ protocolo }: ProtocoloInfoProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Hash className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase font-bold">Número</Label>
                        <p className="text-base font-bold text-foreground">{protocolo.numero}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase font-bold">Data de Abertura</Label>
                        <p className="text-base font-bold text-foreground">{formatDate(protocolo.data_solicitacao)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <Label className="text-muted-foreground text-xs uppercase font-bold">Requerente</Label>
                        <p className="text-base font-bold text-foreground truncate" title={protocolo.solicitante?.nome}>
                            {protocolo.solicitante?.nome || "-"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <Label className="text-muted-foreground text-xs uppercase font-bold">Secretaria Atual</Label>
                        <p className="text-base font-bold text-foreground truncate" title={protocolo.solicitacao?.secretaria?.descricao}>
                            {protocolo.solicitacao?.secretaria?.descricao || "-"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 col-span-1 md:col-span-2 lg:col-span-1 xl:col-span-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <Label className="text-muted-foreground text-xs uppercase font-bold">Setor Atual</Label>
                        <p className="text-base font-bold text-foreground truncate" title={protocolo.setor?.descricao}>
                            {protocolo.setor?.descricao || "-"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-4 pt-2 border-t">
                <div className="flex items-start gap-3 flex-1">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                        <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <Label className="text-muted-foreground text-xs uppercase font-bold">Assunto</Label>
                        <p className="text-base font-bold text-foreground mt-1">
                            {protocolo.solicitacao?.descricao || "-"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
