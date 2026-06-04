import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Plug, Webhook, CheckCircle2, Activity, Database, Shield, Zap, ClipboardList,
  AlertTriangle, FileCheck2, MapPin, Settings, ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, Legend,
} from "recharts";

export const Route = createFileRoute("/integrations")({ component: IntegrationsPage });

function IntegrationsPage() { return <AppShell><Body /></AppShell>; }

const flow24h = Array.from({ length: 24 }).map((_, i) => {
  const s = Math.abs(Math.sin(i * 0.7)) * 80 + 30;
  return {
    h: `${String(i).padStart(2, "0")}:00`,
    Kobo: Math.round(s + (i % 3) * 10),
    RapidPro: Math.round(s * 0.7 + (i % 4) * 8),
  };
});

const actionsByDay = [
  { d: "Mon", SMS: 1240, OBD: 320, CRBT: 180, Tickets: 42 },
  { d: "Tue", SMS: 1610, OBD: 410, CRBT: 220, Tickets: 51 },
  { d: "Wed", SMS: 1420, OBD: 380, CRBT: 240, Tickets: 38 },
  { d: "Thu", SMS: 1980, OBD: 510, CRBT: 290, Tickets: 67 },
  { d: "Fri", SMS: 2210, OBD: 620, CRBT: 310, Tickets: 74 },
  { d: "Sat", SMS: 1340, OBD: 290, CRBT: 160, Tickets: 29 },
  { d: "Sun", SMS: 980, OBD: 210, CRBT: 110, Tickets: 18 },
];

interface EventRow {
  at: string; source: "KoboCollect" | "RapidPro"; form: string; trigger: string;
  action: string; channel: string; recipients: number; outcome: "Delivered" | "Failed" | "Queued";
}
const events: EventRow[] = [
  { at: "2026-05-17 10:42:08", source: "KoboCollect", form: "Drought PDM Q2", trigger: "water_access = none", action: "OBD dispatch", channel: "WFP-OPS", recipients: 218, outcome: "Queued" },
  { at: "2026-05-17 10:39:21", source: "KoboCollect", form: "Nutrition Screening", trigger: "muac < 11.5", action: "SMS follow-up", channel: "WFP-NUTR", recipients: 12, outcome: "Delivered" },
  { at: "2026-05-17 10:35:11", source: "RapidPro", form: "Cash Beneficiary", trigger: "response = 2", action: "Ticket opened", channel: "Helpdesk", recipients: 1, outcome: "Delivered" },
  { at: "2026-05-17 10:21:04", source: "RapidPro", form: "Vaccination Pulse", trigger: "next_dose ≤ 3d", action: "CRBT push", channel: "Hormuud", recipients: 1820, outcome: "Delivered" },
  { at: "2026-05-17 10:11:54", source: "KoboCollect", form: "Market Price Monitor", trigger: "price_spike > 25%", action: "SMS alert", channel: "WFP-VAM", recipients: 86, outcome: "Delivered" },
  { at: "2026-05-17 09:58:30", source: "KoboCollect", form: "Drought PDM Q2", trigger: "incomplete", action: "Retry queued", channel: "Kobo", recipients: 1, outcome: "Failed" },
  { at: "2026-05-17 09:42:11", source: "RapidPro", form: "Distribution Check", trigger: "no_response", action: "OBD callback", channel: "WFP-SOM", recipients: 412, outcome: "Queued" },
];

