'use client';

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageShell } from "@/components/PageShell";
import { MOCK_COMPLAINTS, STATUS_COLORS, CATEGORIES } from "@/lib/mockData";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live City Map — NagarVaani Bhatkal" },
      { name: "description", content: "Explore every reported civic issue across Bhatkal's 12 wards on a live, filterable map." },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <PageShell eyebrow="Live across Bhatkal" title="City Issue Map" subtitle="A geographic view of every reported complaint. Interactive Leaflet map shipping in v2 — current view shows the live feed.">
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Filter by status</div>
            <div className="space-y-2">
              {(["Submitted","Verified","Assigned","In Progress","Resolved"] as const).map(s => (
                <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" defaultChecked className="accent-[var(--civic)]" />
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_COLORS[s]}`}>{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">By category</div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.slice(0,8).map(c => (
                <button key={c.id} className="text-xs px-2.5 py-1 rounded-full bg-muted/60 hover:bg-muted">{c.name}</button>
              ))}
            </div>
          </div>
        </aside>
        <div className="glass rounded-2xl overflow-hidden min-h-[600px] relative grid-bg">
          <div className="absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <div className="mx-auto h-16 w-16 grid place-items-center rounded-2xl gradient-civic shadow-civic mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold">Interactive Leaflet map — v2</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Pin clusters, heatmap layer, and click-to-detail popups. Showing {MOCK_COMPLAINTS.length} live complaints below.
              </p>
            </div>
          </div>
          {MOCK_COMPLAINTS.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring" }}
              style={{ left: `${15 + (i * 11) % 70}%`, top: `${20 + (i * 17) % 60}%` }}
              className="absolute"
            >
              <div className="relative">
                <div className="h-4 w-4 rounded-full bg-[var(--civic)] ring-4 ring-[var(--civic)]/30 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}