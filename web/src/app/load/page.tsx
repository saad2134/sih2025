"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Test() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start fade out 1.8 seconds in, complete redirect at 2 seconds
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1800);

    const redirectTimer = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 ${
        isExiting ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{ backgroundColor: '#7939e7' }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl transition-all duration-700 ${
          isExiting ? "opacity-0 scale-150" : "opacity-100 scale-100 animate-pulse"
        }`}></div>
        <div className={`absolute -bottom-40 -left-32 w-80 h-80 bg-white/10 rounded-full blur-3xl transition-all duration-700 delay-300 ${
          isExiting ? "opacity-0 scale-150" : "opacity-100 scale-100 animate-pulse delay-1000"
        }`}></div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center transition-all duration-600 ${
        isExiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}>
        {/* App Name with fade-in */}
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight animate-fade-in">
          Shiksha<span className="text-white/80">Disha</span>
        </h1>

        {/* Book Loading Animation */}
        <div className="relative mb-8">
          <div className={`w-20 h-24 mx-auto bg-white/20 rounded-lg shadow-lg transition-transform duration-500 ${
            isExiting ? "scale-90 rotate-5" : "scale-100 rotate-0"
          }`}>
            {/* Book Pages Animation */}
            <div className="absolute inset-0 flex justify-center">
              <div className={`w-1 h-20 bg-white/40 mx-0.5 transition-all duration-300 ${
                isExiting ? "opacity-0 h-4" : "opacity-100 h-20 animate-pulse"
              }`}></div>
              <div className={`w-1 h-20 bg-white/30 mx-0.5 transition-all duration-300 delay-75 ${
                isExiting ? "opacity-0 h-4" : "opacity-100 h-20 animate-pulse delay-75"
              }`}></div>
              <div className={`w-1 h-20 bg-white/20 mx-0.5 transition-all duration-300 delay-150 ${
                isExiting ? "opacity-0 h-4" : "opacity-100 h-20 animate-pulse delay-150"
              }`}></div>
              <div className={`w-1 h-20 bg-white/10 mx-0.5 transition-all duration-300 delay-300 ${
                isExiting ? "opacity-0 h-4" : "opacity-100 h-20 animate-pulse delay-300"
              }`}></div>
            </div>
          </div>
        </div>

        {/* Loading Text with Dots Animation */}
        <div className={`text-white/90 text-lg font-medium transition-all duration-400 ${
          isExiting ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}>
          Preparing Your Learning Path
          <span className="inline-flex ml-1">
            <span className={`transition-all duration-300 ${
              isExiting ? "opacity-0 scale-50" : "animate-bounce"
            }`}>.</span>
            <span className={`transition-all duration-300 delay-100 ${
              isExiting ? "opacity-0 scale-50" : "animate-bounce delay-100"
            }`}>.</span>
            <span className={`transition-all duration-300 delay-200 ${
              isExiting ? "opacity-0 scale-50" : "animate-bounce delay-200"
            }`}>.</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-48 mx-auto bg-white/20 rounded-full h-1.5 overflow-hidden">
          <div className={`bg-white h-1.5 rounded-full transition-all duration-2000 ${
            isExiting ? "w-full opacity-80" : "animate-progress"
          }`}></div>
        </div>
      </div>

      {/* Subtle Footer */}
      <div className={`absolute bottom-6 text-white/60 text-sm transition-all duration-500 ${
        isExiting ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
      }`}>
        Your journey to career clarity begins here.
      </div>
    </div>
  );
}