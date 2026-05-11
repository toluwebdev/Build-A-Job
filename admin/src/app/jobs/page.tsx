"use client";

import * as React from "react";
import { DashboardLayout } from "../dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  AlertTriangle,
  XCircle,
  Edit3,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
interface Job {
  id: string;
  customer: string;
  category: string;
  postcode: string;
  status: "draft" | "open" | "quotes" | "confirmed" | "in_progress" | "completed" | "cancelled" | "disputed";
  quotesCount: number;
  hasDispute: boolean;
  createdAt: string;
}

// Mock jobs data
const mockJobs: Job[] = [
  {
    id: "JOB-4521",
    customer: "Sarah Johnson",
    category: "Driveway",
    postcode: "SW1A 1AA",
    status: "quotes",
    quotesCount: 5,
    hasDispute: false,
    createdAt: "2024-05-20",
  },
  {
    id: "JOB-4520",
    customer: "Michael Brown",
    category: "Kitchen",
    postcode: "M1 1AA",
    status: "in_progress",
    quotesCount: 3,
    hasDispute: false,
    createdAt: "2024-05-18",
  },
  {
    id: "JOB-4519",
    customer: "Emma Wilson",
    category: "Garden",
    postcode: "B1 1AA",
    status: "disputed",
    quotesCount: 4,
    hasDispute: true,
    createdAt: "2024-05-15",
  },
  {
    id: "JOB-4518",
    customer: "James Davis",
    category: "Bathroom",
    postcode: "LS1 1AA",
    status: "completed",
    quotesCount: 6,
    hasDispute: false,
    createdAt: "2024-05-10",
  },
  {
    id: "JOB-4517",
    customer: "Olivia Taylor",
    category: "Roofing",
    postcode: "EH1 1AA",
    status: "open",
    quotesCount: 0,
    hasDispute: false,
    createdAt: "2024-05-20",
  },
  {
    id: "JOB-4516",
    customer: "William Clark",
    category: "Driveway",
    postcode: "CF10 1AA",
    status: "cancelled",
    quotesCount: 2,
    hasDispute: false,
    createdAt: "2024-05-08",
  },
];

// Status badge component
function StatusBadge({ status, hasDispute }: { status: Job["status"]; hasDispute: boolean }) {
  const statusClasses: Record<string, string> = {
    draft: "status-draft",
    open: "status-open",
    quotes: "status-quotes",
    confirmed: "status-confirmed",
    "in_progress": "status-in-progress",
    completed: "status-completed",
    cancelled: "status-cancelled",
    disputed: "status-disputed",
  };

  return (
    <div className="flex items-center gap-2">
      <Badge className={cn("capitalize", statusClasses[status])}>
        {status.replace("_", " ")}
      </Badge>
      {hasDispute && (
        <AlertTriangle className="h-4 w-4 text-orange-400" />
      )}
    </div>
  );
}

export default function JobsPage() {
  const [globalFilter, setGlobalFilter] = React.useState("");

  const columns: ColumnDef<Job>[] = [
    {
      accessorKey: "id",
      header: "Job ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.id}</span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "postcode",
      header: "Postcode",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} hasDispute={row.original.hasDispute} />
      ),
    },
    {
      accessorKey: "quotesCount",
      header: "Quotes",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.quotesCount}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageSquare className="mr-2 h-4 w-4" />
              View Messages
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit3 className="mr-2 h-4 w-4" />
              Reassign Category
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Force Close
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: mockJobs,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Jobs</h1>
            <p className="text-sm text-muted-foreground">
              Manage all jobs on the platform
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <span className="text-sm text-muted-foreground">Total:</span>
              <span className="font-medium">{mockJobs.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by job ID, customer, or category..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Active Jobs</p>
              <p className="text-2xl font-bold">
                {mockJobs.filter((j) => ["open", "quotes", "confirmed", "in_progress"].includes(j.status)).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending Quotes</p>
              <p className="text-2xl font-bold">
                {mockJobs.filter((j) => j.status === "quotes").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Disputes</p>
              <p className="text-2xl font-bold text-orange-400">
                {mockJobs.filter((j) => j.hasDispute).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold text-green-400">12</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-border">
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "hover:bg-muted/50",
                        row.original.hasDispute && "bg-orange-500/5"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-3">
              <div className="text-sm text-muted-foreground">
                Showing {table.getRowModel().rows.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
