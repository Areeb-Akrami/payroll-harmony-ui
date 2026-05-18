'use client';

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { Trophy, Medal } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — NagarVaani" }] }),
  component: Leaderboard,
});

const TOP = [
  { name: "Imran Khan", ward: "Ward 6", points: 1240, badges: 6, avatar: "https://i.pravatar.cc/100?img=12" },
  { name: "Fatima Begum", ward: "Ward 9", points: 1080, badges: 5, avatar: "https://i.pravatar.cc/100?img=47" },
  { name: "Ramesh Naik", ward: "Ward 2", points: 940, badges: 4, avatar: "https://i.pravatar.cc/100?img=33" },
  { name: "Suma Hegde", ward: "Ward 4", points: 820, badges: 4, avatar: "https://i.pravatar.cc/100?img=45" },
  { name: "Yusuf Ali", ward: "Ward 10", points: 745, badges: 3, avatar: "https://i.pravatar.cc/100?img=8" },
  { name: "Anwar Sheikh", ward: "Ward 7", points: 690, badges: 3, avatar: "https://i.pravatar.cc/100?img=15" },
  { name: "Vinod Shetty", ward: "Ward 6", points: 580, badges: 3, avatar: "https://i.pravatar.cc/100?img=23" },
  { name: "Aisha Khan", ward: "Ward 10", points: 510, badges: 2, avatar: "https://i.pravatar.cc/100?img=44" },
];

function Leaderboard() {
  return (
    <PageShell eyebrow="Civic champions" title="Bhatkal Leaderboard" subtitle="The citizens making the biggest difference, ranked by impact points.">
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {TOP.slice(0, 3).map((u, i) => (
          <motion.div key={u.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className={`glass rounded-2xl p-6 text-center ${i === 0 ? "md:scale-105 shadow-amber" : ""}`}>
            <div className="mx-auto relative w-fit">
              <img src={u.avatar} className="h-20 w-20 rounded-full mx-auto ring-4 ring-[var(--amber-accent)]/40" alt="" />
              <div className={`absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full font-display font-bold text-sm
                ${i === 0 ? "gradient-civic text-white shadow-civic" : i === 1 ? "bg-zinc-300 text-zinc-800" : "bg-orange-300 text-orange-900"}`}>{i + 1}</div>
            </div>
            <div className="mt-4 font-display font-bold text-lg">{u.name}</div>
            <div className="text-xs text-muted-foreground">{u.ward}</div>
            <div className="mt-3 font-display text-3xl font-bold text-gradient-civic">{u.points}</div>
            <div className="text-xs text-muted-foreground mt-1">{u.badges} badges earned</div>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[60px_1fr_120px_80px_100px] px-5 py-3 border-b border-border/40 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
          <div>Rank</div><div>Citizen</div><div>Ward</div><div>Badges</div><div className="text-right">Points</div>
        </div>
        {TOP.slice(3).map((u, i) => (
          <motion.div key={u.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
            className="grid grid-cols-[60px_1fr_120px_80px_100px] items-center px-5 py-3 border-b border-border/30 hover:bg-muted/30 transition">
            <div className="font-display font-bold text-muted-foreground">#{i + 4}</div>
            <div className="flex items-center gap-3 min-w-0">
              <img src={u.avatar} className="h-9 w-9 rounded-full" alt="" />
              <span className="font-medium truncate">{u.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">{u.ward}</div>
            <div className="flex items-center gap-1 text-sm"><Medal className="h-3.5 w-3.5 text-[var(--amber-accent)]" />{u.badges}</div>
            <div className="text-right font-display font-bold">{u.points}</div>
          </motion.div>
        ))}
      </div>
    </PageShell>
  );
}