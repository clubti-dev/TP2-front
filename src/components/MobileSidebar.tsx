import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { useState } from "react";

const MobileSidebar = () => {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r">
                <AdminSidebar mobile onClose={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    );
};

export default MobileSidebar;
