/*
 * Orbit SaaS — LTV / CAC Dashboard
 *
 * Static snapshot: figures are pre-computed from model/*.py scripts.
 * Core subscription data: IBM Telco Customer Churn (public dataset).
 * Acquisition channel & CAC data: simulated for methodology demonstration.
 */

const {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Scatter, ScatterChart,
} = window.Recharts;

// ─── Color palette ──────────────────────────────────────────────────────────
const C = {
  blue:       "#4A7FB5",
  blueDim:    "#3A5F8A",
  green:      "#5BA37A",
  greenDim:   "#2D5A42",
  amber:      "#C49A3C",
  amberDim:   "#7A6028",
  rose:       "#C46B6B",
  roseDim:    "#7A3A3A",
  purple:     "#8B6BBF",
  purpleDim:  "#5A3A8A",
  slate:      "#64748B",
  slateLight: "#94A3B8",
  dark:       "#1E293B",
  darker:     "#0F172A",
  card:       "#FFFFFF",
  bg:         "#F8FAFC",
  border:     "#E2E8F0",
};

const CHANNEL_COLORS = {
  "Organic Search": C.green,
  "Content":        C.blue,
  "Referral":       C.purple,
  "Paid Search":    C.amber,
  "Paid Social":    C.rose,
  "Partnerships":   C.slate,
};

// ─── Data (static snapshot from analysis) ───────────────────────────────────
const EXEC = {
  totalCustomers: 7043,
  activeCustomers: 5174,
  arr: 3803829,
  mrr: 316986,
  arpu: 64.76,
  blendedCac: 376,
  blendedLtv: 2744,
  ltvCacRatio: 7.3,
  paybackMonths: 7.7,
  monthlyChurnRate: 0.0082,
  totalAcqSpend: 2646882,
  revenueAtRisk: 238799,
  atRiskCustomers: 501,
};

const CHANNELS = [
  { channel: "Organic Search", customers: 1998, pctCustomers: 28.4, avgCac: 179, avgLtv: 2481, ltvCacRatio: 13.9, paybackMonths: 3.0, churnRate: 0.275, health: "Scale", roi: 1288, activeMrr: 87692, currentPct: 13.5, optimizedPct: 35.8 },
  { channel: "Referral",       customers: 947,  pctCustomers: 13.4, avgCac: 277, avgLtv: 3095, ltvCacRatio: 11.2, paybackMonths: 4.0, churnRate: 0.269, health: "Scale", roi: 1016, activeMrr: 44823, currentPct: 9.9, optimizedPct: 15.2 },
  { channel: "Content",        customers: 1039, pctCustomers: 14.8, avgCac: 240, avgLtv: 2609, ltvCacRatio: 10.9, paybackMonths: 3.9, churnRate: 0.271, health: "Scale", roi: 986,  activeMrr: 49234, currentPct: 9.4, optimizedPct: 16.5 },
  { channel: "Paid Search",    customers: 1321, pctCustomers: 18.8, avgCac: 480, avgLtv: 2657, ltvCacRatio: 5.5,  paybackMonths: 7.4, churnRate: 0.262, health: "Scale", roi: 454,  activeMrr: 62156, currentPct: 23.9, optimizedPct: 14.9 },
  { channel: "Partnerships",   customers: 860,  pctCustomers: 12.2, avgCac: 757, avgLtv: 3578, ltvCacRatio: 4.7,  paybackMonths: 9.3, churnRate: 0.244, health: "Healthy", roi: 373, activeMrr: 47538, currentPct: 24.6, optimizedPct: 8.9 },
  { channel: "Paid Social",    customers: 878,  pctCustomers: 12.5, avgCac: 562, avgLtv: 2438, ltvCacRatio: 4.3,  paybackMonths: 9.3, churnRate: 0.270, health: "Healthy", roi: 334, activeMrr: 25543, currentPct: 18.6, optimizedPct: 8.7 },
];

const LTV_BY_PLAN = [
  { segment: "Starter",       customers: 1837, arpu: 29.52, churnRate: 0.116, ltv: 1441, avgCac: 325, ltvCacRatio: 4.4, paybackMonths: 11.0 },
  { segment: "Professional",  customers: 2529, arpu: 58.79, churnRate: 0.295, ltv: 2368, avgCac: 374, ltvCacRatio: 6.3, paybackMonths: 6.4 },
  { segment: "Business",      customers: 2677, arpu: 96.63, churnRate: 0.340, ltv: 4073, avgCac: 414, ltvCacRatio: 9.8, paybackMonths: 4.3 },
];

