import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { surveyReports, type SurveyResponseStats } from "@/lib/telecom-data";
import { downloadCSV, toCSV } from "@/lib/csv";
import {
  BarChart3, Search, FileDown, ChevronRight, ArrowLeft,
  PhoneCall, PhoneOff, PhoneMissed, XCircle, CheckCircle2, Loader2, ThumbsUp, ThumbsDown,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/m-survey-reports")({ component: SurveyReports });

const THEME_COLOR: Record<string, string> = {
  Drought: "var(--warning)", DRR: "var(--info)", Livestock: "var(--violet)",
  Nutrition: "var(--success)", Cash: "var(--brand)", Health: "var(--pink)", Protection: "var(--destructive)",
};

function SurveyReports() { return <AppShell><Body /></AppShell>; }

function Body() {
  const [selected, setSelected] = useState<SurveyResponseStats | null>(null);
  const [q, setQ] = useState("");
  const [theme, setTheme] = useState("All");

  const list = useMemo(() =>
    surveyReports.filter(s =>
      (theme === "All" || s.theme === theme) &&
      [s.campaign, s.theme, s.interface].join(" ").toLowerCase().includes(q.toLowerCase())
    ),
    [q, theme]
  );

  if (selected) return <Detail s={selected} back={() => setSelected(null)} />;

  const exportCsv = () => {
    downloadCSV(`m-survey-reports-${new Date().toISOString().slice(0, 10)}.csv`,
      toCSV(list.map(s => ({
        Campaign: s.campaign, Theme: s.theme, Channel: s.interface, Status: s.status,
        Reached: s.totalReached, Answered: s.answered, "1-Yes": s.yes, "2-No": s.no,
        "No Answer": s.noAnswer, Busy: s.busy, Declined: s.declined, Failed: s.failed,
      }))));
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand grid place-items-center"><BarChart3 className="h-5 w-5" /></span>
          M-Survey Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track survey campaigns by theme. Yes/No responses split from out-of-number reasons (busy, declined, no answer).</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Surveys" value={surveyReports.length} color="var(--brand)" />
        <Stat label="Completed" value={surveyReports.filter(s => s.status === "Completed").length} color="var(--success)" />
        <Stat label="Running" value={surveyReports.filter(s => s.status === "Running").length} color="var(--info)" />
        <Stat label="Total Reached" value={surveyReports.reduce((s, x) => s + x.totalReached, 0).toLocaleString()} color="var(--violet)" />
      </div>

      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaign, theme, channel…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-2 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
          <select value={theme} onChange={(e) => setTheme(e.target.value)} className="h-9 px-3 rounded-lg bg-surface-2 border border-border text-sm">
            {["All", "Drought", "DRR", "Livestock", "Nutrition", "Cash", "Health"].map(t => <option key={t}>{t}</option>)}
          </select>
          <button onClick={exportCsv} className="h-9 px-3 rounded-lg border border-border text-xs font-medium inline-flex items-center gap-2 hover:bg-accent">
            <FileDown className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>{["Campaign", "Theme", "Channel", "Reached", "Answered", "1 — Yes", "2 — No", "No Answer", "Busy", "Declined", "Failed", "Status", ""].map(h =>
                <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>
              )}</tr>
            </thead>
            <tbody>
              {list.map(s => (
                <tr key={s.campaign} onClick={() => setSelected(s)} className="border-t border-border hover:bg-surface-2/60 cursor-pointer">
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">{s.campaign}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium"
                      style={{ background: `color-mix(in oklab, ${THEME_COLOR[s.theme]} 14%, transparent)`, color: THEME_COLOR[s.theme] }}>
                      {s.theme}
                    </span>
                  </td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-info/10 text-info">{s.interface}</span></td>
                  <td className="px-4 py-3 font-mono">{s.totalReached.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-success">{s.answered.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-brand font-semibold">{s.yes}</td>
                  <td className="px-4 py-3 font-mono text-destructive font-semibold">{s.no}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{s.noAnswer}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{s.busy}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{s.declined}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{s.failed}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${s.status === "Completed" ? "bg-success/10 text-success" : "bg-info/10 text-info"}`}>
                      {s.status === "Completed" ? <CheckCircle2 className="h-3 w-3" /> : <Loader2 className="h-3 w-3 animate-spin" />}
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground"><ChevronRight className="h-4 w-4" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const COLORS = ["var(--brand)", "var(--destructive)", "var(--warning)", "var(--violet)", "var(--info)", "var(--pink)"];

function Detail({ s, back }: { s: SurveyResponseStats; back: () => void }) {
  const responseChart = [
    { name: "1 — Yes", count: s.yes },
    { name: "2 — No", count: s.no },
  ];
  const outOfNumber = [
    { name: "No Answer", value: s.noAnswer },
    { name: "Busy", value: s.busy },
    { name: "Declined", value: s.declined },
    { name: "Failed", value: s.failed },
  ];

  const exportCsv = () => {
    const rows = [
      { Metric: "1 — Yes", Count: s.yes, Category: "Response" },
      { Metric: "2 — No", Count: s.no, Category: "Response" },
      { Metric: "No Answer", Count: s.noAnswer, Category: "Out of number" },
      { Metric: "Busy", Count: s.busy, Category: "Out of number" },
      { Metric: "Declined", Count: s.declined, Category: "Out of number" },
      { Metric: "Failed", Count: s.failed, Category: "Out of number" },
    ];
    downloadCSV(`${s.campaign.replace(/\s+/g, "-")}-report.csv`, toCSV(rows));
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <button onClick={back} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Surveys
      </button>

      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold"
              style={{ background: `color-mix(in oklab, ${THEME_COLOR[s.theme]} 14%, transparent)`, color: THEME_COLOR[s.theme] }}>
              {s.theme}
            </span>
            <span className="text-xs text-muted-foreground">· {s.interface} · {s.status}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">{s.campaign}</h1>
        </div>
        <button onClick={exportCsv} className="h-10 px-4 rounded-lg border border-border text-sm font-medium inline-flex items-center gap-2 hover:bg-accent">
          <FileDown className="h-4 w-4" /> Export
        </button>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Responses (callers who pressed a key)</div>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
          <Stat label="1 — Yes" value={s.yes} color="var(--brand)" icon={<ThumbsUp className="h-4 w-4" />} />
          <Stat label="2 — No" value={s.no} color="var(--destructive)" icon={<ThumbsDown className="h-4 w-4" />} />
        </div>
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Out of number (call not completed)</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Reached" value={s.totalReached.toLocaleString()} color="var(--violet)" icon={<PhoneCall className="h-4 w-4" />} />
          <Stat label="No Answer" value={s.noAnswer} color="var(--warning)" icon={<PhoneMissed className="h-4 w-4" />} />
          <Stat label="Busy" value={s.busy} color="var(--info)" icon={<PhoneOff className="h-4 w-4" />} />
          <Stat label="Declined" value={s.declined} color="var(--pink)" icon={<XCircle className="h-4 w-4" />} />
          <Stat label="Failed" value={s.failed} color="var(--destructive)" icon={<XCircle className="h-4 w-4" />} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-surface border border-border p-6">
          <h2 className="font-semibold mb-1">Response Breakdown</h2>
          <p className="text-xs text-muted-foreground mb-4">Yes vs No answers — only counted out of {s.answered.toLocaleString()} answered calls.</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={responseChart}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                <Cell fill="var(--brand)" />
                <Cell fill="var(--destructive)" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-surface border border-border p-6">
          <h2 className="font-semibold mb-1">Out-of-Number Breakdown</h2>
          <p className="text-xs text-muted-foreground mb-4">Why some calls did not produce a response.</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={outOfNumber} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {outOfNumber.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-surface border border-border p-6">
        <h2 className="font-semibold mb-4">Detailed Metrics</h2>
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
            <tr>{["Metric", "Category", "Count", "Share of Answered", "Share of Reached"].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {[
              { name: "1 — Yes", cat: "Response", count: s.yes },
              { name: "2 — No", cat: "Response", count: s.no },
              { name: "No Answer", cat: "Out of number", count: s.noAnswer },
              { name: "Busy", cat: "Out of number", count: s.busy },
              { name: "Declined", cat: "Out of number", count: s.declined },
              { name: "Failed", cat: "Out of number", count: s.failed },
            ].map(r => (
              <tr key={r.name} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.cat}</td>
                <td className="px-4 py-3 font-mono">{r.count.toLocaleString()}</td>
                <td className="px-4 py-3 text-brand font-semibold">{s.answered ? ((r.count / s.answered) * 100).toFixed(1) : "0"}%</td>
                <td className="px-4 py-3 text-muted-foreground">{((r.count / s.totalReached) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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
