import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Megaphone, Upload, ChevronDown, Calendar, Check, Users, Globe, Send, Download,
  PlayCircle, CheckCircle2, PauseCircle,
} from "lucide-react";
import { toCSV, downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/create-campaign")({ component: CreateCampaign });

function CreateCampaign() {
  return <AppShell><Body /></AppShell>;
}

type CampaignStatus = "Running" | "Completed" | "Scheduled" | "Paused";
interface CampaignRow {
  id: string;
  name: string;
  channel: "OBD" | "SMS";
  sender: string;
  department: string;
  sent: number;
  delivered: number;
  answered: number;
  failed: number;
  noAnswer: number;
  busy: number;
  startedAt: string;
  status: CampaignStatus;
}

const seed: CampaignRow[] = [
  { id: "CMP-2041", name: "December Distribution Alert", channel: "OBD", sender: "WFP-SOM", department: "Relief", sent: 12480, delivered: 0, answered: 8210, failed: 612, noAnswer: 2890, busy: 768, startedAt: "2026-05-14 09:00", status: "Completed" },
  { id: "CMP-2042", name: "Cash Transfer Reminder Q2", channel: "SMS", sender: "WFP-CASH", department: "Baxnano", sent: 28400, delivered: 27812, answered: 0, failed: 588, noAnswer: 0, busy: 0, startedAt: "2026-05-15 07:30", status: "Completed" },
  { id: "CMP-2043", name: "Nutrition Survey Push", channel: "OBD", sender: "WFP-NUTR", department: "VAM", sent: 5200, delivered: 0, answered: 3120, failed: 280, noAnswer: 1410, busy: 390, startedAt: "2026-05-16 10:15", status: "Running" },
  { id: "CMP-2044", name: "Fraud Awareness Blast", channel: "SMS", sender: "WFP-OPS", department: "Relief", sent: 18900, delivered: 14210, answered: 0, failed: 410, noAnswer: 0, busy: 0, startedAt: "2026-05-17 08:00", status: "Running" },
  { id: "CMP-2045", name: "PDM Q2 Outreach", channel: "OBD", sender: "WFP-SOM", department: "VAM", sent: 0, delivered: 0, answered: 0, failed: 0, noAnswer: 0, busy: 0, startedAt: "2026-05-18 09:00", status: "Scheduled" },
];

function Body() {
  const [scheduleLater, setScheduleLater] = useState(false);
  const [iface, setIface] = useState<"OBD" | "SMS">("OBD");

  return (
    <div className="p-4 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Create Campaign</span>
      </div>

      <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-surface to-surface-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-violet/10 text-violet grid place-items-center">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Campaign</h1>
              <p className="text-sm text-muted-foreground">One-way outbound communication (OBD · SMS)</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2">
          {/* LEFT — Survey-style config */}
          <div className="p-8 space-y-6 border-r border-border">
            <Section title="Campaign Details">
              <Field label="Name" required>
                <input placeholder="e.g. December Distribution Alert" className={inputCls} />
              </Field>
              <Field label="Department" required>
                <SelectInput placeholder="Select department" options={["Baxnano", "VAM", "Relief"]} />
              </Field>
            </Section>

            <Section title="Schedule">
              <div className="grid grid-cols-2 gap-3">
                <RadioCard checked={!scheduleLater} onClick={() => setScheduleLater(false)} icon={<Check className="h-4 w-4" />} title="Schedule Now" desc="Send immediately upon submit" />
                <RadioCard checked={scheduleLater} onClick={() => setScheduleLater(true)} icon={<Calendar className="h-4 w-4" />} title="Schedule Later" desc="Pick a future date & time" />
              </div>
              {scheduleLater && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field label="Date"><input type="date" className={inputCls} /></Field>
                  <Field label="Time"><input type="time" className={inputCls} /></Field>
                </div>
              )}
            </Section>

            <Section title="Channel">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Campaign Interface" required>
                  <div className="relative">
                    <select value={iface} onChange={e => setIface(e.target.value as "OBD" | "SMS")}
                      className="w-full h-11 pl-3.5 pr-9 appearance-none rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring">
                      <option value="OBD">OBD</option>
                      <option value="SMS">SMS</option>
                    </select>
                    <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>
                <Field label="Sender ID" required>
                  <SelectInput placeholder="Select" options={["WFP-SOM", "WFP-CASH", "WFP-NUTR", "WFP-OPS"]} />
                </Field>
                <Field label="Primary Charging Unit">
                  <SelectInput placeholder="Select" options={["Baxnano", "VAM", "Relief"]} />
                </Field>
                <Field label="Secondary Charging Unit">
                  <SelectInput placeholder="Select" options={["Baxnano", "VAM", "Relief"]} />
                </Field>
              </div>
            </Section>

            <Section title="Location">
              <Field label="Target Location">
                <input placeholder="e.g. Mogadishu, Banadir" className={inputCls} />
              </Field>
            </Section>
          </div>

          {/* RIGHT — Audience & message */}
          <div className="p-8 space-y-6 bg-surface-2/40">
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-5 w-5 text-brand" /> Target Audience
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Upload contacts and craft your campaign content</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="group border-2 border-dashed border-border rounded-xl p-5 cursor-pointer hover:border-brand hover:bg-brand/5 transition-colors block">
                <Upload className="h-5 w-5 text-brand mb-2" />
                <div className="font-semibold text-sm">Upload Audience</div>
                <div className="text-xs text-muted-foreground mt-0.5">XLSX or CSV · max 50k rows</div>
                <input type="file" accept=".csv,.xlsx" className="hidden" />
              </label>
              <button className="border-2 border-border rounded-xl p-5 text-left bg-surface hover:bg-accent transition-colors">
                <Download className="h-5 w-5 text-muted-foreground mb-2" />
                <div className="font-semibold text-sm">Sample XLSX</div>
                <div className="text-xs text-muted-foreground mt-0.5">Download template</div>
              </button>
            </div>

            {iface === "SMS" ? (
              <Field label="Message Content" required>
                <textarea rows={6} placeholder="Type your SMS message…" className={`${inputCls} h-auto py-3 resize-none`} />
                <div className="text-xs text-muted-foreground mt-1">0 / 160 characters · 1 segment</div>
              </Field>
            ) : (
              <div>
                <label className="block text-sm font-semibold mb-2">Voice Recording</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-brand hover:bg-brand/5">
                  <Upload className="h-5 w-5 text-brand mb-2" />
                  <div className="font-semibold text-sm">Upload voice file (MP3/WAV)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Used as the OBD message</div>
                  <input type="file" accept="audio/*" className="hidden" />
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Retry Count"><input type="number" defaultValue={3} className={inputCls} /></Field>
              <Field label={<span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Language</span>}>
                <SelectInput placeholder="English" options={["English", "Somali", "Arabic"]} />
              </Field>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-border bg-surface flex flex-wrap gap-3 justify-end">
          <button className="h-11 px-6 rounded-lg border border-border bg-surface text-sm font-medium hover:bg-accent min-w-[160px]">Save as Draft</button>
          <button className="h-11 px-6 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 min-w-[200px] shadow-sm shadow-brand/30 inline-flex items-center justify-center gap-2">
            <Send className="h-4 w-4" /> Launch Campaign
          </button>
        </div>
      </div>

      <CampaignsReport />
    </div>
  );
}

function CampaignsReport() {
  const [rows] = useState<CampaignRow[]>(seed);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | CampaignStatus>("All");

  const filtered = useMemo(() => rows.filter(r => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (q && !`${r.id} ${r.name} ${r.sender} ${r.department}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [rows, q, statusFilter]);

  const totals = useMemo(() => filtered.reduce((a, r) => ({
    sent: a.sent + r.sent, delivered: a.delivered + r.delivered, answered: a.answered + r.answered,
    failed: a.failed + r.failed, noAnswer: a.noAnswer + r.noAnswer, busy: a.busy + r.busy,
  }), { sent: 0, delivered: 0, answered: 0, failed: 0, noAnswer: 0, busy: 0 }), [filtered]);

  const exportCsv = () => {
    const csv = toCSV(filtered.map(r => ({
      ID: r.id, Name: r.name, Channel: r.channel, Sender: r.sender, Department: r.department,
      Sent: r.sent, Delivered: r.delivered, Answered: r.answered, Failed: r.failed,
      NoAnswer: r.noAnswer, Busy: r.busy, StartedAt: r.startedAt, Status: r.status,
    })));
    downloadCSV("campaigns-report.csv", csv);
  };

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-border flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Campaigns Report</h2>
          <p className="text-xs text-muted-foreground">Live status breakdown of every campaign you have launched.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter as you type…"
            className="h-9 px-3 rounded-lg border border-border bg-surface text-sm w-60 focus:ring-2 focus:ring-ring/40 outline-none" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            className="h-9 px-3 rounded-lg border border-border bg-surface text-sm">
            {["All", "Running", "Completed", "Scheduled", "Paused"].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={exportCsv} className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-accent inline-flex items-center gap-1.5">
            <Download className="h-4 w-4" /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-px bg-border">
        <Kpi label="Total Sent" value={totals.sent} tone="brand" />
        <Kpi label="Delivered" value={totals.delivered} tone="info" />
        <Kpi label="Answered" value={totals.answered} tone="success" />
        <Kpi label="No Answer" value={totals.noAnswer} tone="warning" />
        <Kpi label="Busy" value={totals.busy} tone="violet" />
        <Kpi label="Failed" value={totals.failed} tone="destructive" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
            <tr>
              {["Campaign", "Channel", "Sender", "Dept", "Sent", "Delivered", "Answered", "Failed", "No Answer", "Busy", "Delivered %", "Answered %", "Started", "Status"].map(h =>
                <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const denom = r.sent || 1;
              const deliveredPct = r.channel === "SMS" ? (r.delivered / denom) * 100 : 0;
              const answeredPct = r.channel === "OBD" ? (r.answered / denom) * 100 : 0;
              return (
                <tr key={r.id} className="border-t border-border hover:bg-surface-2/60">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{r.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{r.id}</div>
                  </td>
                  <td className="px-4 py-3"><Chip tone={r.channel === "OBD" ? "violet" : "info"}>{r.channel}</Chip></td>
                  <td className="px-4 py-3 font-mono text-xs">{r.sender}</td>
                  <td className="px-4 py-3 text-xs">{r.department}</td>
                  <td className="px-4 py-3 font-mono">{r.sent.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{r.delivered.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{r.answered.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-destructive">{r.failed.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{r.noAnswer.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{r.busy.toLocaleString()}</td>
                  <td className="px-4 py-3"><Pct value={deliveredPct} tone="info" /></td>
                  <td className="px-4 py-3"><Pct value={answeredPct} tone="success" /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{r.startedAt}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CampaignStatus }) {
  const map = {
    Running: { cls: "bg-info/10 text-info", icon: <PlayCircle className="h-3 w-3" /> },
    Completed: { cls: "bg-success/10 text-success", icon: <CheckCircle2 className="h-3 w-3" /> },
    Scheduled: { cls: "bg-violet/10 text-violet", icon: <Calendar className="h-3 w-3" /> },
    Paused: { cls: "bg-warning/10 text-warning", icon: <PauseCircle className="h-3 w-3" /> },
  }[status];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${map.cls}`}>{map.icon}{status}</span>;
}

function Pct({ value, tone }: { value: number; tone: "info" | "success" }) {
  if (value === 0) return <span className="text-muted-foreground">—</span>;
  const c = tone === "info" ? "var(--info)" : "var(--success)";
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(value, 100)}%`, background: c }} />
      </div>
      <span className="font-mono text-xs tabular-nums">{value.toFixed(1)}%</span>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="bg-surface p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-xl font-bold mt-0.5" style={{ color: `var(--${tone})` }}>{value.toLocaleString()}</div>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: string }) {
  return <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: `color-mix(in oklab, var(--${tone}) 14%, transparent)`, color: `var(--${tone})` }}>{children}</span>;
}

const inputCls = "w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
function Field({ label, required, children }: { label: React.ReactNode; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label} {required && <span className="text-destructive">*</span>}</label>
      {children}
    </div>
  );
}
function SelectInput({ placeholder, options }: { placeholder: string; options: string[] }) {
  return (
    <div className="relative">
      <select defaultValue="" className="w-full h-11 pl-3.5 pr-9 appearance-none rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring">
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}
function RadioCard({ checked, onClick, icon, title, desc }: { checked: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all ${checked ? "border-brand bg-brand/5 shadow-sm" : "border-border bg-surface hover:border-muted-foreground/30"}`}>
      <div className="flex items-start gap-3">
        <div className={`h-5 w-5 rounded-full border-2 grid place-items-center mt-0.5 ${checked ? "border-brand bg-brand text-brand-foreground" : "border-border"}`}>
          {checked && icon}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
        </div>
      </div>
    </button>
  );
}
