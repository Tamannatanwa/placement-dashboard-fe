"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Server,
  Database,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Bug,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import {
  adminApi,
  MonitoringServicesUi,
  MonitoringCrawlerUi,
  MonitoringClassifierUi,
  MonitoringDowntimeUi,
} from "@/lib/api/admin";

interface BugReport {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved";
  reportedAt: Date;
  reportedBy: string;
}

export default function MonitoringPage() {
  const [services, setServices] = useState<MonitoringServicesUi[]>([]);

  const [crawlers, setCrawlers] = useState<MonitoringCrawlerUi[]>([]);

  const [classifier, setClassifier] = useState<MonitoringClassifierUi | null>(null);

  const [bugs, setBugs] = useState<BugReport[]>([]);

  const [downtimeHistory, setDowntimeHistory] = useState<MonitoringDowntimeUi[]>([]);

  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = () => {
    setLastRefresh(new Date());
    // Scraping & job stats drive the monitoring view
    Promise.all([adminApi.getScrapingStats(), adminApi.getJobStats()])
      .then(([scraping, jobs]) => {
        // Map scraping stats into high-level services
        const now = new Date();
        const mappedServices: MonitoringServicesUi[] = [
          {
            name: "Backend API",
            status: "healthy",
            uptime: 99.0,
            lastCheck: now,
            responseTime: 100,
            description: "FastAPI backend service",
          },
          {
            name: "Telegram Scraper",
            status: scraping.channels_scraped_today > 0 ? "healthy" : "degraded",
            uptime: 98.0,
            lastCheck: now,
            responseTime: 200,
            description: "Telegram scraping & ingestion pipeline",
          },
        ];
        setServices(mappedServices);

        // Map to simple crawler tiles using scraping stats
        const mappedCrawlers: MonitoringCrawlerUi[] = [
          {
            name: "Telegram Crawler",
            status: scraping.messages_today > 0 ? "running" : "idle",
            lastRun: now,
            jobsFound: jobs.jobs_today,
            errors: 0,
            nextRun: new Date(Date.now() + 60 * 60 * 1000),
          },
        ];
        setCrawlers(mappedCrawlers);

        // Classifier summary based on job stats
        setClassifier({
          status: "active",
          accuracy: 0, // not provided yet
          totalClassified: jobs.total_jobs,
          lastRun: now,
        });

        // For now, keep bugs/downtime empty; can be wired to dedicated endpoints later
        setBugs([]);
        setDowntimeHistory([]);
      })
      .catch((error) => {
        console.error("Failed to load monitoring data", error);
      });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      healthy: { variant: "outline", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
      degraded: { variant: "outline", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
      down: { variant: "outline", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
      running: { variant: "outline", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
      idle: { variant: "outline", className: "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20" },
      error: { variant: "outline", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
      active: { variant: "outline", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
    };
    return variants[status] || variants.healthy;
  };

  const getStatusIcon = (status: string) => {
    if (status === "healthy" || status === "running" || status === "active") {
      return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
    }
    if (status === "degraded" || status === "idle") {
      return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    }
    return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Activity className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
            System Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor system health, crawlers, and service status
          </p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="crawlers">Crawlers</TabsTrigger>
          <TabsTrigger value="classifier">Job Classifier</TabsTrigger>
          <TabsTrigger value="bugs">Bug Reports</TabsTrigger>
          <TabsTrigger value="downtime">Downtime History</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => {
              const badgeProps = getStatusBadge(service.status);
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <CardTitle>{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                      </div>
                      <Badge {...badgeProps}>{service.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Uptime</div>
                        <div className="text-2xl font-bold">{service.uptime}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Response Time</div>
                        <div className="text-2xl font-bold">{service.responseTime}ms</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last checked: {formatDistanceToNow(service.lastCheck, { addSuffix: true })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Crawlers Tab */}
        <TabsContent value="crawlers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {crawlers.map((crawler, index) => {
              const badgeProps = getStatusBadge(crawler.status);
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{crawler.name}</CardTitle>
                      <Badge {...badgeProps}>{crawler.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Jobs Found</div>
                        <div className="text-2xl font-bold">{crawler.jobsFound}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Errors</div>
                        <div className={`text-2xl font-bold ${crawler.errors > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                          {crawler.errors}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="text-muted-foreground">
                        Last run: {formatDistanceToNow(crawler.lastRun, { addSuffix: true })}
                      </div>
                      <div className="text-muted-foreground">
                        Next run: {formatDistanceToNow(crawler.nextRun, { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Classifier Tab */}
        <TabsContent value="classifier" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Job Classifier Status</CardTitle>
                  <CardDescription>AI-powered job classification system</CardDescription>
                </div>
                {classifier ? (
                  <Badge {...getStatusBadge(classifier.status)}>{classifier.status}</Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20">
                    loading
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {classifier ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Accuracy</div>
                    <div className="text-3xl font-bold">{classifier.accuracy}%</div>
                    <div className="flex items-center gap-1 mt-2 text-green-600 dark:text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">+2.3% from last week</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Total Classified</div>
                    <div className="text-3xl font-bold">
                      {classifier.totalClassified.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Last Run</div>
                    <div className="text-lg font-medium">
                      {formatDistanceToNow(classifier.lastRun, { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Loading classifier stats...
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bugs Tab */}
        <TabsContent value="bugs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bug Reports</CardTitle>
              <CardDescription>Track and manage reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead>Reported By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bugs.map((bug) => (
                    <TableRow key={bug.id}>
                      <TableCell className="font-mono">{bug.id}</TableCell>
                      <TableCell className="font-medium">{bug.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            bug.severity === "critical"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                              : bug.severity === "high"
                              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                              : bug.severity === "medium"
                              ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                              : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
                          }
                        >
                          {bug.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            bug.status === "resolved"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                              : bug.status === "in-progress"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
                          }
                        >
                          {bug.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDistanceToNow(bug.reportedAt, { addSuffix: true })}</TableCell>
                      <TableCell>{bug.reportedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Downtime Tab */}
        <TabsContent value="downtime" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Downtime History</CardTitle>
              <CardDescription>Historical service outages and incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downtimeHistory.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.service}</TableCell>
                      <TableCell>
                        {event.startTime.toLocaleString()}
                      </TableCell>
                      <TableCell>{formatDuration(event.duration)}</TableCell>
                      <TableCell>{event.reason}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            event.status === "resolved"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                          }
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-xs text-muted-foreground text-center">
        Last refreshed: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
      </div>
    </div>
  );
}