const LTV_BY_BILLING = [
  { segment: "Monthly",  customers: 3875, churnRate: 0.427, ltv: 2804, ltvCacRatio: 7.3 },
  { segment: "Annual",   customers: 1473, churnRate: 0.113, ltv: 24269, ltvCacRatio: 65.1 },
  { segment: "2-Year",   customers: 1695, churnRate: 0.028, ltv: 60770, ltvCacRatio: 166.5 },
];

const RETENTION_CURVE = [
  { month: 0, pct: 100 }, { month: 1, pct: 99.8 }, { month: 2, pct: 94.3 },
  { month: 3, pct: 87.8 }, { month: 6, pct: 80.5 }, { month: 9, pct: 75.3 },
  { month: 12, pct: 70.6 }, { month: 18, pct: 62.4 }, { month: 24, pct: 55.8 },
  { month: 30, pct: 49.2 }, { month: 36, pct: 43.3 }, { month: 48, pct: 32.7 },
  { month: 60, pct: 21.1 }, { month: 72, pct: 5.1 },
];

const RETENTION_BY_BILLING = [
  { month: 0, Monthly: 100, Annual: 100, "2-Year": 100 },
  { month: 3, Monthly: 78, Annual: 97, "2-Year": 99 },
  { month: 6, Monthly: 65, Annual: 95, "2-Year": 98 },
  { month: 12, Monthly: 50.8, Annual: 93.1, "2-Year": 96.5 },
  { month: 18, Monthly: 40, Annual: 90, "2-Year": 95 },
  { month: 24, Monthly: 32, Annual: 85, "2-Year": 93 },
  { month: 36, Monthly: 20, Annual: 75, "2-Year": 88 },
];

const CHURN_BY_TENURE = [
  { period: "0–3 mo", rate: 56.2, label: "Early" },
  { period: "4–12 mo", rate: 39.1, label: "Mid" },
  { period: "12+ mo", rate: 17.1, label: "Mature" },
];

const RECOMMENDATIONS = [
  { priority: 1, area: "Channel Optimization", action: "Shift 15–20% of Paid Social/Partnerships budget to Organic & Content", impact: "Reduce blended CAC by ~$50, improve LTV:CAC from 7.3x to ~9.5x", effort: "Medium" },
  { priority: 2, area: "Early Retention", action: "Implement 90-day onboarding program for monthly-billing customers", impact: "Reduce early churn by 20–30% → save ~$190K ARR", effort: "High" },
  { priority: 3, area: "Annual Conversion", action: "Offer 15% discount for monthly→annual upgrade at month 3", impact: "Convert 20% of monthly users → reduce churn from 42.7% to ~30%", effort: "Low" },
  { priority: 4, area: "Add-on Adoption", action: "Drive add-on usage in first 30 days (SSO, backup, priority support)", impact: "Customers with 3+ add-ons churn 50% less than 0-addon users", effort: "Medium" },
];

const LTV_PERCENTILES = { p10: 324, p25: 750, p50: 1806, p75: 4353, p90: 6817, mean: 2744 };

