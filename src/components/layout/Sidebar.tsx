"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Home,
  FlaskConical,
  GitBranch,
  Package,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Dna,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/experiments", label: "Experiments", icon: FlaskConical },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/modules", label: "Modules", icon: Package },
  { href: "/learning", label: "My Learning", icon: GraduationCap },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <motion.aside
      animate={{ width: expanded ? 256 : 64 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-screen flex-col border-r border-white/10 bg-dayhoff-bg-secondary"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4">
        <Dna className="h-8 w-8 shrink-0 text-dayhoff-purple" />
        {expanded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-brand bg-clip-text text-xl font-bold tracking-tight text-transparent"
          >
            dayhoff
          </motion.span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "border-l-2 border-dayhoff-purple bg-white/5 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {expanded && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mx-2 mb-2 flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
      >
        {expanded ? (
          <ChevronLeft className="h-5 w-5" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </button>

      {/* User Section */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-dayhoff-purple/20 text-sm font-semibold text-dayhoff-purple">
            {session?.user?.name?.[0] ?? "?"}
          </div>
          {expanded && (
            <div className="flex flex-1 items-center justify-between">
              <span className="truncate text-sm text-gray-300">
                {session?.user?.name ?? "User"}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="text-gray-400 hover:text-white"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
