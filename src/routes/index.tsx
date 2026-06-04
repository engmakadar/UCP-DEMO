import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  records, summarize, byDay, statusMix, campaignSummary,
  crbtSeries, crbtStats, simStats, statusOverTime, senderPerformance,
  programmeUsage,
} from "@/lib/telecom-data";
import { downloadCSV, toCSV } from "@/lib/csv";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis,
  CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line,
} from "recharts";
import {
  PhoneCall, MessageSquareText, RotateCcw, Download, TrendingUp,
  CheckCircle2, XCircle, PhoneMissed, Timer, Megaphone, AlertTriangle, FileDown,
  Radio, Smartphone,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  return <AppShell><DashboardBody /></AppShell>;
}

const PIE_COLORS: Record<string, string> = {
  Delivered: "var(--success)",
  Answered: "var(--brand)",
  Failed: "var(--destructive)",
  "No Answer": "var(--warning)",
  Busy: "var(--violet)",
  Unavailable: "var(--info)",
  Congestion: "var(--pink)",
};

function DashboardBody() {
  const [iface, setIface] = useState<"All" | "OBD" | "SMS">("All");
  const [loc, setLoc] = useState("All");
  const [camp, setCamp] = useState("All");
  const [sender, setSender] = useState("All");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => records.filter(r =>
    (iface === "All" || r.interface === iface) &&
    (loc === "All" || r.location === loc) &&
    (camp === "All" || r.campaign === camp) &&
    (sender === "All" || r.sender === sender) &&
    (status === "All" || r.status === status)
  ), [iface, loc, camp, sender, status]);

  const s = useMemo(() => summarize(filtered), [filtered]);
  const trend = useMemo(() => byDay(filtered), [filtered]);
  const mix = useMemo(() => statusMix(filtered), [filtered]);
  const statusTime = useMemo(() => statusOverTime(filtered), [filtered]);
  const senderPerf = useMemo(() => senderPerformance(filtered), [filtered]);
  const progUse = useMemo(() => programmeUsage(filtered), [filtered]);
  const crbtTime = useMemo(() => crbtSeries(), []);
  const cstats = useMemo(() => crbtStats(), []);

  const locations = Array.from(new Set(records.map(r => r.location)));
  const campaigns = Array.from(new Set(records.map(r => r.campaign)));
  const senders = Array.from(new Set(records.map(r => r.sender)));
  const statuses = Array.from(new Set(records.map(r => r.status)));

  const reset = () => { setIface("All"); setLoc("All"); setCamp("All"); setSender("All"); setStatus("All"); };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Title */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UCP Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time telecommunications campaign analytics · WFP Somalia</p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      {/* Filters */}
      <section className="rounded-2xl bg-surface border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="section-label">Filters</div>
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <PillGroup label="Interface" value={iface} onChange={(v) => setIface(v as any)}
            options={[{v:"All", l:"All"}, {v:"OBD", l:"OBD"}, {v:"SMS", l:"SMS"}]} />
          <Select label="Location" value={loc} onChange={setLoc} options={["All", ...locations]} />
          <Select label="Campaign" value={camp} onChange={setCamp} options={["All", ...campaigns]} />
          <Select label="Sender ID" value={sender} onChange={setSender} options={["All", ...senders]} />
          <Select label="Status" value={status} onChange={setStatus} options={["All", ...statuses]} />
          <DateField label="Date" />
        </div>
      </section>

      {/* Interface overview */}
      <section className="space-y-3">
        <div className="section-label">Interface Overview</div>
        <div className="grid md:grid-cols-2 gap-4">
          <OverviewCard
            icon={<PhoneCall className="h-5 w-5" />}
            color="var(--info)"
            title="OBD — Outbound Calls"
            value={s.obd}
            footer={`${((s.obd / (s.total || 1)) * 100).toFixed(1)}% of total records`}
            ratio={(s.obd / (s.total || 1)) * 100}
          />
          <OverviewCard
            icon={<MessageSquareText className="h-5 w-5" />}
            color="var(--success)"
            title="SMS — Messages"
            value={s.sms}
            footer={`${((s.sms / (s.total || 1)) * 100).toFixed(1)}% of total records`}
            ratio={(s.sms / (s.total || 1)) * 100}
          />
        </div>
      </section>

      {/* KPI grid */}
      <section className="space-y-3">
        <div className="section-label">Performance KPIs</div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <Kpi color="var(--foreground)" label="Total Records" value={s.total.toLocaleString()} sub={`${s.dates} unique dates`} icon={<TrendingUp className="h-4 w-4" />} />
          <Kpi color="var(--success)" label="Delivery Rate" value={`${s.deliveryRate.toFixed(1)}%`} sub={`${s.delivered} delivered`} icon={<CheckCircle2 className="h-4 w-4" />} />
          <Kpi color="var(--brand)" label="Answer Rate" value={`${s.answerRate.toFixed(1)}%`} sub={`${s.answered} answered`} icon={<PhoneCall className="h-4 w-4" />} />
          <Kpi color="var(--violet)" label="Avg Duration" value={`${s.avgDuration.toFixed(1)}s`} sub={`${s.answered} calls`} icon={<Timer className="h-4 w-4" />} />
          <Kpi color="var(--destructive)" label="Failed Rate" value={`${s.failedRate.toFixed(1)}%`} sub={`${s.failed} failed`} icon={<XCircle className="h-4 w-4" />} />
          <Kpi color="var(--info)" label="Campaigns" value={s.campaigns.toString()} sub={`${s.senders} senders`} icon={<Megaphone className="h-4 w-4" />} />
          <Kpi color="var(--warning)" label="No Answer" value={`${s.noAnswerRate.toFixed(1)}%`} sub={`${s.noAnswer} records`} icon={<PhoneMissed className="h-4 w-4" />} />
          <Kpi color="var(--pink)" label="Others" value={`${s.othersRate.toFixed(1)}%`} sub={`${s.others} busy/unavail.`} icon={<AlertTriangle className="h-4 w-4" />} />
        </div>
      </section>

      {/* Analytics — restructured rows */}
      <section className="space-y-4">
        <div className="section-label">Analytics</div>

        {/* Row 1: Daily Volume (wide) + Status Mix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard className="lg:col-span-2" title="Daily Volume Trend" subtitle="Records over time, by status" badge="AREA">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trend} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gTot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tt} />
                <Area dataKey="Total" stroke="var(--brand)" strokeWidth={2} fill="url(#gTot)" />
                <Line type="monotone" dataKey="Answered" stroke="var(--success)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Status Mix" subtitle="Share by status type" badge="DONUT">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={mix} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {mix.map((e, i) => <Cell key={i} fill={PIE_COLORS[e.name] ?? "var(--muted-foreground)"} />)}
                </Pie>
                <Tooltip contentStyle={tt} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 2: CRBT + SIM + Sender Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="CRBT Active vs Failed" subtitle={`${cstats.total.toLocaleString()} active · ${cstats.failed} failed`} badge="CRBT" icon={<Radio className="h-4 w-4" />}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={crbtTime} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tt} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Active" stroke="var(--success)" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Failed" stroke="var(--destructive)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="eSIM vs Physical SIM" subtitle="Created and cancelled per week" badge="SIM" icon={<Smartphone className="h-4 w-4" />}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={simStats} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tt} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="eSIM" stackId="a" fill="var(--violet)" />
                <Bar dataKey="Physical" stackId="a" fill="var(--info)" />
                <Bar dataKey="Cancelled" stackId="a" fill="var(--destructive)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sender Performance" subtitle="Answered vs Other per sender" badge="SENDERS">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={senderPerf} layout="vertical" margin={{ top: 10, right: 12, left: 20, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis dataKey="sender" type="category" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={70} />
                <Tooltip contentStyle={tt} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Answered" stackId="x" fill="var(--success)" />
                <Bar dataKey="Others" stackId="x" fill="var(--warning)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Row 3: Programme Usage circular gauges */}
        <ChartCard title="Programme Usage" subtitle="Share of total requests per WFP programme" badge="GAUGES">
          <ProgrammeGauges data={progUse} />
        </ChartCard>

        {/* Row 4: Status Over Time (wide) + Sender Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard className="lg:col-span-2" title="Status Over Time" subtitle="Stacked daily volume by status" badge="STACKED">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={statusTime} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tt} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                {Object.keys(PIE_COLORS).map((k) =>
                  <Area key={k} type="monotone" dataKey={k} stackId="s" stroke={PIE_COLORS[k]} fill={PIE_COLORS[k]} fillOpacity={0.75} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sender Performance — Trend" subtitle="Answered vs Other per sender" badge="SENDERS">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={senderPerf} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="sender" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={tt} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Answered" fill="var(--success)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Others" fill="var(--warning)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </section>

      {/* Campaign summary table */}
      <CampaignTable filtered={filtered} />
    </div>
  );
}

