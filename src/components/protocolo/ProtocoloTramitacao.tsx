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
    onCancel
}: ProtocoloTramitacaoProps) {
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
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="responder">Responder</TabsTrigger>
                        <TabsTrigger value="transferir">Transferir</TabsTrigger>
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
                                            {statusList.map((status) => (
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
        </Card>
    );
}
