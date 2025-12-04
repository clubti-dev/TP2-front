import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    FolderPlus,
    ArrowRightLeft,
    UserCircle,
    FileQuestion,
    ChevronRight,
    LogOut,
    User,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { municipioService, Municipio } from "@/services/municipioService";
import { getStorageUrl } from "@/utils/urlUtils";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function AppSidebar() {
    const { user, logout } = useAuth();
    const location = useLocation();
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

    const sidebarItems = [
        {
            icon: LayoutDashboard,
            label: "Dashboard",
            href: "/admin/dashboard",
            roles: ["Master", "Admin", "Usuário"],
        },
        {
            icon: FileText,
            label: "Protocolos",
            href: "/admin/protocolos",
            roles: ["Master", "Admin", "Usuário"],
        },
        {
            icon: FolderPlus,
            label: "Cadastro",
            roles: ["Master", "Admin"],
            submenu: [
                { icon: Users, label: "Usuários", href: "/admin/usuarios", roles: ["Master", "Admin"] },
                { icon: UserCircle, label: "Solicitantes", href: "/admin/solicitantes", roles: ["Master", "Admin"] },
                { icon: FileQuestion, label: "Solicitações", href: "/admin/solicitacoes", roles: ["Master", "Admin"] },
                { icon: FileText, label: "Documentos Necessários", href: "/admin/documentos-necessarios", roles: ["Master", "Admin"] },
                { icon: ArrowRightLeft, label: "Movimentação", href: "/admin/movimentacoes", roles: ["Master", "Admin", "Usuário"] },
                { icon: FileText, label: "Secretarias", href: "/admin/secretarias", roles: ["Master"] },
                { icon: FolderPlus, label: "Setores", href: "/admin/setores", roles: ["Master", "Admin"] },
            ],
        },
        {
            icon: Settings,
            label: "Configurações",
            href: "/admin/configuracoes",
            roles: ["Master"],
        },
    ];

    const filteredItems = sidebarItems.filter((item) => {
        if (!user?.perfil) return false;
        if (item.roles && !item.roles.includes(user.perfil.descricao)) return false;
        if (item.submenu) {
            const filteredSubmenu = item.submenu.filter(
                (subItem) => !subItem.roles || subItem.roles.includes(user.perfil.descricao)
            );
            if (filteredSubmenu.length === 0) return false;
            item.submenu = filteredSubmenu;
        }
        return true;
    });

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="h-16 border-b flex items-center justify-center bg-sidebar-primary/5">
                {municipio?.logo_municipio ? (
                    <img
                        src={getStorageUrl(municipio.logo_municipio) || ""}
                        alt="Logo"
                        className="h-10 w-auto object-contain transition-all group-data-[collapsible=icon]:h-8"
                    />
                ) : (
                    <span className="text-xl font-bold text-primary transition-all group-data-[collapsible=icon]:hidden">
                        ClubTI
                    </span>
                )}
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredItems.map((item) => {
                                if (item.submenu) {
                                    return (
                                        <Collapsible key={item.label} asChild defaultOpen={false} className="group/collapsible">
                                            <SidebarMenuItem>
                                                <CollapsibleTrigger asChild>
                                                    <SidebarMenuButton tooltip={item.label}>
                                                        <item.icon />
                                                        <span>{item.label}</span>
                                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <SidebarMenuSub>
                                                        {item.submenu.map((subItem) => (
                                                            <SidebarMenuSubItem key={subItem.href}>
                                                                <SidebarMenuSubButton asChild isActive={location.pathname === subItem.href}>
                                                                    <Link to={subItem.href}>
                                                                        <subItem.icon className="h-4 w-4 mr-2" />
                                                                        <span>{subItem.label}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </CollapsibleContent>
                                            </SidebarMenuItem>
                                        </Collapsible>
                                    );
                                }

                                return (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton asChild isActive={location.pathname === item.href} tooltip={item.label}>
                                            <Link to={item.href}>
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-4">
                {/* User info moved to header */}
            </SidebarFooter>
        </Sidebar>
    );
}