function CampaignTable({ filtered }: { filtered: typeof records }) {
  const rows = useMemo(() => campaignSummary(filtered), [filtered]);
  const exportCsv = () => {
    const csv = toCSV(rows.map(r => ({
      Campaign: r.campaign, Interface: r.interface, Sender: r.sender,
      Location: r.location, Department: r.department, Total: r.total,
      Answered: r.answered, Delivered: r.delivered, Failed: r.failed,
      "Answer Rate %": r.answerRate.toFixed(2),
      "Delivery Rate %": r.deliveryRate.toFixed(2),
      Status: r.status, "Last Date": r.lastDate,
    })));
    downloadCSV(`campaigns-${new Date().toISOString().slice(0,10)}.csv`, csv);
  };
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="section-label">Recent Campaigns</div>
          <div className="text-xs text-muted-foreground mt-1">Per-campaign delivery & answer rates · {rows.length} campaigns</div>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-surface text-xs font-medium hover:bg-accent">
          <FileDown className="h-3.5 w-3.5" /> Download CSV
        </button>
      </div>
      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                {["Campaign","Interface","Sender","Location","Total","Answered","Delivered","Answer Rate","Delivery Rate","Failed","Status","Last Date"].map(h =>
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.campaign} className="border-t border-border hover:bg-surface-2/60">
                  <td className="px-4 py-3 font-semibold">{r.campaign}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-info/10 text-info">{r.interface}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.sender}</td>
                  <td className="px-4 py-3">{r.location}</td>
                  <td className="px-4 py-3 font-mono">{r.total.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-brand">{r.answered}</td>
                  <td className="px-4 py-3 font-mono text-success">{r.delivered}</td>
                  <td className="px-4 py-3"><RateBar value={r.answerRate} color="var(--brand)" /></td>
                  <td className="px-4 py-3"><RateBar value={r.deliveryRate} color="var(--success)" /></td>
                  <td className="px-4 py-3 font-mono text-destructive">{r.failed}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${
                      r.status === "Completed" ? "bg-success/10 text-success" :
                      r.status === "Running" ? "bg-info/10 text-info" : "bg-destructive/10 text-destructive"
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.lastDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function RateBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="min-w-[100px]">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-semibold" style={{ color }}>{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(value,100)}%`, background: color }} />
      </div>
    </div>
  );
}

const tt = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--foreground)",
};


