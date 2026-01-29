import { useEffect, useState } from "react";
import clubtiLogo from "@/assets/clubti_footer.png";
import { municipioService, Municipio } from "@/services/municipioService";

const AdminFooter = () => {
    const [municipio, setMunicipio] = useState<Municipio | null>(null);

    useEffect(() => {
        const fetchMunicipio = async () => {
            try {
                const data = await municipioService.get();
                setMunicipio(data);
            } catch (error) {
                console.error("Erro ao carregar dados do município:", error);
            }
        };
        fetchMunicipio();
    }, []);

    return (
        <footer className="fixed bottom-0 left-0 w-full h-10 border-t flex flex-row items-center justify-between gap-4 text-xs text-slate-300 px-6 py-2 bg-slate-900 z-50">
            <p>© {new Date().getFullYear()} {municipio?.nome_municipio || "Prefeitura Municipal"}. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
                <span className="text-xs">contato@clubti.com.br</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs">Desenvolvido por</span>
                    <a
                        href="https://www.clubti.com.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition-opacity"
                    >
                        <img src={clubtiLogo} alt="ClubTI - Soluções em Software" className="h-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default AdminFooter;
