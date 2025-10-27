"use client";

import { useCanvas } from "@/modules/canvas/server/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Image, FileText, Play, ArrowLeft, Brain, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState } from "react";

interface CanvasDetailsViewProps {
  canvasId: string;
}

export default function CanvasDetailsView({
  canvasId,
}: CanvasDetailsViewProps) {
  const router = useRouter();
  const { data: canvas, isLoading, error } = useCanvas(canvasId);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [torchAnalysisResult, setTorchAnalysisResult] = useState<any>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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

  const handleStartAnalysis = async () => {
    if (!canvas) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setTorchAnalysisResult(null);
    setOcrResult(null);

    console.log(canvas.url);

    const API_BASE_URL = "https://bold-helpful-gull.ngrok-free.app";

    try {
  setIsAnalyzing(true);
  setAnalysisError(null);

  // 1️⃣ Torch analysis first
  const torchUrl = `${API_BASE_URL}/api/v1/torch-analysis?image_url=${encodeURIComponent(String(canvas.url))}`;
  const torchResponse = await fetch(torchUrl, {
    method: 'POST', // keep POST if backend expects it
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!torchResponse.ok) {
    throw new Error(`Torch analysis failed: ${torchResponse.status} ${torchResponse.statusText}`);
  }

  const torchData = await torchResponse.json();
  setTorchAnalysisResult(torchData);
  console.log("Torch Analysis response:", torchData);

  // 2️⃣ Then OCR analysis (after torch finishes)
  const ocrUrl = `${API_BASE_URL}/api/v1/run-ocr?image_url=${encodeURIComponent(String(canvas.url))}`;
  const ocrResponse = await fetch(ocrUrl, {
    method: 'POST', // same note — adjust if your backend uses GET
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!ocrResponse.ok) {
    throw new Error(`OCR analysis failed: ${ocrResponse.status} ${ocrResponse.statusText}`);
  }

  const ocrData = await ocrResponse.json();
  setOcrResult(ocrData);
  console.log("OCR response:", ocrData);

} catch (error) {
  console.error("Analysis failed:", error);
  setAnalysisError(error instanceof Error ? error.message : "Analysis failed");
} finally {
  setIsAnalyzing(false);
}

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
            disabled={isAnalyzing || !canvas?.url}
          >
            <Play className="h-5 w-5 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Start Analysis"}
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

        {/* Analysis Results */}
        {(torchAnalysisResult || ocrResult || analysisError) && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analysis Results</h2>

            {analysisError && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700">Analysis Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-600">{analysisError}</p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Torch Analysis Results */}
              {torchAnalysisResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Torch Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Main Prediction */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-green-800">Primary Classification</h4>
                          <span className="text-sm text-green-600">
                            {(torchAnalysisResult.confidence * 100).toFixed(1)}% confidence
                          </span>
                        </div>
                        <p className="text-lg font-medium text-green-900 mt-1 capitalize">
                          {torchAnalysisResult.label}
                        </p>
                      </div>

                      {/* Top 5 Predictions */}
                      {torchAnalysisResult.top5 && (
                        <div>
                          <h4 className="font-semibold text-sm text-muted-foreground mb-3">Top 5 Predictions</h4>
                          <div className="space-y-2">
                            {torchAnalysisResult.top5.map((prediction: any, index: number) => (
                              <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                                <span className="text-sm capitalize">{prediction.label}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full" 
                                      style={{ width: `${prediction.prob * 100}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-muted-foreground w-12 text-right">
                                    {(prediction.prob * 100).toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw JSON (collapsible) */}
                      <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                          View Raw Response
                        </summary>
                        <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-48 mt-2">
                          {JSON.stringify(torchAnalysisResult, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* OCR Results */}
              {ocrResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      OCR Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <pre className="bg-muted p-3 rounded-md text-sm overflow-auto max-h-96">
                        {JSON.stringify(ocrResult, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
