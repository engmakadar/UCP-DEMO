import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { LifeBuoy, Phone, Mail, MessageSquare, Send, Clock, CheckCircle2, AlertCircle, Plus } from "lucide-react";

export const Route = createFileRoute("/helpdesk")({ component: HelpdeskPage });

interface Ticket {
  id: string; subject: string; category: string; priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved"; createdAt: string; lastMessage: string; messages: Msg[];
}
interface Msg { from: "user" | "agent"; text: string; at: string; }

const seed: Ticket[] = [
  { id: "TCK-1042", subject: "OBD failing to Telesom numbers", category: "Telecom Routing", priority: "High", status: "In Progress", createdAt: "2026-05-15 09:12", lastMessage: "Engineering reviewing route logs", messages: [
    { from: "user", text: "We're seeing 60% failure on Telesom OBD since 8 AM.", at: "2026-05-15 09:12" },
    { from: "agent", text: "Acknowledged — escalated to Telesom NOC. Will update in 30 min.", at: "2026-05-15 09:24" },
  ]},
  { id: "TCK-1041", subject: "CRBT tone upload rejected", category: "CRBT", priority: "Medium", status: "Open", createdAt: "2026-05-15 08:01", lastMessage: "Pending agent reply", messages: [
    { from: "user", text: "WAV file 22kHz failing validation.", at: "2026-05-15 08:01" },
  ]},
  { id: "TCK-1038", subject: "M-Survey report export", category: "Reports", priority: "Low", status: "Resolved", createdAt: "2026-05-14 14:30", lastMessage: "Resolved — feature shipped", messages: [
    { from: "user", text: "Need a CSV export of survey responses.", at: "2026-05-14 14:30" },
    { from: "agent", text: "Available now in M-Survey Reports → Export.", at: "2026-05-14 16:10" },
  ]},
];

function HelpdeskPage() { return <AppShell><Body /></AppShell>; }

