"use client";

import * as React from "react";
import { DashboardLayout } from "../dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Search,
  Download,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Tag,
  Plus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface Transaction {
  id: string;
  date: string;
  trade: string;
  type: "credit_purchase" | "subscription" | "refund";
  amount: number;
  balanceAfter: number;
  stripeId: string;
}

interface DiscountCode {
  id: string;
  code: string;
  discountPercent: number;
  usageCount: number;
  usageLimit: number;
  expiryDate: string;
  active: boolean;
}

const mockTransactions: Transaction[] = [
  {
    id: "TXN-001",
    date: "2024-05-20",
    trade: "Premier Paving Ltd",
    type: "subscription",
    amount: 99,
    balanceAfter: 549,
    stripeId: "pi_1234567890",
  },
  {
    id: "TXN-002",
    date: "2024-05-19",
    trade: "SJ Groundworks",
    type: "credit_purchase",
    amount: 250,
    balanceAfter: 480,
    stripeId: "pi_0987654321",
  },
  {
    id: "TXN-003",
    date: "2024-05-18",
    trade: "Elite Landscapes",
    type: "refund",
    amount: -50,
    balanceAfter: 630,
    stripeId: "re_1122334455",
  },
];

const mockDiscountCodes: DiscountCode[] = [
  {
    id: "DISC-001",
    code: "WELCOME20",
    discountPercent: 20,
    usageCount: 45,
    usageLimit: 100,
    expiryDate: "2024-12-31",
    active: true,
  },
  {
    id: "DISC-002",
    code: "SUMMER15",
    discountPercent: 15,
    usageCount: 78,
    usageLimit: 200,
    expiryDate: "2024-08-31",
    active: true,
  },
];

const revenueData = [
  { month: "Jan", pro: 4500, premium: 3200, credits: 2800 },
  { month: "Feb", pro: 5200, premium: 3800, credits: 3100 },
  { month: "Mar", pro: 4800, premium: 4100, credits: 3500 },
  { month: "Apr", pro: 6100, premium: 5200, credits: 4200 },
  { month: "May", pro: 6800, premium: 5800, credits: 4800 },
];

function TypeBadge({ type }: { type: Transaction["type"] }) {
  const classes = {
    credit_purchase: "bg-blue-500/20 text-blue-400",
    subscription: "bg-violet-500/20 text-violet-400",
    refund: "bg-red-500/20 text-red-400",
  };
  return (
    <Badge className={cn("capitalize", classes[type])}>
      {type.replace("_", " ")}
    </Badge>
  );
}

export default function FinancePage() {
  const [activeTab, setActiveTab] = React.useState("ledger");
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<Transaction>[] = [
    { accessorKey: "date", header: "Date", cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: "trade", header: "Trade" },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <TypeBadge type={row.original.type} /> },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: "balanceAfter", header: "Balance After", cell: ({ row }) => row.original.balanceAfter },
    { accessorKey: "stripeId", header: "Stripe ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.stripeId}</span> },
  ];

  const table = useReactTable({
    data: mockTransactions,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Finance</h1>
            <p className="text-sm text-muted-foreground">
              Manage transactions, refunds, and revenue
            </p>
          </div>
        </div>

        {/* Revenue Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Revenue (MTD)</p>
              <p className="text-2xl font-bold">{formatCurrency(17400)}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-green-400">
                <TrendingUp className="h-3 w-3" />
                +12.5%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pro Subscriptions</p>
              <p className="text-2xl font-bold">{formatCurrency(6800)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Premium Subscriptions</p>
              <p className="text-2xl font-bold">{formatCurrency(5800)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Credit Purchases</p>
              <p className="text-2xl font-bold">{formatCurrency(4800)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ledger">Transaction Ledger</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Reports</TabsTrigger>
            <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
          </TabsList>

          <TabsContent value="ledger" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={globalFilter}
                      onChange={(e) => setGlobalFilter(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th key={header.id} className="px-4 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-border">
                      {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/50">
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="pro" stackId="1" stroke="#8b5cf6" fill="url(#colorPro)" />
                    <Area type="monotone" dataKey="premium" stackId="1" stroke="#06b6d4" fill="url(#colorPremium)" />
                    <Area type="monotone" dataKey="credits" stackId="1" stroke="#10b981" fill="#10b98120" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discounts" className="space-y-4">
            <div className="flex justify-end">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Code
              </Button>
            </div>
            <div className="grid gap-4">
              {mockDiscountCodes.map((code) => (
                <Card key={code.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10">
                          <Tag className="h-6 w-6 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-mono text-lg font-bold">{code.code}</p>
                          <p className="text-sm text-muted-foreground">
                            {code.discountPercent}% off • {code.usageCount}/{code.usageLimit} used
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Expires</p>
                          <p className="text-sm">{formatDate(code.expiryDate)}</p>
                        </div>
                        <Badge variant={code.active ? "success" : "secondary"}>
                          {code.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
