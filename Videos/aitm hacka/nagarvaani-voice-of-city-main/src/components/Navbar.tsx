'use client';

import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Menu, Moon, Sun, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("nv-theme");
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("nv-theme", next ? "dark" : "light");
    }
  };

  // Don't render interactive elements until after hydration
  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 border-b border-border/40 glass-strong">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-civic shadow-civic">
              <Megaphone className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-none">
              <div className="font-display text-lg font-bold tracking-tight">NagarVaani</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Voice of Bhatkal</div>
            </div>
          </Link>
          <div className="flex-1" />
        </div>
      </header>
    );
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border/40 glass-strong"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-civic shadow-civic">
            <Megaphone className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <div className="font-display text-lg font-bold tracking-tight">NagarVaani</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Voice of Bhatkal</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/map", label: "City Map" },
            { to: "/analytics", label: "Analytics" },
            { to: "/leaderboard", label: "Leaderboard" },
            { to: "/dashboard", label: "Dashboard" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition"
              activeProps={{ className: "px-3 py-2 rounded-lg text-sm font-medium text-foreground bg-muted/60" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--amber-accent)] animate-pulse" />
          </button>
          <Link to="/submit" className="hidden sm:block">
            <Button className="gradient-civic text-white shadow-civic hover:opacity-95 hover:shadow-civic transition rounded-full px-5">
              Report Issue
            </Button>
          </Link>
          <button className="md:hidden grid h-9 w-9 place-items-center rounded-lg hover:bg-muted/60 text-muted-foreground" aria-label="Menu">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}