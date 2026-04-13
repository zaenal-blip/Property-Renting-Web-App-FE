import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/axios";

interface DashboardSummary {
  totalProperties: number;
  totalRevenue: number;
  totalReservations: number;
  pendingConfirmations: number;
  revenueChart: { name: string; revenue: number }[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28" />
      </CardContent>
    </Card>
  );
}

async function fetchDashboardSummary(
  from: string,
  to: string,
): Promise<DashboardSummary> {
  const { data } = await axiosInstance.get(`/dashboard/summary`, {
    params: { from, to },
  });
  return data;
}

export default function DashboardOverviewPage() {
  const [dateRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 3);
    from.setDate(1);
    return { from, to };
  });

  const {
    data: summary,
    isLoading,
    isError,
  } = useQuery<DashboardSummary>({
    queryKey: [
      "dashboard-summary",
      dateRange.from.toISOString(),
      dateRange.to.toISOString(),
    ],
    queryFn: () =>
      fetchDashboardSummary(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
      ),
  });

  const stats = summary
    ? [
        {
          title: "Total Properties",
          value: summary.totalProperties,
          icon: Building2,
          color: "text-primary",
        },
        {
          title: "Total Revenue",
          value: formatCurrency(summary.totalRevenue),
          icon: DollarSign,
          color: "text-emerald-600",
        },
        {
          title: "Reservations",
          value: summary.totalReservations,
          icon: CalendarCheck,
          color: "text-blue-600",
        },
        {
          title: "Pending",
          value: summary.pendingConfirmations,
          icon: Users,
          color: "text-amber-600",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's a summary of your property business.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : isError
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      —
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Unable to load</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            : stats.map((stat, i) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
      </div>

      {/* Revenue Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <div className="h-80 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">
                  Revenue chart will appear here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start receiving bookings to see analytics.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
