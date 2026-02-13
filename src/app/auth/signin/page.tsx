"use client";

import { signIn } from "next-auth/react";
import DayhoffLogo from "@/components/brand/DayhoffLogo";
import FadeIn from "@/components/motion/FadeIn";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-dayhoff-bg-primary">
      {/* ── Animated background orbs ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[38%] h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.03) 50%, transparent 70%)",
            animation: "drift 14s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute left-[60%] top-[45%] h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 60%)",
            animation: "drift 18s ease-in-out infinite alternate-reverse",
          }}
        />
      </div>

      {/* ── Dot grid ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-start px-6">
        {/* Logo — generous size for sign-in */}
        <FadeIn delay={0} duration={0.7}>
          <DayhoffLogo className="text-4xl sm:text-5xl lg:text-6xl" />
        </FadeIn>

        <FadeIn delay={0.15} duration={0.5}>
          <p className="mt-5 text-base leading-relaxed text-gray-400">
            AI-collaborative drug design that teaches you the science while
            you do the science.
          </p>
        </FadeIn>

        {/* Sign-in card */}
        <FadeIn delay={0.3} duration={0.5} className="mt-10 w-full">
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.03] p-8 shadow-2xl shadow-black/30 backdrop-blur-sm">
            <div className="space-y-4">
              <button
                onClick={() =>
                  signIn("google", { callbackUrl: "/dashboard" })
                }
                className="group flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:border-white/20 hover:bg-white/10"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-dayhoff-bg-secondary px-3 text-gray-500">or</span>
                </div>
              </div>

              <button
                onClick={() =>
                  signIn("credentials", { callbackUrl: "/dashboard" })
                }
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-dayhoff-purple px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-dayhoff-purple/20 transition-all duration-300 hover:shadow-xl hover:shadow-dayhoff-purple/30 hover:brightness-110"
              >
                <span className="relative z-10">Sign in as Demo User</span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ── Keyframes ── */}
      <style jsx>{`
        @keyframes drift {
          0% {
            transform: translate(-50%, -50%) translate(0px, 0px);
          }
          100% {
            transform: translate(-50%, -50%) translate(30px, -20px);
          }
        }
      `}</style>
    </div>
  );
}
