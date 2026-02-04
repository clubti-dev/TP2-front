import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    selectedFile?: File | null;
    accept?: string;
    label?: string;
    className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    selectedFile,
    accept = ".pdf,.jpg,.jpeg,.png",
    label = "Clique ou arraste um arquivo aqui",
    className = ""
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    }, [onFileSelect]);

    const removeFile = useCallback((e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering the file input
        onFileSelect(null);
    }, [onFileSelect]);

    return (
        <div className="w-full">
            <div
                className={`
          relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer
          flex flex-col items-center justify-center text-center gap-2
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}
          ${selectedFile ? 'border-success/50 bg-success/5' : ''}
          ${className}
        `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload-input')?.click()}
            >
                <input
                    type="file"
                    id="file-upload-input"
                    className="hidden"
                    accept={accept}
                    onChange={handleChange}
                />

                {selectedFile ? (
                    <div className="w-full flex items-center justify-between bg-card p-3 rounded-lg border shadow-sm animate-fade-in">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-success flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Pronto
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={removeFile}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-2">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Suporta: {accept.replace(/\./g, ' ').toUpperCase()}
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
