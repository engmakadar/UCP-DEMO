import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { crbtCampaigns as seedCampaigns, type CRBTCampaign } from "@/lib/telecom-data";
import { downloadCSV, toCSV } from "@/lib/csv";
import { Radio, Upload, CheckCircle2, Plus, Users, FileDown, X, Square, PauseCircle, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/crbt")({ component: CRBTPage });

interface Tone { id: string; name: string; file: File; }

function CRBTPage() { return <AppShell><Body /></AppShell>; }

function categoryColor(cat: string): string {
  const palette = ["var(--brand)", "var(--success)", "var(--info)", "var(--violet)", "var(--warning)", "var(--pink)", "var(--destructive)"];
  let h = 0; for (let i = 0; i < cat.length; i++) h = (h * 31 + cat.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function Body() {
  const [campaigns, setCampaigns] = useState<CRBTCampaign[]>(seedCampaigns);
  const [showRegister, setShowRegister] = useState(false);

  const exportReport = () => {
    downloadCSV(`crbt-campaigns-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(campaigns.map(c => ({
      ID: c.id, Campaign: c.name, Theme: c.theme, Tone: c.tone, Telco: c.telco,
      "Audience Size": c.audienceCount, "Active Users": c.activeUsers, "Failed": c.failed,
      "Success Rate %": ((c.activeUsers / c.audienceCount) * 100).toFixed(2),
      Activated: c.activated, Status: c.status,
    }))));
  };

  const register = (c: Omit<CRBTCampaign, "id" | "activeUsers" | "failed" | "activated" | "status">) => {
    setCampaigns(arr => [{
      ...c, id: `CRBT-${String(arr.length + 1).padStart(3, "0")}`,
      activeUsers: 0, failed: 0, activated: new Date().toISOString().slice(0, 10), status: "Active",
    }, ...arr]);
    setShowRegister(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand grid place-items-center"><Radio className="h-5 w-5" /></span>
            CRBT — Caller Ring-Back Tones
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Register CRBT campaigns by theme (Drought, DRR, Livestock…), upload voice tones, and assign the subscriber list.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportReport} className="h-10 px-4 rounded-lg border border-border text-sm font-medium inline-flex items-center gap-2 hover:bg-accent">
            <FileDown className="h-4 w-4" /> Export Report
          </button>
          <button onClick={() => setShowRegister(true)} className="h-10 px-5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 shadow-sm shadow-brand/30">
            <Plus className="h-4 w-4" /> Register CRBT Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryStat label="Campaigns" value={campaigns.length} color="var(--brand)" />
        <SummaryStat label="Active" value={campaigns.filter(c => c.status === "Active").length} color="var(--success)" />
        <SummaryStat label="Subscribers" value={campaigns.reduce((s, c) => s + c.activeUsers, 0).toLocaleString()} color="var(--violet)" />
        <SummaryStat label="Failed" value={campaigns.reduce((s, c) => s + c.failed, 0)} color="var(--destructive)" />
      </div>

      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Registered CRBT Campaigns</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Each campaign is tagged with the category it was created for.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>{["ID", "Campaign", "Category", "Tone", "Telco", "Audience", "Active Users", "Failed", "Success Rate", "Activated", "Status", "Actions"].map(h =>
                <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {campaigns.map(c => {
                const rate = (c.activeUsers / (c.audienceCount || 1)) * 100;
                const color = categoryColor(c.theme);
                const setStatus = (s: CRBTCampaign["status"]) =>
                  setCampaigns(arr => arr.map(x => x.id === c.id ? { ...x, status: s } : x));
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-surface-2/60">
                    <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                    <td className="px-4 py-3 font-semibold">{c.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}>
                        {c.theme}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{c.tone}</td>
                    <td className="px-4 py-3">{c.telco}</td>
                    <td className="px-4 py-3 font-mono">{c.audienceCount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-success">{c.activeUsers.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-destructive">{c.failed}</td>
                    <td className="px-4 py-3">
                      <div className="min-w-[100px]">
                        <div className="text-xs font-semibold text-brand mb-1">{rate.toFixed(1)}%</div>
                        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(rate, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.activated}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                        c.status === "Active" ? "bg-success/10 text-success" :
                        c.status === "Suspended" ? "bg-warning/10 text-warning" :
                        c.status === "Stopped" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {c.status === "Active" ? (
                          <button onClick={() => setStatus("Suspended")} title="Suspend"
                            className="h-7 w-7 grid place-items-center rounded-md text-warning hover:bg-warning/10">
                            <PauseCircle className="h-4 w-4" />
                          </button>
                        ) : (
                          <button onClick={() => setStatus("Active")} title="Resume"
                            className="h-7 w-7 grid place-items-center rounded-md text-success hover:bg-success/10">
                            <PlayCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => setStatus("Stopped")} title="Stop"
                          className="h-7 w-7 grid place-items-center rounded-md text-destructive hover:bg-destructive/10">
                          <Square className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} onAdd={register} tones={[]} />}
    </div>
  );
}

function RegisterModal({ onClose, onAdd, tones }: { onClose: () => void; onAdd: (c: any) => void; tones: Tone[] }) {
  const now = new Date().toISOString().slice(0, 16);
  const [form, setForm] = useState({ name: "", theme: "", tone: tones[0]?.name ?? "", telco: "Hormuud", audienceCount: 0, startAt: now, endAt: "" });
  const [audience, setAudience] = useState<File | null>(null);
  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand/10 text-brand grid place-items-center"><Radio className="h-5 w-5" /></div>
            <div>
              <h2 className="font-semibold">Register CRBT Campaign</h2>
              <p className="text-xs text-muted-foreground">Tag a CRBT tone to a campaign category.</p>
            </div>
          </div>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="space-y-3">
          <Field label="Campaign Name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Drought Awareness Q3" className={inputCls} />
          </Field>
          <Field label="Category">
            <input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="e.g. Drought, Cash, Nutrition…" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date & Time">
              <input type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className={inputCls} />
            </Field>
            <Field label="End Date & Time">
              <input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="Upload Tone">
            <label className="flex items-center gap-3 h-11 px-3 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-brand">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{form.tone || "Choose an audio file (MP3, WAV)"}</span>
              <input type="file" accept="audio/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setForm({ ...form, tone: f.name }); }} />
            </label>
            {tones.length > 0 && (
              <select value={form.tone} onChange={(e) => setForm({ ...form, tone: e.target.value })} className={`${inputCls} mt-2`}>
                <option value="">— or pick from uploaded tones —</option>
                {tones.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            )}
          </Field>
          <Field label="Audience List">
            <label className="flex items-center gap-3 h-11 px-3 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-brand">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{audience ? audience.name : "Upload subscriber list (CSV / XLSX)"}</span>
              <input type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0] ?? null; setAudience(f); if (f) setForm({ ...form, audienceCount: 0 }); }} />
            </label>
          </Field>
          <Field label="Telecom">
            <select value={form.telco} onChange={(e) => setForm({ ...form, telco: e.target.value })} className={inputCls}>
              {["Hormuud", "Somnet", "Telesom", "Golis"].map(t => <option key={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium">Cancel</button>
          <button disabled={!form.name || !form.theme || !form.tone || !form.startAt || !form.endAt} onClick={() => onAdd(form)} className="flex-1 h-10 rounded-lg bg-brand text-brand-foreground text-sm font-semibold disabled:opacity-50">
            Register Campaign
          </button>
        </div>
      </div>
    </div>
  );
}
const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>{children}</div>;
}
function SummaryStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-xl font-bold mt-1" style={{ color }}>{value}</div>
    </div>
  );
}
