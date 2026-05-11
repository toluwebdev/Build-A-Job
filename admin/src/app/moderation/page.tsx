"use client";

import * as React from "react";
import { DashboardLayout } from "../dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatDate } from "@/lib/utils";
import {
  Star,
  Image as ImageIcon,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  User,
  Hammer,
  Clock,
} from "lucide-react";

interface Review {
  id: string;
  jobId: string;
  tradeName: string;
  customerName: string;
  rating: number;
  content: string;
  flagReason: string;
  flaggedAt: string;
}

interface FlaggedPhoto {
  id: string;
  url: string;
  uploadedBy: string;
  jobId: string;
  flaggedAt: string;
  reason: string;
}

const mockReviews: Review[] = [
  {
    id: "REV-001",
    jobId: "JOB-4518",
    tradeName: "Premier Paving Ltd",
    customerName: "James Davis",
    rating: 2,
    content: "Work was substandard and they left a mess. Would not recommend.",
    flagReason: "Potentially fake review",
    flaggedAt: "2024-05-19",
  },
  {
    id: "REV-002",
    jobId: "JOB-4515",
    tradeName: "SJ Groundworks",
    customerName: "Sarah Johnson",
    rating: 1,
    content: "Terrible experience, never showed up on time.",
    flagReason: "Inappropriate language",
    flaggedAt: "2024-05-18",
  },
];

const mockPhotos: FlaggedPhoto[] = [
  {
    id: "IMG-001",
    url: "/placeholder.jpg",
    uploadedBy: "customer",
    jobId: "JOB-4519",
    flaggedAt: "2024-05-20",
    reason: "Irrelevant to job",
  },
  {
    id: "IMG-002",
    url: "/placeholder.jpg",
    uploadedBy: "trade",
    jobId: "JOB-4517",
    flaggedAt: "2024-05-19",
    reason: "Poor quality",
  },
];

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-4 w-4",
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  );
}

export default function ModerationPage() {
  const [activeTab, setActiveTab] = React.useState("reviews");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Content Moderation</h1>
            <p className="text-sm text-muted-foreground">
              Review and moderate flagged content
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="reviews" className="relative">
              <Star className="mr-2 h-4 w-4" />
              Reviews
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                {mockReviews.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="photos" className="relative">
              <ImageIcon className="mr-2 h-4 w-4" />
              Photos
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[10px] font-bold text-white">
                {mockPhotos.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="audit">
              <Clock className="mr-2 h-4 w-4" />
              Audit Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="space-y-4">
            <div className="grid gap-4">
              {mockReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-muted-foreground">
                            {review.id}
                          </span>
                          <Badge variant="warning" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {review.flagReason}
                          </Badge>
                        </div>
                        <RatingStars rating={review.rating} />
                        <p className="text-sm">{review.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Hammer className="h-4 w-4" />
                            {review.tradeName}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {review.customerName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Flagged {formatDate(review.flaggedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Context
                        </Button>
                        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm">
                          <XCircle className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockPhotos.map((photo) => (
                <Card key={photo.id}>
                  <CardContent className="p-4">
                    <div className="aspect-video rounded-lg bg-muted mb-3 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {photo.id}
                        </span>
                        <Badge variant="warning" className="text-xs">
                          {photo.reason}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploaded by {photo.uploadedBy} • Job {photo.jobId}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="default" size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1">
                          <XCircle className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "Review approved", admin: "Super Admin", entity: "REV-001", time: "2 hours ago" },
                    { action: "Photo removed", admin: "Admin User", entity: "IMG-003", time: "5 hours ago" },
                    { action: "Review escalated", admin: "Admin User", entity: "REV-004", time: "1 day ago" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.entity} by {log.admin}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
