"use client";

import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layouts/Navbar";
import { Footer } from "@/components/layouts/Footer";
import { AnimatedBackground } from "@/components/layouts/AnimatedBackground";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Bell,
  ArrowRight,
  Shield,
  UserCircle,
  LayoutDashboard,
} from "lucide-react";
import { isAuthenticated, getUserRole, getDashboardRoute } from "@/lib/utils/auth";

export default function Home() {
  const router = useRouter();

  // Handle dashboard button click - check auth and redirect accordingly
  const handleDashboardClick = () => {
    if (isAuthenticated()) {
      const role = getUserRole();
      if (role) {
        // User is logged in, redirect to their dashboard
        router.push(getDashboardRoute(role));
      } else {
        // Has token but no role, redirect to login
        router.push("/login");
      }
    } else {
      // Not logged in, redirect to login page
      router.push("/login");
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 dark:bg-slate-950">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center min-h-screen pt-16 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Grid Pattern Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <AnimatedBackground />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 dark:bg-cyan-400/10 text-cyan-400 dark:text-cyan-300 text-sm font-medium border border-cyan-500/20 dark:border-cyan-400/20">
              <Sparkles className="h-4 w-4" />
              AI-Powered Job Matching
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              Find Your Dream Job{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-green-400 bg-clip-text text-transparent">
                Faster Than Ever
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 dark:text-slate-400 max-w-2xl mx-auto">
              We collect and organize relevant job openings so you can easily discover roles and apply directly—no complex matching or intermediaries.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                onClick={handleDashboardClick}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950" asChild>
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="text-sm uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-semibold">
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Everything You Need to Land Your{" "}
              <span className="text-cyan-600 dark:text-cyan-400">Dream Job</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with human expertise to maximize your chances of success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-lg border bg-card space-y-4 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center border border-cyan-500/20 dark:border-cyan-400/20">
                <Zap className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold">Real-Time Updates</h3>
              <p className="text-muted-foreground">
                Jobs aggregated from Telegram channels and top platforms, updated every few minutes.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card space-y-4 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center border border-cyan-500/20 dark:border-cyan-400/20">
                <Bell className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold">Instant Alerts</h3>
              <p className="text-muted-foreground">
                Get notified immediately when a job matching your profile is posted.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card space-y-4 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center border border-cyan-500/20 dark:border-cyan-400/20">
                <Shield className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold">Verified Companies</h3>
              <p className="text-muted-foreground">
                Every company is verified to ensure you&apos;re applying to legitimate opportunities.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card space-y-4 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center border border-cyan-500/20 dark:border-cyan-400/20">
                <TrendingUp className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold">Application Tracking</h3>
              <p className="text-muted-foreground">
                Track all your applications in one place with status updates and analytics.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card space-y-4 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center border border-cyan-500/20 dark:border-cyan-400/20">
                <UserCircle className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold">Placement Support</h3>
              <p className="text-muted-foreground">
                Dedicated placement team to guide you through the interview process.
              </p>
            </div>

            <div className="p-6 rounded-lg border bg-card space-y-4 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-cyan-500/10 dark:bg-cyan-400/10 flex items-center justify-center border border-cyan-500/20 dark:border-cyan-400/20">
                <Sparkles className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                Our intelligent algorithm matches you with jobs that align with your skills and career goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl opacity-90">
              Quality job opportunities, curated to help you apply faster and feel confident every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white"
                onClick={handleDashboardClick}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-cyan-600 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950" asChild>
                <Link href="/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
