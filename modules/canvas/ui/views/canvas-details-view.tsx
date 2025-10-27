"use client";

import { useCanvas } from "@/modules/canvas/server/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Image, FileText, Play, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface CanvasDetailsViewProps {
  canvasId: string;
}

export default function CanvasDetailsView({
  canvasId,
}: CanvasDetailsViewProps) {
  const router = useRouter();
  const { data: canvas, isLoading, error } = useCanvas(canvasId);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStartAnalysis = () => {
    // TODO: Implement analysis functionality
    console.log("Starting analysis for canvas:", canvas?.id);
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-8 w-48" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="aspect-video w-full rounded-md" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !canvas) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">
            Error Loading Canvas
          </h1>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Canvas not found"}
          </p>
          <Button onClick={handleBackToDashboard} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{canvas.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>Created {formatDate(canvas.createdAt)}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleStartAnalysis}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <Play className="h-5 w-5 mr-2" />
            Start Analysis
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canvas Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Canvas Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {canvas.url ? (
                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                  <img
                    src={canvas.url}
                    alt={canvas.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="w-full h-full hidden items-center justify-center bg-muted">
                    <Image className="h-12 w-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Failed to load image
                    </p>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No image available
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Canvas Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Canvas Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Canvas ID
                </label>
                <p className="text-sm font-mono bg-muted p-2 rounded-md mt-1">
                  {canvas.id}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Prompt
                </label>
                <p className="mt-1 text-sm leading-relaxed">{canvas.prompt}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Created
                  </label>
                  <p className="text-sm mt-1">{formatDate(canvas.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="text-sm mt-1">{formatDate(canvas.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
