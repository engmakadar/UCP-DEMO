import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { verifiedCallerIds, type VerifiedCallerID } from "@/lib/telecom-data";
import { downloadCSV, toCSV } from "@/lib/csv";
import {
  PhoneOutgoing, Plus, Search, FileDown, CheckCircle2, Clock, XCircle,
  ShieldCheck, PhoneCall,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";

export const Route = createFileRoute("/verified-caller-id")({ component: Page });
function Page() { return <AppShell><Body /></AppShell>; }

function Body() {
  const [list, setList] = useState<VerifiedCallerID[]>(verifiedCallerIds);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => list.filter(v =>
    [v.displayName, v.displayNumber, v.realNumber, v.programme, v.telco].join(" ").toLowerCase().includes(q.toLowerCase())
  ), [list, q]);

  const totals = useMemo(() => ({
    total: list.length,
    active: list.filter(v => v.status === "Active").length,
    pending: list.filter(v => v.status === "Pending").length,
    calls: list.reduce((s, v) => s + v.callsMade, 0),
    answered: list.reduce((s, v) => s + v.callsAnswered, 0),
  }), [list]);

  const chart = list.map(v => ({ name: v.displayName, Made: v.callsMade, Answered: v.callsAnswered }));

  const exportCsv = () => {
    downloadCSV(`verified-caller-ids-${new Date().toISOString().slice(0, 10)}.csv`,
      toCSV(filtered.map(v => ({
        ID: v.id, "Display Name": v.displayName, "Displayed Number": v.displayNumber,
        "Real Number": v.realNumber, Programme: v.programme, Telco: v.telco,
        Status: v.status, "Created": v.createdAt, "Calls Made": v.callsMade,
        "Calls Answered": v.callsAnswered,
        "Answer Rate %": v.callsMade ? ((v.callsAnswered / v.callsMade) * 100).toFixed(2) : "0",
      }))));
  };

  const add = (v: Omit<VerifiedCallerID, "id" | "createdAt" | "callsMade" | "callsAnswered" | "status">) => {
    setList(arr => [{
      ...v, id: `VID-${String(arr.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString().slice(0, 10),
      callsMade: 0, callsAnswered: 0, status: "Pending",
    }, ...arr]);
    setOpen(false);
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand grid place-items-center"><PhoneOutgoing className="h-5 w-5" /></span>
            Verified Caller ID
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register the numbers WFP Somalia teams display when calling beneficiaries. The real number stays masked.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="h-10 px-4 rounded-lg border border-border text-sm font-medium inline-flex items-center gap-2 hover:bg-accent">
            <FileDown className="h-4 w-4" /> Export
          </button>
          <button onClick={() => setOpen(true)} className="h-10 px-5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 shadow-sm shadow-brand/30">
            <Plus className="h-4 w-4" /> Register Caller ID
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Registered" value={totals.total} color="var(--brand)" icon={<ShieldCheck className="h-4 w-4" />} />
        <Stat label="Active" value={totals.active} color="var(--success)" icon={<CheckCircle2 className="h-4 w-4" />} />
        <Stat label="Pending" value={totals.pending} color="var(--warning)" icon={<Clock className="h-4 w-4" />} />
        <Stat label="Calls Made" value={totals.calls.toLocaleString()} color="var(--info)" icon={<PhoneCall className="h-4 w-4" />} />
        <Stat label="Answered" value={totals.answered.toLocaleString()} color="var(--violet)" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <div className="rounded-2xl bg-surface border border-border p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-semibold">Caller ID Performance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Calls placed using each verified display number</p>
          </div>
          <span className="text-[10px] tracking-widest text-muted-foreground bg-surface-2 px-2 py-1 rounded">BAR</span>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chart} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="Made" fill="var(--info)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="Answered" fill="var(--success)" radius={[6, 6, 0, 0]}>
              {chart.map((_, i) => <Cell key={i} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search display name, number, programme…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-2 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
          <span className="text-xs text-muted-foreground">{filtered.length} of {list.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>{["ID", "Display Name", "Displayed Number", "Real Number", "Programme", "Telco", "Calls", "Answered", "Answer Rate", "Status", "Created"].map(h =>
                <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const rate = v.callsMade ? (v.callsAnswered / v.callsMade) * 100 : 0;
                return (
                  <tr key={v.id} className="border-t border-border hover:bg-surface-2/60">
                    <td className="px-4 py-3 font-mono text-xs">{v.id}</td>
                    <td className="px-4 py-3 font-semibold">{v.displayName}</td>
                    <td className="px-4 py-3 font-mono text-brand">{v.displayNumber}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">•••••{v.realNumber.slice(-4)}</td>
                    <td className="px-4 py-3">{v.programme}</td>
                    <td className="px-4 py-3">{v.telco}</td>
                    <td className="px-4 py-3 font-mono">{v.callsMade.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-success">{v.callsAnswered.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--brand)" }}>{rate.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                        v.status === "Active" ? "bg-success/10 text-success" :
                        v.status === "Pending" ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                      }`}>
                        {v.status === "Active" ? <CheckCircle2 className="h-3 w-3" /> :
                         v.status === "Pending" ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {v.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{v.createdAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {open && <RegisterModal onClose={() => setOpen(false)} onAdd={add} />}
    </div>
  );
}

function RegisterModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: any) => void }) {
  const [form, setForm] = useState({
    displayName: "WFP Somalia", displayNumber: "", realNumber: "",
    programme: "Cash Operations", telco: "Hormuud",
  });
  const [mode, setMode] = useState<"single" | "multiple">("single");
  const [csv, setCsv] = useState<File | null>(null);

  const submit = () => {
    if (mode === "single") onAdd(form);
    else onAdd({ ...form, realNumber: csv ? `CSV:${csv.name}` : "", displayNumber: form.displayNumber || "(bulk)" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand/10 text-brand grid place-items-center"><ShieldCheck className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold">Register Verified Caller ID</h2>
            <p className="text-xs text-muted-foreground">Customize what beneficiaries see on their phone when WFP calls.</p>
          </div>
        </div>
        <div className="space-y-3">
          <Field label="Display Name">
            <input value={form.displayName} maxLength={20} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="e.g. WFP Somalia" className={inputCls} />
          </Field>
          <Field label="Number Type">
            <div className="grid grid-cols-2 gap-2">
              {([["single", "Single Number"], ["multiple", "Multiple Numbers (CSV)"]] as const).map(([v, l]) => (
                <label key={v} className={`flex items-center gap-2 h-11 px-3 rounded-lg border-2 cursor-pointer text-sm font-medium ${
                  mode === v ? "border-brand bg-brand/5 text-brand" : "border-border text-foreground"
                }`}>
                  <input type="radio" name="numType" value={v} checked={mode === v} onChange={() => setMode(v)}
                    className="h-4 w-4 accent-brand" />
                  {l}
                </label>
              ))}
            </div>
          </Field>

          {mode === "single" ? (
            <Field label="Number to Mask">
              <input placeholder="+25261xxxxxxx" value={form.realNumber} onChange={(e) => setForm({ ...form, realNumber: e.target.value })} className={inputCls} />
            </Field>
          ) : (
            <Field label="Upload CSV of Numbers to Mask">
              <label className="flex items-center gap-3 h-11 px-3 rounded-lg border-2 border-dashed border-border cursor-pointer hover:border-brand">
                <FileDown className="h-4 w-4 text-muted-foreground rotate-180" />
                <span className="text-sm flex-1 truncate">{csv ? csv.name : "Upload CSV (one number per row)"}</span>
                <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => setCsv(e.target.files?.[0] ?? null)} />
              </label>
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Programme">
              <select value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })} className={inputCls}>
                {["Baxnano", "VAM", "Relief"].map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Telco">
              <select value={form.telco} onChange={(e) => setForm({ ...form, telco: e.target.value })} className={inputCls}>
                {["Hormuud", "Somnet", "Telesom", "Golis"].map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <div className="rounded-lg bg-info/5 border border-info/20 p-3 text-xs text-foreground">
          <span className="font-semibold text-info">Note:</span> Telco approval may take 24–48 hours before the display name is live.
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium">Cancel</button>
          <button onClick={submit} disabled={mode === "multiple" ? !csv : !form.realNumber}
            className="flex-1 h-10 rounded-lg bg-brand text-brand-foreground text-sm font-semibold disabled:opacity-50">
            Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>{children}</div>;
}
function Stat({ label, value, color, icon }: { label: string; value: string | number; color: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
        {icon && <div style={{ color }}>{icon}</div>}
      </div>
      <div className="text-2xl font-bold mt-2" style={{ color }}>{value}</div>
    </div>
  );
}
