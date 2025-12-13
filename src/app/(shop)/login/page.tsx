'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sendOtp, verifyOtp } from '@/lib/apiClients/store/authentication';
import { authAPI, setAuthSession } from '@/lib/apiClients/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [keyValidated, setKeyValidated] = useState(false);
  const [validatingKey, setValidatingKey] = useState(true);
  const router = useRouter();

  // Validate API key once when component loads
  useEffect(() => {
    const validateApiKey = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_STORENTIA_API_KEY;
        if (!apiKey) {
          setError('API key not configured');
          setValidatingKey(false);
          return;
        }

        const result = await authAPI.validateKey(apiKey);
        
        if (result.success && result.store_data) {
          // Store the validated data
          setAuthSession(result.store_data, apiKey);
          setKeyValidated(true);
          console.log('API key validated successfully:', result.store_data);
        } else {
          setError(result.message || 'Invalid API key');
        }
      } catch (error) {
        console.error('Key validation error:', error);
        setError('Failed to validate API key');
      } finally {
        setValidatingKey(false);
      }
    };

    validateApiKey();
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyValidated) {
      setError('API key validation required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await sendOtp({ email });
      
      if (result.success) {
        setStep('otp');
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      setError('An error occurred while sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifyOtp({ email, otp });
      
      if (result.success) {
        // Redirect to store home page after successful login (not dashboard)
        router.push('/');
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch (error) {
      setError('An error occurred while verifying OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
  };

  // Show loading while validating key
  if (validatingKey) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-10">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Validating store configuration...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if key validation failed
  if (!keyValidated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-red-600">Configuration Error</CardTitle>
            <CardDescription>
              Store configuration validation failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            {step === 'email' 
              ? 'Enter your email to receive an OTP'
              : 'Enter the OTP sent to your email'
            }
          </CardDescription>
        </CardHeader>
        
        {error && (
          <div className="mx-6 mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="storeuser@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={loading}
                  maxLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-6">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default LoginPage;
