import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const DashboardSkeleton = () => {
    return (
        <div className="container mx-auto p-6 space-y-8 max-w-[1600px]">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-16 w-64 rounded-lg" />
                <Skeleton className="h-6 w-96 rounded-lg" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="relative overflow-hidden border border-border/50 bg-background/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-10 rounded-xl" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-10 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Chart Skeleton */}
                <div className="md:col-span-4">
                    <Card className="h-full">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <Skeleton className="h-4 w-64 mt-1" />
                        </CardHeader>
                        <CardContent className="h-[450px] p-4">
                            <div className="flex items-end justify-between h-full gap-2 px-2">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Skeleton key={i} className="w-full rounded-t-sm" style={{ height: `${Math.random() * 60 + 20}%` }} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Summary Skeleton */}
                <div className="md:col-span-3">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-center gap-8">
                            <Skeleton className="h-24 w-full rounded-xl" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
