import { useState, useEffect } from "react";
import { municipioService, Municipio } from "@/services/municipioService";
import { getStorageUrl } from "@/utils/urlUtils";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Settings, ChevronDown, ChevronRight, FolderPlus, ArrowRightLeft, UserCircle, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
  { icon: FileText, label: "Protocolos", href: "/admin/protocolos" },
  {
    icon: FolderPlus,
    label: "Cadastro",
    submenu: [
      { icon: Users, label: "Usuários", href: "/admin/usuarios" },
      { icon: UserCircle, label: "Solicitantes", href: "/admin/solicitantes" },
      { icon: FileQuestion, label: "Solicitações", href: "/admin/solicitacoes" },
      { icon: FileText, label: "Documentos Necessários", href: "/admin/documentos-necessarios" },
      { icon: ArrowRightLeft, label: "Movimentação", href: "/admin/movimentacoes" },
      { icon: FileText, label: "Secretarias", href: "/admin/secretarias" },
      { icon: FolderPlus, label: "Setores", href: "/admin/setores" },
    ],
  },
  { icon: Settings, label: "Configurações", href: "/admin/configuracoes" },
];

interface AdminSidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const AdminSidebar = ({ mobile, onClose }: AdminSidebarProps) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState<string[]>(["Cadastro"]);
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

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleLinkClick = () => {
    if (mobile && onClose) {
      onClose();
    }
  };

  return (
    <aside className={cn(
      "flex flex-col w-64 bg-card border-r h-full",
      mobile ? "border-none" : "hidden md:flex h-screen sticky top-0"
    )}>
      <div className="h-[72px] flex flex-col justify-center items-center px-6 border-b">
        {municipio?.logo_municipio ? (
          <img
            src={getStorageUrl(municipio.logo_municipio) || ''}
            alt="Logo"
            className="h-12 w-auto object-contain"
          />
        ) : (
          <h1 className="text-xl font-bold text-primary">ClubTI</h1>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          if (item.submenu) {
            const isOpen = openSubmenus.includes(item.label);
            const isActive = item.submenu.some((sub) => location.pathname === sub.href);

            return (
              <Collapsible
                key={item.label}
                open={isOpen}
                onOpenChange={() => toggleSubmenu(item.label)}
                className="space-y-1"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between px-4 py-3 h-auto font-normal hover:bg-muted hover:text-foreground",
                      isActive ? "text-primary font-medium" : "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1">
                  {item.submenu.map((subItem) => {
                    const isSubActive = location.pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        to={subItem.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                          isSubActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                      >
                        <subItem.icon className="h-4 w-4" />
                        <span>{subItem.label}</span>
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>


    </aside>
  );
};

export default AdminSidebar;
