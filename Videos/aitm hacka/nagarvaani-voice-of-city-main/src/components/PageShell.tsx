'use client';

import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function PageShell({ children, eyebrow, title, subtitle }: { children: React.ReactNode; eyebrow?: string; title?: string; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="relative border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-[var(--civic)] opacity-15 blur-[100px]" />
        {(eyebrow || title) && (
          <div className="relative mx-auto max-w-7xl px-6 py-14">
            {eyebrow && <div className="text-xs uppercase tracking-[0.25em] text-[var(--civic-glow)] font-semibold">{eyebrow}</div>}
            {title && <h1 className="mt-2 font-display text-4xl sm:text-5xl font-bold tracking-tight">{title}</h1>}
            {subtitle && <p className="mt-3 text-muted-foreground max-w-2xl">{subtitle}</p>}
          </div>
        )}
      </div>
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl px-6 py-12"
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
}