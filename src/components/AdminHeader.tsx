import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { User, LogOut, ChevronDown, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileSidebar from "./MobileSidebar";
import { useState, useEffect } from "react";
import { municipioService, Municipio } from "@/services/municipioService";

const AdminHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/admin");
    };

    const isAdmin = user?.role === "admin";
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
        <header className="bg-primary border-b border-primary/10 px-8 h-[72px] flex justify-between items-center text-primary-foreground shadow-md">
            <div className="flex items-center gap-4">
                <MobileSidebar />
                <h2 className="text-lg font-semibold text-white hidden md:block">
                    {municipio?.nome_municipio || "Gestão Municipal"}
                </h2>
            </div>

            <div className="flex-1" /> {/* Spacer to push content to right */}

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary-foreground/10 text-primary-foreground hover:text-primary-foreground">
                            <div className="flex flex-col items-end mr-2">
                                <span className="text-sm font-medium">{user?.name}</span>
                                <span className="text-xs opacity-80">{user?.role}</span>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center overflow-hidden">
                                {user?.avatar ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/storage/${user.avatar}`}
                                        alt={user.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-80" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onClick={() => navigate("/admin/perfil")}>
                            <UserCircle className="mr-2 h-4 w-4" />
                            <span>Meu Perfil</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};

export default AdminHeader;
