"use client";

import { motion } from "framer-motion";

interface DayhoffLogoProps {
  className?: string;
}

export default function DayhoffLogo({ className }: DayhoffLogoProps) {
  return (
    <div className={className}>
      <p
        className="font-semibold tracking-tight"
        style={{
          color: "#F3F6FF",
          textShadow:
            "0 0 40px rgba(123,231,255,0.12), 0 0 80px rgba(184,199,255,0.06)",
        }}
      >
        The{" "}
        <span
          className="font-bold"
          style={{
            background:
              "linear-gradient(to right, #B8C7FF, #7BE7FF 55%, #C9A7FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Dayhoff
        </span>{" "}
        Project
      </p>

      {/* Squiggly DNA-like underline */}
      <svg
        className="mt-2 w-full"
        viewBox="0 0 600 16"
        preserveAspectRatio="none"
        style={{ height: "10px" }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7BE7FF" stopOpacity="0" />
            <stop offset="12%" stopColor="#7BE7FF" stopOpacity=".7" />
            <stop offset="50%" stopColor="#B8C7FF" stopOpacity=".6" />
            <stop offset="88%" stopColor="#C9A7FF" stopOpacity=".7" />
            <stop offset="100%" stopColor="#C9A7FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 0 8 C 25 2, 50 2, 75 8 S 125 14, 150 8 S 200 2, 225 8 S 275 14, 300 8 S 350 2, 375 8 S 425 14, 450 8 S 500 2, 525 8 S 575 14, 600 8"
          stroke="url(#lineGrad)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.9 }}
          transition={{
            pathLength: {
              duration: 1.8,
              delay: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            },
            opacity: { duration: 0.4, delay: 0.6 },
          }}
        />
      </svg>
    </div>
  );
}
