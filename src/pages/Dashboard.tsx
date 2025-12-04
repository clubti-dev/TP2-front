import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Clock, CheckCircle, Activity, ArrowUpRight } from "lucide-react";
import { dashboardService, DashboardStats } from "@/services/dashboardService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/admin");
        }
    }, [isAuthenticated, isLoading, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            loadStats();
        }
    }, [isAuthenticated]);

    const loadStats = async () => {
        try {
            const data = await dashboardService.getStats();
            setStats(data);
        } catch (error) {
            console.error("Erro ao carregar estatísticas", error);
            toast({
                title: "Erro",
                description: "Não foi possível carregar as estatísticas do dashboard.",
                variant: "destructive",
            });
        } finally {
            setLoadingStats(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground">Carregando...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Visão geral do sistema e atividades recentes.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Protocolos Abertos
                        </CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingStats ? "-" : stats?.aberto || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Aguardando análise inicial
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Em Andamento
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingStats ? "-" : stats?.em_andamento || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Sendo processados pelos setores
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Finalizados
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loadingStats ? "-" : stats?.concluido || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Concluídos este mês
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Atividades Recentes</CardTitle>
                        <CardDescription>
                            Últimas movimentações nos protocolos do sistema.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Protocolo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Data</TableHead>
                                    <TableHead className="text-right">Ação</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Placeholder data - will be connected to real API later */}
                                <TableRow>
                                    <TableCell className="font-medium">2024.001.234</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">Em Análise</Badge>
                                    </TableCell>
                                    <TableCell>Hoje, 14:30</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/protocolos/1')}>
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">2024.001.230</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-green-600 border-green-600">Concluído</Badge>
                                    </TableCell>
                                    <TableCell>Ontem, 10:15</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/protocolos/2')}>
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">2024.001.228</TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">Pendente</Badge>
                                    </TableCell>
                                    <TableCell>02/12/2024</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/protocolos/3')}>
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Resumo por Setor</CardTitle>
                        <CardDescription>
                            Distribuição de protocolos ativos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Secretaria de Obras</p>
                                    <p className="text-sm text-muted-foreground">12 protocolos ativos</p>
                                </div>
                                <div className="ml-auto font-medium">45%</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Secretaria de Saúde</p>
                                    <p className="text-sm text-muted-foreground">8 protocolos ativos</p>
                                </div>
                                <div className="ml-auto font-medium">30%</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Secretaria de Educação</p>
                                    <p className="text-sm text-muted-foreground">5 protocolos ativos</p>
                                </div>
                                <div className="ml-auto font-medium">15%</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Outros</p>
                                    <p className="text-sm text-muted-foreground">2 protocolos ativos</p>
                                </div>
                                <div className="ml-auto font-medium">10%</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
