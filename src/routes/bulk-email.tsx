import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Mail, Upload, Send, Paperclip, Eye, Users, Calendar, Check } from "lucide-react";

export const Route = createFileRoute("/bulk-email")({ component: BulkEmail });

function BulkEmail() { return <AppShell><Body /></AppShell>; }

function Body() {
  const [later, setLater] = useState(false);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const onRecipientUpload = (f: File | null) => {
    if (!f) return;
    f.text().then(t => {
      const emails = t.split(/[\s,;\n]+/).filter(e => /@/.test(e));
      setRecipients(emails);
    });
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-info/10 text-info grid place-items-center"><Mail className="h-5 w-5" /></span>
            Bulk Email
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Compose and send mass email campaigns to beneficiary or staff lists.</p>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{recipients.length.toLocaleString()}</span> recipients loaded
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-surface border border-border p-6 space-y-5">
          <h2 className="font-semibold">Compose Email</h2>

          <div className="grid grid-cols-2 gap-3">
            <Field label="From Name"><input defaultValue="WFP Somalia" className={inputCls} /></Field>
            <Field label="From Email"><input defaultValue="noreply@wfp.org" className={inputCls} /></Field>
          </div>

          <Field label="Subject" required>
            <input value={subject} onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Important: December Distribution Schedule" className={inputCls} />
          </Field>

          <Field label="Message Body" required>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12}
              placeholder="Compose your message. Use {{name}} for personalization."
              className={`${inputCls} h-auto py-3 resize-none font-mono text-xs`} />
            <div className="text-xs text-muted-foreground mt-1">Supports HTML and merge tags: {"{{name}}, {{location}}, {{amount}}"}</div>
          </Field>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-xs font-medium hover:bg-accent">
              <Paperclip className="h-3.5 w-3.5" /> Attach file
            </button>
            <button className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border text-xs font-medium hover:bg-accent">
              <Eye className="h-3.5 w-3.5" /> Preview
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-surface border border-border p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-brand" /> Recipients</h3>
            <label className="block border-2 border-dashed border-border rounded-xl p-5 text-center cursor-pointer hover:border-brand hover:bg-brand/5">
              <Upload className="h-5 w-5 text-brand mx-auto mb-2" />
              <div className="font-semibold text-sm">Upload list</div>
              <div className="text-xs text-muted-foreground mt-0.5">CSV · one email per line</div>
              <input type="file" accept=".csv,.txt" className="hidden" onChange={(e) => onRecipientUpload(e.target.files?.[0] ?? null)} />
            </label>
            {recipients.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg bg-surface-2 p-2 text-xs font-mono space-y-0.5">
                {recipients.slice(0, 20).map(e => <div key={e} className="truncate">{e}</div>)}
                {recipients.length > 20 && <div className="text-muted-foreground italic">+{recipients.length - 20} more…</div>}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-surface border border-border p-5 space-y-3">
            <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4 text-brand" /> Scheduling</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setLater(false)} className={`p-3 rounded-lg border-2 text-xs font-semibold ${!later ? "border-brand bg-brand/5 text-brand" : "border-border"}`}>
                <Check className="h-3.5 w-3.5 mx-auto mb-1" /> Send Now
              </button>
              <button onClick={() => setLater(true)} className={`p-3 rounded-lg border-2 text-xs font-semibold ${later ? "border-brand bg-brand/5 text-brand" : "border-border"}`}>
                <Calendar className="h-3.5 w-3.5 mx-auto mb-1" /> Schedule
              </button>
            </div>
            {later && (
              <>
                <input type="date" className={inputCls} />
                <input type="time" className={inputCls} />
              </>
            )}
          </div>

          <button className="w-full h-12 rounded-xl bg-brand text-brand-foreground font-semibold shadow-sm shadow-brand/30 inline-flex items-center justify-center gap-2 hover:opacity-90">
            <Send className="h-4 w-4" /> Send to {recipients.length.toLocaleString()} recipients
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-surface border border-border p-6">
        <h2 className="font-semibold mb-4">Recent Email Campaigns</h2>
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
            <tr>{["Subject", "Recipients", "Sent", "Opened", "Clicked", "Bounced", "Date"].map(h => <th key={h} className="text-left px-4 py-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {[
              { s: "December Distribution Schedule", r: 12480, sent: 12350, o: 8421, c: 2103, b: 130, d: "2026-05-15" },
              { s: "Cash Transfer Confirmation", r: 8760, sent: 8702, o: 6234, c: 1842, b: 58, d: "2026-05-12" },
              { s: "Nutrition Programme Update", r: 5430, sent: 5418, o: 3120, c: 890, b: 12, d: "2026-05-08" },
            ].map(r => (
              <tr key={r.s} className="border-t border-border">
                <td className="px-4 py-3 font-medium">{r.s}</td>
                <td className="px-4 py-3 font-mono">{r.r.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-success">{r.sent.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono">{r.o.toLocaleString()} <span className="text-xs text-muted-foreground">({((r.o/r.sent)*100).toFixed(1)}%)</span></td>
                <td className="px-4 py-3 font-mono">{r.c.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-destructive">{r.b}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.d}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputCls = "w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring";
function Field({ label, required, children }: { label: React.ReactNode; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label} {required && <span className="text-destructive">*</span>}</label>
      {children}
    </div>
  );
}
