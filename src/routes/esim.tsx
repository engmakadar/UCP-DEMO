import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Smartphone,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Zap,
  QrCode,
  Upload,
} from "lucide-react";

export const Route = createFileRoute("/esim")({
  component: ESimPage,
});

type SimStatus = "Active" | "Pending" | "Suspended";

interface Sim {
  id: string;
  iccid: string;
  msisdn: string;
  type: "eSIM" | "Physical";
  telco: string;
  status: SimStatus;
  activated: string;
  holder: string;
}

const seed: Sim[] = [
  {
    id: "1",
    iccid: "8925201000001234567",
    msisdn: "+252612345678",
    type: "eSIM",
    telco: "Hormuud",
    status: "Active",
    activated: "2026-05-12",
    holder: "Field Office — Mogadishu",
  },
  {
    id: "2",
    iccid: "8925201000001234568",
    msisdn: "+252612345679",
    type: "Physical",
    telco: "Somnet",
    status: "Pending",
    activated: "—",
    holder: "Sub-office — Hargeisa",
  },
  {
    id: "3",
    iccid: "8925201000001234569",
    msisdn: "+252612345680",
    type: "eSIM",
    telco: "Telesom",
    status: "Active",
    activated: "2026-05-10",
    holder: "M&E Team",
  },
  {
    id: "4",
    iccid: "8925201000001234570",
    msisdn: "+252612345681",
    type: "eSIM",
    telco: "Hormuud",
    status: "Suspended",
    activated: "2026-04-22",
    holder: "Logistics Pool",
  },
];

function ESimPage() {
  return (
    <AppShell>
      <Body />
    </AppShell>
  );
}

