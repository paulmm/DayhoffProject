"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import DayhoffLogo from "@/components/brand/DayhoffLogo";
import FadeIn from "@/components/motion/FadeIn";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-dayhoff-bg-primary">
      {/* ── Animated background orbs ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute left-1/2 top-[40%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(139,92,246,0.04) 50%, transparent 70%)",
            animation: "drift 12s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute left-[60%] top-[35%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.10) 0%, rgba(236,72,153,0.03) 50%, transparent 70%)",
            animation: "drift 16s ease-in-out infinite alternate-reverse",
          }}
        />
        <div
          className="absolute left-[35%] top-[50%] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgba(123,231,255,0.07) 0%, transparent 60%)",
            animation: "drift 10s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* ── Dot grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Horizontal rule accents ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-0 right-0 top-[30%] h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute left-0 right-0 top-[70%] h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-start px-6">
        <FadeIn delay={0} duration={0.7}>
          <DayhoffLogo className="text-6xl sm:text-7xl lg:text-8xl" />
        </FadeIn>

        <FadeIn delay={0.2} duration={0.6}>
          <h1 className="mt-10 max-w-3xl text-3xl font-semibold leading-snug tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            AI-collaborative drug design that teaches you the science
            while you do the science.
          </h1>
        </FadeIn>

        <FadeIn delay={0.4} duration={0.6}>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
            Learn computational biology by doing it&nbsp;&mdash; with an AI
            collaborator that shows its reasoning, admits uncertainty, and
            makes you a better scientist with every interaction.
          </p>
        </FadeIn>

        <FadeIn delay={0.55} duration={0.6}>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <button
              onClick={() => setShowLogin(true)}
              className="group relative overflow-hidden rounded-xl bg-dayhoff-purple px-8 py-4 text-base font-semibold text-white shadow-lg shadow-dayhoff-purple/25 transition-all duration-300 hover:shadow-xl hover:shadow-dayhoff-purple/30 hover:brightness-110"
            >
              <span className="relative z-10">Login</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
            <Link
              href="/about"
              className="rounded-xl border border-white/10 px-8 py-4 text-base font-semibold text-gray-300 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.03] hover:text-white"
            >
              Learn More
            </Link>
          </div>
        </FadeIn>
      </div>

      {/* ── Login Modal ── */}
      <AnimatePresence>
        {showLogin && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowLogin(false)}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-6"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div
                className="relative w-full max-w-sm rounded-2xl border border-white/[0.12] bg-dayhoff-bg-secondary p-8 shadow-2xl shadow-black/40"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setShowLogin(false)}
                  className="absolute right-4 top-4 text-gray-500 transition-colors hover:text-white"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <h2 className="mb-6 text-xl font-semibold text-white">
                  Sign in
                </h2>

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
                      <span className="bg-dayhoff-bg-secondary px-3 text-gray-500">
                        or
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      signIn("credentials", { callbackUrl: "/dashboard" })
                    }
                    className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-dayhoff-purple px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-dayhoff-purple/20 transition-all duration-300 hover:shadow-xl hover:shadow-dayhoff-purple/30 hover:brightness-110"
                  >
                    <span className="relative z-10">
                      Sign in as Demo User
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
