import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Upload, FileStack, X, Save, Loader2 } from "lucide-react";
import { Status } from "@/services/statusService";
import { Secretaria } from "@/services/secretariaService";
import { Setor } from "@/services/setorService";
import { Movimentacao } from "@/services/protocoloService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, Circle, Clock, User, XCircle, Building2 } from "lucide-react";

interface ProtocoloTramitacaoProps {
    activeTab: string;
    setActiveTab: (value: string) => void;
    statusList: Status[];
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
    despacho: string;
    setDespacho: (value: string) => void;
    anexoDespacho: File | null;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRemoveFile: () => void;
    secretarias: Secretaria[];
    setores: Setor[];
    selectedSecretariaTransfer: string;
    handleSecretariaTransferChange: (value: string) => void;
    selectedSetorTransfer: string;
    setSelectedSetorTransfer: (value: string) => void;
    onSave: () => void;
    isSaving: boolean;
    onCancel: () => void;
    movimentacoes?: Movimentacao[];
}

export function ProtocoloTramitacao({
    activeTab,
    setActiveTab,
    statusList,
    selectedStatus,
    setSelectedStatus,
    despacho,
    setDespacho,
    anexoDespacho,
    handleFileChange,
    handleRemoveFile,
    secretarias,
    setores,
    selectedSecretariaTransfer,
    handleSecretariaTransferChange,
    selectedSetorTransfer,
    setSelectedSetorTransfer,
    onSave,
    isSaving,
    onCancel,
    movimentacoes = []
}: ProtocoloTramitacaoProps) {
    const getStatusIcon = (status?: string) => {
        const s = status?.toLowerCase() || "";
        if (s.includes("concluído") || s.includes("concluido")) return <CheckCircle2 className="h-6 w-6 text-green-500" />;
        if (s.includes("cancelado") || s.includes("indeferido")) return <XCircle className="h-6 w-6 text-red-500" />;
        if (s.includes("andamento") || s.includes("análise")) return <Clock className="h-6 w-6 text-yellow-500" />;
        return <Circle className="h-6 w-6 text-blue-500" />;
    };

    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes("aberto") || s.includes("novo")) return "text-blue-600 bg-blue-50 border-blue-100";
        if (s.includes("análise") || s.includes("andamento")) return "text-amber-600 bg-amber-50 border-amber-100";
        if (s.includes("concluído") || s.includes("deferido")) return "text-green-600 bg-green-50 border-green-100";
        if (s.includes("indeferido") || s.includes("cancelado")) return "text-red-600 bg-red-50 border-red-100";
        if (s.includes("transferido")) return "text-purple-600 bg-purple-50 border-purple-100";
        return "text-gray-600 bg-gray-50 border-gray-100";
    };

    return (
        <Card className="border-primary/20 shadow-md">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    Tramitação e Resposta
                </CardTitle>
                <CardDescription>Selecione a ação desejada</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="responder">Responder</TabsTrigger>
                        <TabsTrigger value="transferir">Transferir</TabsTrigger>
                        <TabsTrigger value="historico">Histórico</TabsTrigger>
                    </TabsList>

                    <TabsContent value="responder" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Status do Protocolo</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger className="w-full h-12 text-base bg-background">
                                            <SelectValue placeholder="Selecione o status..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusList.filter(s => s.descricao !== 'Aberto').map((status) => (
                                                <SelectItem key={status.id} value={status.id.toString()}>
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full shadow-sm"
                                                            style={{ backgroundColor: status.cor }}
                                                        />
                                                        <span className="text-base">{status.descricao}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="anexo" className="text-base font-semibold">Anexar Arquivo</Label>
                                    {!anexoDespacho ? (
                                        <div className="border-2 border-dashed rounded-xl p-4 hover:border-primary/50 transition-colors bg-muted/10">
                                            <label
                                                htmlFor="anexo"
                                                className="flex items-center justify-center gap-4 cursor-pointer py-2"
                                            >
                                                <Upload className="h-6 w-6 text-muted-foreground" />
                                                <div className="text-center sm:text-left">
                                                    <p className="text-base text-muted-foreground font-medium">
                                                        Clique para anexar
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        PDF, DOC, JPG (máx. 10MB)
                                                    </p>
                                                </div>
                                                <Input
                                                    id="anexo"
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 p-3 rounded-xl border bg-background">
                                            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center border">
                                                <FileStack className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-medium truncate">{anexoDespacho.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(anexoDespacho.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={handleRemoveFile}
                                                className="h-10 w-10 text-destructive hover:text-destructive"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="despacho" className="text-base font-semibold">Resposta / Despacho</Label>
                                <Textarea
                                    id="despacho"
                                    value={despacho}
                                    onChange={(e) => setDespacho(e.target.value)}
                                    placeholder="Digite a resposta ou observações..."
                                    rows={8}
                                    className="resize-none text-base p-4 bg-background focus-visible:ring-primary h-full min-h-[200px]"
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="transferir" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Secretaria de Destino</Label>
                                    <Select value={selectedSecretariaTransfer} onValueChange={handleSecretariaTransferChange}>
                                        <SelectTrigger className="w-full h-12 text-base bg-background">
                                            <SelectValue placeholder="Selecione a secretaria..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {secretarias.map((secretaria) => (
                                                <SelectItem key={secretaria.id} value={secretaria.id.toString()}>
                                                    {secretaria.descricao}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-base font-semibold">Setor de Destino</Label>
                                    <Select
                                        value={selectedSetorTransfer}
                                        onValueChange={setSelectedSetorTransfer}
                                        disabled={!selectedSecretariaTransfer}
                                    >
                                        <SelectTrigger className="w-full h-12 text-base bg-background">
                                            <SelectValue placeholder="Selecione o setor..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {setores.map((setor) => (
                                                <SelectItem key={setor.id} value={setor.id.toString()}>
                                                    {setor.descricao}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="motivo-transferencia" className="text-base font-semibold">Motivo da Transferência</Label>
                                <Textarea
                                    id="motivo-transferencia"
                                    value={despacho}
                                    onChange={(e) => setDespacho(e.target.value)}
                                    placeholder="Justifique a transferência..."
                                    rows={8}
                                    className="resize-none text-base p-4 bg-background focus-visible:ring-primary h-full min-h-[200px]"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Anexar Arquivo (Opcional)</Label>
                                <div className="border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors text-center cursor-pointer relative">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                    {!anexoDespacho ? (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Upload className="h-8 w-8" />
                                            <span className="text-sm font-medium">Clique ou arraste para anexar</span>
                                            <span className="text-xs">PDF, Word ou Imagens (max 10MB)</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <FileStack className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-base font-medium truncate">{anexoDespacho.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(anexoDespacho.size / 1024).toFixed(2)} KB
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveFile();
                                                }}
                                                className="h-10 w-10 text-destructive hover:text-destructive z-10"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="historico">
                        <div className="relative space-y-8 pl-2 before:absolute before:inset-0 before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent pb-8 pt-4">
                            {movimentacoes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground ml-8">
                                    Nenhuma movimentação registrada.
                                </div>
                            ) : (
                                movimentacoes.sort((a, b) => a.id - b.id).map((mov, index) => (
                                    <div key={mov.id} className="relative flex gap-6 group">
                                        {/* Linha vertical conectando os passos */}
                                        {index !== movimentacoes.length - 1 && (
                                            <div className="absolute left-[19px] top-10 h-full w-0.5 border-l-2 border-dashed border-border" />
                                        )}
                                        <div className={`
                                            absolute left-0 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full border ring-4 ring-background font-bold text-xs transition-colors
                                            ${index === movimentacoes.length - 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground'}
                                        `}>
                                            {index + 1}
                                        </div>

                                        <div className="flex flex-col gap-2 pl-10 w-full">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                                <span className="text-sm font-medium text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                                                    {format(new Date(mov.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                                </span>
                                            </div>

                                            <div className="rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md group-hover:border-primary/30">
                                                <div className="flex items-center justify-between mb-3 border-b pb-3 border-dashed">
                                                    <div className="flex items-center gap-3">
                                                        <span
                                                            className="inline-flex px-2.5 py-0.5 rounded-md text-sm font-bold text-white shadow-sm"
                                                            style={{ backgroundColor: mov.status?.cor || "#6b7280" }}
                                                        >
                                                            {mov.status?.descricao}
                                                        </span>
                                                        {mov.responsavel && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                                <User className="h-3 w-3 mr-1" />
                                                                {mov.responsavel.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        <tr>
                                                            <td className="w-24 font-medium text-muted-foreground align-top py-1">Secretaria:</td>
                                                            <td className="font-medium align-top py-1">
                                                                {mov.setor?.secretaria?.descricao || <span className="text-muted-foreground">-</span>}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className="w-24 font-medium text-muted-foreground align-top py-1">Setor:</td>
                                                            <td className="font-medium align-top py-1">
                                                                {mov.setor?.descricao || <span className="text-muted-foreground">-</span>}
                                                            </td>
                                                        </tr>

                                                        {mov.observacao && (
                                                            <tr>
                                                                <td className="w-24 font-medium text-muted-foreground align-top py-3">Despacho:</td>
                                                                <td className="align-top py-3">
                                                                    <div className="bg-muted/30 p-3 rounded-lg text-sm italic border-l-2 border-primary/50 text-muted-foreground">
                                                                        "{mov.observacao}"
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="bg-muted/30 p-6 flex justify-end gap-4">
                <Button variant="outline" size="lg" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button size="lg" className="min-w-[140px]" onClick={onSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar
                </Button>
            </CardFooter>
        </Card >
    );
}
