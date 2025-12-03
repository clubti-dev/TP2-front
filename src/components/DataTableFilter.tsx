import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface FilterColumn {
    key: string;
    label: string;
    type?: "text" | "select" | "date";
    options?: { label: string; value: string }[];
}

export interface ActiveFilter {
    key: string;
    value: string;
    label: string;
}

interface UseDataTableFilterProps {
    columns: FilterColumn[];
    onFilterChange: (filters: ActiveFilter[]) => void;
}

export function useDataTableFilter({ columns, onFilterChange }: UseDataTableFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});
    const [activeCount, setActiveCount] = useState(0);

    const handleInputChange = (key: string, value: string) => {
        setFilterValues((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const calculateActiveFilters = (values: Record<string, string>) => {
        const newActiveFilters: ActiveFilter[] = [];
        let count = 0;
        columns.forEach((col) => {
            const value = values[col.key];
            if (value && value.trim() !== "" && value !== "all_clear_value") {
                newActiveFilters.push({
                    key: col.key,
                    value: value,
                    label: col.label,
                });
                count++;
            }
        });
        return { newActiveFilters, count };
    };

    const handleApply = () => {
        const { newActiveFilters, count } = calculateActiveFilters(filterValues);
        setActiveCount(count);
        onFilterChange(newActiveFilters);
        // Optional: Close on apply? User might want to keep refining.
        // setIsOpen(false); 
    };

    const handleClear = () => {
        setFilterValues({});
        setActiveCount(0);
        onFilterChange([]);
        setIsOpen(false);
    };

    const handleRemoveFilter = (key: string) => {
        const newValues = { ...filterValues };
        delete newValues[key];
        setFilterValues(newValues);

        const { newActiveFilters, count } = calculateActiveFilters(newValues);
        setActiveCount(count);
        onFilterChange(newActiveFilters);
    };

    return {
        isOpen,
        setIsOpen,
        filterValues,
        handleInputChange,
        handleApply,
        handleClear,
        handleRemoveFilter,
        activeCount,
        columns,
    };
}

// Types for the components
type FilterHook = ReturnType<typeof useDataTableFilter>;

interface DataTableFilterTriggerProps {
    filter: FilterHook;
    className?: string;
}

export function DataTableFilterTrigger({ filter, className }: DataTableFilterTriggerProps) {
    return (
        <Collapsible open={filter.isOpen} onOpenChange={filter.setIsOpen}>
            <CollapsibleTrigger asChild>
                <Button
                    variant={filter.isOpen ? "secondary" : "outline"}
                    size="icon"
                    title="Filtros"
                    className={cn("relative bg-accent/20 hover:bg-accent/40 border-accent/50", className)}
                >
                    <Filter className="h-4 w-4" />
                    {filter.activeCount > 0 && (
                        <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 justify-center rounded-full p-0 bg-primary text-primary-foreground border-2 border-background">
                            {filter.activeCount}
                        </Badge>
                    )}
                </Button>
            </CollapsibleTrigger>
        </Collapsible>
    );
}

interface DataTableFilterContentProps {
    filter: FilterHook;
    className?: string;
}

export function DataTableFilterContent({ filter, className }: DataTableFilterContentProps) {
    if (!filter.isOpen) return null;

    return (
        <div className={cn("w-full border rounded-lg bg-card p-4 shadow-sm animate-in slide-in-from-top-2 fade-in duration-200", className)}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium leading-none">Filtrar Resultados</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            Preencha os campos para refinar a busca.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={filter.handleClear}
                        className="text-muted-foreground hover:text-destructive"
                        disabled={Object.keys(filter.filterValues).length === 0}
                    >
                        Limpar Filtros
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filter.columns.map((col) => (
                        <div key={col.key} className="space-y-2">
                            <Label htmlFor={`filter-${col.key}`} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {col.label}
                            </Label>
                            {col.type === "select" && col.options ? (
                                <Select
                                    value={filter.filterValues[col.key] || ""}
                                    onValueChange={(val) => filter.handleInputChange(col.key, val)}
                                >
                                    <SelectTrigger id={`filter-${col.key}`} className="h-9">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_clear_value">Todos</SelectItem>
                                        {col.options.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    id={`filter-${col.key}`}
                                    value={filter.filterValues[col.key] || ""}
                                    onChange={(e) => filter.handleInputChange(col.key, e.target.value)}
                                    className="h-9"
                                    placeholder={`Buscar por ${col.label.toLowerCase()}...`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button onClick={filter.handleApply} className="w-full sm:w-auto">
                        <Search className="mr-2 h-4 w-4" />
                        Aplicar Filtros
                    </Button>
                </div>

                {/* Active badges inline if needed, or keep them in the trigger? 
            Let's show them here too for clarity if open 
        */}
                {filter.activeCount > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {filter.columns.map((col) => {
                            const val = filter.filterValues[col.key];
                            if (!val || val === "all_clear_value") return null;
                            return (
                                <Badge key={col.key} variant="secondary" className="flex items-center gap-1">
                                    <span className="font-normal">{col.label}:</span>
                                    <span>{val}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-3 w-3 ml-1 p-0 hover:bg-transparent"
                                        onClick={() => filter.handleRemoveFilter(col.key)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
