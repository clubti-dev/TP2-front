import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Phone, Mail, HelpCircle } from "lucide-react";
import clubtiContactLogo from "@/assets/clubti_contact.png";

export function SupportDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
                    <HelpCircle className="h-4 w-4" />
                    Fale Conosco
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">Fale Conosco</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center space-y-6 py-6">
                    <div className="flex flex-col items-center gap-2">
                        <img
                            src={clubtiContactLogo}
                            alt="ClubTI"
                            className="h-16 w-auto object-contain"
                        />
                        <span className="text-sm font-medium text-muted-foreground tracking-wide">Soluções em Softwares</span>
                    </div>

                    <div className="flex flex-col space-y-4 w-full px-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-medium uppercase">Telefone / WhatsApp</span>
                                <span className="text-sm font-semibold select-all">(98) 99131-4044</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                            <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground font-medium uppercase">Email de Suporte</span>
                                <span className="text-sm font-semibold select-all">suporte@clubti.com.br</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
