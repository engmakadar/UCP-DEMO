import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { records } from "@/lib/telecom-data";
import { downloadCSV, toCSV } from "@/lib/csv";
import { Search, FileDown, X, FileSpreadsheet } from "lucide-react";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

function ReportsPage() { return <AppShell><Body /></AppShell>; }

const COLS = [
  { key: "id", label: "Campaign ID" },
  { key: "location", label: "Location" },
  { key: "campaign", label: "Campaign Name" },
  { key: "interface", label: "Interface" },
  { key: "sender", label: "Sender ID" },
  { key: "date", label: "Date" },
  { key: "mobile", label: "Mobile Number" },
  { key: "status", label: "Status" },
  { key: "duration", label: "Call Duration" },
  { key: "telco", label: "Telco Name" },
  { key: "department", label: "Programme / Department" },
] as const;

function Body() {
  const [q, setQ] = useState("");
  const [colFilters, setColFilters] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const global = q.toLowerCase().trim();
    return records.filter(r => {
      if (global && !COLS.some(c => String((r as any)[c.key] ?? "").toLowerCase().includes(global))) return false;
      for (const [k, v] of Object.entries(colFilters)) {
        if (v && !String((r as any)[k] ?? "").toLowerCase().includes(v.toLowerCase())) return false;
      }
      return true;
    });
  }, [q, colFilters]);

  const exportCsv = () => {
    const rows = filtered.map(r => Object.fromEntries(COLS.map(c => [c.label, (r as any)[c.key] ?? ""])));
    downloadCSV(`reports-${new Date().toISOString().slice(0,10)}.csv`, toCSV(rows));
  };

  const activeFilters = Object.entries(colFilters).filter(([, v]) => v);

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-info/10 text-info grid place-items-center"><FileSpreadsheet className="h-5 w-5" /></span>
            Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Advanced search & filter-as-you-type across all campaign records.</p>
        </div>
        <button onClick={exportCsv} className="h-10 px-5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 shadow-sm shadow-brand/30">
          <FileDown className="h-4 w-4" /> Export CSV ({filtered.length.toLocaleString()})
        </button>
      </div>

      <div className="rounded-2xl bg-surface border border-border p-4 space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter-as-you-type across all columns…"
            className="w-full h-11 pl-10 pr-10 rounded-lg bg-surface-2 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40" />
          {q && <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
        </div>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Active filters:</span>
            {activeFilters.map(([k, v]) => (
              <span key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand/10 text-brand font-medium">
                {COLS.find(c => c.key === k)?.label}: {v}
                <button onClick={() => setColFilters(f => ({ ...f, [k]: "" }))}><X className="h-3 w-3" /></button>
              </span>
            ))}
            <button onClick={() => setColFilters({})} className="text-muted-foreground hover:text-foreground underline">Clear all</button>
          </div>
        )}
      </div>

      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-wider">
              <tr>{COLS.map(c => <th key={c.key} className="text-left px-3 py-3 font-medium text-muted-foreground whitespace-nowrap">{c.label}</th>)}</tr>
              <tr className="border-t border-border bg-surface-2/60">
                {COLS.map(c => (
                  <th key={c.key} className="px-3 py-2">
                    <input value={colFilters[c.key] ?? ""} onChange={(e) => setColFilters(f => ({ ...f, [c.key]: e.target.value }))}
                      placeholder="Filter…"
                      className="w-full h-7 px-2 rounded border border-border bg-surface text-xs font-normal normal-case tracking-normal outline-none focus:ring-1 focus:ring-ring/40" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map(r => (
                <tr key={r.id} className="border-t border-border hover:bg-surface-2/60">
                  <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{r.id}</td>
                  <td className="px-3 py-2.5">{r.location}</td>
                  <td className="px-3 py-2.5 font-medium">{r.campaign}</td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${r.interface === "OBD" ? "bg-info/10 text-info" : "bg-success/10 text-success"}`}>{r.interface}</span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{r.sender}</td>
                  <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{r.date}</td>
                  <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap">{r.mobile}</td>
                  <td className="px-3 py-2.5"><StatusBadge s={r.status} /></td>
                  <td className="px-3 py-2.5 font-mono text-xs">{r.duration ? `${r.duration}s` : "—"}</td>
                  <td className="px-3 py-2.5">{r.telco}</td>
                  <td className="px-3 py-2.5">{r.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-muted-foreground text-sm">No records match your filters.</div>
        )}
        {filtered.length > 200 && (
          <div className="p-3 text-center text-xs text-muted-foreground bg-surface-2 border-t border-border">
            Showing first 200 of {filtered.length.toLocaleString()} — export CSV for full dataset.
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    Delivered: "bg-success/10 text-success",
    Answered: "bg-brand/10 text-brand",
    Failed: "bg-destructive/10 text-destructive",
    "No Answer": "bg-warning/10 text-warning",
    Busy: "bg-violet/10 text-violet",
    Unavailable: "bg-info/10 text-info",
    Congestion: "bg-pink/10 text-pink",
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${map[s] ?? "bg-muted text-muted-foreground"}`}>{s}</span>;
}
