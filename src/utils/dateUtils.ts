import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    try {
        if (dateString.includes('T')) {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
        }
        return format(new Date(dateString + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR });
    } catch {
        return dateString;
    }
};