// ─── Utility components ─────────────────────────────────────────────────────
const fmt = (n) => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`;
const fmtK = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : `${n}`;
const pct = (n) => `${(n * 100).toFixed(1)}%`;

function Card({ children, className = "" }) {
  return React.createElement("div", {
    className: `bg-white rounded-xl border border-slate-200 shadow-sm ${className}`,
  }, children);
}

function StatCard({ label, value, sub, color = C.dark }) {
  return React.createElement(Card, { className: "p-5" },
    React.createElement("div", { className: "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1" }, label),
    React.createElement("div", { className: "text-2xl font-bold", style: { color } }, value),
    sub && React.createElement("div", { className: "text-xs text-slate-400 mt-1" }, sub),
  );
}

function SectionTitle({ children, sub }) {
  return React.createElement("div", { className: "mb-4" },
    React.createElement("h3", { className: "text-lg font-bold text-slate-800" }, children),
    sub && React.createElement("p", { className: "text-sm text-slate-500 mt-0.5" }, sub),
  );
}

function HealthBadge({ health }) {
  const styles = {
    Scale:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    Healthy: "bg-blue-50 text-blue-700 border-blue-200",
    Monitor: "bg-amber-50 text-amber-700 border-amber-200",
    Cut:     "bg-red-50 text-red-700 border-red-200",
  };
  return React.createElement("span", {
    className: `px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[health] || styles.Monitor}`,
  }, health);
}

// ─── Tab: Executive Briefing ────────────────────────────────────────────────
function ExecutiveBriefing() {
  return React.createElement("div", { className: "space-y-6" },
    // TL;DR
    React.createElement("div", {
      className: "rounded-xl p-6",
      style: { background: C.dark, color: "#F1F5F9" },
    },
      React.createElement("div", { className: "text-xs font-semibold uppercase tracking-wider mb-3", style: { color: C.slateLight } }, "TL;DR"),
      React.createElement("p", { className: "text-base leading-relaxed" },
        "Orbit's unit economics are healthy: ",
        React.createElement("strong", null, "7.3x blended LTV:CAC"),
        " with ",
        React.createElement("strong", null, "7.7-month payback"),
        ". But 55% of acquisition spend goes to the two least efficient channels (Paid Social + Partnerships). ",
        "Reallocating 15–20% of budget to Organic & Content would improve blended CAC by ~$50 without sacrificing volume. ",
        "The bigger lever: ",
        React.createElement("strong", null, "monthly→annual conversion"),
        " — annual customers have 4x lower churn and 8.6x higher LTV.",
      ),
    ),

    // Hero KPIs
    React.createElement("div", {
      className: "rounded-xl p-6",
      style: { background: C.darker, color: "#F1F5F9" },
    },
      React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
        [
          { label: "ARR", value: fmt(EXEC.arr), color: C.blue },
          { label: "LTV : CAC", value: `${EXEC.ltvCacRatio}x`, color: C.green },
          { label: "PAYBACK", value: `${EXEC.paybackMonths} mo`, color: C.amber },
          { label: "MONTHLY CHURN", value: pct(EXEC.monthlyChurnRate), color: C.rose },
          { label: "ACTIVE CUSTOMERS", value: fmtK(EXEC.activeCustomers), color: C.slateLight },
          { label: "BLENDED CAC", value: fmt(EXEC.blendedCac), color: C.slateLight },
          { label: "BLENDED LTV", value: fmt(EXEC.blendedLtv), color: C.slateLight },
          { label: "ARPU", value: `$${EXEC.arpu}/mo`, color: C.slateLight },
        ].map((kpi, i) => React.createElement("div", {
          key: i,
          className: "rounded-lg p-3",
          style: { background: "rgba(255,255,255,0.05)" },
        },
          React.createElement("div", { className: "text-xs font-semibold uppercase tracking-wider mb-1", style: { color: C.slate } }, kpi.label),
          React.createElement("div", { className: "text-xl font-bold", style: { color: kpi.color } }, kpi.value),
        )),
      ),
    ),

    // Revenue at risk
    React.createElement(Card, { className: "p-5 border-l-4 border-l-amber-400" },
      React.createElement("div", { className: "flex items-start gap-3" },
        React.createElement("div", { className: "text-2xl" }, "\u26A0\uFE0F"),
        React.createElement("div", null,
          React.createElement("div", { className: "font-bold text-slate-800" }, `${fmt(EXEC.revenueAtRisk)} ARR at risk`),
          React.createElement("p", { className: "text-sm text-slate-500 mt-1" },
            `${EXEC.atRiskCustomers} active customers on monthly billing with ≤1 add-on and ≤6 months tenure. These are the highest churn-probability accounts.`,
          ),
        ),
      ),
    ),

    // Recommendations
    React.createElement(SectionTitle, { children: "Strategic Recommendations" }),
    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
      RECOMMENDATIONS.map((rec, i) => React.createElement(Card, { key: i, className: "p-5" },
        React.createElement("div", { className: "flex items-center gap-2 mb-2" },
          React.createElement("span", {
            className: "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
            style: { background: [C.rose, C.amber, C.green, C.blue][i] },
          }, rec.priority),
          React.createElement("span", { className: "text-sm font-bold text-slate-700" }, rec.area),
          React.createElement("span", {
            className: `ml-auto px-2 py-0.5 rounded text-xs font-medium ${
              rec.effort === "Low" ? "bg-green-50 text-green-700" :
              rec.effort === "Medium" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
            }`,
          }, rec.effort),
        ),
        React.createElement("p", { className: "text-sm text-slate-600 mb-2" }, rec.action),
        React.createElement("p", { className: "text-xs text-slate-400" }, rec.impact),
      )),
    ),
  );
}

// ─── Tab: Cohort Retention ──────────────────────────────────────────────────
function CohortRetention() {
  return React.createElement("div", { className: "space-y-6" },
    React.createElement(SectionTitle, {
      children: "Retention Curve",
      sub: "What percentage of customers survive to month M",
    }),
    React.createElement(Card, { className: "p-5" },
      React.createElement(ResponsiveContainer, { width: "100%", height: 320 },
        React.createElement(AreaChart, { data: RETENTION_CURVE },
          React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }),
          React.createElement(XAxis, { dataKey: "month", tick: { fontSize: 12, fill: C.slate }, label: { value: "Months since signup", position: "insideBottom", offset: -5, fontSize: 12, fill: C.slate } }),
          React.createElement(YAxis, { tick: { fontSize: 12, fill: C.slate }, domain: [0, 100], tickFormatter: v => `${v}%` }),
          React.createElement(Tooltip, { formatter: v => [`${v}%`, "Retained"] }),
          React.createElement(Area, { type: "monotone", dataKey: "pct", stroke: C.blue, fill: C.blue, fillOpacity: 0.15, strokeWidth: 2 }),
        ),
      ),
    ),

    React.createElement(SectionTitle, {
      children: "Retention by Billing Cycle",
      sub: "Annual and 2-year contracts retain dramatically better",
    }),
    React.createElement(Card, { className: "p-5" },
      React.createElement(ResponsiveContainer, { width: "100%", height: 320 },
        React.createElement(LineChart, { data: RETENTION_BY_BILLING },
          React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }),
          React.createElement(XAxis, { dataKey: "month", tick: { fontSize: 12, fill: C.slate } }),
          React.createElement(YAxis, { tick: { fontSize: 12, fill: C.slate }, domain: [0, 100], tickFormatter: v => `${v}%` }),
          React.createElement(Tooltip, { formatter: (v, name) => [`${v}%`, name] }),
          React.createElement(Legend, null),
          React.createElement(Line, { type: "monotone", dataKey: "Monthly", stroke: C.rose, strokeWidth: 2, dot: { r: 3 } }),
          React.createElement(Line, { type: "monotone", dataKey: "Annual", stroke: C.blue, strokeWidth: 2, dot: { r: 3 } }),
          React.createElement(Line, { type: "monotone", dataKey: "2-Year", stroke: C.green, strokeWidth: 2, dot: { r: 3 } }),
        ),
      ),
    ),

    React.createElement(SectionTitle, {
      children: "Churn Timing",
      sub: "When do customers churn? Early churn is the #1 problem.",
    }),
    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
      CHURN_BY_TENURE.map((d, i) => React.createElement(Card, { key: i, className: "p-5 text-center" },
        React.createElement("div", { className: "text-xs font-semibold text-slate-400 uppercase mb-1" }, d.period),
        React.createElement("div", {
          className: "text-3xl font-bold",
          style: { color: d.rate > 40 ? C.rose : d.rate > 25 ? C.amber : C.green },
        }, `${d.rate}%`),
        React.createElement("div", { className: "text-sm text-slate-500 mt-1" }, `of churned customers`),
      )),
    ),

    React.createElement(Card, { className: "p-5 border-l-4 border-l-rose-400" },
      React.createElement("p", { className: "text-sm text-slate-600" },
        React.createElement("strong", null, "Key insight: "),
        "56% of all churn happens in the first 3 months. This is the critical window. A structured onboarding program targeting month-to-month subscribers could reduce early churn by 20–30% and save ~$190K ARR annually.",
      ),
    ),
  );
}

// ─── Tab: LTV Deep Dive ─────────────────────────────────────────────────────
function LtvDeepDive() {
  const planChartData = LTV_BY_PLAN.map(p => ({
    ...p,
    label: p.segment,
  }));

  return React.createElement("div", { className: "space-y-6" },
    React.createElement(SectionTitle, {
      children: "LTV by Plan Tier",
      sub: "Business plan has highest LTV but also highest absolute churn — retention is the lever",
    }),
    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
      LTV_BY_PLAN.map((p, i) => {
        const colors = [C.blue, C.purple, C.green];
        return React.createElement(Card, { key: i, className: "p-5" },
          React.createElement("div", { className: "text-sm font-bold text-slate-700 mb-3" }, p.segment),
          React.createElement("div", { className: "space-y-2" },
            React.createElement("div", { className: "flex justify-between" },
              React.createElement("span", { className: "text-xs text-slate-400" }, "LTV"),
              React.createElement("span", { className: "text-sm font-bold", style: { color: colors[i] } }, fmt(p.ltv)),
            ),
            React.createElement("div", { className: "flex justify-between" },
              React.createElement("span", { className: "text-xs text-slate-400" }, "ARPU"),
              React.createElement("span", { className: "text-sm font-semibold text-slate-700" }, `$${p.arpu}/mo`),
            ),
            React.createElement("div", { className: "flex justify-between" },
              React.createElement("span", { className: "text-xs text-slate-400" }, "CAC"),
              React.createElement("span", { className: "text-sm font-semibold text-slate-700" }, fmt(p.avgCac)),
            ),
            React.createElement("div", { className: "flex justify-between" },
              React.createElement("span", { className: "text-xs text-slate-400" }, "LTV:CAC"),
              React.createElement("span", { className: "text-sm font-bold", style: { color: colors[i] } }, `${p.ltvCacRatio}x`),
            ),
            React.createElement("div", { className: "flex justify-between" },
              React.createElement("span", { className: "text-xs text-slate-400" }, "Payback"),
              React.createElement("span", { className: "text-sm text-slate-600" }, `${p.paybackMonths} mo`),
            ),
            React.createElement("div", { className: "flex justify-between" },
              React.createElement("span", { className: "text-xs text-slate-400" }, "Churn Rate"),
              React.createElement("span", { className: "text-sm text-slate-600" }, `${(p.churnRate * 100).toFixed(1)}%`),
            ),
          ),
        );
      }),
    ),

    React.createElement(SectionTitle, {
      children: "LTV Distribution",
      sub: "Wide spread indicates opportunity for segmented retention strategies",
    }),
    React.createElement(Card, { className: "p-5" },
      React.createElement("div", { className: "flex flex-wrap gap-4 mb-4" },
        Object.entries(LTV_PERCENTILES).map(([k, v]) => React.createElement("div", { key: k, className: "text-center" },
          React.createElement("div", { className: "text-xs text-slate-400 uppercase" }, k === "mean" ? "Mean" : k.toUpperCase()),
          React.createElement("div", { className: "text-sm font-bold text-slate-700" }, fmt(v)),
        )),
      ),
      React.createElement("div", {
        className: "h-3 rounded-full overflow-hidden flex",
        style: { background: "#E2E8F0" },
      },
        React.createElement("div", { style: { width: `${LTV_PERCENTILES.p25 / LTV_PERCENTILES.p90 * 100}%`, background: C.rose, opacity: 0.6 } }),
        React.createElement("div", { style: { width: `${(LTV_PERCENTILES.p50 - LTV_PERCENTILES.p25) / LTV_PERCENTILES.p90 * 100}%`, background: C.amber, opacity: 0.6 } }),
        React.createElement("div", { style: { width: `${(LTV_PERCENTILES.p75 - LTV_PERCENTILES.p50) / LTV_PERCENTILES.p90 * 100}%`, background: C.green, opacity: 0.6 } }),
        React.createElement("div", { style: { width: `${(LTV_PERCENTILES.p90 - LTV_PERCENTILES.p75) / LTV_PERCENTILES.p90 * 100}%`, background: C.blue, opacity: 0.6 } }),
      ),
      React.createElement("div", { className: "flex justify-between mt-1 text-xs text-slate-400" },
        React.createElement("span", null, fmt(LTV_PERCENTILES.p10)),
        React.createElement("span", null, fmt(LTV_PERCENTILES.p90)),
      ),
    ),

    React.createElement(SectionTitle, {
      children: "The Annual Conversion Opportunity",
      sub: "Billing cycle is the single biggest predictor of LTV",
    }),
    React.createElement(Card, { className: "p-5" },
      React.createElement(ResponsiveContainer, { width: "100%", height: 280 },
        React.createElement(BarChart, { data: LTV_BY_BILLING, layout: "vertical" },
          React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }),
          React.createElement(YAxis, { dataKey: "segment", type: "category", tick: { fontSize: 13, fill: C.slate }, width: 80 }),
          React.createElement(XAxis, { type: "number", tick: { fontSize: 12, fill: C.slate }, tickFormatter: v => v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}` }),
          React.createElement(Tooltip, { formatter: (v) => [`$${v.toLocaleString()}`, "LTV"] }),
          React.createElement(Bar, { dataKey: "ltv", radius: [0, 6, 6, 0], barSize: 28 },
            LTV_BY_BILLING.map((d, i) => React.createElement(Cell, { key: i, fill: [C.rose, C.blue, C.green][i] })),
          ),
        ),
      ),
    ),
  );
}

