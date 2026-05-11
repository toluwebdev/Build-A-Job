"use client";

import * as React from "react";
import { DashboardLayout } from "../dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  Shield,
  Clock,
  FileText,
  Hammer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Types
interface Trade {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  category: string;
  region: string;
  subscription: "free" | "pro" | "premium";
  credits: number;
  rating: number;
  reviewCount: number;
  status: "active" | "suspended" | "pending";
  verified: boolean;
  joinedAt: string;
}

interface VerificationRequest {
  id: string;
  tradeName: string;
  companyName: string;
  submittedAt: string;
  credentialTypes: string[];
  daysPending: number;
  status: "pending" | "approved" | "rejected";
}

// Mock trades data
const mockTrades: Trade[] = [
  {
    id: "1",
    companyName: "Premier Paving Ltd",
    contactName: "John Smith",
    email: "john@premierpaving.co.uk",
    category: "Driveways",
    region: "London",
    subscription: "premium",
    credits: 450,
    rating: 4.9,
    reviewCount: 127,
    status: "active",
    verified: true,
    joinedAt: "2023-06-15",
  },
  {
    id: "2",
    companyName: "SJ Groundworks",
    contactName: "Sarah Johnson",
    email: "sarah@sjgroundworks.co.uk",
    category: "Foundations",
    region: "Manchester",
    subscription: "pro",
    credits: 230,
    rating: 4.7,
    reviewCount: 89,
    status: "active",
    verified: true,
    joinedAt: "2023-09-20",
  },
  {
    id: "3",
    companyName: "MW Construction",
    contactName: "Mike Williams",
    email: "mike@mwconstruction.co.uk",
    category: "Driveways",
    region: "Birmingham",
    subscription: "free",
    credits: 50,
    rating: 4.5,
    reviewCount: 56,
    status: "active",
    verified: false,
    joinedAt: "2024-01-10",
  },
  {
    id: "4",
    companyName: "Elite Landscapes",
    contactName: "Emma Davis",
    email: "emma@elitelandscapes.co.uk",
    category: "Landscaping",
    region: "London",
    subscription: "premium",
    credits: 680,
    rating: 4.8,
    reviewCount: 203,
    status: "active",
    verified: true,
    joinedAt: "2023-03-05",
  },
  {
    id: "5",
    companyName: "DB Roofing Specialists",
    contactName: "David Brown",
    email: "david@dbroofing.co.uk",
    category: "Roofing",
    region: "Leeds",
    subscription: "pro",
    credits: 180,
    rating: 4.6,
    reviewCount: 78,
    status: "suspended",
    verified: true,
    joinedAt: "2023-08-12",
  },
];

// Mock verification requests
const mockVerifications: VerificationRequest[] = [
  {
    id: "v1",
    tradeName: "Tom's Plumbing",
    companyName: "Thomas Plumbing Services Ltd",
    submittedAt: "2024-05-18",
    credentialTypes: ["Gas Safe", "Public Liability"],
    daysPending: 5,
    status: "pending",
  },
  {
    id: "v2",
    tradeName: "City Electrics",
    companyName: "City Electrical Solutions",
    submittedAt: "2024-05-19",
    credentialTypes: ["NICEIC", "Public Liability"],
    daysPending: 4,
    status: "pending",
  },
  {
    id: "v3",
    tradeName: "Green Gardens",
    companyName: "Green Gardens Landscaping",
    submittedAt: "2024-05-15",
    credentialTypes: ["Public Liability", "Employers Liability"],
    daysPending: 8,
    status: "pending",
  },
  {
    id: "v4",
    tradeName: "BuildRight Construction",
    companyName: "BuildRight Construction Ltd",
    submittedAt: "2024-05-20",
    credentialTypes: ["CSCS", "Public Liability"],
    daysPending: 3,
    status: "pending",
  },
];

// Subscription badge
function SubscriptionBadge({ tier }: { tier: Trade["subscription"] }) {
  const colors = {
    free: "bg-gray-500/20 text-gray-400",
    pro: "bg-violet-500/20 text-violet-400",
    premium: "bg-amber-500/20 text-amber-400",
  };
  return (
    <Badge className={cn("capitalize", colors[tier])}>
      {tier}
    </Badge>
  );
}

// Verification Status Badge
function VerificationBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <Badge variant="success" className="gap-1">
      <Shield className="h-3 w-3" />
      Verified
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Unverified
    </Badge>
  );
}

