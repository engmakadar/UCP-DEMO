// Sample telecommunications campaign data for UCP WFP dashboard
export type Interface = "OBD" | "SMS";
export type Status =
  | "Delivered"
  | "Answered"
  | "Failed"
  | "No Answer"
  | "Busy"
  | "Unavailable"
  | "Congestion";

export interface Record {
  id: string;
  date: string; // YYYY-MM-DD
  interface: Interface;
  campaign: string;
  sender: string;
  location: string;
  status: Status;
  duration: number; // seconds
  mobile: string;
  telco: string;
  department: string;
}

const campaigns = [
  "Cash Transfer Reminder",
  "Nutrition Survey",
  "PDM Follow-up",
  "Fraud Awareness",
  "Distribution Alert",
  "Beneficiary Verification",
];
const locations = ["Mogadishu", "Hargeisa", "Baidoa", "Kismayo", "Garowe", "Bossaso"];
const senders = ["WFP-SOM", "WFP-CASH", "WFP-NUTR", "WFP-OPS"];
const departments = ["Baxnano", "VAM", "Relief"];
const telcos = ["Hormuud", "Somnet", "Telesom", "Golis"];

const statusesObd: Status[] = ["Answered", "No Answer", "Busy", "Failed", "Unavailable", "Congestion"];
const statusesSms: Status[] = ["Delivered", "Failed"];

function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const records: Record[] = Array.from({ length: 320 }).map((_, i) => {
  const isObd = seeded(i) > 0.45;
  const dayOffset = Math.floor(seeded(i + 1) * 14);
  const d = new Date();
  d.setDate(d.getDate() - dayOffset);
  const iface: Interface = isObd ? "OBD" : "SMS";
  const status = isObd
    ? statusesObd[Math.floor(seeded(i + 2) * statusesObd.length)]
    : statusesSms[Math.floor(seeded(i + 2) * statusesSms.length)];
  return {
    id: `UCP-${10000 + i}`,
    date: d.toISOString().slice(0, 10),
    interface: iface,
    campaign: campaigns[Math.floor(seeded(i + 3) * campaigns.length)],
    sender: senders[Math.floor(seeded(i + 4) * senders.length)],
    location: locations[Math.floor(seeded(i + 5) * locations.length)],
    status,
    duration: iface === "OBD" && status === "Answered" ? Math.floor(seeded(i + 6) * 90) + 8 : 0,
    mobile: `+25261${String(Math.floor(seeded(i + 7) * 9000000) + 1000000)}`,
    telco: telcos[Math.floor(seeded(i + 8) * telcos.length)],
    department: departments[Math.floor(seeded(i + 9) * departments.length)],
  };
});

export function summarize(rs: Record[]) {
  const total = rs.length;
  const obd = rs.filter((r) => r.interface === "OBD");
  const sms = rs.filter((r) => r.interface === "SMS");
  const delivered = sms.filter((r) => r.status === "Delivered").length;
  const answered = obd.filter((r) => r.status === "Answered").length;
  const failed = rs.filter((r) => r.status === "Failed").length;
  const noAnswer = obd.filter((r) => r.status === "No Answer").length;
  const others = obd.filter((r) => ["Busy", "Unavailable", "Congestion"].includes(r.status)).length;
  const avgDuration = answered
    ? obd.filter((r) => r.status === "Answered").reduce((s, r) => s + r.duration, 0) / answered
    : 0;
  const campaigns = new Set(rs.map((r) => r.campaign)).size;
  const senders = new Set(rs.map((r) => r.sender)).size;
  const dates = new Set(rs.map((r) => r.date)).size;
  return {
    total, obd: obd.length, sms: sms.length,
    delivered, answered, failed, noAnswer, others,
    avgDuration, campaigns, senders, dates,
    deliveryRate: sms.length ? (delivered / sms.length) * 100 : 0,
    answerRate: obd.length ? (answered / obd.length) * 100 : 0,
    failedRate: total ? (failed / total) * 100 : 0,
    noAnswerRate: obd.length ? (noAnswer / obd.length) * 100 : 0,
    othersRate: obd.length ? (others / obd.length) * 100 : 0,
  };
}