// ─── Tab: Channel Economics ─────────────────────────────────────────────────
function ChannelEconomics() {
  const bubbleData = CHANNELS.map(ch => ({
    x: ch.avgCac,
    y: ch.avgLtv,
    z: ch.customers,
    name: ch.channel,
    ratio: ch.ltvCacRatio,
  }));

  return React.createElement("div", { className: "space-y-6" },
    React.createElement(SectionTitle, {
      children: "Channel Performance",
      sub: "Sorted by LTV:CAC efficiency — your best channels deserve more budget",
    }),

    // Channel cards
    React.createElement("div", { className: "space-y-3" },
      CHANNELS.map((ch, i) => React.createElement(Card, { key: i, className: "p-4" },
        React.createElement("div", { className: "flex flex-wrap items-center gap-4" },
          React.createElement("div", { className: "flex items-center gap-3 min-w-[180px]" },
            React.createElement("div", {
              className: "w-3 h-3 rounded-full flex-shrink-0",
              style: { background: CHANNEL_COLORS[ch.channel] || C.slate },
            }),
            React.createElement("div", null,
              React.createElement("div", { className: "text-sm font-bold text-slate-700" }, ch.channel),
              React.createElement("div", { className: "text-xs text-slate-400" }, `${ch.pctCustomers}% of customers`),
            ),
          ),
          React.createElement("div", { className: "flex flex-wrap gap-6 items-center flex-1" },
            React.createElement("div", { className: "text-center" },
              React.createElement("div", { className: "text-xs text-slate-400" }, "CAC"),
              React.createElement("div", { className: "text-sm font-bold text-slate-700" }, fmt(ch.avgCac)),
            ),
            React.createElement("div", { className: "text-center" },
              React.createElement("div", { className: "text-xs text-slate-400" }, "LTV"),
              React.createElement("div", { className: "text-sm font-bold text-slate-700" }, fmt(ch.avgLtv)),
            ),
            React.createElement("div", { className: "text-center" },
              React.createElement("div", { className: "text-xs text-slate-400" }, "LTV:CAC"),
              React.createElement("div", {
                className: "text-sm font-bold",
                style: { color: ch.ltvCacRatio >= 5 ? C.green : ch.ltvCacRatio >= 3 ? C.blue : C.rose },
              }, `${ch.ltvCacRatio}x`),
            ),
            React.createElement("div", { className: "text-center" },
              React.createElement("div", { className: "text-xs text-slate-400" }, "Payback"),
              React.createElement("div", { className: "text-sm text-slate-600" }, `${ch.paybackMonths} mo`),
            ),
            React.createElement("div", { className: "text-center" },
              React.createElement("div", { className: "text-xs text-slate-400" }, "ROI"),
              React.createElement("div", { className: "text-sm font-bold", style: { color: C.green } }, `${ch.roi}%`),
            ),
          ),
          React.createElement(HealthBadge, { health: ch.health }),
        ),
      )),
    ),

    // LTV:CAC comparison chart
    React.createElement(SectionTitle, {
      children: "LTV:CAC by Channel",
      sub: "Dashed line = 3x breakeven threshold",
    }),
    React.createElement(Card, { className: "p-5" },
      React.createElement(ResponsiveContainer, { width: "100%", height: 300 },
        React.createElement(ComposedChart, { data: CHANNELS },
          React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }),
          React.createElement(XAxis, { dataKey: "channel", tick: { fontSize: 11, fill: C.slate }, angle: -20, textAnchor: "end", height: 60 }),
          React.createElement(YAxis, { tick: { fontSize: 12, fill: C.slate }, label: { value: "LTV:CAC", angle: -90, position: "insideLeft", fontSize: 12, fill: C.slate } }),
          React.createElement(Tooltip, null),
          React.createElement(Bar, { dataKey: "ltvCacRatio", name: "LTV:CAC", radius: [6, 6, 0, 0], barSize: 36 },
            CHANNELS.map((ch, i) => React.createElement(Cell, { key: i, fill: CHANNEL_COLORS[ch.channel] })),
          ),
          React.createElement(Line, { type: "monotone", dataKey: () => 3, stroke: C.rose, strokeDasharray: "8 4", strokeWidth: 1.5, dot: false, name: "3x threshold" }),
        ),
      ),
    ),

    // Budget reallocation
    React.createElement(SectionTitle, {
      children: "Budget Reallocation Opportunity",
      sub: `Current total acquisition spend: ${fmt(EXEC.totalAcqSpend)}`,
    }),
    React.createElement(Card, { className: "p-5" },
      React.createElement(ResponsiveContainer, { width: "100%", height: 300 },
        React.createElement(BarChart, {
          data: CHANNELS.map(ch => ({
            channel: ch.channel,
            Current: ch.currentPct,
            Optimized: ch.optimizedPct,
          })),
          layout: "vertical",
        },
          React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: "#E2E8F0" }),
          React.createElement(YAxis, { dataKey: "channel", type: "category", tick: { fontSize: 12, fill: C.slate }, width: 120 }),
          React.createElement(XAxis, { type: "number", tick: { fontSize: 12, fill: C.slate }, tickFormatter: v => `${v}%` }),
          React.createElement(Tooltip, { formatter: (v) => [`${v}%`] }),
          React.createElement(Legend, null),
          React.createElement(Bar, { dataKey: "Current", fill: C.slate, opacity: 0.4, barSize: 14, radius: [0, 4, 4, 0] }),
          React.createElement(Bar, { dataKey: "Optimized", fill: C.blue, barSize: 14, radius: [0, 4, 4, 0] }),
        ),
      ),
    ),
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
function App() {
  const [tab, setTab] = React.useState("executive");

  const tabs = [
    { id: "executive", label: "Executive Briefing" },
    { id: "retention", label: "Cohort Retention" },
    { id: "ltv",       label: "LTV Deep Dive" },
    { id: "channels",  label: "Channel Economics" },
  ];

  return React.createElement("div", { className: "min-h-screen", style: { background: C.bg } },
    // Header
    React.createElement("header", {
      className: "bg-white border-b border-slate-200 shadow-sm",
    },
      React.createElement("div", { className: "max-w-6xl mx-auto px-4 py-5" },
        React.createElement("div", { className: "text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1" }, "LTV / CAC MODELING"),
        React.createElement("h1", { className: "text-2xl sm:text-3xl font-bold text-slate-800" }, "Customer Unit Economics"),
        React.createElement("p", { className: "text-sm text-slate-500 mt-1" }, "Orbit · B2B SaaS · Jan 2023 – Dec 2024"),
      ),
    ),

    // Tabs
    React.createElement("div", { className: "bg-white border-b border-slate-200 sticky top-0 z-10" },
      React.createElement("div", {
        className: "max-w-6xl mx-auto px-4 flex gap-0 overflow-x-auto",
        style: { WebkitOverflowScrolling: "touch" },
      },
        tabs.map(t => React.createElement("button", {
          key: t.id,
          onClick: () => setTab(t.id),
          className: `px-4 py-3 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
            tab === t.id
              ? "border-slate-800 text-slate-800"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`,
        }, t.label)),
        React.createElement("div", { style: { minWidth: 20, flexShrink: 0 } }),
      ),
    ),

    // Content
    React.createElement("main", { className: "max-w-6xl mx-auto px-4 py-6" },
      tab === "executive" && React.createElement(ExecutiveBriefing),
      tab === "retention" && React.createElement(CohortRetention),
      tab === "ltv"       && React.createElement(LtvDeepDive),
      tab === "channels"  && React.createElement(ChannelEconomics),
    ),

    // Footer
    React.createElement("footer", { className: "bg-white border-t border-slate-200 mt-8" },
      React.createElement("div", { className: "max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400" },
        React.createElement("span", null,
          "Core data: ",
          React.createElement("a", { href: "https://github.com/IBM/telco-customer-churn-on-icp4d", target: "_blank", className: "underline hover:text-slate-600" }, "IBM Telco Customer Churn"),
          " (public dataset). Acquisition data simulated.",
        ),
        React.createElement("span", null,
          "Built by ",
          React.createElement("a", { href: "https://linkedin.com/in/freena", target: "_blank", className: "underline hover:text-slate-600" }, "Freena Wang"),
        ),
      ),
    ),
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
