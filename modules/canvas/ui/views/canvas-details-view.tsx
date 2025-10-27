"use client";

import { useCanvas } from "@/modules/canvas/server/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Image, FileText, Play, ArrowLeft, Brain, Eye, Sparkles } from "lucide-react";
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
  const [desc, setDesc] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);

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

  // Helper function to clean markdown-wrapped JSON
  const cleanJsonResponse = (response: string): string => {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();
    return cleaned;
  };

  const handleStartAnalysis = async () => {
    if (!canvas) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setTorchAnalysisResult(null);
    setOcrResult(null);
    setDesc(null);
    setPrompt(null);

    console.log("Starting analysis for:", canvas.url);

    const API_BASE_URL = process.env.API_URL;


    try {
      // Torch Analysis
      console.log("Starting torch analysis...");
      const torchUrl = `${API_BASE_URL}/api/v1/torch-analysis?image_url=${encodeURIComponent(String(canvas.url))}`;
      const torchResponse = await fetch(torchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!torchResponse.ok) {
        const errorText = await torchResponse.text();
        throw new Error(`Torch analysis failed: ${torchResponse.status} - ${errorText}`);
      }

      const torchData = await torchResponse.json();
      setTorchAnalysisResult(torchData);
      console.log("Torch Analysis completed:", torchData);

      // OCR Analysis
      console.log("Starting OCR analysis...");
      const ocrUrl = `${API_BASE_URL}/api/v1/run-ocr?image_url=${encodeURIComponent(String(canvas.url))}`;
      const ocrResponse = await fetch(ocrUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!ocrResponse.ok) {
        const errorText = await ocrResponse.text();
        throw new Error(`OCR analysis failed: ${ocrResponse.status} - ${errorText}`);
      }

      const ocrData = await ocrResponse.json();
      setOcrResult(ocrData);
      console.log("OCR Analysis completed:", ocrData);

      
      // Critique Analysis
      console.log("Starting critique analysis...");
      const ocrString = typeof ocrData === "string" ? ocrData : JSON.stringify(ocrData);
      const torchString = JSON.stringify(torchData.top5);

      console.log("OCR string for critique:", ocrString);
      console.log("Torch string for critique:", torchString);

      const critiqueUrl = `${API_BASE_URL}/api/v1/critique-analyser?ocr=${encodeURIComponent(ocrString)}&torch_analysis=${encodeURIComponent(torchString)}&canvas_id=${encodeURIComponent(canvas.id)}`;
      const critiqueResponse = await fetch(critiqueUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });


      if (!critiqueResponse.ok) {
        const errorText = await critiqueResponse.text();
        throw new Error(`Critique analysis failed: ${critiqueResponse.status} - ${errorText}`);
      }

      const critiqueRawResponse = await critiqueResponse.json();
      console.log("Raw critique response:", critiqueRawResponse);

      // Parse the JSON string response (handle markdown wrapping)
      let critiqueData;
      if (typeof critiqueRawResponse === 'string') {
        try {
          const cleanedResponse = cleanJsonResponse(critiqueRawResponse);
          console.log("Cleaned response:", cleanedResponse);
          critiqueData = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error("Failed to parse critique response:", parseError);
          console.error("Raw response was:", critiqueRawResponse);
          throw new Error("Invalid JSON response from critique API");
        }
      } else {
        critiqueData = critiqueRawResponse;
      }

      console.log("Parsed critique data:", critiqueData);

      // Set the critique results
      setDesc(critiqueData.ad_description || "No description available");
      setPrompt(critiqueData.refined_prompt || "No refined prompt available");

      console.log("Final description:", critiqueData.ad_description);
      console.log("Final prompt:", critiqueData.refined_prompt);

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
          <h1 className="text-2xl font-bold text-red-600">Error Loading Canvas</h1>
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
                    <div className="text-center">
                      <Image className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Failed to load image</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No image available</p>
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
                <label className="text-sm font-medium text-muted-foreground">Canvas ID</label>
                <p className="text-sm font-mono bg-muted p-2 rounded-md mt-1">{canvas.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Prompt</label>
                <p className="mt-1 text-sm leading-relaxed">{canvas.prompt}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm mt-1">{formatDate(canvas.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm mt-1">{formatDate(canvas.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Analysis Results */}
        {/* Analysis Results */}
        {(desc || prompt || analysisError) && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold flex items-center justify-center gap-3 mb-2">
                <Brain className="h-8 w-8 text-primary" />
                AI Analysis Results
              </h2>
              <p className="text-muted-foreground">Powered by advanced computer vision and natural language processing</p>
            </div>

            {analysisError && (
              <Card className="border-destructive/20 bg-white">
                <CardHeader>
                  <CardTitle className="text-destructive">Analysis Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive">{analysisError}</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {desc && (
                <Card className="border-primary/20 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Eye className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Ad Description</h3>
                        <p className="text-sm text-primary font-normal">AI-generated content analysis</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-white backdrop-blur-sm rounded-lg p-4 border border-primary/10">
                      <p className="text-foreground leading-relaxed text-base font-medium">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {prompt && (
                <Card className="border-primary/20 bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Refined Prompt</h3>
                        <p className="text-sm text-primary font-normal">Optimized for better results</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-white backdrop-blur-sm rounded-lg p-4 border border-primary/10">
                      <p className="text-foreground leading-relaxed text-base font-medium">{prompt}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Loading indicator during analysis */}
        {isAnalyzing && (
          <Card className="border-primary/20 bg-white">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
                  <Brain className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-primary mb-1">AI Analysis in Progress</h3>
                  <p className="text-muted-foreground">Processing your canvas with advanced algorithms...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
}
