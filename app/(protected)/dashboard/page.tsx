"use client";

import { useAuthProtection } from "@/hooks/use-auth-protection";
import { useUserData } from "@/hooks/use-user-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Upload,
  Eye,
  Wand2,
  Target,
  MessageSquare,
  Palette,
  TrendingUp,
  BarChart3,
  Zap,
  CheckCircle,
  Star,
  Play,
  ArrowRight,
  Brain,
  Sparkles,
  Plus,
} from "lucide-react";

export default function DashboardPage() {
  const { session, isLoading: isAuthLoading } = useAuthProtection({ requireAuth: true });
  const { data: userData, isLoading: isUserDataLoading } = useUserData();

  const isLoading = isAuthLoading || isUserDataLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Not Signed In</h1>
          <p className="text-sm sm:text-base text-muted-foreground px-4">
            Please sign in to access your dashboard.
          </p>
          <Button asChild className="w-full sm:w-auto px-8">
            <a href="/sign-in">Sign In</a>
          </Button>
        </div>
      </div>
    );
  }

  const displayUser = userData || session.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {displayUser.name.split(" ")[0]}!
              </h1>
              <p className="text-gray-600 mt-2">
                Ready to create amazing ads with AI?
              </p>
            </div>
            <Button size="lg" className="px-6 py-3">
              <Plus className="w-5 h-5 mr-2" />
              Create New Ad
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Total Canvas</h3>
                  <Palette className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {userData?.stats.totalCanvases ?? 0}
                </div>
                <p className="text-sm text-gray-600">AI-generated designs</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Projects</h3>
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {userData?.stats.totalProjects ?? 0}
                </div>
                <p className="text-sm text-gray-600">Analysis completed</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Credits Left</h3>
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">25</div>
                <p className="text-sm text-gray-600">Out of 100 credits</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Member Since</h3>
                  <Star className="w-5 h-5 text-primary" />
                </div>
                <div className="text-lg font-bold text-primary mb-2">
                  {userData?.stats.memberSince || "Loading..."}
                </div>
                <p className="text-sm text-gray-600">Active user</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex-col gap-3 hover:bg-primary/5">
                  <Upload className="w-8 h-8 text-primary" />
                  <span className="font-medium">Upload Ad</span>
                  <span className="text-xs text-gray-500">Analyze existing ad</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex-col gap-3 hover:bg-primary/5">
                  <Wand2 className="w-8 h-8 text-primary" />
                  <span className="font-medium">AI Generate</span>
                  <span className="text-xs text-gray-500">Create from scratch</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex-col gap-3 hover:bg-primary/5">
                  <Eye className="w-8 h-8 text-primary" />
                  <span className="font-medium">View Projects</span>
                  <span className="text-xs text-gray-500">See all analyses</span>
                </Button>
                
                <Button variant="outline" className="h-24 flex-col gap-3 hover:bg-primary/5">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <span className="font-medium">Analytics</span>
                  <span className="text-xs text-gray-500">Performance insights</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData?.stats.totalProjects === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No projects yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Upload your first ad to get AI-powered insights and improvements.
                    </p>
                    <Button>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Your First Ad
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Ad Analysis Completed</p>
                          <p className="text-sm text-gray-600">2 hours ago</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Completed</Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}