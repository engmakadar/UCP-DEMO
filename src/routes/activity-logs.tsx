import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  ScrollText, Download, Search, User, LogIn, LogOut, FileEdit, Send,
  Trash2, ShieldAlert, Eye, Upload,
} from "lucide-react";
import { toCSV, downloadCSV } from "@/lib/csv";

export const Route = createFileRoute("/activity-logs")({ component: ActivityLogsPage });

function ActivityLogsPage() { return <AppShell><Body /></AppShell>; }

type Action =
  | "Login" | "Logout" | "Create Campaign" | "Launch Campaign" | "Edit Campaign"
  | "Delete Record" | "Upload File" | "View Report" | "Activate SIM" | "Register CRBT"
  | "Open Ticket" | "Update Rule" | "Failed Login";

interface LogRow {
  id: string;
  at: string;
  user: string;
  email: string;
  role: "Admin" | "Operator" | "Analyst" | "Viewer";
  action: Action;
  module: string;
  target: string;
  ip: string;
  status: "Success" | "Failure";
}

const actions: Action[] = [
  "Login", "Logout", "Create Campaign", "Launch Campaign", "Edit Campaign",
  "Delete Record", "Upload File", "View Report", "Activate SIM", "Register CRBT",
  "Open Ticket", "Update Rule", "Failed Login",
];
const users = [
  { u: "Ayan Mohamed", e: "ayan.m@wfp.org", r: "Admin" as const },
  { u: "Hassan Ali", e: "hassan.a@wfp.org", r: "Operator" as const },
  { u: "Fatuma Yusuf", e: "fatuma.y@wfp.org", r: "Analyst" as const },
  { u: "Omar Abdi", e: "omar.a@wfp.org", r: "Operator" as const },
  { u: "Nimo Farah", e: "nimo.f@wfp.org", r: "Viewer" as const },
  { u: "Khalid Warsame", e: "khalid.w@wfp.org", r: "Admin" as const },
];
const modules = ["Campaigns", "M-Survey", "CRBT", "eSIM", "Reports", "Helpdesk", "Integrations", "Auth", "Caller ID"];

function rnd(i: number) { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x); }

const rows: LogRow[] = Array.from({ length: 64 }).map((_, i) => {
  const u = users[Math.floor(rnd(i) * users.length)];
  const a = actions[Math.floor(rnd(i + 1) * actions.length)];
  const m = modules[Math.floor(rnd(i + 2) * modules.length)];
  const d = new Date(); d.setMinutes(d.getMinutes() - i * 17);
  return {
    id: `EVT-${50000 + i}`,
    at: d.toISOString().slice(0, 19).replace("T", " "),
    user: u.u, email: u.e, role: u.r, action: a, module: m,
    target: a.includes("Campaign") ? `CMP-${2000 + Math.floor(rnd(i + 3) * 99)}` : a === "Activate SIM" ? `+25261${Math.floor(rnd(i + 4) * 9000000) + 1000000}` : a === "Open Ticket" ? `TCK-${1000 + i}` : "—",
    ip: `196.${Math.floor(rnd(i + 5) * 250)}.${Math.floor(rnd(i + 6) * 250)}.${Math.floor(rnd(i + 7) * 250)}`,
    status: a === "Failed Login" ? "Failure" : rnd(i + 8) > 0.94 ? "Failure" : "Success",
  };
});

const iconFor: Record<string, React.ReactNode> = {
  "Login": <LogIn className="h-3.5 w-3.5" />,
  "Logout": <LogOut className="h-3.5 w-3.5" />,
  "Create Campaign": <FileEdit className="h-3.5 w-3.5" />,
  "Launch Campaign": <Send className="h-3.5 w-3.5" />,
  "Edit Campaign": <FileEdit className="h-3.5 w-3.5" />,
  "Delete Record": <Trash2 className="h-3.5 w-3.5" />,
  "Upload File": <Upload className="h-3.5 w-3.5" />,
  "View Report": <Eye className="h-3.5 w-3.5" />,
  "Activate SIM": <User className="h-3.5 w-3.5" />,
  "Register CRBT": <FileEdit className="h-3.5 w-3.5" />,
  "Open Ticket": <FileEdit className="h-3.5 w-3.5" />,
  "Update Rule": <FileEdit className="h-3.5 w-3.5" />,
  "Failed Login": <ShieldAlert className="h-3.5 w-3.5" />,
};

function Body() {
  const [q, setQ] = useState("");
  const [user, setUser] = useState("All");
  const [module, setModule] = useState("All");
  const [status, setStatus] = useState("All");
  const [range, setRange] = useState<"10" | "50" | "100" | "All">("10");

  const filtered = useMemo(() => rows.filter(r => {
    if (user !== "All" && r.user !== user) return false;
    if (module !== "All" && r.module !== module) return false;
    if (status !== "All" && r.status !== status) return false;
    if (q && !`${r.id} ${r.user} ${r.email} ${r.action} ${r.target} ${r.ip}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, user, module, status]);

  const visible = useMemo(() => range === "All" ? filtered : filtered.slice(0, parseInt(range)), [filtered, range]);

  const exportCsv = () => downloadCSV("activity-logs.csv", toCSV(visible as any));

  const totals = useMemo(() => ({
    total: filtered.length,
    success: filtered.filter(r => r.status === "Success").length,
    failure: filtered.filter(r => r.status === "Failure").length,
    uniqueUsers: new Set(filtered.map(r => r.user)).size,
  }), [filtered]);

  return (
    <div className="p-4 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <span className="h-10 w-10 rounded-xl bg-violet/10 text-violet grid place-items-center"><ScrollText className="h-5 w-5" /></span>
          Activity Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Audit trail of every user action across the platform.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total Events" value={totals.total} color="var(--brand)" />
        <Kpi label="Successful" value={totals.success} color="var(--success)" />
        <Kpi label="Failures" value={totals.failure} color="var(--destructive)" />
        <Kpi label="Unique Users" value={totals.uniqueUsers} color="var(--violet)" />
      </div>

      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter as you type — user, action, IP, target…"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          </div>
          <select value={user} onChange={e => setUser(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm">
            <option>All</option>{users.map(u => <option key={u.u}>{u.u}</option>)}
          </select>
          <select value={module} onChange={e => setModule(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm">
            <option>All</option>{modules.map(m => <option key={m}>{m}</option>)}
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm">
            <option>All</option><option>Success</option><option>Failure</option>
          </select>
          <select value={range} onChange={e => setRange(e.target.value as any)} className="h-9 px-3 rounded-lg border border-border bg-surface text-sm" title="Rows to show">
            <option value="10">0-10</option>
            <option value="50">0-50</option>
            <option value="100">0-100</option>
            <option value="All">All</option>
          </select>
          <button onClick={exportCsv} className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-accent inline-flex items-center gap-1.5">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
              <tr>{["Event ID", "Timestamp", "User", "Role", "Action", "Module", "Target", "IP", "Status"].map(h =>
                <th key={h} className="text-left px-4 py-3 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {visible.map(r => (
                <tr key={r.id} className="border-t border-border hover:bg-surface-2/60">
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{r.id}</td>
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{r.at}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.user}</div>
                    <div className="text-[11px] text-muted-foreground">{r.email}</div>
                  </td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold bg-info/10 text-info">{r.role}</span></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-violet/10 text-violet">
                      {iconFor[r.action]}{r.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{r.module}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.target}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.ip}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold ${r.status === "Success" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {visible.length} of {filtered.length} events
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-surface border border-border p-5">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className="text-2xl font-bold mt-1" style={{ color }}>{value.toLocaleString()}</div>
    </div>
  );
}
