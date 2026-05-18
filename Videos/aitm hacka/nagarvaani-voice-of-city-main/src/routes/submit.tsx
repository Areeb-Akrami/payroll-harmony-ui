'use client';

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { CATEGORIES, BHATKAL_WARDS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Bot, Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/submit")({
  head: () => ({ meta: [{ title: "Report an Issue — NagarVaani" }] }),
  component: Submit,
});

const STEPS = ["Details", "Location", "Photos & AI", "Review"];

function Submit() {
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState<string>("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [ward, setWard] = useState("");

  return (
    <PageShell eyebrow="New report" title="Report a Civic Issue" subtitle="Takes 60 seconds. AI handles the rest.">
      <div className="max-w-3xl mx-auto">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1 flex items-center">
              <div className={`flex items-center gap-2 ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                <div className={`grid h-9 w-9 place-items-center rounded-full font-display font-bold text-sm transition
                  ${i < step ? "gradient-civic text-white" : i === step ? "gradient-civic text-white shadow-civic" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? "bg-[var(--civic)]" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-6 sm:p-8">
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium">Issue title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Massive pothole on Bandar Road" className="mt-1.5" />
              </div>
              <div>
                <label className="text-sm font-medium">Pick a category</label>
                <div className="mt-2 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {CATEGORIES.map((c) => {
                    const Icon = (Icons as Record<string, any>)[c.icon] || Sparkles;
                    const active = cat === c.id;
                    return (
                      <button key={c.id} onClick={() => setCat(c.id)} type="button"
                        className={`p-3 rounded-xl border transition text-center ${active ? "border-[var(--civic)] bg-[var(--civic)]/10 shadow-civic" : "border-border bg-muted/30 hover:bg-muted/60"}`}>
                        <Icon className="h-5 w-5 mx-auto mb-1" />
                        <div className="text-[11px] font-medium leading-tight">{c.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Describe the issue</label>
                <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className="mt-1.5" placeholder="Provide details so officers can act faster..." />
                <div className="text-xs text-muted-foreground mt-1">{desc.length}/500</div>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="space-y-5">
              <div className="aspect-[2/1] rounded-2xl grid-bg glass border border-border/60 grid place-items-center relative overflow-hidden">
                <div className="text-center">
                  <div className="mx-auto h-14 w-14 grid place-items-center rounded-full gradient-civic shadow-civic mb-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <Button size="sm" className="rounded-full">Use my location</Button>
                  <p className="text-xs text-muted-foreground mt-2">Or tap the map to drop a pin</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input className="mt-1.5" placeholder="e.g. Bandar Road, near Jamia Masjid" />
              </div>
              <div>
                <label className="text-sm font-medium">Ward</label>
                <select value={ward} onChange={(e) => setWard(e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Select your ward</option>
                  {BHATKAL_WARDS.map(w => <option key={w}>{w}</option>)}
                </select>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-[var(--civic)] transition cursor-pointer">
                <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Drop photos here or click to upload</p>
                <p className="text-xs text-muted-foreground">Max 5 images · 5 MB each</p>
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass-strong rounded-2xl p-5 border-l-4 border-[var(--civic)]">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg gradient-civic shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-display font-semibold text-sm">AI Analysis</div>
                      <span className="text-[10px] uppercase tracking-widest text-emerald-500">94% confidence</span>
                    </div>
                    <div className="mt-2 grid sm:grid-cols-3 gap-3 text-xs">
                      <Pill label="Detected" value="Pothole" />
                      <Pill label="Priority" value="High" />
                      <Pill label="Routed to" value="PWD Bhatkal" />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      Auto-summary: High-risk road damage on a major thoroughfare. Recommend immediate dispatch.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <h3 className="font-display text-lg font-semibold">Review your report</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Field label="Title" value={title || "—"} />
                <Field label="Category" value={CATEGORIES.find(c => c.id === cat)?.name || "—"} />
                <Field label="Ward" value={ward || "—"} />
                <Field label="Priority" value="High (AI)" />
              </div>
              <Field label="Description" value={desc || "—"} />
              <Button onClick={() => toast.success("Complaint submitted! ID: NV-1043")}
                className="w-full gradient-civic text-white rounded-full h-12 shadow-civic text-base">
                Submit Complaint
              </Button>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < 3 && (
              <Button onClick={() => setStep(step + 1)} className="rounded-full gradient-civic text-white px-6">
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </PageShell>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-semibold text-sm mt-0.5">{value}</div>
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-medium text-sm mt-0.5">{value}</div>
    </div>
  );
}