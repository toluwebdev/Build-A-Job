"use client";

import * as React from "react";
import { DashboardLayout } from "../dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  Upload,
  Download,
  Hammer,
  TreePine,
  Home,
  Settings,
  Mail,
  Flag,
  CheckCircle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  jobCount: number;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  rankingBoost: number;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercent: number;
}

const mockCategories: Category[] = [
  { id: "1", name: "Driveway", icon: "hammer", active: true, jobCount: 456 },
  { id: "2", name: "Garden", icon: "tree", active: true, jobCount: 389 },
  { id: "3", name: "Kitchen", icon: "home", active: true, jobCount: 312 },
  { id: "4", name: "Bathroom", icon: "home", active: true, jobCount: 267 },
  { id: "5", name: "Roofing", icon: "hammer", active: true, jobCount: 198 },
  { id: "6", name: "Plumbing", icon: "hammer", active: false, jobCount: 0 },
];

const subscriptionTiers: SubscriptionTier[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 10,
    features: ["Basic profile", "Limited quotes", "Standard support"],
    rankingBoost: 1,
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    credits: 100,
    features: ["Enhanced profile", "Unlimited quotes", "Priority support", "Verified badge"],
    rankingBoost: 1.5,
  },
  {
    id: "premium",
    name: "Premium",
    price: 99,
    credits: 500,
    features: ["Premium profile", "Unlimited quotes", "24/7 support", "Verified badge", "Featured placement"],
    rankingBoost: 2,
  },
];

const featureFlags: FeatureFlag[] = [
  { id: "1", name: "AI Design Generation", description: "Enable AI-powered design generation for customers", enabled: true, rolloutPercent: 100 },
  { id: "2", name: "New Quote Flow", description: "Updated quote submission experience for trades", enabled: true, rolloutPercent: 50 },
  { id: "3", name: "Video Calls", description: "Enable video call feature in messaging", enabled: false, rolloutPercent: 0 },
  { id: "4", name: "Instant Quotes", description: "Allow trades to provide instant automated quotes", enabled: true, rolloutPercent: 25 },
];

export default function ConfigPage() {
  const [activeTab, setActiveTab] = React.useState("categories");
  const [categories, setCategories] = React.useState(mockCategories);

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Platform Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Manage categories, subscription tiers, and feature flags
            </p>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="estimates">Estimates</TabsTrigger>
            <TabsTrigger value="flags">Feature Flags</TabsTrigger>
            <TabsTrigger value="emails">Email Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Categories</CardTitle>
                <CardDescription>Manage categories available to customers and trades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                          <Hammer className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.jobCount} jobs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={category.active}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {subscriptionTiers.map((tier) => (
                <Card key={tier.id} className={cn(tier.id === "pro" && "border-violet-500/50")}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {tier.name}
                      {tier.id === "pro" && <Badge>Popular</Badge>}
                    </CardTitle>
                    <CardDescription>
                      <span className="text-2xl font-bold">£{tier.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Monthly Credits</label>
                      <Input type="number" defaultValue={tier.credits} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ranking Boost</label>
                      <Input type="number" step="0.1" defaultValue={tier.rankingBoost} className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Features</label>
                      <div className="mt-2 space-y-2">
                        {tier.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="estimates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estimate Parameters</CardTitle>
                <CardDescription>Configure pricing by category and region</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead className="border-b bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Labour Rate (£/m²)</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Materials Low</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Materials Mid</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Materials High</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {mockCategories.filter(c => c.active).map((category) => (
                        <tr key={category.id}>
                          <td className="px-4 py-3 font-medium">{category.name}</td>
                          <td className="px-4 py-3"><Input type="number" defaultValue={45} className="w-24" /></td>
                          <td className="px-4 py-3"><Input type="number" defaultValue={25} className="w-24" /></td>
                          <td className="px-4 py-3"><Input type="number" defaultValue={45} className="w-24" /></td>
                          <td className="px-4 py-3"><Input type="number" defaultValue={85} className="w-24" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Control feature rollout across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {featureFlags.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">{flag.name}</p>
                        <p className="text-sm text-muted-foreground">{flag.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Rollout</p>
                          <p className="font-medium">{flag.rolloutPercent}%</p>
                        </div>
                        <Switch checked={flag.enabled} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Manage automated email notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: "Quote Received Notification", subject: "You received a new quote!" },
                    { name: "Trade Verification Approved", subject: "Your verification is complete" },
                    { name: "Job Completed", subject: "Your job has been marked complete" },
                    { name: "Password Reset", subject: "Reset your password" },
                  ].map((template, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-violet-400" />
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
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
