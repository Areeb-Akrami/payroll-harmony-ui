'use client';

import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, MapPin, Users, Languages, Bot, CheckCircle2, Activity, Shield, Trash2, AlertTriangle, Droplets, Lightbulb, Waves, Home, Leaf, AlertCircle, PawPrint, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ComplaintCard } from "@/components/ComplaintCard";
import { MOCK_COMPLAINTS, MOCK_STATS, MOCK_TESTIMONIALS, CATEGORIES } from "@/lib/mockData";
import type { LucideIcon } from "lucide-react";

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Trash2, AlertTriangle, Droplets, Lightbulb, Waves, Home, Leaf, AlertCircle, PawPrint, Volume2,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NagarVaani — Voice of Bhatkal · Smart Civic Complaint Platform" },
      { name: "description", content: "Report civic issues in Bhatkal, track resolutions live, and earn points for making your city better. AI-powered, multilingual, built for Bharat." },
      { property: "og:title", content: "NagarVaani — Aapki Awaaz, Sheher Ki Taaqat" },
      { property: "og:description", content: "Smart civic complaint platform for Bhatkal. Report. Track. Resolve." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <CategoriesGrid />
      <RecentComplaints />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-[var(--civic)] opacity-20 blur-[120px]" />
      <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-[var(--amber-accent)] opacity-15 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-28 lg:pt-28 lg:pb-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live · {MOCK_STATS.total.toLocaleString()} issues tracked across Bhatkal
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight max-w-5xl mx-auto"
        >
          Aapki Awaaz,<br />
          <span className="text-gradient-civic">Sheher Ki Taaqat</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 text-center text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Report potholes, garbage, broken lights — and watch them get fixed.
          AI-powered, multilingual, built for Bhatkal's 12 wards.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link to="/submit">
            <Button size="lg" className="gradient-civic text-white shadow-civic rounded-full px-7 h-12 text-base hover:scale-[1.02] transition">
              Report an Issue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/map">
            <Button size="lg" variant="outline" className="rounded-full px-7 h-12 text-base glass border-border/60">
              View Live Map
            </Button>
          </Link>
        </motion.div>

        {/* Floating preview cards */}
        <div className="relative mt-20 grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
          {MOCK_COMPLAINTS.slice(0, 3).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 40, rotate: i === 1 ? 0 : i === 0 ? -2 : 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.1 }}
              className={i === 1 ? "md:-mt-8" : ""}
            >
              <ComplaintCard c={c} index={i} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const items = [
    { label: "Issues Reported", value: MOCK_STATS.total, suffix: "+", icon: Activity },
    { label: "Resolved", value: 89, suffix: "%", icon: CheckCircle2 },
    { label: "Avg Response", value: MOCK_STATS.avgDays, suffix: " days", decimals: 1, icon: Sparkles },
    { label: "Wards Covered", value: MOCK_STATS.wards, suffix: "", icon: MapPin },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 -mt-12 relative z-10">
      <div className="glass-strong rounded-3xl p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="text-center"
          >
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[var(--civic)]/10 text-[var(--civic-glow)] mb-3">
              <s.icon className="h-5 w-5" />
            </div>
            <div className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              <CountUp end={s.value} duration={2} decimals={s.decimals || 0} suffix={s.suffix} enableScrollSpy scrollSpyOnce />
            </div>
            <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Bot, title: "AI Triage", desc: "Auto-categorizes complaints, predicts priority, and flags duplicates in under 2 seconds." },
    { icon: Activity, title: "Real-Time Tracking", desc: "Live status updates from Submitted → Verified → Resolved with officer notes." },
    { icon: Users, title: "Community Upvoting", desc: "Citizens upvote issues — popular complaints get prioritized automatically." },
    { icon: Languages, title: "Four Languages", desc: "English, Kannada, Hindi, Urdu — your mother can use it too." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading eyebrow="What makes it work" title="Built for citizens, designed for impact" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="glass rounded-2xl p-6 hover:shadow-civic transition"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl gradient-civic shadow-civic mb-4">
              <f.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-display font-semibold text-lg">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Report", desc: "Snap a photo, drop a pin, hit submit." },
    { n: "02", title: "AI Analyses", desc: "Category, priority, summary — generated instantly." },
    { n: "03", title: "Officer Acts", desc: "Routed to the right department with full context." },
    { n: "04", title: "Resolved", desc: "You get notified. Earn points. Repeat." },
  ];
  return (
    <section className="border-y border-border/40 bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="How it works" title="Four steps. Real change." />
        <div className="mt-14 grid gap-8 lg:grid-cols-4 relative">
          <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px border-t-2 border-dashed border-border" />
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl glass-strong shadow-civic mb-4 relative z-10">
                <span className="font-display font-bold text-2xl text-gradient-civic">{s.n}</span>
              </div>
              <h3 className="font-display font-semibold text-lg">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoriesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading eyebrow="Categories" title="Report any civic issue, big or small" />
      <div className="mt-12 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map((cat, i) => {
          const IconComponent = CATEGORY_ICON_MAP[cat.icon] ?? Sparkles;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-5 text-center cursor-pointer hover:shadow-civic transition"
            >
              <div className={`mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${cat.color} mb-3 shadow-lg`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div className="text-sm font-medium">{cat.name}</div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function RecentComplaints() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <SectionHeading eyebrow="Live feed" title="Recent complaints across Bhatkal" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_COMPLAINTS.slice(0, 4).map((c, i) => <ComplaintCard key={c.id} c={c} index={i} />)}
      </div>
      <div className="mt-10 text-center">
        <Link to="/map">
          <Button variant="outline" className="rounded-full px-6 glass">
            See all on the map <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <SectionHeading eyebrow="Citizens speak" title="Stories from the streets of Bhatkal" />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {MOCK_TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="text-4xl font-display text-[var(--amber-accent)] leading-none">"</div>
            <p className="mt-2 text-sm leading-relaxed">{t.quote}</p>
            <div className="mt-5 flex items-center gap-3">
              <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.ward}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl gradient-civic p-10 sm:p-16 text-center text-white shadow-civic"
      >
        <Shield className="absolute -right-8 -top-8 h-48 w-48 text-white/10" />
        <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
          Your ward needs your voice.
        </h2>
        <p className="mt-4 text-white/85 max-w-xl mx-auto">
          Join 1,200+ Bhatkal citizens already making their neighbourhoods better, one complaint at a time.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/signup">
            <Button size="lg" className="bg-white text-[var(--civic)] hover:bg-white/95 rounded-full px-7 h-12">
              Get Started Free
            </Button>
          </Link>
          <Link to="/map">
            <Button size="lg" variant="outline" className="rounded-full px-7 h-12 border-white/40 bg-white/10 text-white hover:bg-white/20">
              Explore Live Map
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="text-xs uppercase tracking-[0.25em] text-[var(--civic-glow)] font-semibold">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
