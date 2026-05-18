'use client';

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { MOCK_COMPLAINTS, STATUS_COLORS, CATEGORIES, PRIORITY_COLORS } from "@/lib/mockData";
import { ArrowUp, Bot, MapPin, Calendar, MessageSquare, Share2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/complaints/$id")({
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const c = MOCK_COMPLAINTS.find(x => x.id === id) || MOCK_COMPLAINTS[0];
  const cat = CATEGORIES.find(x => x.id === c.category);
  const timeline = [
    { status: "Submitted", note: "Reported by citizen with 1 photo", date: c.createdAt, by: "Citizen" },
    { status: "Verified", note: "AI verified location and category", date: c.createdAt, by: "NagarVaani AI" },
    { status: "Assigned", note: "Routed to PWD Bhatkal — Officer Suresh Hegde", date: "2026-05-13", by: "System" },
    { status: "In Progress", note: "Site visit completed. Repair scheduled.", date: "2026-05-14", by: "Officer Suresh" },
  ];
  return (
    <PageShell>
      <Link to="/map" className="text-sm text-muted-foreground hover:text-foreground">← Back to map</Link>
      <div className="mt-4 grid lg:grid-cols-[1fr_360px] gap-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_COLORS[c.status]}`}>{c.status}</span>
            <span className={`text-xs font-bold ${PRIORITY_COLORS[c.priority]}`}>● {c.priority} Priority</span>
            <span className="text-xs text-muted-foreground">#{c.id} · {cat?.name}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight leading-tight">{c.title}</h1>
          <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{c.ward}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{c.createdAt}</span>
          </div>
          <img src={c.imageUrl} className="mt-6 w-full aspect-[16/10] object-cover rounded-2xl" alt="" />
          <p className="mt-6 text-base leading-relaxed">{c.description}</p>

          {c.aiSummary && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 glass rounded-2xl p-5 border-l-4 border-[var(--civic)]">
              <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                <Bot className="h-4 w-4 text-[var(--civic-glow)]" /> AI Analysis
                <span className="ml-auto text-[10px] uppercase tracking-widest text-emerald-500">{Math.round((c.aiConfidence || 0.9) * 100)}% confidence</span>
              </div>
              <p className="text-sm text-muted-foreground">{c.aiSummary}</p>
            </motion.div>
          )}

          <h2 className="mt-10 font-display text-xl font-semibold">Timeline</h2>
          <div className="mt-4 space-y-4">
            {timeline.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="grid h-9 w-9 place-items-center rounded-full gradient-civic shadow-civic">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  {i < timeline.length - 1 && <div className="w-px flex-1 bg-border my-2" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{t.status}</span>
                    <span className="text-xs text-muted-foreground">· {t.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{t.note}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">by {t.by}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5 sticky top-20">
            <Button className="w-full gradient-civic text-white rounded-full h-11"><ArrowUp className="h-4 w-4 mr-1" />Upvote · {c.upvotes}</Button>
            <Button variant="outline" className="w-full mt-2 rounded-full"><Share2 className="h-4 w-4 mr-1" />Share</Button>
            <Button variant="outline" className="w-full mt-2 rounded-full"><MessageSquare className="h-4 w-4 mr-1" />Comment</Button>
            <div className="mt-5 pt-5 border-t border-border/40 text-xs space-y-2 text-muted-foreground">
              <div className="flex justify-between"><span>Reported by</span><span className="font-medium text-foreground">{c.citizen}</span></div>
              <div className="flex justify-between"><span>Department</span><span className="font-medium text-foreground">PWD Bhatkal</span></div>
              <div className="flex justify-between"><span>Officer</span><span className="font-medium text-foreground">S. Hegde</span></div>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}