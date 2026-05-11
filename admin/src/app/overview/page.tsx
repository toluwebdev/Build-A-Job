"use client";

import * as React from "react";
import { DashboardLayout } from "../dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, formatNumber, calculateTrend, formatRelativeTime } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Briefcase,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  X,
  PoundSterling,
  Activity,
  MessageSquare,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react";

// Date range options
const dateRanges = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7d" },
  { id: "30d", label: "30d" },
  { id: "90d", label: "90d" },
];

// Mock KPI data
const kpiData = [
  {
    label: "Active Jobs",
    value: 1247,
    previousValue: 1189,
    icon: Briefcase,
    sparkline: [1189, 1195, 1201, 1198, 1210, 1223, 1234, 1247],
  },
  {
    label: "Jobs Posted Today",
    value: 89,
    previousValue: 76,
    icon: Activity,
    sparkline: [76, 82, 78, 85, 91, 87, 92, 89],
  },
  {
    label: "Quotes Sent Today",
    value: 342,
    previousValue: 298,
    icon: MessageSquare,
    sparkline: [298, 310, 305, 318, 325, 331, 338, 342],
  },
  {
    label: "Leads Purchased",
    value: 156,
    previousValue: 142,
    icon: CheckCircle,
    sparkline: [142, 145, 148, 151, 149, 153, 155, 156],
  },
  {
    label: "New Customers",
    value: 45,
    previousValue: 38,
    icon: Users,
    sparkline: [38, 40, 42, 41, 43, 44, 46, 45],
  },
  {
    label: "New Trades",
    value: 23,
    previousValue: 19,
    icon: Star,
    sparkline: [19, 20, 21, 20, 22, 23, 24, 23],
  },
  {
    label: "Revenue Today",
    value: 8450,
    previousValue: 7200,
    icon: PoundSterling,
    isCurrency: true,
    sparkline: [7200, 7450, 7680, 7520, 7890, 8120, 8340, 8450],
  },
  {
    label: "Platform GMV",
    value: 2847500,
    previousValue: 2689000,
    icon: TrendingUp,
    isCurrency: true,
    sparkline: [2689000, 2712000, 2734000, 2751000, 2778000, 2802000, 2824000, 2847500],
  },
];

// Mock alerts
const initialAlerts = [
  {
    id: 1,
    severity: "critical" as const,
    message: "Unusual 40% drop in new job postings compared to last week",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 2,
    severity: "warning" as const,
    message: "Dispute rate exceeded 3% threshold in London region",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: 3,
    severity: "info" as const,
    message: "5 trades pending verification for over 7 days",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
  },
];

// Jobs funnel data
const funnelData = [
  { stage: "Submitted", count: 1247 },
  { stage: "Quotes Received", count: 892 },
  { stage: "Confirmed", count: 456 },
  { stage: "Completed", count: 234 },
];

// Revenue over time
const revenueData = [
  { date: "Mon", subscription: 2400, credits: 1800 },
  { date: "Tue", subscription: 2600, credits: 2100 },
  { date: "Wed", subscription: 2300, credits: 1950 },
  { date: "Thu", subscription: 2800, credits: 2400 },
  { date: "Fri", subscription: 3100, credits: 2800 },
  { date: "Sat", subscription: 2200, credits: 1500 },
  { date: "Sun", subscription: 2000, credits: 1200 },
];

// Top categories
const categoryData = [
  { category: "Driveway", jobs: 456 },
  { category: "Garden", jobs: 389 },
  { category: "Kitchen", jobs: 312 },
  { category: "Bathroom", jobs: 267 },
  { category: "Roofing", jobs: 198 },
];

// Real-time events
const initialEvents = [
  { id: 1, type: "job", message: "New job posted in Manchester", time: new Date(Date.now() - 1000 * 30) },
  { id: 2, type: "quote", message: "Quote received for job #4521", time: new Date(Date.now() - 1000 * 120) },
  { id: 3, type: "review", message: "5-star review submitted", time: new Date(Date.now() - 1000 * 180) },
  { id: 4, type: "job", message: "Job #4520 marked complete", time: new Date(Date.now() - 1000 * 300) },
  { id: 5, type: "quote", message: "Trade accepted quote request", time: new Date(Date.now() - 1000 * 450) },
];

