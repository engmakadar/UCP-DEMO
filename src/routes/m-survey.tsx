import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  X, Upload, Download, ChevronDown, Check, MessageSquareText,
  Calendar, Globe, Users, Mic, Play, Trash2,
} from "lucide-react";

export const Route = createFileRoute("/m-survey")({ component: MSurveyPage });

function MSurveyPage() {
  return <AppShell><Body /></AppShell>;
}

function Body() {
  const [scheduleLater, setScheduleLater] = useState(false);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);


  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <div className="text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">Dashboard</Link>
        <span className="mx-2">/</span>
        <span>M-Survey Integration</span>
        <span className="mx-2">/</span>
        <span className="text-foreground">Create Survey</span>
      </div>

      <div className="rounded-2xl bg-surface border border-border shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-surface to-surface-2">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand grid place-items-center">
              <MessageSquareText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Survey</h1>
              <p className="text-sm text-muted-foreground">Two-way SMS / IVR survey campaign · M-Survey Integration</p>
            </div>
          </div>
          <button className="h-9 w-9 grid place-items-center rounded-lg hover:bg-accent text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2">
          {/* LEFT — Survey config */}
          <div className="p-8 space-y-6 border-r border-border">
            <Section title="Survey Details">
              <Field label="Name" required>
                <input placeholder="e.g. PDM Q4 — Cash Transfer Verification"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring" />
              </Field>
              <Field label="Department" required>
                <SelectInput placeholder="Select department" options={["Baxnano", "VAM", "Relief"]} />
              </Field>
            </Section>

            <Section title="Schedule">
              <div className="grid grid-cols-2 gap-3">
                <RadioCard
                  checked={!scheduleLater}
                  onClick={() => setScheduleLater(false)}
                  icon={<Check className="h-4 w-4" />}
                  title="Schedule Now"
                  desc="Send immediately upon submit"
                />
                <RadioCard
                  checked={scheduleLater}
                  onClick={() => setScheduleLater(true)}
                  icon={<Calendar className="h-4 w-4" />}
                  title="Schedule Later"
                  desc="Pick a future date & time"
                />
              </div>
              {scheduleLater && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <Field label="Date"><input type="date" className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm" /></Field>
                  <Field label="Time"><input type="time" className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm" /></Field>
                </div>
              )}
            </Section>

            <Section title="Channel">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Campaign Interface" required>
                  <SelectInput placeholder="OBD" value="OBD" options={["OBD", "SMS", "IVR"]} />
                </Field>
                <Field label="Sender ID" required>
                  <SelectInput placeholder="Select" options={["WFP-SOM", "WFP-CASH", "WFP-NUTR"]} />
                </Field>
                <Field label="Primary Charging Unit">
                  <SelectInput placeholder="Select" options={["Per call", "Per second", "Per minute"]} />
                </Field>
                <Field label="Secondary Charging Unit">
                  <SelectInput placeholder="Select" options={["None", "Per SMS segment", "Per response"]} />
                </Field>
              </div>
            </Section>

            <Section title="Location">
              <Field label="Target Location">
                <input placeholder="e.g. Mogadishu, Banadir"
                  className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring" />
              </Field>
            </Section>
          </div>

          {/* RIGHT — Target audience & questions */}
          <div className="p-8 space-y-6 bg-surface-2/40">
            <div>
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Users className="h-5 w-5 text-brand" /> Target Audience
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Upload contacts and configure delivery</p>
            </div>

            {/* Upload */}
            <div className="grid grid-cols-2 gap-3">
              <button className="group border-2 border-dashed border-border rounded-xl p-5 text-left hover:border-brand hover:bg-brand/5 transition-colors">
                <Upload className="h-5 w-5 text-brand mb-2" />
                <div className="font-semibold text-sm">File Upload</div>
                <div className="text-xs text-muted-foreground mt-0.5">XLSX or CSV · max 50k rows</div>
              </button>
              <button className="border-2 border-border rounded-xl p-5 text-left bg-surface hover:bg-accent transition-colors">
                <Download className="h-5 w-5 text-muted-foreground mb-2" />
                <div className="font-semibold text-sm">Sample XLSX</div>
                <div className="text-xs text-muted-foreground mt-0.5">Download template</div>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Retry Count">
                <div className="relative">
                  <input type="number" defaultValue={3} min={0} max={10}
                    className="w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40" />
                </div>
              </Field>
              <Field label={<span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Language</span>}>
                <SelectInput placeholder="English" value="English" options={["English", "Somali", "Arabic", "Swahili"]} />
              </Field>
            </div>

            {/* Voice Message Upload (replaces Survey Questions) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Mic className="h-4 w-4 text-brand" /> Voice Message
                </label>
                <span className="text-xs text-muted-foreground">MP3 / WAV / OGG · max 5MB</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Upload the voice prompt that beneficiaries will hear when they pick up the call.
              </p>
              {!voiceFile ? (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-brand/10 text-brand grid place-items-center mb-3">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="font-semibold text-sm">Click to upload voice file</div>
                  <div className="text-xs text-muted-foreground mt-1">or drag and drop · MP3, WAV, OGG</div>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => setVoiceFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              ) : (
                <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand/10 text-brand grid place-items-center">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{voiceFile.name}</div>
                      <div className="text-xs text-muted-foreground">{(voiceFile.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <button
                      onClick={() => setVoiceFile(null)}
                      className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <audio controls className="w-full h-10" src={URL.createObjectURL(voiceFile)} />
                  <button className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-lg bg-brand/10 text-brand text-xs font-semibold hover:bg-brand/15">
                    <Play className="h-3.5 w-3.5" /> Preview as caller
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-border bg-surface flex flex-wrap gap-3 justify-end">
          <button className="h-11 px-6 rounded-lg border border-border bg-surface text-sm font-medium hover:bg-accent min-w-[160px]">Cancel</button>
          <button className="h-11 px-6 rounded-lg bg-brand text-brand-foreground text-sm font-semibold hover:opacity-90 min-w-[200px] shadow-sm shadow-brand/30">
            Submit Survey
          </button>
        </div>
      </div>
    </div>
  );
}

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
      <label className="block text-sm font-medium mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
    </div>
  );
}

function SelectInput({ placeholder, value, options }: { placeholder: string; value?: string; options: string[] }) {
  return (
    <div className="relative">
      <select defaultValue={value ?? ""}
        className="w-full h-11 pl-3.5 pr-9 appearance-none rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring">
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
      className={`text-left p-4 rounded-xl border-2 transition-all ${
        checked ? "border-brand bg-brand/5 shadow-sm" : "border-border bg-surface hover:border-muted-foreground/30"
      }`}>
      <div className="flex items-start gap-3">
        <div className={`h-5 w-5 rounded-full border-2 grid place-items-center mt-0.5 transition-colors ${
          checked ? "border-brand bg-brand text-brand-foreground" : "border-border"
        }`}>
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
