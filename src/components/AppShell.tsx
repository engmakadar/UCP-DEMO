import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import wfpLogo from "@/assets/wfp-logo.png";
import {
  LayoutDashboard, MessageSquareText, Megaphone, Radio,
  FileSpreadsheet, Mail, Smartphone, Settings, Bell, Search, ShieldCheck, BarChart3, PhoneOutgoing,
  LifeBuoy, Plug, ScrollText,
} from "lucide-react";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/create-campaign", label: "Create Campaign", icon: Megaphone },
  { to: "/m-survey", label: "M-Survey", icon: MessageSquareText },
  { to: "/m-survey-reports", label: "M-Survey Reports", icon: BarChart3 },
  { to: "/crbt", label: "CRBT", icon: Radio },
  { to: "/verified-caller-id", label: "Verified Caller ID", icon: PhoneOutgoing },
  { to: "/bulk-email", label: "Bulk Email", icon: Mail },
  { to: "/esim", label: "eSIM / SIM", icon: Smartphone },
  { to: "/reports", label: "Reports", icon: FileSpreadsheet },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/helpdesk", label: "Helpdesk 24/7", icon: LifeBuoy },
  { to: "/activity-logs", label: "Activity Logs", icon: ScrollText },
  { to: "/", label: "Settings", icon: Settings, disabled: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-border">
          <div className="h-9 w-9 rounded-lg overflow-hidden bg-primary grid place-items-center"><img src={wfpLogo} alt="WFP" className="h-full w-full object-cover" /></div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">UCP WFP</div>
            <div className="text-[11px] text-muted-foreground">Unified Campaign Platform</div>
          </div>
        </div>
        <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
          {nav.map((n, i) => {
            const disabled = "disabled" in n && n.disabled;
            const active = !disabled && loc.pathname === n.to;
            const Icon = n.icon;
            const cls = `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              active ? "bg-brand text-brand-foreground shadow-sm" :
              disabled ? "text-muted-foreground/60 cursor-not-allowed" : "text-foreground hover:bg-accent"
            }`;
            if (disabled) return <div key={i} className={cls}><Icon className="h-4 w-4" />{n.label}</div>;
            return <Link key={i} to={n.to} className={cls}><Icon className="h-4 w-4" />{n.label}</Link>;
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <div className="rounded-lg bg-surface-2 p-3 text-xs">
            <div className="flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4 text-success" />System Operational</div>
            <div className="text-muted-foreground mt-1">All telecom interfaces healthy</div>
          </div>
          <div className="rounded-lg border border-border p-3 text-[11px] text-muted-foreground">
            <div className="font-semibold text-foreground mb-1">Integrations</div>
            KoboCollect · RapidPro · ODK
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-30 flex items-center px-4 lg:px-8 gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search campaigns, numbers, IDs…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-2 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live · 320 records
            </span>
          </div>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-accent"><Bell className="h-4 w-4" /></button>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand to-violet text-white grid place-items-center text-xs font-semibold">AM</div>
        </header>
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