export function byDay(rs: Record[]) {
  const map = new Map<string, { date: string; OBD: number; SMS: number; Answered: number; Delivered: number; Failed: number; Total: number }>();
  rs.forEach((r) => {
    const e = map.get(r.date) ?? { date: r.date, OBD: 0, SMS: 0, Answered: 0, Delivered: 0, Failed: 0, Total: 0 };
    e[r.interface]++;
    e.Total++;
    if (r.status === "Answered") e.Answered++;
    if (r.status === "Delivered") e.Delivered++;
    if (r.status === "Failed") e.Failed++;
    map.set(r.date, e);
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function statusMix(rs: Record[]) {
  const m = new Map<string, number>();
  rs.forEach((r) => m.set(r.status, (m.get(r.status) ?? 0) + 1));
  return Array.from(m, ([name, value]) => ({ name, value }));
}

export function campaignSummary(rs: Record[]) {
  const map = new Map<string, Record[]>();
  rs.forEach(r => {
    const arr = map.get(r.campaign) ?? [];
    arr.push(r); map.set(r.campaign, arr);
  });
  return Array.from(map.entries()).map(([campaign, list]) => {
    const obd = list.filter(r => r.interface === "OBD");
    const sms = list.filter(r => r.interface === "SMS");
    const answered = obd.filter(r => r.status === "Answered").length;
    const delivered = sms.filter(r => r.status === "Delivered").length;
    const failed = list.filter(r => r.status === "Failed").length;
    const lastDate = list.map(r => r.date).sort().pop() ?? "";
    const ifaceLabel = obd.length && sms.length ? "OBD+SMS" : obd.length ? "OBD" : "SMS";
    const status = failed > list.length * 0.5 ? "Failed" : answered + delivered >= list.length * 0.9 ? "Completed" : "Running";
    return {
      campaign, interface: ifaceLabel,
      total: list.length, answered, delivered, failed,
      answerRate: obd.length ? (answered / obd.length) * 100 : 0,
      deliveryRate: sms.length ? (delivered / sms.length) * 100 : 0,
      lastDate, status,
      sender: list[0]?.sender ?? "",
      location: list[0]?.location ?? "",
      department: list[0]?.department ?? "",
    };
  }).sort((a, b) => b.total - a.total);
}

export interface SurveyResponseStats {
  campaign: string; theme: Theme; interface: "OBD" | "SMS" | "IVR";
  status: "Completed" | "Running";
  totalReached: number;
  answered: number;
  // Only the actual yes/no responses
  yes: number; no: number;
  // Out-of-number reasons (call could not be completed or not answered)
  busy: number; declined: number; noAnswer: number; failed: number;
}

const surveyTopics: { c: string; t: Theme }[] = [
  { c: "PDM Q4 — Cash Verification", t: "Cash" },
  { c: "Nutrition Awareness IVR", t: "Nutrition" },
  { c: "Drought Beneficiary Check", t: "Drought" },
  { c: "Livestock Vaccination Survey", t: "Livestock" },
  { c: "DRR Preparedness Pulse", t: "DRR" },
  { c: "Health Outreach Survey", t: "Health" },
];

export const surveyReports: SurveyResponseStats[] = surveyTopics.map(({ c, t }, i) => {
  const r = (k: number) => Math.floor(seeded(i * 13 + k) * 200);
  const reached = 800 + r(1);
  const answered = 400 + r(2);
  const yes = Math.floor(answered * 0.58);
  const no = answered - yes;
  return {
    campaign: c, theme: t,
    interface: (["IVR","OBD","SMS","IVR"] as const)[i % 4],
    status: i % 3 === 0 ? "Running" : "Completed",
    totalReached: reached, answered, yes, no,
    busy: 40 + r(3) % 80,
    declined: 20 + r(4) % 50,
    noAnswer: 80 + r(5) % 150,
    failed: 15 + r(6) % 40,
  };
});

// ---------- New analytics helpers ----------

export const THEMES = ["Drought", "DRR", "Livestock", "Nutrition", "Cash", "Health", "Protection"] as const;
export type Theme = typeof THEMES[number];

export const PROGRAMMES = ["Baxnano", "VAM", "Relief"] as const;

// Mock CRBT campaigns registered with category
export interface CRBTCampaign {
  id: string; name: string; theme: string; tone: string; telco: string;
  activeUsers: number; failed: number; activated: string; status: "Active" | "Paused" | "Suspended" | "Stopped";
  audienceCount: number;
}
export const crbtCampaigns: CRBTCampaign[] = [
  { id: "CRBT-001", name: "Drought Awareness Q2", theme: "Drought", tone: "drought-en.mp3", telco: "Hormuud", activeUsers: 12480, failed: 312, activated: "2026-04-21", status: "Active", audienceCount: 13200 },
  { id: "CRBT-002", name: "DRR Preparedness", theme: "DRR", tone: "drr-so.wav", telco: "Somnet", activeUsers: 7820, failed: 145, activated: "2026-04-30", status: "Active", audienceCount: 8400 },
  { id: "CRBT-003", name: "Livestock Vaccination", theme: "Livestock", tone: "livestock-so.mp3", telco: "Telesom", activeUsers: 5340, failed: 88, activated: "2026-05-05", status: "Active", audienceCount: 5800 },
  { id: "CRBT-004", name: "Nutrition Outreach", theme: "Nutrition", tone: "nutr-prompt.mp3", telco: "Hormuud", activeUsers: 4210, failed: 60, activated: "2026-05-10", status: "Paused", audienceCount: 4500 },
  { id: "CRBT-005", name: "Cash Transfer Reminder", theme: "Cash", tone: "cash-reminder.mp3", telco: "Golis", activeUsers: 9120, failed: 201, activated: "2026-05-12", status: "Active", audienceCount: 9800 },
];

export function crbtStats() {
  const total = crbtCampaigns.reduce((s, c) => s + c.activeUsers, 0);
  const failed = crbtCampaigns.reduce((s, c) => s + c.failed, 0);
  return { total, failed, active: crbtCampaigns.filter(c => c.status === "Active").length, paused: crbtCampaigns.filter(c => c.status === "Paused").length };
}

// eSIM/SIM stats for chart
export interface SimStat { label: string; eSIM: number; Physical: number; Cancelled: number; }
export const simStats: SimStat[] = [
  { label: "Week 1", eSIM: 32, Physical: 18, Cancelled: 4 },
  { label: "Week 2", eSIM: 48, Physical: 22, Cancelled: 6 },
  { label: "Week 3", eSIM: 41, Physical: 28, Cancelled: 3 },
  { label: "Week 4", eSIM: 56, Physical: 24, Cancelled: 8 },
  { label: "Week 5", eSIM: 62, Physical: 31, Cancelled: 5 },
  { label: "Week 6", eSIM: 71, Physical: 26, Cancelled: 7 },
];

// CRBT active vs failed time series
export function crbtSeries() {
  return Array.from({ length: 7 }).map((_, i) => ({
    week: `W${i + 1}`,
    Active: 3000 + Math.floor(seeded(i + 50) * 4000) + i * 800,
    Failed: 60 + Math.floor(seeded(i + 60) * 80),
  }));
}

// Status over time stacked
export function statusOverTime(rs: Record[]) {
  const map = new Map<string, any>();
  rs.forEach(r => {
    const e = map.get(r.date) ?? { date: r.date };
    e[r.status] = (e[r.status] ?? 0) + 1;
    map.set(r.date, e);
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// Sender performance — answered vs others
export function senderPerformance(rs: Record[]) {
  const map = new Map<string, { sender: string; Answered: number; Others: number }>();
  rs.forEach(r => {
    const e = map.get(r.sender) ?? { sender: r.sender, Answered: 0, Others: 0 };
    if (r.status === "Answered" || r.status === "Delivered") e.Answered++;
    else e.Others++;
    map.set(r.sender, e);
  });
  return Array.from(map.values());
}

// Programme usage
export function programmeUsage(rs: Record[]) {
  const map = new Map<string, number>();
  rs.forEach(r => map.set(r.department, (map.get(r.department) ?? 0) + 1));
  return Array.from(map, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

// Activity heatmap — days of week × campaign
export function heatmap(rs: Record[]) {
  const dows = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const camps = Array.from(new Set(rs.map(r => r.campaign))).slice(0, 6);
  return camps.map(c => {
    const row: any = { campaign: c };
    dows.forEach((d, di) => {
      row[d] = rs.filter(r => r.campaign === c && (new Date(r.date).getDay() + 6) % 7 === di).length;
    });
    return row;
  });
}

// Verified Caller IDs
export interface VerifiedCallerID {
  id: string; displayName: string; displayNumber: string; realNumber: string;
  programme: string; telco: string; status: "Active" | "Pending" | "Suspended";
  createdAt: string; callsMade: number; callsAnswered: number;
}
export const verifiedCallerIds: VerifiedCallerID[] = [
  { id: "VID-001", displayName: "WFP Somalia", displayNumber: "+252600000001", realNumber: "+25261111111", programme: "Baxnano", telco: "Hormuud", status: "Active", createdAt: "2026-04-12", callsMade: 1842, callsAnswered: 1521 },
  { id: "VID-002", displayName: "WFP Cash Desk", displayNumber: "+252600000002", realNumber: "+25261222222", programme: "Baxnano", telco: "Somnet", status: "Active", createdAt: "2026-04-15", callsMade: 980, callsAnswered: 720 },
  { id: "VID-003", displayName: "WFP Nutrition", displayNumber: "+252600000003", realNumber: "+25261333333", programme: "VAM", telco: "Telesom", status: "Active", createdAt: "2026-04-22", callsMade: 612, callsAnswered: 488 },
  { id: "VID-004", displayName: "WFP M&E", displayNumber: "+252600000004", realNumber: "+25261444444", programme: "Relief", telco: "Hormuud", status: "Pending", createdAt: "2026-05-10", callsMade: 0, callsAnswered: 0 },
];

export function ifaceByStatus(rs: Record[]) {
  const statuses = ["Answered", "Delivered", "Failed", "No Answer", "Busy", "Unavailable", "Congestion"];
  return statuses.map((s) => ({
    status: s,
    OBD: rs.filter((r) => r.interface === "OBD" && r.status === s).length,
    SMS: rs.filter((r) => r.interface === "SMS" && r.status === s).length,
  })).filter((r) => r.OBD || r.SMS);
}
