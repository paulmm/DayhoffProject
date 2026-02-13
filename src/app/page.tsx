"use client";

import Link from "next/link";
import DayhoffLogo from "@/components/brand/DayhoffLogo";
import FadeIn from "@/components/motion/FadeIn";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-dayhoff-bg-primary">
      {/* ── Animated background orbs ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Large primary glow — slow drift */}
        <div
          className="absolute left-1/2 top-[40%] h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.14) 0%, rgba(139,92,246,0.04) 50%, transparent 70%)",
            animation: "drift 12s ease-in-out infinite alternate",
          }}
        />
        {/* Secondary pink orb — offset, counter-drift */}
        <div
          className="absolute left-[60%] top-[35%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-100"
          style={{
            background:
              "radial-gradient(circle, rgba(236,72,153,0.10) 0%, rgba(236,72,153,0.03) 50%, transparent 70%)",
            animation: "drift 16s ease-in-out infinite alternate-reverse",
          }}
        />
        {/* Cyan accent orb — smaller, faster */}
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
        {/* Logo — hero sized */}
        <FadeIn delay={0} duration={0.7}>
          <DayhoffLogo className="text-6xl sm:text-7xl lg:text-8xl" />
        </FadeIn>

        {/* Headline */}
        <FadeIn delay={0.2} duration={0.6}>
          <h1 className="mt-10 max-w-3xl text-3xl font-semibold leading-snug tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            AI-collaborative drug design that teaches you the science
            while you do the science.
          </h1>
        </FadeIn>

        {/* Subhead */}
        <FadeIn delay={0.4} duration={0.6}>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-gray-400 sm:text-xl">
            Learn computational biology by doing it&nbsp;&mdash; with an AI
            collaborator that shows its reasoning, admits uncertainty, and
            makes you a better scientist with every interaction.
          </p>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={0.55} duration={0.6}>
          <div className="mt-12 flex flex-wrap items-center gap-5">
            <Link
              href="/auth/signin"
              className="group relative overflow-hidden rounded-xl bg-dayhoff-purple px-8 py-4 text-base font-semibold text-white shadow-lg shadow-dayhoff-purple/25 transition-all duration-300 hover:shadow-xl hover:shadow-dayhoff-purple/30 hover:brightness-110"
            >
              <span className="relative z-10">Get Started</span>
              {/* Shimmer on hover */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>
            <Link
              href="#learn-more"
              className="rounded-xl border border-white/10 px-8 py-4 text-base font-semibold text-gray-300 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.03] hover:text-white"
            >
              Learn More
            </Link>
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
