import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AdminFooter from "./AdminFooter";
import { SupportDialog } from "./SupportDialog";
import { Separator } from "@/components/ui/separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, ChevronDown } from "lucide-react";


export default function MainLayout() {
    const location = useLocation();
    // ... (existing code omitted for brevity in call, but will be preserved by replace_file_content logic if I target correctly)
    // Wait, replace_file_content needs exact target. I should do imports separately.


    const pathSegments = location.pathname.split("/").filter((segment) => segment);
    const { user, logout } = useAuth();

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
                <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="/admin/dashboard">Home</BreadcrumbLink>
                                </BreadcrumbItem>
                                {pathSegments.map((segment, index) => {
                                    const isLast = index === pathSegments.length - 1;
                                    const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
                                    // Skip "admin" segment in breadcrumb display if desired, or capitalize it
                                    if (segment === "admin") return null;

                                    return (
                                        <div key={path} className="flex items-center">
                                            <BreadcrumbSeparator className="hidden md:block" />
                                            <BreadcrumbItem>
                                                {isLast ? (
                                                    <BreadcrumbPage className="capitalize">{segment.replace("-", " ")}</BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink href={path} className="capitalize hidden md:block">
                                                        {segment.replace("-", " ")}
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                        </div>
                                    );
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-4">
                        <SupportDialog />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-10 w-full gap-2 px-2 hover:bg-accent hover:text-accent-foreground">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar} alt={user?.name} />
                                        <AvatarFallback>
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden flex-col items-start text-sm md:flex">
                                        <span className="font-semibold">{user?.name}</span>
                                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link to="/admin/perfil" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Meu Perfil</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Sair</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-6 pb-12">
                    <Outlet />
                </div>
            </main>
            <AdminFooter />
        </SidebarProvider>
    );
}
