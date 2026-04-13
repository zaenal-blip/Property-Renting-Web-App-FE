import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  DoorOpen,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "~/lib/axios";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Types ──────────────────────────────────────────
interface DashboardSummary {
  totalProperties: number;
  totalRooms: number;
  totalRevenue: number;
  totalReservations: number;
  pendingPayments: number;
  confirmedReservations: number;
}

interface DashboardAnalytics {
  monthlyRevenue: { name: string; revenue: number }[];
  occupancyRate: number;
}

// ─── API ──────────────────────────────────────────
async function fetchSummary(
  startDate?: string,
  endDate?: string,
): Promise<DashboardSummary> {
  const { data } = await axiosInstance.get("/dashboard/summary", {
    params: { startDate, endDate },
  });
  return data;
}

async function fetchAnalytics(
  startDate?: string,
  endDate?: string,
): Promise<DashboardAnalytics> {
  const { data } = await axiosInstance.get("/dashboard/analytics", {
    params: { startDate, endDate },
  });
  return data;
}

// ─── Helpers ──────────────────────────────────────────
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCompactCurrency(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return `${v}`;
}

// ─── Components ──────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}

// ─── CustomTooltip ──────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function DashboardOverviewPage() {
  const [dateRange] = useState(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 6);
    from.setDate(1);
    return { from, to };
  });

  const {
    data: summary,
    isLoading: isLoadingSummary,
    isError: isSummaryError,
  } = useQuery<DashboardSummary>({
    queryKey: [
      "dashboard-summary",
      dateRange.from.toISOString(),
      dateRange.to.toISOString(),
    ],
    queryFn: () =>
      fetchSummary(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
      ),
  });

  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    isError: isAnalyticsError,
  } = useQuery<DashboardAnalytics>({
    queryKey: [
      "dashboard-analytics",
      dateRange.from.toISOString(),
      dateRange.to.toISOString(),
    ],
    queryFn: () =>
      fetchAnalytics(
        dateRange.from.toISOString(),
        dateRange.to.toISOString(),
      ),
  });

  const stats = summary
    ? [
        {
          title: "Total Properties",
          value: summary.totalProperties,
          subtitle: `${summary.totalRooms} rooms total`,
          icon: Building2,
          color: "text-primary",
          bgColor: "bg-primary/10",
        },
        {
          title: "Total Revenue",
          value: formatCurrency(summary.totalRevenue),
          subtitle: "Confirmed & completed",
          icon: DollarSign,
          color: "text-emerald-600",
          bgColor: "bg-emerald-500/10",
        },
        {
          title: "Reservations",
          value: summary.totalReservations,
          subtitle: `${summary.confirmedReservations} confirmed`,
          icon: CalendarCheck,
          color: "text-blue-600",
          bgColor: "bg-blue-500/10",
        },
        {
          title: "Pending Payment",
          value: summary.pendingPayments,
          subtitle: "Awaiting payment",
          icon: Clock,
          color: "text-amber-600",
          bgColor: "bg-amber-500/10",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
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
        {isLoadingSummary
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : isSummaryError
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
                  transition={{ delay: i * 0.08 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor}`}
                      >
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.subtitle}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue Chart — takes 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Overview
                </CardTitle>
                <CardDescription className="mt-1">
                  Monthly revenue for the last 6 months
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-72 w-full" />
            ) : isAnalyticsError ||
              !analytics?.monthlyRevenue?.length ? (
              <div className="h-72 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No revenue data yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start receiving bookings to see analytics.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.monthlyRevenue}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      className="text-xs"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={formatCompactCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats — right column */}
        <div className="space-y-4">
          {/* Occupancy Rate Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Occupancy Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAnalytics ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="text-3xl font-bold">
                    {analytics?.occupancyRate ?? 0}%
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(analytics?.occupancyRate ?? 0, 100)}%`,
                      }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on last 6 months
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingSummary ? (
                <>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </>
              ) : summary ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" />
                      Properties
                    </div>
                    <span className="font-semibold">
                      {summary.totalProperties}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DoorOpen className="h-3.5 w-3.5" />
                      Total Rooms
                    </div>
                    <span className="font-semibold">{summary.totalRooms}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Confirmed
                    </div>
                    <span className="font-semibold text-emerald-600">
                      {summary.confirmedReservations}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      Pending
                    </div>
                    <span className="font-semibold text-amber-600">
                      {summary.pendingPayments}
                    </span>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