function Body() {
  const [tickets, setTickets] = useState<Ticket[]>(seed);
  const [active, setActive] = useState<Ticket>(seed[0]);
  const [draft, setDraft] = useState("");
  const [showNew, setShowNew] = useState(false);

  const send = () => {
    if (!draft.trim()) return;
    const m: Msg = { from: "user", text: draft, at: new Date().toISOString().slice(0, 16).replace("T", " ") };
    const next = { ...active, messages: [...active.messages, m], lastMessage: draft };
    setTickets(arr => arr.map(t => t.id === active.id ? next : t));
    setActive(next); setDraft("");
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-brand/10 text-brand grid place-items-center"><LifeBuoy className="h-5 w-5" /></span>
            Helpdesk · 24/7 Support
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Reach UCP support via phone, email, or in-platform ticketing — round-the-clock.</p>
        </div>
        <button onClick={() => setShowNew(true)} className="h-10 px-5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 shadow-sm shadow-brand/30">
          <Plus className="h-4 w-4" /> New Ticket
        </button>
      </div>

      {/* Channels */}
      <div className="grid md:grid-cols-3 gap-4">
        <ChannelCard icon={<Phone className="h-5 w-5" />} title="Phone" sub="24/7 hotline" detail="+252 61 999 0000" color="var(--success)" />
        <ChannelCard icon={<Mail className="h-5 w-5" />} title="Email" sub="Reply within 1 hr" detail="ucp-support@wfp.so" color="var(--brand)" />
        <ChannelCard icon={<MessageSquare className="h-5 w-5" />} title="In-Platform Chat" sub="Live agent · avg 4 min" detail="Open ticket below" color="var(--violet)" />
      </div>

      {/* Tickets + Conversation */}
      <div className="grid lg:grid-cols-[360px_1fr] gap-4">
        <div className="rounded-2xl bg-surface border border-border overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm">My Tickets</h2>
            <span className="text-xs text-muted-foreground">{tickets.length}</span>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {tickets.map(t => (
              <button key={t.id} onClick={() => setActive(t)}
                className={`w-full text-left p-3 border-b border-border block hover:bg-surface-2 ${active.id === t.id ? "bg-surface-2" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] text-muted-foreground">{t.id}</span>
                  <StatusBadge s={t.status} />
                </div>
                <div className="font-semibold text-sm mt-1 truncate">{t.subject}</div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">{t.lastMessage}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  <PriorityChip p={t.priority} />
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{t.createdAt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface border border-border flex flex-col min-h-[560px]">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <div className="font-semibold">{active.subject}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{active.category} · {active.id}</div>
            </div>
            <div className="flex items-center gap-2"><PriorityChip p={active.priority} /><StatusBadge s={active.status} /></div>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {active.messages.map((m, i) => (
              <div key={i} className={`max-w-[78%] ${m.from === "user" ? "ml-auto" : ""}`}>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${m.from === "user" ? "bg-brand text-brand-foreground rounded-tr-sm" : "bg-surface-2 rounded-tl-sm"}`}>
                  {m.text}
                </div>
                <div className={`text-[10px] text-muted-foreground mt-1 ${m.from === "user" ? "text-right" : ""}`}>{m.from === "agent" ? "UCP Support" : "You"} · {m.at}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message to the support team…"
              className="flex-1 h-11 px-3.5 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40" />
            <button onClick={send} className="h-11 px-5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> Send
            </button>
          </div>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4" onClick={() => setShowNew(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-xl p-6 space-y-4">
            <h3 className="font-semibold text-lg">Open New Ticket</h3>
            <NewTicketForm onSubmit={(t) => { setTickets([t, ...tickets]); setActive(t); setShowNew(false); }} onCancel={() => setShowNew(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function NewTicketForm({ onSubmit, onCancel }: { onSubmit: (t: Ticket) => void; onCancel: () => void }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState<Ticket["priority"]>("Medium");
  const [msg, setMsg] = useState("");
  const submit = () => {
    if (!subject.trim() || !msg.trim()) return;
    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    onSubmit({
      id: `TCK-${1043 + Math.floor(Math.random() * 100)}`, subject, category, priority,
      status: "Open", createdAt: now, lastMessage: msg, messages: [{ from: "user", text: msg, at: now }],
    });
  };
  const inp = "w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40";
  return (
    <div className="space-y-3">
      <div><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inp + " mt-1"} placeholder="Short summary of the issue" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inp + " mt-1"}>
            {["General", "Telecom Routing", "CRBT", "M-Survey", "Bulk Email", "eSIM / SIM", "Reports", "Billing"].map(c => <option key={c}>{c}</option>)}
          </select></div>
        <div><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={inp + " mt-1"}>
            {["Low", "Medium", "High", "Critical"].map(p => <option key={p}>{p}</option>)}
          </select></div>
      </div>
      <div><label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</label>
        <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} className="w-full px-3.5 py-2 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40 mt-1" placeholder="Describe the issue, steps to reproduce, expected vs actual…" /></div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 h-10 rounded-lg border border-border text-sm font-medium">Cancel</button>
        <button onClick={submit} disabled={!subject || !msg} className="flex-1 h-10 rounded-lg bg-brand text-brand-foreground text-sm font-semibold disabled:opacity-50">Submit Ticket</button>
      </div>
    </div>
  );
}

function ChannelCard({ icon, title, sub, detail, color }: { icon: React.ReactNode; title: string; sub: string; detail: string; color: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-5 flex items-start gap-4">
      <div className="h-11 w-11 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${color} 12%, transparent)`, color }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
        <div className="font-mono text-sm mt-2 truncate">{detail}</div>
      </div>
    </div>
  );
}
function StatusBadge({ s }: { s: Ticket["status"] }) {
  const map = { Open: ["bg-info/10 text-info", AlertCircle], "In Progress": ["bg-warning/10 text-warning", Clock], Resolved: ["bg-success/10 text-success", CheckCircle2] } as const;
  const [cls, Icon] = map[s];
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${cls}`}><Icon className="h-3 w-3" />{s}</span>;
}
function PriorityChip({ p }: { p: Ticket["priority"] }) {
  const map: Record<Ticket["priority"], string> = {
    Low: "bg-muted text-muted-foreground", Medium: "bg-info/10 text-info",
    High: "bg-warning/10 text-warning", Critical: "bg-destructive/10 text-destructive",
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${map[p]}`}>{p}</span>;
}
