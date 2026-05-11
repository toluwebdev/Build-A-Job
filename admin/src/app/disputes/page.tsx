"use client";

import * as React from "react";
import { DashboardLayout } from "../dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  Hammer,
  FileText,
  ChevronRight,
} from "lucide-react";

interface Dispute {
  id: string;
  jobId: string;
  raisedBy: "customer" | "trade";
  raisedByName: string;
  reason: string;
  openedAt: string;
  assignedAdmin?: string;
  status: "open" | "in_review" | "resolved";
  daysOpen: number;
}

const mockDisputes: Dispute[] = [
  {
    id: "DISP-001",
    jobId: "JOB-4519",
    raisedBy: "customer",
    raisedByName: "Emma Wilson",
    reason: "Work not completed as agreed",
    openedAt: "2024-05-18",
    assignedAdmin: "Admin User",
    status: "in_review",
    daysOpen: 3,
  },
  {
    id: "DISP-002",
    jobId: "JOB-4512",
    raisedBy: "trade",
    raisedByName: "Premier Paving Ltd",
    reason: "Customer refusing payment",
    openedAt: "2024-05-15",
    status: "open",
    daysOpen: 6,
  },
  {
    id: "DISP-003",
    jobId: "JOB-4508",
    raisedBy: "customer",
    raisedByName: "James Davis",
    reason: "Poor quality workmanship",
    openedAt: "2024-05-10",
    assignedAdmin: "Super Admin",
    status: "resolved",
    daysOpen: 11,
  },
];

function StatusBadge({ status }: { status: Dispute["status"] }) {
  const classes = {
    open: "bg-red-500/20 text-red-400",
    in_review: "bg-amber-500/20 text-amber-400",
    resolved: "bg-green-500/20 text-green-400",
  };
  return (
    <Badge className={classes[status]}>
      {status.replace("_", " ").toUpperCase()}
    </Badge>
  );
}

function SLABadge({ days }: { days: number }) {
  const color = days > 7 ? "text-red-400" : days > 3 ? "text-amber-400" : "text-green-400";
  return (
    <span className={cn("text-sm font-medium", color)}>
      {days}d
    </span>
  );
}

export default function DisputesPage() {
  const [activeTab, setActiveTab] = React.useState("open");

  const filteredDisputes = mockDisputes.filter((d) => {
    if (activeTab === "open") return d.status === "open";
    if (activeTab === "in_review") return d.status === "in_review";
    if (activeTab === "resolved") return d.status === "resolved";
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Disputes</h1>
            <p className="text-sm text-muted-foreground">
              Manage and resolve platform disputes
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-muted-foreground">Open:</span>
              <span className="font-medium">{mockDisputes.filter((d) => d.status !== "resolved").length}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="open">
              Open
              <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                {mockDisputes.filter((d) => d.status === "open").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="in_review">
              In Review
              <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                {mockDisputes.filter((d) => d.status === "in_review").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved
              <span className="ml-2 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                {mockDisputes.filter((d) => d.status === "resolved").length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-4">
              {filteredDisputes.map((dispute) => (
                <Card key={dispute.id} className="cursor-pointer hover:border-violet-500/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-muted-foreground">
                            {dispute.id}
                          </span>
                          <StatusBadge status={dispute.status} />
                          <SLABadge days={dispute.daysOpen} />
                        </div>
                        <h3 className="font-medium">{dispute.reason}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {dispute.raisedBy === "customer" ? (
                              <User className="h-4 w-4" />
                            ) : (
                              <Hammer className="h-4 w-4" />
                            )}
                            Raised by {dispute.raisedByName}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            Job {dispute.jobId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Opened {formatDate(dispute.openedAt)}
                          </span>
                        </div>
                        {dispute.assignedAdmin && (
                          <p className="text-sm text-violet-400">
                            Assigned to: {dispute.assignedAdmin}
                          </p>
                        )}
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
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