// Sparkline component
function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = 20 - ((value - min) / range) * 20;
    return `${x},${y}`;
  });

  return (
    <svg width="60" height="24" className="overflow-visible">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={isPositive ? "#10b981" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  previousValue,
  icon: Icon,
  isCurrency,
  sparkline,
}: {
  label: string;
  value: number;
  previousValue: number;
  icon: React.ElementType;
  isCurrency?: boolean;
  sparkline: number[];
}) {
  const trend = calculateTrend(value, previousValue);
  const TrendIcon = trend.isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">
              {isCurrency ? formatCurrency(value) : formatNumber(value)}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <TrendIcon
                className={cn(
                  "h-3 w-3",
                  trend.isPositive ? "text-green-400" : "text-red-400"
                )}
              />
              <span
                className={cn(
                  trend.isPositive ? "text-green-400" : "text-red-400"
                )}
              >
                {trend.value.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Icon className="h-5 w-5 text-violet-400" />
            </div>
            <Sparkline data={sparkline} isPositive={trend.isPositive} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Alert Component
function AlertItem({
  severity,
  message,
  timestamp,
  onDismiss,
}: {
  severity: "critical" | "warning" | "info";
  message: string;
  timestamp: Date;
  onDismiss: () => void;
}) {
  const severityClasses = {
    critical: "alert-critical",
    warning: "alert-warning",
    info: "alert-info",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-3",
        severityClasses[severity]
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm">{message}</p>
        <p className="mt-1 text-xs opacity-70">{formatRelativeTime(timestamp)}</p>
      </div>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// Real-time Event Ticker
function EventTicker() {
  const [events, setEvents] = React.useState(initialEvents);

  React.useEffect(() => {
    // Simulate real-time events
    const interval = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        type: ["job", "quote", "review"][Math.floor(Math.random() * 3)],
        message: [
          "New job posted in Birmingham",
          "Quote accepted for job #4523",
          "Trade verification approved",
          "Customer review submitted",
          "Payment received",
        ][Math.floor(Math.random() * 5)],
        time: new Date(),
      };
      setEvents((prev) => [newEvent, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case "job":
        return <Briefcase className="h-3 w-3" />;
      case "quote":
        return <MessageSquare className="h-3 w-3" />;
      case "review":
        return <Star className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-4 px-4 py-2">
        <div className="flex items-center gap-2 text-xs font-medium text-violet-400">
          <Activity className="h-3 w-3 animate-pulse" />
          LIVE
        </div>
        <div className="flex flex-1 gap-6 overflow-hidden">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              {getEventIcon(event.type)}
              <span className="truncate">{event.message}</span>
              <Clock className="h-3 w-3" />
              <span className="text-xs">{formatRelativeTime(event.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const [selectedRange, setSelectedRange] = React.useState("today");
  const [alerts, setAlerts] = React.useState(initialAlerts);

  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16">
        {/* Date Range Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Platform Overview</h2>
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {dateRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setSelectedRange(range.id)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  selectedRange === range.id
                    ? "bg-violet-500 text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
            <MetricCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Alerts & Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Platform Health Alerts */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Platform Health Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                ) : (
                  alerts.map((alert) => (
                    <AlertItem
                      key={alert.id}
                      {...alert}
                      onDismiss={() => dismissAlert(alert.id)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Jobs Funnel */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Jobs Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="stage"
                    type="category"
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={[
                          "#8b5cf6",
                          "#06b6d4",
                          "#10b981",
                          "#22c55e",
                        ][index]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue Chart */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="subscription"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="url(#colorSub)"
                  />
                  <Area
                    type="monotone"
                    dataKey="credits"
                    stackId="1"
                    stroke="#06b6d4"
                    fill="url(#colorCred)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Categories & Map */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Categories */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="category"
                    type="category"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="jobs" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[250px] items-center justify-center rounded-lg bg-muted/50">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    UK Regional Heatmap
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (React Simple Maps integration)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real-time Ticker */}
      <EventTicker />
    </DashboardLayout>
  );
}
