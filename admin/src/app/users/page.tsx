"use client";

import * as React from "react";
import { DashboardLayout } from "../dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, formatDate } from "@/lib/utils";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Ban,
  Trash2,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock customer data
interface Customer {
  id: string;
  name: string;
  email: string;
  postcode: string;
  jobsSubmitted: number;
  status: "active" | "suspended";
  joinedAt: string;
  lastActive: string;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    postcode: "SW1A 1AA",
    jobsSubmitted: 5,
    status: "active",
    joinedAt: "2024-01-15",
    lastActive: "2024-05-20",
  },
  {
    id: "2",
    name: "Michael Brown",
    email: "m.brown@example.com",
    postcode: "M1 1AA",
    jobsSubmitted: 3,
    status: "active",
    joinedAt: "2024-02-10",
    lastActive: "2024-05-19",
  },
  {
    id: "3",
    name: "Emma Wilson",
    email: "emma.w@example.com",
    postcode: "B1 1AA",
    jobsSubmitted: 0,
    status: "suspended",
    joinedAt: "2024-03-05",
    lastActive: "2024-04-15",
  },
  {
    id: "4",
    name: "James Davis",
    email: "j.davis@example.com",
    postcode: "LS1 1AA",
    jobsSubmitted: 8,
    status: "active",
    joinedAt: "2023-12-01",
    lastActive: "2024-05-20",
  },
  {
    id: "5",
    name: "Olivia Taylor",
    email: "olivia.t@example.com",
    postcode: "EH1 1AA",
    jobsSubmitted: 2,
    status: "active",
    joinedAt: "2024-04-01",
    lastActive: "2024-05-18",
  },
  {
    id: "6",
    name: "William Clark",
    email: "w.clark@example.com",
    postcode: "CF10 1AA",
    jobsSubmitted: 1,
    status: "suspended",
    joinedAt: "2024-01-20",
    lastActive: "2024-03-10",
  },
  {
    id: "7",
    name: "Sophie Martinez",
    email: "sophie.m@example.com",
    postcode: "G1 1AA",
    jobsSubmitted: 4,
    status: "active",
    joinedAt: "2024-02-28",
    lastActive: "2024-05-19",
  },
  {
    id: "8",
    name: "Daniel Lee",
    email: "daniel.l@example.com",
    postcode: "L1 1AA",
    jobsSubmitted: 6,
    status: "active",
    joinedAt: "2023-11-15",
    lastActive: "2024-05-20",
  },
];

// Status badge component
function StatusBadge({ status }: { status: Customer["status"] }) {
  return (
    <Badge
      variant={status === "active" ? "success" : "destructive"}
      className="capitalize"
    >
      {status}
    </Badge>
  );
}

export default function UsersPage() {
  const [data] = React.useState(mockCustomers);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());

  const columns: ColumnDef<Customer>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-border"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-border"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "postcode",
      header: "Postcode",
    },
    {
      accessorKey: "jobsSubmitted",
      header: "Jobs",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.jobsSubmitted}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "joinedAt",
      header: "Joined",
      cell: ({ row }) => formatDate(row.original.joinedAt),
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
              View Profile
            </DropdownMenuItem>
            {row.original.status === "active" ? (
              <DropdownMenuItem className="text-amber-400">
                <Ban className="mr-2 h-4 w-4" />
                Suspend
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-green-400">
                <UserCheck className="mr-2 h-4 w-4" />
                Reinstate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedCount = table.getSelectedRowModel().rows.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Customers</h1>
            <p className="text-sm text-muted-foreground">
              Manage customer accounts and view their activity
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or postcode..."
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

        {/* Bulk Actions */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-4 rounded-lg border border-violet-500/30 bg-violet-500/10 p-3">
            <span className="text-sm">
              {selectedCount} customer{selectedCount !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Ban className="mr-2 h-4 w-4" />
                Suspend
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}

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
                          onClick={header.column.getToggleSortingHandler()}
                          style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                        >
                          <div className="flex items-center gap-1">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getIsSorted() && (
                              <span>
                                {header.column.getIsSorted() === "asc" ? " ↑" : " ↓"}
                              </span>
                            )}
                          </div>
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
                        row.getIsSelected() && "bg-violet-500/5"
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
                Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{" "}
                of {table.getFilteredRowModel().rows.length} results
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
                <span className="text-sm">
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </span>
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