function Body() {
  const [source, setSource] = useState<"All" | "KoboCollect" | "RapidPro">("All");
  const filtered = useMemo(() => events.filter(e => source === "All" || e.source === source), [source]);

  return (
    <div className="p-4 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand grid place-items-center"><Plug className="h-5 w-5" /></span>
          Integrations · Data Activity
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Live data flowing in from KoboCollect & RapidPro — submissions, triggered actions and delivery outcomes.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Database className="h-5 w-5" />} label="Submissions · 24h" value="4,128" delta="+12%" color="var(--brand)" />
        <Stat icon={<Zap className="h-5 w-5" />} label="Actions Triggered" value="3,184" delta="+8%" color="var(--success)" />
        <Stat icon={<FileCheck2 className="h-5 w-5" />} label="Delivered" value="3,022" delta="95.0%" color="var(--info)" />
        <Stat icon={<Shield className="h-5 w-5" />} label="Failed (retried)" value="62" delta="1.9%" color="var(--destructive)" />
      </div>

      {/* Flow */}
      <div className="rounded-2xl bg-surface border border-border p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Activity className="h-4 w-4 text-brand" /> How data flows</h2>
        <div className="grid md:grid-cols-4 gap-3">
          <FlowStep n={1} icon={<ClipboardList className="h-5 w-5" />} title="Form Submitted" desc="Enumerator submits a Kobo form or a RapidPro flow completes." color="var(--info)" />
          <FlowStep n={2} icon={<Webhook className="h-5 w-5" />} title="Webhook → UCP" desc="Event is POSTed to UCP via signed webhook." color="var(--brand)" />
          <FlowStep n={3} icon={<Settings className="h-5 w-5" />} title="Rules Engine" desc="UCP evaluates thresholds, location and case type." color="var(--violet)" />
          <FlowStep n={4} icon={<Zap className="h-5 w-5" />} title="Action + Audit" desc="Sends SMS / OBD / CRBT and logs the outcome." color="var(--success)" last />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-surface border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Submissions · last 24h</h3>
              <p className="text-xs text-muted-foreground">Webhook events received per hour</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={flow24h}>
              <defs>
                <linearGradient id="k" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--brand)" stopOpacity={0} /></linearGradient>
                <linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--violet)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--violet)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="h" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="Kobo" stroke="var(--brand)" fill="url(#k)" strokeWidth={2} />
              <Area type="monotone" dataKey="RapidPro" stroke="var(--violet)" fill="url(#r)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-5">
          <h3 className="font-semibold">Actions by type</h3>
          <p className="text-xs text-muted-foreground mb-3">Last 7 days</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={actionsByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="d" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="SMS" stackId="a" fill="var(--brand)" />
              <Bar dataKey="OBD" stackId="a" fill="var(--violet)" />
              <Bar dataKey="CRBT" stackId="a" fill="var(--success)" />
              <Bar dataKey="Tickets" stackId="a" fill="var(--warning)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Value cards */}
      <div className="grid md:grid-cols-4 gap-3">
        <ValueCard icon={<Zap className="h-5 w-5" />} title="Real-time triggers" desc="Sub-second webhook → dispatch." color="var(--brand)" />
        <ValueCard icon={<MapPin className="h-5 w-5" />} title="Location-aware" desc="Route by district or polygon." color="var(--info)" />
        <ValueCard icon={<AlertTriangle className="h-5 w-5" />} title="Threshold alerts" desc="MUAC, water, food-security." color="var(--warning)" />
        <ValueCard icon={<FileCheck2 className="h-5 w-5" />} title="Full audit trail" desc="Every event logged for M&E." color="var(--success)" />
      </div>

      {/* Event log */}
      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Event Log</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Real-time stream of incoming submissions and resulting actions</p>
          </div>
          <select value={source} onChange={e => setSource(e.target.value as any)}
            className="h-9 px-3 rounded-lg border border-border bg-surface text-sm">
            {["All", "KoboCollect", "RapidPro"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>{["Time", "Source", "Form", "Trigger", "Action", "Channel", "Recipients", "Outcome"].map(h =>
                <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={i} className="border-t border-border hover:bg-surface-2/60">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{e.at}</td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: `color-mix(in oklab, ${e.source === "KoboCollect" ? "var(--brand)" : "var(--violet)"} 14%, transparent)`, color: e.source === "KoboCollect" ? "var(--brand)" : "var(--violet)" }}>{e.source}</span></td>
                  <td className="px-4 py-3 font-medium">{e.form}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground"><code className="bg-surface-2 px-2 py-1 rounded">{e.trigger}</code></td>
                  <td className="px-4 py-3">{e.action}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{e.channel}</td>
                  <td className="px-4 py-3 font-mono">{e.recipients.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${e.outcome === "Delivered" ? "bg-success/10 text-success" : e.outcome === "Queued" ? "bg-info/10 text-info" : "bg-destructive/10 text-destructive"}`}>
                      {e.outcome === "Delivered" && <CheckCircle2 className="h-3 w-3" />}{e.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ n, icon, title, desc, color, last }: { n: number; icon: React.ReactNode; title: string; desc: string; color: string; last?: boolean }) {
  return (
    <div className="relative rounded-xl bg-surface-2 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-lg grid place-items-center" style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}>{icon}</div>
        <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Step {n}</span>
      </div>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      {!last && <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />}
    </div>
  );
}

function ValueCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <div className="h-9 w-9 rounded-lg grid place-items-center mb-2" style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}>{icon}</div>
      <div className="font-semibold text-sm">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
    </div>
  );
}

function Stat({ icon, label, value, delta, color }: { icon: React.ReactNode; label: string; value: string; delta: string; color: string }) {
  return (
    <div className="rounded-xl bg-surface border border-border p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}>{icon}</div>
      <div className="flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        <div className="flex items-baseline gap-2"><div className="text-2xl font-bold" style={{ color }}>{value}</div>
          <span className="text-[11px] text-muted-foreground">{delta}</span>
        </div>
      </div>
    </div>
  );
}
