'use client';

import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — NagarVaani Bhatkal" }] }),
  component: Analytics,
});

const monthly = [
  { m: "Dec", c: 145 }, { m: "Jan", c: 178 }, { m: "Feb", c: 162 }, { m: "Mar", c: 210 }, { m: "Apr", c: 245 }, { m: "May", c: 287 },
];
const byCat = [
  { name: "Garbage", v: 312, c: "#10b981" },
  { name: "Pothole", v: 287, c: "#f97316" },
  { name: "Water", v: 198, c: "#0ea5e9" },
  { name: "Lights", v: 167, c: "#f59e0b" },
  { name: "Drains", v: 142, c: "#06b6d4" },
  { name: "Other", v: 141, c: "#8b5cf6" },
];
const status = [
  { name: "Resolved", v: 1109, c: "#10b981" },
  { name: "In Progress", v: 87, c: "#f97316" },
  { name: "Assigned", v: 33, c: "#f59e0b" },
  { name: "Submitted", v: 18, c: "#0ea5e9" },
];

function Analytics() {
  return (
    <PageShell eyebrow="Civic intelligence" title="Bhatkal Analytics" subtitle="Citywide insights, ward performance, and resolution trends — updated live.">
      <div className="grid lg:grid-cols-2 gap-6">
        <ChartCard title="Complaint volume — last 6 months">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly}>
              <XAxis dataKey="m" stroke="currentColor" opacity={0.5} fontSize={12} />
              <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="c" stroke="var(--civic-glow)" strokeWidth={3} dot={{ r: 5, fill: "var(--civic)" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Status distribution">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={status} dataKey="v" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {status.map((s, i) => <Cell key={i} fill={s.c} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center text-xs">
            {status.map(s => <span key={s.name} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.c }} />{s.name} · {s.v}</span>)}
          </div>
        </ChartCard>
        <ChartCard title="Complaints by category" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCat}>
              <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={12} />
              <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Bar dataKey="v" radius={[12, 12, 0, 0]}>
                {byCat.map((d, i) => <Cell key={i} fill={d.c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </PageShell>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`glass rounded-2xl p-6 ${className}`}>
      <h3 className="font-display font-semibold mb-4">{title}</h3>
      {children}
    </motion.div>
  );
}