"use client";

import * as React from "react";
import { DashboardLayout } from "../dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Download,
  Calendar,
  Mail,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  Star,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

// Acquisition data
const acquisitionData = [
  { month: "Jan", organic: 120, paid: 80, referral: 45, social: 60 },
  { month: "Feb", organic: 135, paid: 95, referral: 52, social: 72 },
  { month: "Mar", organic: 158, paid: 110, referral: 68, social: 85 },
  { month: "Apr", organic: 172, paid: 125, referral: 75, social: 92 },
  { month: "May", organic: 195, paid: 140, referral: 88, social: 105 },
  { month: "Jun", organic: 210, paid: 165, referral: 95, social: 118 },
];

// Funnel data
const funnelData = [
  { stage: "App Install", users: 10000, dropoff: 0 },
  { stage: "Account Created", users: 6500, dropoff: 35 },
  { stage: "Job Posted", users: 2800, dropoff: 57 },
  { stage: "Quote Received", users: 1850, dropoff: 34 },
  { stage: "Job Confirmed", users: 920, dropoff: 50 },
  { stage: "Job Completed", users: 780, dropoff: 15 },
];

// Retention data
const retentionData = [
  { cohort: "Jan 2024", week0: 100, week1: 68, week2: 52, week4: 38, week8: 28, week12: 22 },
  { cohort: "Feb 2024", week0: 100, week1: 72, week2: 55, week4: 42, week8: 32, week12: 25 },
  { cohort: "Mar 2024", week0: 100, week1: 75, week2: 58, week4: 45, week8: 35, week12: 28 },
  { cohort: "Apr 2024", week0: 100, week1: 78, week2: 62, week4: 48, week8: 38, week12: null },
  { cohort: "May 2024", week0: 100, week1: 80, week2: 65, week4: 52, week8: null, week12: null },
];

// NPS data
const npsData = [
  { month: "Jan", score: 42, promoters: 55, passives: 30, detractors: 15 },
  { month: "Feb", score: 45, promoters: 58, passives: 28, detractors: 14 },
  { month: "Mar", score: 48, promoters: 60, passives: 28, detractors: 12 },
  { month: "Apr", score: 52, promoters: 63, passives: 26, detractors: 11 },
  { month: "May", score: 55, promoters: 65, passives: 25, detractors: 10 },
  { month: "Jun", score: 58, promoters: 68, passives: 24, detractors: 8 },
];

// Lead quality data
const leadQualityData = [
  { category: "Driveway", avgQuote: 8, conversion: 72, quality: 4.5 },
  { category: "Garden", avgQuote: 6, conversion: 68, quality: 4.2 },
  { category: "Kitchen", avgQuote: 12, conversion: 58, quality: 4.7 },
  { category: "Bathroom", avgQuote: 10, conversion: 62, quality: 4.4 },
  { category: "Roofing", avgQuote: 5, conversion: 75, quality: 4.6 },
  { category: "Electrical", avgQuote: 7, conversion: 70, quality: 4.3 },
];

// NPS distribution
const npsDistribution = [
  { name: "Promoters", value: 65, color: "#10b981" },
  { name: "Passives", value: 25, color: "#f59e0b" },
  { name: "Detractors", value: 10, color: "#ef4444" },
];

// Scheduled reports
interface ScheduledReport {
  id: string;
  name: string;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  lastSent: string;
  active: boolean;
}

const initialScheduledReports: ScheduledReport[] = [
  {
    id: "RPT-001",
    name: "Daily Revenue Summary",
    frequency: "daily",
    recipients: ["admin@buildajob.co.uk", "finance@buildajob.co.uk"],
    lastSent: "2024-06-15T08:00:00Z",
    active: true,
  },
  {
    id: "RPT-002",
    name: "Weekly User Acquisition",
    frequency: "weekly",
    recipients: ["marketing@buildajob.co.uk"],
    lastSent: "2024-06-10T09:00:00Z",
    active: true,
  },
  {
    id: "RPT-003",
    name: "Monthly Platform Health",
    frequency: "monthly",
    recipients: ["exec@buildajob.co.uk", "cto@buildajob.co.uk"],
    lastSent: "2024-05-31T10:00:00Z",
    active: true,
  },
];