function ChartCard({ title, subtitle, badge, children, className = "", icon }: { title: string; subtitle: string; badge: string; children: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <div className={`rounded-2xl bg-surface border border-border p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-2">
          {icon && <span className="text-brand mt-0.5">{icon}</span>}
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
        <span className="text-[10px] tracking-widest text-muted-foreground bg-surface-2 px-2 py-1 rounded">{badge}</span>
      </div>
      {children}
    </div>
  );
}

function ProgrammeGauges({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {data.map((d) => {
        const pct = (d.value / total) * 100;
        return <HalfGauge key={d.name} name={d.name} pct={pct} value={d.value} total={total} />;
      })}
    </div>
  );
}

function HalfGauge({ name, pct, value, total }: { name: string; pct: number; value: number; total: number }) {
  // Semicircle gauge: -90° (left) to +90° (right). Needle angle from pct.
  const angle = -90 + (Math.min(pct, 100) / 100) * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 100, cy = 100, nLen = 70;
  const nx = cx + nLen * Math.sin(rad);
  const ny = cy - nLen * Math.cos(rad);

  // 4 colored segments
  const segs = [
    { from: -90, to: -45, color: "#ef4444", label: "Far behind" },
    { from: -45, to: 0,   color: "#f97316", label: "Getting there" },
    { from: 0,   to: 45,  color: "#fde047", label: "On track" },
    { from: 45,  to: 90,  color: "#facc15", label: "Ahead" },
  ];
  const arc = (a1: number, a2: number, r: number) => {
    const p1x = cx + r * Math.sin((a1 * Math.PI) / 180);
    const p1y = cy - r * Math.cos((a1 * Math.PI) / 180);
    const p2x = cx + r * Math.sin((a2 * Math.PI) / 180);
    const p2y = cy - r * Math.cos((a2 * Math.PI) / 180);
    return `M ${p1x} ${p1y} A ${r} ${r} 0 0 1 ${p2x} ${p2y}`;
  };

  return (
    <div className="rounded-2xl bg-surface-2/40 border border-border p-4 flex flex-col items-center">
      <div className="text-sm font-semibold text-center mb-1">{name}</div>
      <div className="text-[11px] text-muted-foreground mb-2">{value.toLocaleString()} of {total.toLocaleString()} requests</div>
      <svg viewBox="0 0 200 130" className="w-full max-w-[240px]">
        {segs.map((s, i) => (
          <path key={i} d={arc(s.from, s.to, 72)} fill="none" stroke={s.color} strokeWidth="26" strokeLinecap="butt" />
        ))}
        {/* labels */}
        <text x="20" y="118" fontSize="7" fill="var(--muted-foreground)">Far behind</text>
        <text x="60" y="50" fontSize="7" fill="var(--muted-foreground)">Getting there</text>
        <text x="110" y="50" fontSize="7" fill="var(--muted-foreground)">On track</text>
        <text x="148" y="118" fontSize="7" fill="var(--muted-foreground)">Ahead</text>
        {/* value */}
        <text x="100" y="78" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--foreground)">{pct.toFixed(0)}%</text>
        {/* needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--foreground)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="7" fill="var(--foreground)" />
      </svg>
    </div>
  );
}

function Kpi({ color, label, value, sub, icon }: { color: string; label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
      <div className="flex items-center justify-between">
        <div className="section-label text-[10px]">{label}</div>
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight" style={{ color }}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function OverviewCard({ icon, color, title, value, footer, ratio }: { icon: React.ReactNode; color: string; title: string; value: number; footer: string; ratio: number }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-5">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)`, color }}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="section-label text-[10px]">{title}</div>
          <div className="text-3xl font-bold mt-1" style={{ color }}>{value.toLocaleString()}</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="text-xs text-muted-foreground mb-1.5">{footer}</div>
        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${ratio}%`, background: color }} />
        </div>
      </div>
    </div>
  );
}

function PillGroup({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div>
      <div className="section-label text-[10px] mb-1.5">{label}</div>
      <div className="inline-flex w-full p-1 bg-surface-2 rounded-lg border border-border">
        {options.map(o => (
          <button key={o.v} onClick={() => onChange(o.v)}
            className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
              value === o.v ? "bg-surface shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}>{o.l}</button>
        ))}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <div className="section-label text-[10px] mb-1.5">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40">
        {options.map(o => <option key={o} value={o}>{o === "All" ? `All ${label}s` : o}</option>)}
      </select>
    </div>
  );
}

function DateField({ label }: { label: string }) {
  return (
    <div>
      <div className="section-label text-[10px] mb-1.5">{label}</div>
      <input type="date" className="w-full h-9 px-3 rounded-lg bg-surface border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40" />
    </div>
  );
}