function Body() {
  const [sims, setSims] = useState<Sim[]>(seed);
  const [q, setQ] = useState("");
  const [showActivate, setShowActivate] = useState(false);

  const filtered = sims.filter((s) =>
    [s.iccid, s.msisdn, s.holder, s.telco]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const activate = (id: string) => {
    setSims((arr) =>
      arr.map((s) =>
        s.id === id
          ? {
              ...s,
              status: "Active",
              activated: new Date().toISOString().slice(0, 10),
            }
          : s
      )
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <span className="h-10 w-10 rounded-xl bg-violet/10 text-violet grid place-items-center">
              <Smartphone className="h-5 w-5" />
            </span>
            eSIM / SIM Management
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            Provision, activate and manage SIM cards across telecom partners.
          </p>
        </div>

        <button
          onClick={() => setShowActivate(true)}
          className="h-10 px-5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 shadow-sm shadow-brand/30"
        >
          <Plus className="h-4 w-4" />
          Activate SIM
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total SIMs"
          value={sims.length}
          color="var(--brand)"
        />

        <StatCard
          label="Active"
          value={sims.filter((s) => s.status === "Active").length}
          color="var(--success)"
        />

        <StatCard
          label="Pending Activation"
          value={sims.filter((s) => s.status === "Pending").length}
          color="var(--warning)"
        />

        <StatCard
          label="Suspended"
          value={sims.filter((s) => s.status === "Suspended").length}
          color="var(--destructive)"
        />
      </div>

      <div className="rounded-2xl bg-surface border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />

            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ICCID, MSISDN, holder…"
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-2 border border-border text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          <span className="text-xs text-muted-foreground">
            {filtered.length} of {sims.length}
          </span>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-xs text-muted-foreground uppercase tracking-wider">
            <tr>
              {[
                "ICCID",
                "MSISDN",
                "Type",
                "Telco",
                "Holder",
                "Activated",
                "Status",
                "Action",
              ].map((h) => (
                <th key={h} className="text-left px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-t border-border hover:bg-surface-2/60"
              >
                <td className="px-4 py-3 font-mono text-xs">{s.iccid}</td>

                <td className="px-4 py-3 font-mono text-xs">
                  {s.msisdn}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                      s.type === "eSIM"
                        ? "bg-violet/10 text-violet"
                        : "bg-info/10 text-info"
                    }`}
                  >
                    {s.type === "eSIM" ? (
                      <QrCode className="h-3 w-3" />
                    ) : (
                      <Smartphone className="h-3 w-3" />
                    )}

                    {s.type}
                  </span>
                </td>

                <td className="px-4 py-3">{s.telco}</td>

                <td className="px-4 py-3 text-muted-foreground">
                  {s.holder}
                </td>

                <td className="px-4 py-3 text-muted-foreground">
                  {s.activated}
                </td>

                <td className="px-4 py-3">
                  <StatusPill s={s.status} />
                </td>

                <td className="px-4 py-3">
                  {s.status === "Pending" ? (
                    <button
                      onClick={() => activate(s.id)}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-brand text-brand-foreground text-xs font-semibold hover:opacity-90"
                    >
                      <Zap className="h-3 w-3" />
                      Activate
                    </button>
                  ) : s.status === "Active" ? (
                    <button
                      onClick={() =>
                        setSims((arr) =>
                          arr.map((x) =>
                            x.id === s.id
                              ? { ...x, status: "Suspended" }
                              : x
                          )
                        )
                      }
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => activate(s.id)}
                      className="text-xs text-brand hover:underline"
                    >
                      Reactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showActivate && (
        <ActivateModal
          onClose={() => setShowActivate(false)}
          onAdd={(sim) => {
            setSims((arr) => [sim, ...arr]);
            setShowActivate(false);
          }}
        />
      )}
    </div>
  );
}

function ActivateModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (s: Sim) => void;
}) {
  const [simType, setSimType] = useState<"eSIM" | "Physical">("eSIM");

  const [iccid, setIccid] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [simNumber, setSimNumber] = useState("");

  const [holder, setHolder] = useState("");
  const [personName, setPersonName] = useState("");

  const [telco, setTelco] = useState("Hormuud");

  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycType, setKycType] = useState("National ID");

  const generateSimNumber = (value: string) => {
    if (!value) return "";
    return "+25261" + value.slice(-7);
  };

  const canSubmit =
    holder &&
    personName &&
    kycFile &&
    ((simType === "eSIM" && phoneNumber) ||
      (simType === "Physical" && iccid));

  return (
    <div
      className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand/10 text-brand grid place-items-center">
            <Zap className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-semibold">Activate New SIM</h2>

            <p className="text-xs text-muted-foreground">
              KYC document upload is required for both eSIM and physical SIM
              activation.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Field label="SIM Type">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSimType("eSIM")}
                className={`h-11 rounded-lg border-2 text-sm font-semibold ${
                  simType === "eSIM"
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-border"
                }`}
              >
                eSIM
              </button>

              <button
                onClick={() => setSimType("Physical")}
                className={`h-11 rounded-lg border-2 text-sm font-semibold ${
                  simType === "Physical"
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-border"
                }`}
              >
                Physical
              </button>
            </div>
          </Field>

          {simType === "eSIM" ? (
            <Field label="Phone Number">
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+25261XXXXXXX"
                className={inputCls}
              />
            </Field>
          ) : (
            <>
              <Field label="ICCID">
                <input
                  value={iccid}
                  onChange={(e) => {
                    setIccid(e.target.value);
                    setSimNumber(generateSimNumber(e.target.value));
                  }}
                  placeholder="8925201..."
                  className={inputCls}
                />
              </Field>

              {simNumber && (
                <Field label="SIM Number">
                  <input
                    value={simNumber}
                    readOnly
                    className={`${inputCls} bg-surface-2 text-muted-foreground`}
                  />
                </Field>
              )}
            </>
          )}

          <Field label="Telco">
            <select
              value={telco}
              onChange={(e) => setTelco(e.target.value)}
              className={inputCls}
            >
              {["Hormuud", "Somnet", "Telesom", "Golis"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Person Name">
            <input
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Full name of SIM holder"
              className={inputCls}
            />
          </Field>

          <Field label="Assigned Holder / Office">
            <input
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
              placeholder="Field Office — Mogadishu"
              className={inputCls}
            />
          </Field>

          <div className="rounded-xl bg-warning/5 border border-warning/30 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-warning">
              <CheckCircle2 className="h-4 w-4" />
              KYC Verification (required)
            </div>

            <Field label="Document Type">
              <select
                value={kycType}
                onChange={(e) => setKycType(e.target.value)}
                className={inputCls}
              >
                {[
                  "National ID",
                  "Passport",
                  "Driver's License",
                  "WFP Staff ID",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>

            <label className="flex flex-col items-center justify-center border-2 border-dashed border-warning/40 rounded-lg p-5 text-center cursor-pointer hover:bg-warning/5">
              <Upload className="h-5 w-5 text-warning mb-2" />

              <div className="font-semibold text-xs">
                {kycFile ? kycFile.name : "Upload KYC document"}
              </div>

              <div className="text-[11px] text-muted-foreground mt-0.5">
                PDF, JPG or PNG · max 5MB
              </div>

              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) =>
                  setKycFile(e.target.files?.[0] ?? null)
                }
              />
            </label>

            {kycFile && (
              <div className="text-[11px] text-success flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />

                {kycFile.name} attached (
                {(kycFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-lg border border-border text-sm font-medium"
          >
            Cancel
          </button>

          <button
            disabled={!canSubmit}
            onClick={() => {
              onAdd({
                id: crypto.randomUUID(),
                iccid: simType === "Physical" ? iccid : "N/A",
                msisdn:
                  simType === "eSIM"
                    ? phoneNumber
                    : simNumber,
                type: simType,
                telco,
                status: "Active",
                activated: new Date()
                  .toISOString()
                  .slice(0, 10),
                holder: `${personName} · ${holder}`,
              });
            }}
            className="flex-1 h-10 rounded-lg bg-brand text-brand-foreground text-sm font-semibold disabled:opacity-50"
          >
            Activate Now
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full h-11 px-3.5 rounded-lg border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-ring/40";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
      </label>

      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </div>

      <div className="text-3xl font-bold mt-2" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function StatusPill({ s }: { s: SimStatus }) {
  const map = {
    Active: {
      cls: "bg-success/10 text-success",
      icon: <CheckCircle2 className="h-3 w-3" />,
    },
    Pending: {
      cls: "bg-warning/10 text-warning",
      icon: <Clock className="h-3 w-3" />,
    },
    Suspended: {
      cls: "bg-destructive/10 text-destructive",
      icon: <XCircle className="h-3 w-3" />,
    },
  }[s];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${map.cls}`}
    >
      {map.icon}
      {s}
    </span>
  );
}