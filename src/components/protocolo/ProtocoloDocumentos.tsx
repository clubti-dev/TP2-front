import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Download, FileText, Image as ImageIcon, File } from "lucide-react";
import { Protocolo } from "@/services/protocoloService";
import { formatDate } from "@/utils/dateUtils";

interface ProtocoloDocumentosProps {
    protocolo: Protocolo;
}

export function ProtocoloDocumentos({ protocolo }: ProtocoloDocumentosProps) {
    const getBaseUrl = () => (import.meta.env.VITE_API_URL || "https://api-tp.clubti.com.br/api").replace(/\/api$/, '');

    return (
        <div className="space-y-6">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Documento</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Arquivo</TableHead>
                            <TableHead>Data</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* 1. List Required Documents */}
                        {protocolo.solicitacao?.documentos?.map((doc) => {
                            const anexo = protocolo.anexos?.find(a => a.documento_necessario_id === doc.id);
                            const isImage = anexo?.tipo?.startsWith('image/');
                            const fileUrl = anexo ? `${getBaseUrl()}/storage/${anexo.caminho}` : null;

                            return (
                                <TableRow key={`req-${doc.id}`}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            {doc.descricao}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {anexo ? (
                                            <Badge variant="success">Entregue</Badge>
                                        ) : (
                                            <Badge variant="destructive">Pendente</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {anexo ? (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {isImage ? <ImageIcon className="h-4 w-4" /> : <File className="h-4 w-4" />}
                                                {anexo.nome_original}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {anexo ? formatDate(anexo.created_at) : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {anexo && fileUrl && (
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild title="Visualizar">
                                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild title="Baixar">
                                                    <a href={fileUrl} download>
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {/* 2. List Extra Attachments */}
                        {protocolo.anexos?.filter(a => !a.documento_necessario_id).map((anexo) => {
                            const isImage = anexo.tipo?.startsWith('image/');
                            const fileUrl = `${getBaseUrl()}/storage/${anexo.caminho}`;

                            return (
                                <TableRow key={`extra-${anexo.id}`}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <File className="h-4 w-4 text-muted-foreground" />
                                            Outros Documentos
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">Extra</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            {isImage ? <ImageIcon className="h-4 w-4" /> : <File className="h-4 w-4" />}
                                            {anexo.nome_original}
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatDate(anexo.created_at)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild title="Visualizar">
                                                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild title="Baixar">
                                                <a href={fileUrl} download>
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {/* Empty State */}
                        {(!protocolo.solicitacao?.documentos?.length && !protocolo.anexos?.length) && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    Nenhum documento necessário ou anexo encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
