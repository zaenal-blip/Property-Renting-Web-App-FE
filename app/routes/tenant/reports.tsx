import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Calendar as CalendarIcon,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { axiosInstance } from "~/lib/axios";
import { formatPrice } from "~/lib/utils";
import { DatePicker } from "~/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from "date-fns";

const COLORS = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];

export default function TenantReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 3600 * 1000), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const [calendarDate, setCalendarDate] = useState(new Date());

  // 1. Fetch Sales Report
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["sales-report", dateRange],
    queryFn: async () => {
      const res = await axiosInstance.get("/dashboard/sales-report", { params: dateRange });
      return res.data;
    },
  });

  // 2. Fetch Calendar Data
  const { data: calendarData, isLoading: calendarLoading } = useQuery({
    queryKey: ["calendar", calendarDate.getMonth(), calendarDate.getFullYear()],
    queryFn: async () => {
      const res = await axiosInstance.get("/dashboard/calendar", {
        params: { month: calendarDate.getMonth(), year: calendarDate.getFullYear() },
      });
      return res.data;
    },
  });

  const totalRevenue = salesData?.transactions?.reduce((acc: number, curr: any) => acc + Number(curr.totalPrice), 0) || 0;

  // ─── RENDER ─────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">Track your performance and room availability.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
             <div className="w-[180px]">
               <DatePicker
                 date={dateRange.startDate ? new Date(dateRange.startDate + "T00:00:00") : undefined}
                 setDate={(d) => setDateRange(prev => ({ ...prev, startDate: d ? format(d, "yyyy-MM-dd") : "" }))}
                 placeholder="Start date"
               />
             </div>
             <span className="text-muted-foreground font-medium">-</span>
             <div className="w-[180px]">
               <DatePicker
                 date={dateRange.endDate ? new Date(dateRange.endDate + "T00:00:00") : undefined}
                 setDate={(d) => setDateRange(prev => ({ ...prev, endDate: d ? format(d, "yyyy-MM-dd") : "" }))}
                 placeholder="End date"
               />
             </div>
             <Button variant="outline" className="gap-2 shrink-0">
                <Download className="h-4 w-4" /> Export CSV
             </Button>
          </div>
        </div>

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="sales" className="gap-2">
               <TrendingUp className="h-4 w-4" /> Sales Report
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
               <CalendarIcon className="h-4 w-4" /> Property Calendar
            </TabsTrigger>
          </TabsList>

          {/* ── SALES TAB ── */}
          <TabsContent value="sales" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <StatCard title="Total Revenue" value={formatPrice(totalRevenue)} icon={DollarSign} trend="+12.5%" />
               <StatCard title="Total Transactions" value={salesData?.transactions?.length || 0} icon={Search} trend="+5.2%" />
               <StatCard title="Active Properties" value={salesData?.byProperty?.length || 0} icon={Building2} />
               <StatCard title="Unique Customers" value={salesData?.byUser?.length || 0} icon={Users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <Card>
                  <CardHeader>
                     <CardTitle>Revenue by Property</CardTitle>
                     <CardDescription>Performance comparison across your properties</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData?.byProperty || []}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} />
                           <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                           <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v/1000000}M`} />
                           <Tooltip 
                              formatter={(value: any) => formatPrice(value)}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                           />
                           <Bar dataKey="_sum.totalPrice" fill="#F97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader>
                     <CardTitle>Sales Distribution</CardTitle>
                     <CardDescription>Revenue share by user</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={salesData?.byUser || []}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="_sum.totalPrice"
                              nameKey="name"
                           >
                              {salesData?.byUser?.map((_: any, index: number) => (
                                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                           </Pie>
                           <Tooltip formatter={(value: any) => formatPrice(value)} />
                        </PieChart>
                     </ResponsiveContainer>
                  </CardContent>
               </Card>
            </div>

            <Card>
               <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Detailed log of successfully completed orders</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left">
                        <thead>
                           <tr className="border-b">
                              <th className="pb-3 font-semibold">Date</th>
                              <th className="pb-3 font-semibold">Customer</th>
                              <th className="pb-3 font-semibold">Property</th>
                              <th className="pb-3 font-semibold">Stay Duration</th>
                              <th className="pb-3 font-semibold text-right">Amount</th>
                           </tr>
                        </thead>
                        <tbody>
                           {salesData?.transactions?.map((t: any) => (
                              <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                 <td className="py-4 text-muted-foreground">{format(new Date(t.createdAt), "dd MMM yyyy")}</td>
                                 <td className="py-4">
                                    <div className="font-medium">{t.user?.name}</div>
                                    <div className="text-xs text-muted-foreground">{t.user?.email}</div>
                                 </td>
                                 <td className="py-4 font-medium">{t.property?.name}</td>
                                 <td className="py-4">
                                    {Math.ceil((new Date(t.checkoutDate).getTime() - new Date(t.checkinDate).getTime()) / (1000*3600*24))} nights
                                 </td>
                                 <td className="py-4 text-right font-bold text-primary">{formatPrice(t.totalPrice)}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          {/* ── CALENDAR TAB ── */}
          <TabsContent value="calendar">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                   <div>
                      <CardTitle>Room Availability</CardTitle>
                      <CardDescription>Occupancy status for all your rooms</CardDescription>
                   </div>
                   <div className="flex items-center gap-4">
                      <Button variant="outline" size="icon" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1))}>
                         <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="font-bold min-w-[120px] text-center">{format(calendarDate, "MMMM yyyy")}</span>
                      <Button variant="outline" size="icon" onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1))}>
                         <ChevronRight className="h-4 w-4" />
                      </Button>
                   </div>
                </CardHeader>
                <CardContent>
                   <div className="overflow-x-auto border rounded-xl">
                      <div className="min-w-[1000px]">
                         {/* Calendar Grid */}
                         <div className="grid grid-cols-[200px_repeat(31,1fr)] bg-muted/30 border-b">
                            <div className="p-4 font-bold border-r">Room / Date</div>
                            {eachDayOfInterval({
                               start: startOfMonth(calendarDate),
                               end: endOfMonth(calendarDate)
                            }).map(day => (
                               <div key={day.toString()} className="p-2 text-center text-xs font-bold border-r">
                                  {format(day, "d")}
                                  <div className="text-[10px] text-muted-foreground font-normal">{format(day, "eee")}</div>
                               </div>
                            ))}
                         </div>

                         {/* Room Rows */}
                         {calendarData?.rooms?.map((room: any) => (
                            <div key={room.id} className="grid grid-cols-[200px_repeat(31,1fr)] border-b last:border-0 hover:bg-muted/10">
                               <div className="p-4 border-r">
                                  <div className="font-bold text-sm truncate">{room.name}</div>
                                  <div className="text-[10px] text-muted-foreground truncate">{room.property?.name}</div>
                               </div>
                               {eachDayOfInterval({
                                  start: startOfMonth(calendarDate),
                                  end: endOfMonth(calendarDate)
                               }).map(day => {
                                  const booking = calendarData?.reservations?.find((r: any) => 
                                     r.roomId === room.id && 
                                     isWithinInterval(day, { 
                                        start: new Date(r.reservation.checkinDate), 
                                        end: new Date(r.reservation.checkoutDate) 
                                     })
                                  );

                                  return (
                                     <div key={day.toString()} className="border-r h-12 relative group">
                                        {booking && (
                                           <div 
                                              className="absolute inset-x-0 inset-y-1 bg-primary/20 border-x-2 border-primary/50 cursor-pointer"
                                              title={`${booking.reservation.user.name}`}
                                           />
                                        )}
                                     </div>
                                  );
                               })}
                            </div>
                         ))}
                      </div>
                   </div>
                   <div className="mt-6 flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                         <div className="w-4 h-4 bg-primary/20 border border-primary/50 rounded" />
                         <span>Occupied</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="w-4 h-4 bg-background border border-border rounded" />
                         <span>Available</span>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: any) {
   return (
      <Card>
         <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
               <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Icon className="h-5 w-5" />
               </div>
               {trend && (
                  <Badge variant="outline" className="text-success border-success/20 bg-success/5 font-bold">
                     {trend}
                  </Badge>
               )}
            </div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
         </CardContent>
      </Card>
   );
}
