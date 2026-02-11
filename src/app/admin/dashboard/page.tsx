"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Building2,
  Users,
  MapPin,
  Rss,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi, AdminDashboardUiStats } from "@/lib/api/admin";

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminDashboardUiStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("week");

  useEffect(() => {
    loadDashboardStats();
  }, [timeRange]);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.getDashboardStats();
      setStats(response);
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Jobs Today",
      value: stats?.total_jobs_today ?? 0,
      icon: Briefcase,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10",
      link: "/admin/jobs",
    },
    {
      title: "Jobs This Week",
      value: stats?.total_jobs_this_week ?? 0,
      icon: TrendingUp,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10",
      link: "/admin/jobs",
    },
    {
      title: "Total Channels",
      value: stats?.total_channels ?? 0,
      icon: Rss,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      link: "/admin/channels",
    },
    {
      title: "Total Companies",
      value: stats?.total_companies ?? 0,
      icon: Building2,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-500/10",
      link: "/admin/companies",
    },
    {
      title: "Total Cities",
      value: stats?.total_cities ?? 0,
      icon: MapPin,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Total Students",
      value: stats?.total_students ?? 0,
      icon: Users,
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-500/10",
      link: "/admin/students",
      subtitle: stats
        ? `${stats.active_students} active, ${stats.inactive_students} inactive`
        : undefined,
    },
    {
      title: "Total Campuses",
      value: stats?.total_campuses ?? 0,
      icon: Building2,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your placement platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const CardWrapper = stat.link ? Link : "div";
          const wrapperProps = stat.link ? { href: stat.link } : {};

          return (
            <CardWrapper key={index} {...wrapperProps} className={stat.link ? "block" : ""}>
              <Card className={`hover:shadow-lg transition-shadow ${stat.link ? "cursor-pointer" : ""}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                  {stat.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  )}
                </CardContent>
              </Card>
            </CardWrapper>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              asChild
              className="w-full justify-start"
              variant="outline"
            >
              <Link href="/admin/students/bulk-create">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Bulk Create Students
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-start"
              variant="outline"
            >
              <Link href="/admin/students">
                <Users className="mr-2 h-4 w-4" />
                Manage Students
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-start"
              variant="outline"
            >
              <Link href="/admin/monitoring">
                <Activity className="mr-2 h-4 w-4" />
                System Monitoring
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Jobs Trend */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Jobs Trend</CardTitle>
            <CardDescription>Job postings over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {stats && stats.jobs_trend.length > 0 ? (
              <div className="h-[200px] flex items-end justify-between gap-2">
                {stats.jobs_trend.map((day, index) => {
                  const maxCount = Math.max(...stats.jobs_trend.map((d) => d.count));
                  const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center justify-end h-full">
                        <div
                          className="w-full bg-cyan-500 rounded-t transition-all hover:bg-cyan-600"
                          style={{ height: `${height}%`, minHeight: "4px" }}
                          title={`${day.count} jobs`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{day.date}</span>
                      <span className="text-sm font-medium">{day.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                {isLoading ? "Loading stats..." : "No trend data available"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current health of platform services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <div className="font-medium">Frontend</div>
                <div className="text-sm text-muted-foreground">Operational</div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <div className="font-medium">Backend API</div>
                <div className="text-sm text-muted-foreground">Operational</div>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                Healthy
              </Badge>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <div className="font-medium">Crawler</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}






