import { useEffect, useState } from "react";
import clubtiLogo from "@/assets/clubti_footer.png";
import { municipioService, Municipio } from "@/services/municipioService";

import { useSidebar } from "@/components/ui/sidebar";

const AdminFooter = () => {
    const [municipio, setMunicipio] = useState<Municipio | null>(null);
    const { state, isMobile } = useSidebar();

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
        <footer className="fixed bottom-0 left-0 w-full h-10 border-t border-slate-800 flex flex-row items-center bg-slate-900 z-50 text-xs text-slate-300">
            {/* Sidebar Width Spacer / Separator */}
            {!isMobile && (
                <div
                    className={`h-full border-r border-slate-700 transition-all duration-200 ease-linear ${state === "expanded" ? "w-[16rem]" : "w-[3rem]"
                        } flex-shrink-0 bg-slate-900`}
                />
            )}

            {/* Footer Content Area */}
            <div className="flex-1 flex items-center justify-between px-6">
                <p>© {new Date().getFullYear()} {municipio?.nome_municipio || "Prefeitura Municipal"}. Todos os direitos reservados.</p>
                <div className="flex items-center gap-4">
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
            </div>
        </footer>
    );
};

export default AdminFooter;
