'use client';

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { MOCK_COMPLAINTS, STATUS_COLORS, MOCK_STATS } from "@/lib/mockData";
import { Plus, Award, TrendingUp, Activity, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NagarVaani" }] }),
  component: Dashboard,
});

function Dashboard() {
  const stats = [
    { label: "My Complaints", value: 12, icon: Activity, trend: "+3 this month" },
    { label: "Resolved", value: 9, icon: CheckCircle2, trend: "75% rate" },
    { label: "Pending", value: 3, icon: Clock, trend: "Avg 2.1 days" },
    { label: "Points Earned", value: 285, icon: Award, trend: "Rank #14" },
  ];
  return (
    <PageShell eyebrow="Welcome back" title="Hello, Imran 👋" subtitle="Your civic activity at a glance. Ward 6 · 285 points · Watchdog badge earned.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--civic)]/10 text-[var(--civic-glow)]">
                <s.icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-4 font-display text-3xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label} · {s.trend}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Complaints</h2>
            <Link to="/submit"><Button size="sm" className="gradient-civic text-white rounded-full"><Plus className="h-4 w-4 mr-1" />New</Button></Link>
          </div>
          <div className="divide-y divide-border/40">
            {MOCK_COMPLAINTS.slice(0,5).map(c => (
              <Link key={c.id} to="/complaints/$id" params={{ id: c.id }} className="flex items-center gap-4 py-3 hover:bg-muted/30 rounded-lg px-2 -mx-2 transition">
                <img src={c.imageUrl} className="h-12 w-12 rounded-lg object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground">#{c.id} · {c.createdAt}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[c.status]}`}>{c.status}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold mb-4">City Pulse</h2>
          {[
            ["Total this month", "147"],
            ["Resolution rate", "89%"],
            ["Avg response", `${MOCK_STATS.avgDays} days`],
            ["Active officers", "23"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
              <span className="text-sm text-muted-foreground">{k}</span>
              <span className="font-display font-semibold">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}