// Verification Review Modal
function VerificationModal({
  isOpen,
  onClose,
  request,
}: {
  isOpen: boolean;
  onClose: () => void;
  request: VerificationRequest | null;
}) {
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Verification</DialogTitle>
          <DialogDescription>
            Review credentials for {request.companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Trade Info */}
          <div className="rounded-lg bg-muted/50 p-4">
            <h4 className="mb-2 text-sm font-medium">Trade Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Trade Name:</span>
              <span>{request.tradeName}</span>
              <span className="text-muted-foreground">Company:</span>
              <span>{request.companyName}</span>
              <span className="text-muted-foreground">Submitted:</span>
              <span>{formatDate(request.submittedAt)}</span>
              <span className="text-muted-foreground">Days Pending:</span>
              <span className={request.daysPending > 7 ? "text-amber-400" : ""}>
                {request.daysPending} days
              </span>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h4 className="mb-2 text-sm font-medium">Submitted Documents</h4>
            <div className="space-y-2">
              {request.credentialTypes.map((type) => (
                <div
                  key={type}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-violet-400" />
                    <span className="text-sm">{type}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div>
            <h4 className="mb-2 text-sm font-medium">Verification Checklist</h4>
            <div className="space-y-2">
              {[
                "Company is registered",
                "Insurance is valid",
                "Credentials are authentic",
                "No outstanding disputes",
              ].map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Request More Info
          </Button>
          <Button variant="destructive">
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button>
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TradesPage() {
  const [activeTab, setActiveTab] = React.useState("trades");
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [selectedVerification, setSelectedVerification] = React.useState<VerificationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Trades table columns
  const tradeColumns: ColumnDef<Trade>[] = [
    {
      accessorKey: "companyName",
      header: "Company",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.companyName}</p>
          <p className="text-xs text-muted-foreground">{row.original.contactName}</p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "region",
      header: "Region",
    },
    {
      accessorKey: "subscription",
      header: "Plan",
      cell: ({ row }) => <SubscriptionBadge tier={row.original.subscription} />,
    },
    {
      accessorKey: "credits",
      header: "Credits",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.credits}</span>
      ),
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="font-medium">{row.original.rating}</span>
          <span className="text-xs text-muted-foreground">
            ({row.original.reviewCount})
          </span>
        </div>
      ),
    },
    {
      accessorKey: "verified",
      header: "Status",
      cell: ({ row }) => <VerificationBadge verified={row.original.verified} />,
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
            <DropdownMenuItem>
              <Hammer className="mr-2 h-4 w-4" />
              Impersonate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const tradesTable = useReactTable({
    data: mockTrades,
    columns: tradeColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleVerificationClick = (request: VerificationRequest) => {
    setSelectedVerification(request);
    setIsModalOpen(true);
  };

  const pendingCount = mockVerifications.filter((v) => v.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tradespeople</h1>
            <p className="text-sm text-muted-foreground">
              Manage tradespeople and verification queue
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="trades">All Trades</TabsTrigger>
            <TabsTrigger value="verification" className="relative">
              Verification Queue
              {pendingCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trades" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search tradespeople..."
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

            {/* Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      {tradesTable.getHeaderGroups().map((headerGroup) => (
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
                      {tradesTable.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="hover:bg-muted/50">
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
                    Showing {tradesTable.getRowModel().rows.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => tradesTable.previousPage()}
                      disabled={!tradesTable.getCanPreviousPage()}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => tradesTable.nextPage()}
                      disabled={!tradesTable.getCanNextPage()}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-4">
            {/* Verification Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-violet-400" />
                  Pending Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockVerifications
                    .filter((v) => v.status === "pending")
                    .map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleVerificationClick(request)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                            <Hammer className="h-5 w-5 text-violet-400" />
                          </div>
                          <div>
                            <p className="font-medium">{request.tradeName}</p>
                            <p className="text-sm text-muted-foreground">
                              {request.companyName}
                            </p>
                            <div className="mt-1 flex gap-2">
                              {request.credentialTypes.map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            Submitted {formatDate(request.submittedAt)}
                          </p>
                          <p
                            className={cn(
                              "text-sm font-medium",
                              request.daysPending > 7
                                ? "text-amber-400"
                                : "text-muted-foreground"
                            )}
                          >
                            {request.daysPending} days pending
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedVerification}
      />
    </DashboardLayout>
  );
}