// Cohort retention heatmap cell
function RetentionCell({ value }: { value: number | null }) {
  if (value === null) return <div className="h-8 w-12 rounded bg-muted/30" />;
  
  const getColor = (v: number) => {
    if (v >= 60) return "bg-emerald-500/80";
    if (v >= 45) return "bg-emerald-500/60";
    if (v >= 35) return "bg-emerald-500/40";
    if (v >= 25) return "bg-emerald-500/30";
    return "bg-emerald-500/20";
  };
  
  return (
    <div className={cn("flex h-8 w-12 items-center justify-center rounded text-xs font-medium", getColor(value))}>
      {value}%
    </div>
  );
}

// Frequency badge
function FrequencyBadge({ frequency }: { frequency: ScheduledReport["frequency"] }) {
  const classes = {
    daily: "bg-blue-500/20 text-blue-400",
    weekly: "bg-violet-500/20 text-violet-400",
    monthly: "bg-amber-500/20 text-amber-400",
  };
  return (
    <Badge className={cn("capitalize", classes[frequency])}>
      <Calendar className="mr-1 h-3 w-3" />
      {frequency}
    </Badge>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = React.useState("acquisition");
  const [scheduledReports, setScheduledReports] = React.useState(initialScheduledReports);
  const [newReportName, setNewReportName] = React.useState("");
  const [newReportFrequency, setNewReportFrequency] = React.useState<ScheduledReport["frequency"]>("weekly");
  const [newReportRecipients, setNewReportRecipients] = React.useState("");

  const toggleReport = (id: string) => {
    setScheduledReports(prev =>
      prev.map(r => r.id === id ? { ...r, active: !r.active } : r)
    );
  };

  const deleteReport = (id: string) => {
    setScheduledReports(prev => prev.filter(r => r.id !== id));
  };

  const addReport = () => {
    if (!newReportName || !newReportRecipients) return;
    
    const newReport: ScheduledReport = {
      id: `RPT-${Date.now()}`,
      name: newReportName,
      frequency: newReportFrequency,
      recipients: newReportRecipients.split(",").map(e => e.trim()),
      lastSent: new Date().toISOString(),
      active: true,
    };
    
    setScheduledReports(prev => [...prev, newReport]);
    setNewReportName("");
    setNewReportRecipients("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics & Reports</h1>
            <p className="text-sm text-muted-foreground">
              Platform metrics, user insights, and scheduled reports
            </p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export All Data
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 lg:w-auto">
            <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
            <TabsTrigger value="funnel">Job Funnel</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="nps">NPS</TabsTrigger>
            <TabsTrigger value="leads">Lead Quality</TabsTrigger>
          </TabsList>

          {/* Acquisition Tab */}
          <TabsContent value="acquisition" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                      <Users className="h-5 w-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">New Users (MTD)</p>
                      <p className="text-2xl font-bold">{formatNumber(2847)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    +18.5% vs last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Target className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">CAC</p>
                      <p className="text-2xl font-bold">{formatCurrency(28)}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                    <TrendingDown className="h-3 w-3" />
                    -8.2% vs last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-2xl font-bold">7.8%</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    +1.2% vs last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <Star className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Top Channel</p>
                      <p className="text-2xl font-bold">Organic</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    42% of all acquisitions
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User Acquisition by Channel</CardTitle>
                <CardDescription>New user signups broken down by acquisition source</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={acquisitionData}>
                    <defs>
                      <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorReferral" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSocial" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="organic" stackId="1" stroke="#8b5cf6" fill="url(#colorOrganic)" />
                    <Area type="monotone" dataKey="paid" stackId="1" stroke="#06b6d4" fill="url(#colorPaid)" />
                    <Area type="monotone" dataKey="referral" stackId="1" stroke="#10b981" fill="url(#colorReferral)" />
                    <Area type="monotone" dataKey="social" stackId="1" stroke="#f59e0b" fill="url(#colorSocial)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funnel Tab */}
          <TabsContent value="funnel" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Completion Funnel</CardTitle>
                <CardDescription>User journey from app install to completed job</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={funnelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => formatNumber(v)} />
                    <YAxis dataKey="stage" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="users" radius={[0, 4, 4, 0]}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#8b5cf6", "#7c3aed", "#06b6d4", "#0891b2", "#10b981", "#059669"][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              {funnelData.slice(0, -1).map((stage, index) => (
                <Card key={stage.stage}>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{stage.stage} → {funnelData[index + 1].stage}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-2xl font-bold text-red-400">-{stage.dropoff}%</p>
                      <p className="text-sm text-muted-foreground">
                        {formatNumber(stage.users - funnelData[index + 1].users)} users lost
                      </p>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div 
                        className="h-2 rounded-full bg-red-400" 
                        style={{ width: `${stage.dropoff}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Retention Tab */}
          <TabsContent value="retention" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cohort Retention Analysis</CardTitle>
                <CardDescription>User retention by signup cohort over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="px-2 py-2 text-left text-xs font-medium text-muted-foreground">Cohort</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">Week 0</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">Week 1</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">Week 2</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">Week 4</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">Week 8</th>
                        <th className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">Week 12</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {retentionData.map((cohort) => (
                        <tr key={cohort.cohort}>
                          <td className="px-2 py-2 text-sm font-medium">{cohort.cohort}</td>
                          <td className="px-2 py-2"><RetentionCell value={cohort.week0} /></td>
                          <td className="px-2 py-2"><RetentionCell value={cohort.week1} /></td>
                          <td className="px-2 py-2"><RetentionCell value={cohort.week2} /></td>
                          <td className="px-2 py-2"><RetentionCell value={cohort.week4} /></td>
                          <td className="px-2 py-2"><RetentionCell value={cohort.week8} /></td>
                          <td className="px-2 py-2"><RetentionCell value={cohort.week12} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={[
                    { week: "W0", rate: 100 },
                    { week: "W1", rate: 75 },
                    { week: "W2", rate: 58 },
                    { week: "W4", rate: 45 },
                    { week: "W8", rate: 34 },
                    { week: "W12", rate: 25 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v) => [`${v}%`, "Retention"]} />
                    <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NPS Tab */}
          <TabsContent value="nps" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">Current NPS Score</p>
                  <p className="mt-2 text-6xl font-bold text-emerald-400">+58</p>
                  <Badge className="mt-2 bg-emerald-500/20 text-emerald-400">Excellent</Badge>
                  <div className="mt-4 flex items-center justify-center gap-1 text-xs text-green-400">
                    <TrendingUp className="h-3 w-3" />
                    +5.4 vs last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Response Distribution</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={npsDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {npsDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 text-xs">
                    {npsDistribution.map((item) => (
                      <div key={item.name} className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="mt-2 text-4xl font-bold">32%</p>
                  <p className="text-xs text-muted-foreground">of completed jobs</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Responses</span>
                      <span className="font-medium">1,247</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>This Month</span>
                      <span className="font-medium">312</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>NPS Score Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={npsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lead Quality Tab */}
          <TabsContent value="leads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lead Quality by Category</CardTitle>
                <CardDescription>Average quotes, conversion rates, and quality scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={leadQualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="avgQuote" fill="#8b5cf6" name="Avg Quotes" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="conversion" fill="#10b981" name="Conversion %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leadQualityData
                      .sort((a, b) => b.quality - a.quality)
                      .slice(0, 3)
                      .map((category, index) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-sm font-bold text-violet-400">
                              {index + 1}
                            </div>
                            <span className="font-medium">{category.category}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{category.quality}/5</p>
                              <p className="text-xs text-muted-foreground">Quality Score</p>
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400">{category.conversion}% conv.</Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Response Time</span>
                        <span className="font-medium">4.2/5</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-violet-500" style={{ width: "84%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Quote Accuracy</span>
                        <span className="font-medium">4.5/5</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-violet-500" style={{ width: "90%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Communication</span>
                        <span className="font-medium">4.3/5</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-violet-500" style={{ width: "86%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span className="font-medium">4.6/5</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-violet-500" style={{ width: "92%" }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Scheduled Reports Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-violet-400" />
              Scheduled Reports
            </CardTitle>
            <CardDescription>Configure automated report delivery</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add New Report */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="mb-4 text-sm font-medium">Create New Scheduled Report</p>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Report Name</label>
                  <Input
                    placeholder="e.g., Weekly Summary"
                    value={newReportName}
                    onChange={(e) => setNewReportName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Frequency</label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={newReportFrequency}
                    onChange={(e) => setNewReportFrequency(e.target.value as ScheduledReport["frequency"])}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs text-muted-foreground">Recipients (comma-separated)</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="email1@example.com, email2@example.com"
                      value={newReportRecipients}
                      onChange={(e) => setNewReportRecipients(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={addReport}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-3">
              {scheduledReports.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-4 transition-colors",
                    report.active ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Switch checked={report.active} onCheckedChange={() => toggleReport(report.id)} />
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <FrequencyBadge frequency={report.frequency} />
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {report.recipients.length} recipient{report.recipients.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Last sent</p>
                      <p>{new Date(report.lastSent).toLocaleDateString("en-GB")}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
