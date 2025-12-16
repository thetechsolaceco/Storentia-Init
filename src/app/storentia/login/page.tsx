"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authAPI } from "@/lib/apiClients";
import { useAuth } from "@/components/providers/auth-provider";
import { Eye, EyeOff, Github } from "lucide-react";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#FFFFFF"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#FFFFFF"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FFFFFF"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#FFFFFF"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round">
             <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    )
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { setUserData } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser();
        if (response.success && response.data?.user) {
          setUserData(response.data.user);
          router.replace("/storentia/dashboard");
          return;
        }
      } catch (error) {
        console.log("[Login] Auth check error:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, setUserData]);

  const handleGoogleLogin = () => {
    setIsRedirecting(true);
    authAPI.initiateGoogleAuth();
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-black overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[100px]" />
      
       {/* Ambient Light Beam Effect */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[500px] bg-gradient-to-b from-indigo-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />


      <div className="relative z-10 w-full max-w-[420px] p-8 mx-4">
        {/* Glass Card Container */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl" />
        
        <div className="relative z-20 flex flex-col items-center">
            {/* Tag/Badge at top - purely decorative as per screenshot */}


            <h1 className="font-playfair text-4xl text-white font-medium mb-12 tracking-tight text-center mt-4">
            Welcome Back
            </h1>

            <div className="w-full space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium ml-1">Email address</label>
                <div className="relative group">
                    <input 
                        type="email" 
                        defaultValue="rares@stream.com"
                        className="w-full text-white border  rounded-xl px-4 py-3 focus:outline-none focus:border-green-500/60 transition-all placeholder:text-zinc-600"
                    />
                    {/* Glow effect on input */}
                    <div className="absolute inset-0 rounded-xl bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            </div>

             {/* Password Input */}
             <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-medium ml-1">Password</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        className="w-full bg-zinc-900/50 text-white border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-white/10 transition-all placeholder:text-zinc-600 pr-10"
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>


            {/* Divider */}
            <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-zinc-500">or Sign in with</span>
                </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-4">
                 <Button 
                    variant="outline" 
                    className="h-12 bg-black/40 border-white/5 hover:bg-white/5 hover:text-white text-zinc-300 rounded-full gap-2 transition-all"
                    onClick={() => handleGoogleLogin()}
                >
                    <GoogleIcon className="w-5 h-5" />
                    Google
                </Button>
                <Button 
                    variant="outline" 
                    className="h-12 bg-black/40 border-white/5 hover:bg-white/5 hover:text-white text-zinc-300 rounded-full gap-2 transition-all"
                >
                    <Github className="w-5 h-5" />
                    Github
                </Button>
            </div>

            {/* Footer */}
            <div className="space-y-4 text-center pt-4">
                 
                 <div className="text-[10px] text-zinc-600 leading-tight px-4">
                    By signing up, you agree to the <span className="text-zinc-500 hover:text-zinc-400 cursor-pointer">Terms of Service</span>.
                    <br />
                    You agree to receive our emails.
                 </div>
            </div>

            </div>
        </div>
      </div>
    </div>
  );
}
