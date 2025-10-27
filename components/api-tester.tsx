"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/axios-client';
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';

export default function ApiTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testHealthEndpoint = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.get('/health');
      setResult({
        status: response.status,
        data: response.data,
        success: true
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect to API');
      setResult({
        status: err.response?.status || 'Network Error',
        data: err.response?.data || null,
        success: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          API Tester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testHealthEndpoint}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Health Endpoint'
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {result.status}
              </Badge>
            </div>
            
            {result.data && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium mb-1">Response:</p>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Error:</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}