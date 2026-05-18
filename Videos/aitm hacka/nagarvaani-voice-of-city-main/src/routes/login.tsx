'use client';

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Megaphone, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — NagarVaani" }] }),
  component: Login,
});

function Login() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:block overflow-hidden gradient-civic">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute inset-0 grid place-items-center p-12">
          <div className="text-white max-w-md">
            <Megaphone className="h-12 w-12 mb-6" />
            <h2 className="font-display text-4xl font-bold leading-tight">Bhatkal's civic voice, in your pocket.</h2>
            <p className="mt-4 text-white/85">Join 1,200+ citizens reporting issues, tracking resolutions, and earning recognition for making the city better.</p>
            <div className="mt-8 flex gap-6 text-sm">
              <Stat n="1,247" l="Issues" />
              <Stat n="89%" l="Resolved" />
              <Stat n="12" l="Wards" />
            </div>
          </div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="grid place-items-center p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-civic"><Megaphone className="h-4 w-4 text-white" /></div>
            <span className="font-display font-bold">NagarVaani</span>
          </Link>
          <div className="inline-flex rounded-full bg-muted p-1 mb-6">
            <button onClick={() => setTab("login")} className={`px-5 py-1.5 rounded-full text-sm font-medium transition ${tab === "login" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Sign in</button>
            <button onClick={() => setTab("signup")} className={`px-5 py-1.5 rounded-full text-sm font-medium transition ${tab === "signup" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>Sign up</button>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {tab === "login" ? "Welcome back" : "Join NagarVaani"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "login" ? "Sign in to track your complaints" : "Create your civic account in 30 seconds"}
          </p>
          <form className="mt-6 space-y-3">
            {tab === "signup" && <Input placeholder="Full name" />}
            <Input placeholder="Email" type="email" />
            <Input placeholder="Password" type="password" />
            {tab === "signup" && (
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>Select your ward</option>
                <option>Ward 1 — Tenginagundi</option>
                <option>Ward 6 — Bandar Road</option>
                <option>Ward 9 — Nawayath Mohalla</option>
              </select>
            )}
            <Button type="button" className="w-full gradient-civic text-white rounded-full h-11 shadow-civic">
              {tab === "login" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing you agree to NagarVaani's terms and citizen pledge.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return <div><div className="font-display text-2xl font-bold">{n}</div><div className="text-xs text-white/70 uppercase tracking-widest">{l}</div></div>;
}