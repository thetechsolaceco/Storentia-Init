"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authAPI, BASE_URL } from "@/lib/apiClients";

export default function DebugPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testAuthApi = async () => {
    setLoading(true);
    setResult("");
    try {
      console.log("[Debug] Testing authAPI.getCurrentUser()");
      const response = await authAPI.getCurrentUser();
      
      setResult(JSON.stringify({
        type: "authAPI.getCurrentUser()",
        cookies: document.cookie,
        response,
      }, null, 2));
    } catch (error) {
      setResult(`API Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const showCookies = () => {
    setResult(JSON.stringify({
      cookies: document.cookie,
      localStorage: {
        storentia_user: localStorage.getItem("storentia_user"),
        storentia_api_key: localStorage.getItem("storentia_api_key"),
        storentia_store: localStorage.getItem("storentia_store"),
      },
      BASE_URL,
    }, null, 2));
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Auth Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testAuthApi} disabled={loading}>
              {loading ? "Testing..." : "Test Auth API"}
            </Button>
            <Button variant="outline" onClick={showCookies}>
              Show Storage
            </Button>
            <Button variant="outline" onClick={() => authAPI.initiateGoogleAuth()}>
              Login with Google
            </Button>
          </div>
          
          {result && (
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-96">
              {result}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
