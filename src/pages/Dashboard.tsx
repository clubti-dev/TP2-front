import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Clock, CheckCircle, ArrowRightLeft, Building2, Users, PieChart as PieChartIcon, Activity } from "lucide-react";
import { dashboardService, DashboardStats } from "@/services/dashboardService";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from "recharts";

const Dashboard = () => {
    const { isAuthenticated, isLoading } = useAuth();
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

    if (isLoading || loadingStats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // Prepare data for charts
    const sectoresData = stats?.distribuicao_setores.map(s => ({
        name: s.descricao,
        value: s.setores_count
    })) || [];

    const usersData = stats?.distribuicao_usuarios.map(s => ({
        name: s.descricao,
        users: s.users_count
    })) || [];


    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-[1600px]">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2"
            >
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent w-fit">
                    Dashboard
                </h1>
                <p className="text-muted-foreground text-lg">
                    Visão geral e métricas do sistema
                </p>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
                {/* Aberto */}
                <motion.div variants={item}>
                    <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Protocolos Abertos</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats?.aberto || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Aguardando análise</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Em Andamento */}
                <motion.div variants={item}>
                    <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Em Andamento</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats?.em_andamento || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Sendo processados</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Transferidos */}
                <motion.div variants={item}>
                    <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Transferências</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                                <ArrowRightLeft className="h-4 w-4 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats?.transferidos || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Movimentações entre setores</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Concluído */}
                <motion.div variants={item}>
                    <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Finalizados</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stats?.concluido || 0}</div>
                            <p className="text-xs text-muted-foreground mt-1">Processos encerrados</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-7"
            >
                {/* Chart: Setores por Secretaria */}
                <motion.div variants={item} className="md:col-span-4">
                    <Card className="shadow-lg h-full">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <CardTitle>Setores por Secretaria</CardTitle>
                            </div>
                            <CardDescription>Quantidade de setores cadastrados em cada secretaria</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sectoresData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                    />
                                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                        {sectoresData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Secretarias Summary Card */}
                <motion.div variants={item} className="md:col-span-3">
                    <Card className="shadow-lg h-full flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                <CardTitle>Visão Geral da Organização</CardTitle>
                            </div>
                            <CardDescription>Métricas estruturais</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center gap-8">
                            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total de Secretarias</p>
                                        <p className="text-2xl font-bold">{stats?.total_secretarias || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total de Usuários</p>
                                        <p className="text-2xl font-bold">
                                            {stats?.distribuicao_usuarios.reduce((acc, curr) => acc + curr.users_count, 0) || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Users Distribution Chart */}
            <motion.div
                variants={item}
                initial="hidden"
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
            >
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <CardTitle>Usuários por Secretaria</CardTitle>
                        </div>
                        <CardDescription>Distribuição da equipe entre as secretarias</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usersData} layout="vertical" margin={{ left: 50 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}
                                />
                                <Bar dataKey="users" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20}>
                                    {usersData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>

        </div>
    );
};

export default Dashboard;
