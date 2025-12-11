"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setUserSession } from "@/lib/apiClients";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      const token = searchParams.get("token");
      const error = searchParams.get("error");
      const name = searchParams.get("name");
      const email = searchParams.get("email");
      const userId = searchParams.get("userId");
      const image = searchParams.get("image");

      if (error) {
        setStatus("error");
        setMessage(decodeURIComponent(error));
        return;
      }

      if (token) {
        setUserSession(token, {
          id: userId || "",
          name: name || "",
          email: email || "",
          image: image || undefined,
        });

        setUserName(name);
        setStatus("success");
        setMessage("Authentication successful!");

        setTimeout(() => {
          router.push("/storentia/dashboard");
        }, 1500);
      } else {
        setStatus("error");
        setMessage("No authentication token received. Please try again.");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            {status === "loading" && "Completing Sign In..."}
            {status === "success" && "Welcome!"}
            {status === "error" && "Authentication Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Processing your Google sign in...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium">{message}</p>
                {userName && (
                  <p className="text-sm text-muted-foreground">
                    Welcome, {userName}!
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="h-12 w-12 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
                <Button
                  variant="outline"
                  onClick={() => router.push("/storentia/login")}
                  className="mt-4"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
