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


    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#3B82F6', '#10B981'];

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
                <h1 className="text-6xl font-bold tracking-tighter bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent w-fit mb-2">
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
                    <Card className="relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-blue-600 transition-colors">Protocolos Abertos</CardTitle>
                            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                                <FileText className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold text-foreground tracking-tight">{stats?.aberto || 0}</div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Aguardando análise</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Em Andamento */}
                <motion.div variants={item}>
                    <Card className="relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-yellow-600 transition-colors">Em Andamento</CardTitle>
                            <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                                <Clock className="h-5 w-5 text-yellow-600 group-hover:text-white transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold text-foreground tracking-tight">{stats?.em_andamento || 0}</div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Sendo processados</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Transferidos */}
                <motion.div variants={item}>
                    <Card className="relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-orange-600 transition-colors">Transferências</CardTitle>
                            <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                                <ArrowRightLeft className="h-5 w-5 text-orange-600 group-hover:text-white transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold text-foreground tracking-tight">{stats?.transferidos || 0}</div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Movimentações entre setores</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Concluído */}
                <motion.div variants={item}>
                    <Card className="relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-green-600 transition-colors">Finalizados</CardTitle>
                            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                                <CheckCircle className="h-5 w-5 text-green-600 group-hover:text-white transition-colors" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-4xl font-bold text-foreground tracking-tight">{stats?.concluido || 0}</div>
                            <p className="text-xs text-muted-foreground mt-2 font-medium">Processos encerrados</p>
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
                        <CardHeader className="p-4 pb-2">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <CardTitle>Setores por Secretaria</CardTitle>
                            </div>
                            <CardDescription>Quantidade de setores cadastrados em cada secretaria</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[450px] p-4 pt-0">
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
                                    <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                        <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            <CardTitle>Usuários por Secretaria</CardTitle>
                        </div>
                        <CardDescription>Distribuição da equipe entre as secretarias</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px] p-4 pt-0">
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
