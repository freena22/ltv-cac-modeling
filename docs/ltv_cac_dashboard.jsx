/*
 * Orbit SaaS — LTV / CAC Command Center (v2)
 *
 * Dark-theme analytics dashboard. Core subscription data from IBM Telco
 * Customer Churn (public). Acquisition channels & CAC simulated.
 */

const {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ComposedChart, ReferenceLine,
} = window.Recharts;

// ─── Design tokens (muted, low-saturation palette) ─────────────────────────
const T = {
  bg:         "#0B1120",
  surface:    "#111827",
  surfaceAlt: "#162031",
  border:     "#1E293B",
  borderHi:   "#334155",
  text:       "#E2E8F0",
  textSec:    "#94A3B8",
  textMuted:  "#64748B",
  textDim:    "#475569",
  accent:     "#6B8FBF",
  green:      "#5BA88A",
  greenDim:   "#2D5A42",
  amber:      "#BFA06B",
  amberDim:   "#7A6028",
  rose:       "#BF6B6B",
  roseDim:    "#7A3A3A",
  purple:     "#8B7BBF",
  cyan:       "#5BA8B8",
  pink:       "#BF6B8F",
};

const CHANNEL_C = {
  "Organic Search": "#5BA88A",
  "Content":        "#6B8FBF",
  "Referral":       "#8B7BBF",
  "Paid Search":    "#BFA06B",
  "Paid Social":    "#BF6B6B",
  "Partnerships":   "#7A8899",
};

// ─── Realistic SaaS data (18-month window) ──────────────────────────────────

const KPI = {
  arr: 3803829, mrr: 316986, customers: 7043, active: 5174,
  arpu: 64.76, blendedCac: 376, blendedLtv: 2744,
  ltvCac: 7.3, payback: 7.7, monthlyChurn: 0.82,
  nrr: 94.2, grossMargin: 78.5, burnMultiple: 1.2,
};

// Cohort retention heatmap — quarterly cohorts, monthly retention
const COHORT_HEATMAP = [
  { cohort: "Q1 2023", size: 892,  m0:100, m1:82, m2:72, m3:65, m4:60, m5:56, m6:52, m7:50, m8:48, m9:46, m10:44, m11:43, m12:42 },
  { cohort: "Q2 2023", size: 845,  m0:100, m1:80, m2:70, m3:63, m4:58, m5:55, m6:51, m7:49, m8:47, m9:45, m10:43, m11:42, m12:41 },
  { cohort: "Q3 2023", size: 910,  m0:100, m1:83, m2:73, m3:67, m4:62, m5:58, m6:55, m7:52, m8:50, m9:48, m10:47, m11:null, m12:null },
  { cohort: "Q4 2023", size: 878,  m0:100, m1:85, m2:76, m3:69, m4:64, m5:61, m6:57, m7:55, m8:53, m9:null, m10:null, m11:null, m12:null },
  { cohort: "Q1 2024", size: 935,  m0:100, m1:84, m2:75, m3:68, m4:63, m5:59, m6:56, m7:null, m8:null, m9:null, m10:null, m11:null, m12:null },
  { cohort: "Q2 2024", size: 920,  m0:100, m1:86, m2:77, m3:71, m4:66, m5:null, m6:null, m7:null, m8:null, m9:null, m10:null, m11:null, m12:null },
  { cohort: "Q3 2024", size: 880,  m0:100, m1:87, m2:78, m3:null, m4:null, m5:null, m6:null, m7:null, m8:null, m9:null, m10:null, m11:null, m12:null },
  { cohort: "Q4 2024", size: 783,  m0:100, m1:88, m2:null, m3:null, m4:null, m5:null, m6:null, m7:null, m8:null, m9:null, m10:null, m11:null, m12:null },
];

// MRR waterfall — monthly movement
const MRR_WATERFALL = [
  { month: "Jul", newMrr: 42000, expansion: 8200, contraction: -3100, churn: -18500, net: 28600 },
  { month: "Aug", newMrr: 45000, expansion: 9100, contraction: -2800, churn: -17200, net: 34100 },
  { month: "Sep", newMrr: 38000, expansion: 7800, contraction: -3400, churn: -19100, net: 23300 },
  { month: "Oct", newMrr: 51000, expansion: 10200, contraction: -2600, churn: -16800, net: 41800 },
  { month: "Nov", newMrr: 48000, expansion: 11500, contraction: -3200, churn: -17500, net: 38800 },
  { month: "Dec", newMrr: 35000, expansion: 6800, contraction: -4100, churn: -20200, net: 17500 },
  { month: "Jan", newMrr: 52000, expansion: 12000, contraction: -2900, churn: -16200, net: 44900 },
  { month: "Feb", newMrr: 49000, expansion: 10800, contraction: -3300, churn: -17800, net: 38700 },
  { month: "Mar", newMrr: 55000, expansion: 13200, contraction: -2700, churn: -15900, net: 49600 },
];

const CHANNELS = [
  { ch: "Organic Search", cust: 1998, pct: 28.4, cac: 179, ltv: 2481, ratio: 13.9, payback: 3.0, churn: 27.5, health: "Scale" },
  { ch: "Content",        cust: 1039, pct: 14.8, cac: 240, ltv: 2609, ratio: 10.9, payback: 3.9, churn: 27.1, health: "Scale" },
  { ch: "Referral",       cust: 947,  pct: 13.4, cac: 277, ltv: 3095, ratio: 11.2, payback: 4.0, churn: 26.9, health: "Scale" },
  { ch: "Paid Search",    cust: 1321, pct: 18.8, cac: 480, ltv: 2657, ratio: 5.5,  payback: 7.4, churn: 26.2, health: "Healthy" },
  { ch: "Paid Social",    cust: 878,  pct: 12.5, cac: 562, ltv: 2438, ratio: 4.3,  payback: 9.3, churn: 27.0, health: "Watch" },
  { ch: "Partnerships",   cust: 860,  pct: 12.2, cac: 757, ltv: 3578, ratio: 4.7,  payback: 9.3, churn: 24.4, health: "Watch" },
];

// Payback curves: cumulative revenue per channel over months
const PAYBACK_CURVES = (() => {
  const months = Array.from({ length: 19 }, (_, i) => i);
  return months.map(m => {
    const row = { month: m };
    CHANNELS.forEach(ch => {
      const survivalRate = Math.pow(1 - ch.churn / 100 / 12, m);
      row[ch.ch] = Math.round(ch.cac > 0 ? (KPI.arpu * m * survivalRate) / ch.cac * 100 : 0);
    });
    return row;
  });
})();

// SaaS benchmarks for context
const BENCHMARKS = {
  ltvCac: { good: 3, great: 5, orbit: 7.3 },
  payback: { good: 18, great: 12, orbit: 7.7 },
  monthlyChurn: { good: 3, great: 1.5, orbit: 0.82 },
  nrr: { good: 100, great: 120, orbit: 94.2 },
};

// ─── Utility ────────────────────────────────────────────────────────────────
const fmt = (n) => {
  if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n}`;
};

// ─── Components ─────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, context }) {
  return React.createElement("div", {
    className: "rounded-lg border p-5",
    style: { background: T.surface, borderColor: T.border },
  },
    React.createElement("div", {
      className: "text-sm font-semibold uppercase tracking-wider mb-2",
      style: { color: T.textMuted },
    }, label),
    React.createElement("div", {
      className: "text-4xl font-bold",
      style: { color: T.text },
    }, value),
    sub && React.createElement("div", {
      className: "text-sm mt-1.5",
      style: { color: T.textDim },
    }, sub),
    context && React.createElement("div", {
      className: "text-sm mt-3 pt-3 leading-relaxed",
      style: { color: T.textSec, borderTop: `1px solid ${T.border}` },
    }, context),
  );
}

function Section({ id, title, sub, children }) {
  return React.createElement("section", { id, className: "mb-10" },
    React.createElement("div", { className: "mb-5" },
      React.createElement("h2", {
        className: "text-3xl font-bold",
        style: { color: T.text },
      }, title),
      sub && React.createElement("p", {
        className: "text-base mt-1.5 leading-relaxed",
        style: { color: T.textSec },
      }, sub),
    ),
    children,
  );
}

function Panel({ children, className = "" }) {
  return React.createElement("div", {
    className: `rounded-lg border p-5 ${className}`,
    style: { background: T.surface, borderColor: T.border },
  }, children);
}

// ─── Cohort Heatmap ─────────────────────────────────────────────────────────
function CohortHeatmap() {
  const months = Array.from({ length: 13 }, (_, i) => i);

  const getColor = (val) => {
    if (val === null || val === undefined) return "transparent";
    if (val >= 80) return "#2D5A42";
    if (val >= 65) return "#3D6B52";
    if (val >= 55) return "#6B6030";
    if (val >= 45) return "#7A5A28";
    if (val >= 35) return "#7A4030";
    return "#6B2A2A";
  };

  return React.createElement("div", { className: "overflow-x-auto" },
    React.createElement("table", {
      className: "w-full text-sm",
      style: { minWidth: 720, borderCollapse: "separate", borderSpacing: 2 },
    },
      React.createElement("thead", null,
        React.createElement("tr", null,
          React.createElement("th", {
            className: "text-left px-2 py-1 font-semibold",
            style: { color: T.textMuted, minWidth: 90 },
          }, "Cohort"),
          React.createElement("th", {
            className: "text-right px-1 py-1 font-semibold",
            style: { color: T.textMuted, width: 50 },
          }, "Size"),
          ...months.map(m => React.createElement("th", {
            key: m,
            className: "text-center px-1 py-1 font-semibold",
            style: { color: T.textMuted, width: 42 },
          }, `M${m}`)),
        ),
      ),
      React.createElement("tbody", null,
        COHORT_HEATMAP.map((row, ri) => React.createElement("tr", { key: ri },
          React.createElement("td", {
            className: "px-2 py-1 font-medium",
            style: { color: T.text },
          }, row.cohort),
          React.createElement("td", {
            className: "text-right px-1 py-1",
            style: { color: T.textMuted },
          }, row.size.toLocaleString()),
          ...months.map(m => {
            const val = row[`m${m}`];
            return React.createElement("td", {
              key: m,
              className: "text-center py-1 rounded",
              style: {
                background: getColor(val),
                color: val !== null ? "#fff" : "transparent",
                fontWeight: 600,
                fontSize: 12,
                padding: "5px 3px",
              },
            }, val !== null ? `${val}%` : "");
          }),
        )),
      ),
    ),
    React.createElement("div", {
      className: "flex items-center gap-2 mt-3 text-[10px]",
      style: { color: T.textMuted },
    },
      React.createElement("span", null, "Retention %:"),
      ...[
        { label: ">80%", color: "#2D5A42" },
        { label: "65-80%", color: "#3D6B52" },
        { label: "55-65%", color: "#6B6030" },
        { label: "45-55%", color: "#7A5A28" },
        { label: "35-45%", color: "#7A4030" },
        { label: "<35%", color: "#6B2A2A" },
      ].map((item, i) => React.createElement("div", {
        key: i,
        className: "flex items-center gap-1",
      },
        React.createElement("div", {
          className: "w-3 h-3 rounded-sm",
          style: { background: item.color },
        }),
        React.createElement("span", null, item.label),
      )),
    ),
  );
}

// ─── MRR Waterfall ──────────────────────────────────────────────────────────
function MrrWaterfall() {
  return React.createElement(ResponsiveContainer, { width: "100%", height: 300 },
    React.createElement(ComposedChart, { data: MRR_WATERFALL },
      React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: T.border }),
      React.createElement(XAxis, { dataKey: "month", tick: { fontSize: 11, fill: T.textMuted } }),
      React.createElement(YAxis, {
        tick: { fontSize: 11, fill: T.textMuted },
        tickFormatter: v => v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`,
      }),
      React.createElement(Tooltip, {
        contentStyle: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 },
        labelStyle: { color: T.text },
        formatter: (v, name) => [`$${v.toLocaleString()}`, name],
      }),
      React.createElement(Legend, { wrapperStyle: { fontSize: 11, color: T.textMuted } }),
      React.createElement(Bar, { dataKey: "newMrr", name: "New MRR", stackId: "pos", fill: T.green, radius: [2, 2, 0, 0], barSize: 24 }),
      React.createElement(Bar, { dataKey: "expansion", name: "Expansion", stackId: "pos", fill: T.cyan, radius: [2, 2, 0, 0] }),
      React.createElement(Bar, { dataKey: "contraction", name: "Contraction", stackId: "neg", fill: T.amber, radius: [0, 0, 2, 2] }),
      React.createElement(Bar, { dataKey: "churn", name: "Churned", stackId: "neg", fill: T.rose, radius: [0, 0, 2, 2] }),
      React.createElement(Line, { type: "monotone", dataKey: "net", name: "Net New", stroke: "#fff", strokeWidth: 2, dot: { fill: "#fff", r: 3 } }),
    ),
  );
}

// ─── Benchmark Gauge ────────────────────────────────────────────────────────
function BenchmarkBar({ label, value, unit, good, great, orbit, invert }) {
  const maxVal = invert ? good * 1.5 : great * 1.5;
  const goodPct = (good / maxVal) * 100;
  const greatPct = (great / maxVal) * 100;
  const orbitPct = Math.min((orbit / maxVal) * 100, 98);

  const isGood = invert ? orbit <= good : orbit >= good;
  const isGreat = invert ? orbit <= great : orbit >= great;
  const color = isGreat ? T.green : isGood ? T.amber : T.rose;

  return React.createElement("div", { className: "mb-4" },
    React.createElement("div", { className: "flex justify-between mb-1" },
      React.createElement("span", { className: "text-xs font-medium", style: { color: T.text } }, label),
      React.createElement("span", { className: "text-xs font-bold", style: { color } }, `${value}${unit}`),
    ),
    React.createElement("div", {
      className: "h-2 rounded-full relative overflow-hidden",
      style: { background: T.border },
    },
      React.createElement("div", {
        className: "h-full rounded-full transition-all",
        style: { width: `${orbitPct}%`, background: color },
      }),
      React.createElement("div", {
        className: "absolute top-0 h-full border-r-2 border-dashed",
        style: { left: `${goodPct}%`, borderColor: T.textDim },
      }),
      React.createElement("div", {
        className: "absolute top-0 h-full border-r-2",
        style: { left: `${greatPct}%`, borderColor: T.textMuted },
      }),
    ),
    React.createElement("div", { className: "flex justify-between mt-0.5" },
      React.createElement("span", { className: "text-[9px]", style: { color: T.textDim } }, ""),
      React.createElement("span", { className: "text-[9px]", style: { color: T.textDim, marginLeft: `${goodPct - 5}%` } }, `Good: ${good}${unit}`),
      React.createElement("span", { className: "text-[9px]", style: { color: T.textDim } }, `Best: ${great}${unit}`),
    ),
  );
}

// ─── Scenario Simulator ─────────────────────────────────────────────────────
function Simulator() {
  const [retentionLift, setRetentionLift] = React.useState(0);
  const [annualConv, setAnnualConv] = React.useState(0);
  const [cacReduction, setCacReduction] = React.useState(0);

  // Base metrics
  const baseChurn = 0.82;
  const baseLtv = 2744;
  const baseCac = 376;
  const baseArr = 3803829;
  const basePayback = 7.7;

  // Computed impact
  const newChurn = Math.max(0.1, baseChurn * (1 - retentionLift / 100));
  const churnMultiplier = baseChurn / newChurn;
  const annualEffect = 1 + (annualConv / 100) * 0.6;
  const newLtv = Math.round(baseLtv * churnMultiplier * annualEffect);
  const newCac = Math.round(baseCac * (1 - cacReduction / 100));
  const newRatio = (newLtv / Math.max(newCac, 1)).toFixed(1);
  const newPayback = (newCac / KPI.arpu).toFixed(1);
  const arrImpact = Math.round(baseArr * (churnMultiplier * annualEffect - 1));
  const cacSavings = Math.round(KPI.totalAcqSpend * (cacReduction / 100));

  function Slider({ label, value, onChange, min, max, step, unit, color }) {
    return React.createElement("div", { className: "mb-6" },
      React.createElement("div", { className: "flex justify-between mb-2" },
        React.createElement("span", { className: "text-sm font-medium", style: { color: T.text } }, label),
        React.createElement("span", {
          className: "text-base font-bold px-2 py-0.5 rounded",
          style: { color, background: `${color}20` },
        }, `${value > 0 ? "+" : ""}${value}${unit}`),
      ),
      React.createElement("input", {
        type: "range", min, max, step, value,
        onChange: e => onChange(Number(e.target.value)),
        className: "w-full h-1.5 rounded-full appearance-none cursor-pointer",
        style: {
          background: `linear-gradient(to right, ${color} 0%, ${color} ${(value - min) / (max - min) * 100}%, ${T.border} ${(value - min) / (max - min) * 100}%, ${T.border} 100%)`,
          accentColor: color,
        },
      }),
    );
  }

  return React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5" },
    // Controls
    React.createElement(Panel, null,
      React.createElement("div", {
        className: "text-xs font-semibold uppercase tracking-wider mb-4",
        style: { color: T.textMuted },
      }, "Adjust Levers"),
      React.createElement(Slider, {
        label: "Retention improvement",
        value: retentionLift, onChange: setRetentionLift,
        min: 0, max: 40, step: 5, unit: "%", color: T.green,
      }),
      React.createElement(Slider, {
        label: "Monthly→Annual conversion lift",
        value: annualConv, onChange: setAnnualConv,
        min: 0, max: 50, step: 5, unit: "%", color: T.cyan,
      }),
      React.createElement(Slider, {
        label: "CAC reduction (channel reallocation)",
        value: cacReduction, onChange: setCacReduction,
        min: 0, max: 30, step: 5, unit: "%", color: T.amber,
      }),
    ),

    // Results
    React.createElement(Panel, null,
      React.createElement("div", {
        className: "text-xs font-semibold uppercase tracking-wider mb-4",
        style: { color: T.textMuted },
      }, "Projected Impact"),
      React.createElement("div", { className: "grid grid-cols-2 gap-3" },
        ...[
          { label: "New LTV", now: fmt(baseLtv), proj: fmt(newLtv), delta: newLtv - baseLtv, prefix: "$" },
          { label: "New CAC", now: fmt(baseCac), proj: fmt(newCac), delta: -(baseCac - newCac), prefix: "$" },
          { label: "LTV:CAC", now: `${(baseLtv/baseCac).toFixed(1)}x`, proj: `${newRatio}x`, delta: (newRatio - baseLtv/baseCac).toFixed(1), suffix: "x" },
          { label: "Payback", now: `${basePayback} mo`, proj: `${newPayback} mo`, delta: -(basePayback - newPayback).toFixed(1), suffix: " mo" },
        ].map((m, i) => React.createElement("div", {
          key: i,
          className: "rounded-lg p-3",
          style: { background: T.surfaceAlt, border: `1px solid ${T.border}` },
        },
          React.createElement("div", { className: "text-xs uppercase tracking-wider mb-1.5", style: { color: T.textMuted } }, m.label),
          React.createElement("div", { className: "text-xl font-bold", style: { color: T.text } }, m.proj),
          React.createElement("div", {
            className: "text-xs mt-1",
            style: { color: m.delta > 0 && m.label !== "New CAC" ? T.green : m.delta < 0 && m.label === "New CAC" ? T.green : T.textDim },
          }, `was ${m.now}`),
        )),
      ),
      // Total impact
      (retentionLift > 0 || annualConv > 0 || cacReduction > 0) &&
      React.createElement("div", {
        className: "mt-4 rounded-lg p-3 border",
        style: { background: `${T.green}10`, borderColor: `${T.green}30` },
      },
        React.createElement("div", { className: "text-xs font-semibold mb-1", style: { color: T.green } }, "Combined Impact"),
        React.createElement("div", { className: "text-sm", style: { color: T.text } },
          arrImpact > 0 ? `+${fmt(arrImpact)} incremental ARR` : "",
          cacSavings > 0 ? ` · ${fmt(cacSavings)} CAC savings` : "",
          (arrImpact <= 0 && cacSavings <= 0) ? "Adjust sliders to see projected impact" : "",
        ),
      ),
    ),
  );
}

// ─── Channel Scatter Plot (CAC vs LTV) ──────────────────────────────────────
function ChannelBubble() {
  const data = CHANNELS.map(ch => ({
    name: ch.ch,
    cac: ch.cac,
    ltv: ch.ltv,
    customers: ch.cust,
    ratio: ch.ratio,
  }));

  return React.createElement("div", { className: "relative" },
    React.createElement(ResponsiveContainer, { width: "100%", height: 340 },
      React.createElement(ComposedChart, {
        data,
        margin: { top: 20, right: 30, bottom: 20, left: 20 },
      },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: T.border }),
        React.createElement(XAxis, {
          dataKey: "cac", type: "number", name: "CAC",
          tick: { fontSize: 11, fill: T.textMuted },
          label: { value: "CAC ($)", position: "bottom", offset: 0, fontSize: 11, fill: T.textMuted },
          tickFormatter: v => `$${v}`,
        }),
        React.createElement(YAxis, {
          dataKey: "ltv", type: "number", name: "LTV",
          tick: { fontSize: 11, fill: T.textMuted },
          label: { value: "LTV ($)", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: T.textMuted },
          tickFormatter: v => v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`,
        }),
        React.createElement(Tooltip, {
          contentStyle: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 },
          formatter: (v, name) => {
            if (name === "LTV") return [`$${v.toLocaleString()}`, "LTV"];
            return [v, name];
          },
          labelFormatter: (_, payload) => payload[0] ? payload[0].payload.name : "",
        }),
        data.map((d, i) => React.createElement(ReferenceLine, {
          key: `line-${i}`,
          segment: [{ x: 0, y: 0 }, { x: d.cac, y: d.ltv }],
          stroke: CHANNEL_C[d.name],
          strokeDasharray: "3 3",
          strokeOpacity: 0.3,
        })),
        React.createElement(Line, {
          data: [{ cac: 0, ltv: 0 }, { cac: 800, ltv: 2400 }],
          dataKey: "ltv", stroke: T.textDim, strokeDasharray: "8 4", strokeWidth: 1, dot: false,
        }),
        data.map((d, i) => {
          const r = Math.sqrt(d.customers / 200) * 3 + 6;
          return React.createElement("circle", {
            key: i,
            cx: `${((d.cac) / 900) * 100}%`,
            cy: `${(1 - (d.ltv) / 4000) * 100}%`,
            r,
            fill: CHANNEL_C[d.name],
            opacity: 0.8,
            stroke: "#fff",
            strokeWidth: 1.5,
          });
        }),
      ),
    ),
    // Legend
    React.createElement("div", {
      className: "flex flex-wrap gap-3 mt-2 justify-center",
    },
      CHANNELS.map((ch, i) => React.createElement("div", {
        key: i,
        className: "flex items-center gap-1.5 text-[11px]",
        style: { color: T.textMuted },
      },
        React.createElement("div", {
          className: "w-2.5 h-2.5 rounded-full",
          style: { background: CHANNEL_C[ch.ch] },
        }),
        React.createElement("span", null, ch.ch),
        React.createElement("span", { className: "font-bold", style: { color: CHANNEL_C[ch.ch] } }, `${ch.ratio}x`),
      )),
    ),
  );
}

// ─── Payback Curves ─────────────────────────────────────────────────────────
function PaybackCurves() {
  return React.createElement(ResponsiveContainer, { width: "100%", height: 300 },
    React.createElement(LineChart, { data: PAYBACK_CURVES },
      React.createElement(CartesianGrid, { strokeDasharray: "3 3", stroke: T.border }),
      React.createElement(XAxis, {
        dataKey: "month",
        tick: { fontSize: 11, fill: T.textMuted },
        label: { value: "Months", position: "bottom", offset: 0, fontSize: 11, fill: T.textMuted },
      }),
      React.createElement(YAxis, {
        tick: { fontSize: 11, fill: T.textMuted },
        tickFormatter: v => `${v}%`,
        label: { value: "Cumulative Revenue / CAC", angle: -90, position: "insideLeft", offset: 10, fontSize: 10, fill: T.textMuted },
      }),
      React.createElement(Tooltip, {
        contentStyle: { background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 },
        formatter: (v, name) => [`${v}%`, name],
      }),
      React.createElement(ReferenceLine, { y: 100, stroke: "#fff", strokeDasharray: "8 4", strokeWidth: 1.5, label: { value: "Breakeven", position: "right", fill: T.textMuted, fontSize: 10 } }),
      ...Object.keys(CHANNEL_C).map(ch => React.createElement(Line, {
        key: ch,
        type: "monotone",
        dataKey: ch,
        stroke: CHANNEL_C[ch],
        strokeWidth: 2,
        dot: false,
      })),
    ),
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
function App() {
  const [activeNav, setActiveNav] = React.useState("overview");

  const navItems = [
    { id: "overview", icon: "\u25A0", label: "Overview" },
    { id: "cohorts", icon: "\u2593", label: "Cohorts" },
    { id: "channels", icon: "\u25CE", label: "Channels" },
    { id: "simulator", icon: "\u2699", label: "Simulator" },
  ];

  return React.createElement("div", {
    className: "min-h-screen",
    style: { background: T.bg, color: T.text },
  },
    // Top bar
    React.createElement("header", {
      className: "border-b sticky top-0 z-20",
      style: { background: T.bg, borderColor: T.border },
    },
      React.createElement("div", { className: "max-w-7xl mx-auto px-4 py-3 flex items-center justify-between" },
        React.createElement("div", null,
          React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement("div", {
              className: "w-2 h-2 rounded-full",
              style: { background: T.green },
            }),
            React.createElement("span", {
              className: "text-[10px] font-semibold uppercase tracking-widest",
              style: { color: T.textMuted },
            }, "Orbit SaaS · Unit Economics"),
          ),
          React.createElement("h1", { className: "text-3xl font-bold mt-0.5" }, "LTV / CAC Command Center"),
        ),
        // Nav pills
        React.createElement("nav", { className: "flex gap-1" },
          navItems.map(item => React.createElement("button", {
            key: item.id,
            onClick: () => setActiveNav(item.id),
            className: `px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeNav === item.id ? "" : "hover:opacity-80"
            }`,
            style: {
              background: activeNav === item.id ? T.accent : "transparent",
              color: activeNav === item.id ? "#fff" : T.textMuted,
            },
          }, `${item.icon} ${item.label}`)),
        ),
      ),
    ),

    // Content
    React.createElement("main", { className: "max-w-7xl mx-auto px-4 py-6" },

      // ── Overview ──
      activeNav === "overview" && React.createElement(React.Fragment, null,
        // Context header
        React.createElement("div", {
          className: "rounded-lg p-5 mb-6 border",
          style: { background: T.surface, borderColor: T.border },
        },
          React.createElement("p", { className: "text-lg leading-relaxed", style: { color: T.text } },
            React.createElement("strong", null, "What is this?"),
            " — This dashboard models the unit economics of Orbit, a B2B SaaS platform with 7,043 customers. It answers the fundamental growth question: ",
            React.createElement("em", { style: { color: T.accent } }, "where should we spend the next dollar to maximize sustainable revenue?"),
          ),
          React.createElement("p", { className: "text-sm mt-2 leading-relaxed", style: { color: T.textSec } },
            "We analyze customer lifetime value (LTV), acquisition cost (CAC) by channel, cohort retention patterns, and simulate the impact of different growth strategies on unit economics.",
          ),
        ),
        // KPI row — 4 primary metrics with context
        React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" },
          React.createElement(MetricCard, { label: "ARR", value: fmt(KPI.arr), sub: `${KPI.active.toLocaleString()} active customers`, context: "Annual recurring revenue. Foundation metric for SaaS valuation." }),
          React.createElement(MetricCard, { label: "LTV : CAC", value: `${KPI.ltvCac}x`, sub: `LTV ${fmt(KPI.blendedLtv)} / CAC ${fmt(KPI.blendedCac)}`, context: "Healthy is >3x. Above 5x means efficient growth or room to invest more." }),
          React.createElement(MetricCard, { label: "Payback Period", value: `${KPI.payback} months`, sub: `ARPU $${KPI.arpu}/mo`, context: "Time to recoup acquisition cost. Under 12 months is strong for B2B SaaS." }),
          React.createElement(MetricCard, { label: "Net Revenue Retention", value: `${KPI.nrr}%`, sub: `Monthly churn: ${KPI.monthlyChurn}%`, context: "Below 100% means existing revenue shrinks over time. Top SaaS targets >110%." }),
        ),

        // Benchmark context
        React.createElement(Section, {
          title: "Where Orbit Stands",
          sub: "Compared to B2B SaaS benchmarks (dashed = good, solid = best-in-class)",
        },
          React.createElement(Panel, null,
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-8" },
              React.createElement(BenchmarkBar, { label: "LTV:CAC Ratio", value: "7.3", unit: "x", good: 3, great: 5, orbit: 7.3 }),
              React.createElement(BenchmarkBar, { label: "Payback Period", value: "7.7", unit: " mo", good: 18, great: 12, orbit: 7.7, invert: true }),
              React.createElement(BenchmarkBar, { label: "Monthly Churn", value: "0.82", unit: "%", good: 3, great: 1.5, orbit: 0.82, invert: true }),
              React.createElement(BenchmarkBar, { label: "Net Revenue Retention", value: "94.2", unit: "%", good: 100, great: 120, orbit: 94.2 }),
            ),
          ),
        ),

        // MRR Waterfall
        React.createElement(Section, {
          title: "MRR Movement",
          sub: "Monthly revenue dynamics: new ARR vs expansion vs contraction vs churn",
        },
          React.createElement(Panel, null,
            React.createElement(MrrWaterfall),
          ),
        ),

        // Key insight
        React.createElement("div", {
          className: "rounded-lg p-6 border",
          style: { background: `${T.accent}08`, borderColor: `${T.accent}30` },
        },
          React.createElement("div", { className: "text-base font-semibold uppercase tracking-wider mb-3", style: { color: T.accent } }, "So What Does This Mean?"),
          React.createElement("p", { className: "text-lg leading-relaxed mb-3", style: { color: T.text } },
            "Orbit's unit economics look healthy on paper — ",
            React.createElement("strong", null, "7.3x LTV:CAC"),
            " and ",
            React.createElement("strong", null, "7.7-month payback"),
            " beat most B2B SaaS benchmarks.",
          ),
          React.createElement("p", { className: "text-lg leading-relaxed mb-3", style: { color: T.text } },
            "But two problems hide under the surface:",
          ),
          React.createElement("ul", { className: "space-y-3 ml-1" },
            React.createElement("li", { className: "flex items-start gap-2 text-base", style: { color: T.text } },
              React.createElement("span", { style: { color: T.rose } }, "•"),
              React.createElement("span", null,
                React.createElement("strong", { style: { color: T.rose } }, "NRR is 94.2%, below 100%"),
                " — existing customer revenue shrinks over time. Expansion revenue doesn't offset churn, which is a growth ceiling.",
              ),
            ),
            React.createElement("li", { className: "flex items-start gap-2 text-base", style: { color: T.text } },
              React.createElement("span", { style: { color: T.amber } }, "•"),
              React.createElement("span", null,
                React.createElement("strong", { style: { color: T.amber } }, "55% of acquisition spend goes to the 2 least efficient channels"),
                " — Paid Social and Partnerships cost 2–4x more per customer but don't produce higher-LTV users.",
              ),
            ),
          ),
          React.createElement("p", { className: "text-sm mt-4 font-medium", style: { color: T.textSec } },
            "The real opportunity isn't acquiring more customers — it's retaining better and spending smarter.",
          ),
        ),
      ),

      // ── Cohorts ──
      activeNav === "cohorts" && React.createElement(React.Fragment, null,
        React.createElement("div", {
          className: "rounded-lg p-5 mb-6 border",
          style: { background: T.surface, borderColor: T.border },
        },
          React.createElement("p", { className: "text-lg leading-relaxed", style: { color: T.text } },
            React.createElement("strong", null, "Why cohort analysis?"),
            " — Averages hide the truth. A \"25% churn rate\" could mean everyone churns evenly, or that early users churn rapidly while mature users stick around forever. Cohort analysis shows ",
            React.createElement("em", { style: { color: T.accent } }, "when"),
            " customers leave and whether retention is improving over time.",
          ),
        ),
        React.createElement(Section, {
          title: "Cohort Retention Heatmap",
          sub: "Each row is a quarterly signup cohort. Each cell shows what % of that cohort is still active at month M. Green = strong, red = concerning.",
        },
          React.createElement(Panel, null,
            React.createElement(CohortHeatmap),
          ),
        ),

        // Interpretation
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" },
          React.createElement(Panel, null,
            React.createElement("div", { className: "text-xs font-semibold uppercase tracking-wider mb-2", style: { color: T.rose } }, "The Problem"),
            React.createElement("div", { className: "text-3xl font-bold mb-2", style: { color: T.text } }, "18–35%"),
            React.createElement("p", { className: "text-base leading-relaxed", style: { color: T.textSec } }, "of each cohort churns in the first 3 months. This early-life attrition is the #1 drag on LTV and the most actionable window for intervention."),
          ),
          React.createElement(Panel, null,
            React.createElement("div", { className: "text-xs font-semibold uppercase tracking-wider mb-2", style: { color: T.green } }, "Trend: Improving"),
            React.createElement("div", { className: "text-3xl font-bold mb-2", style: { color: T.text } }, "82% → 88%"),
            React.createElement("p", { className: "text-base leading-relaxed", style: { color: T.textSec } }, "M1 retention improved from 82% (Q1'23) to 88% (Q4'24). Product or onboarding changes are working — but there's more to capture."),
          ),
          React.createElement(Panel, null,
            React.createElement("div", { className: "text-xs font-semibold uppercase tracking-wider mb-2", style: { color: T.amber } }, "The Lever"),
            React.createElement("div", { className: "text-3xl font-bold mb-2", style: { color: T.text } }, "M1 → M3"),
            React.createElement("p", { className: "text-base leading-relaxed", style: { color: T.textSec } }, "The steepest drop. A 5pp improvement in M1–M3 retention adds ~$380K ARR/year. This is where onboarding investment pays off most."),
          ),
        ),

        // Retention by billing
        React.createElement(Section, {
          title: "The Billing Cycle Effect",
          sub: "Annual contracts don't just lock in revenue — they fundamentally change retention behavior",
        },
          React.createElement(Panel, null,
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-5" },
              [
                { label: "Monthly", churn: "42.7%", m12: "50.8%", color: T.rose },
                { label: "Annual", churn: "11.3%", m12: "93.1%", color: T.accent },
                { label: "2-Year", churn: "2.8%", m12: "96.5%", color: T.green },
              ].map((d, i) => React.createElement("div", {
                key: i,
                className: "rounded-lg p-5 text-center border",
                style: { borderColor: `${d.color}40`, background: `${d.color}10` },
              },
                React.createElement("div", { className: "text-base font-bold mb-2", style: { color: d.color } }, d.label),
                React.createElement("div", { className: "text-3xl font-bold mb-1", style: { color: T.text } }, d.m12),
                React.createElement("div", { className: "text-xs", style: { color: T.textSec } }, "12-month retention"),
                React.createElement("div", { className: "text-xs mt-1", style: { color: T.textMuted } }, `Churn rate: ${d.churn}`),
              )),
            ),
          ),
        ),
      ),

      // ── Channels ──
      activeNav === "channels" && React.createElement(React.Fragment, null,
        React.createElement("div", {
          className: "rounded-lg p-5 mb-6 border",
          style: { background: T.surface, borderColor: T.border },
        },
          React.createElement("p", { className: "text-lg leading-relaxed", style: { color: T.text } },
            React.createElement("strong", null, "Why channel economics matter"),
            " — Not all customers are created equal. A customer from Organic Search costs $179 to acquire; one from Partnerships costs $757. If they generate similar revenue, the channel choice determines whether growth is profitable or just burning cash.",
          ),
        ),
        React.createElement(Section, {
          title: "Channel Economics: CAC vs LTV",
          sub: "Higher and to the left = better (high LTV, low CAC). The best channels live in the top-left corner.",
        },
          React.createElement(Panel, null,
            React.createElement(ChannelBubble),
          ),
        ),

        // Channel table
        React.createElement(Section, {
          title: "Channel Breakdown",
          sub: "Full performance table. \"Scale\" = invest more aggressively. \"Watch\" = efficiency below target, needs optimization or reallocation.",
        },
          React.createElement(Panel, null,
            React.createElement("div", { className: "overflow-x-auto" },
              React.createElement("table", {
                className: "w-full text-sm",
                style: { minWidth: 680 },
              },
                React.createElement("thead", null,
                  React.createElement("tr", { style: { borderBottom: `1px solid ${T.border}` } },
                    ["Channel", "Customers", "CAC", "LTV", "LTV:CAC", "Payback", "Churn", "Health"].map(h =>
                      React.createElement("th", {
                        key: h,
                        className: `text-left py-2 px-2 font-semibold ${h !== "Channel" ? "text-right" : ""}`,
                        style: { color: T.textMuted },
                      }, h),
                    ),
                  ),
                ),
                React.createElement("tbody", null,
                  CHANNELS.map((ch, i) => React.createElement("tr", {
                    key: i,
                    style: { borderBottom: `1px solid ${T.border}` },
                  },
                    React.createElement("td", { className: "py-2.5 px-2" },
                      React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement("div", {
                          className: "w-2 h-2 rounded-full",
                          style: { background: CHANNEL_C[ch.ch] },
                        }),
                        React.createElement("span", { className: "font-medium", style: { color: T.text } }, ch.ch),
                      ),
                    ),
                    React.createElement("td", { className: "text-right py-2 px-2", style: { color: T.textMuted } }, ch.cust.toLocaleString()),
                    React.createElement("td", { className: "text-right py-2 px-2 font-medium", style: { color: T.text } }, `$${ch.cac}`),
                    React.createElement("td", { className: "text-right py-2 px-2 font-medium", style: { color: T.text } }, `$${ch.ltv.toLocaleString()}`),
                    React.createElement("td", {
                      className: "text-right py-2 px-2 font-bold",
                      style: { color: ch.ratio >= 5 ? T.green : ch.ratio >= 3 ? T.amber : T.rose },
                    }, `${ch.ratio}x`),
                    React.createElement("td", { className: "text-right py-2 px-2", style: { color: T.textMuted } }, `${ch.payback} mo`),
                    React.createElement("td", { className: "text-right py-2 px-2", style: { color: T.textMuted } }, `${ch.churn}%`),
                    React.createElement("td", { className: "text-right py-2 px-2" },
                      React.createElement("span", {
                        className: "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                        style: {
                          color: ch.health === "Scale" ? T.green : ch.health === "Healthy" ? T.accent : T.amber,
                          background: ch.health === "Scale" ? `${T.green}15` : ch.health === "Healthy" ? `${T.accent}15` : `${T.amber}15`,
                        },
                      }, ch.health),
                    ),
                  )),
                ),
              ),
            ),
          ),
        ),

        // Payback curves
        React.createElement(Section, {
          title: "Time to Payback",
          sub: "How quickly each channel earns back its CAC. White dashed line = breakeven (100%).",
        },
          React.createElement(Panel, null,
            React.createElement(PaybackCurves),
          ),
        ),

        // Reallocation recommendation
        React.createElement("div", {
          className: "rounded-lg p-6 border",
          style: { background: `${T.green}08`, borderColor: `${T.green}30` },
        },
          React.createElement("div", { className: "text-sm font-semibold uppercase tracking-wider mb-3", style: { color: T.green } }, "Recommendation: Budget Reallocation"),
          React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            React.createElement("div", null,
              React.createElement("p", { className: "text-lg leading-relaxed mb-3", style: { color: T.text } },
                "Organic Search, Content, and Referral deliver ",
                React.createElement("strong", null, "11–14x LTV:CAC"),
                " and pay back in under 4 months. Yet they receive only 33% of acquisition spend.",
              ),
              React.createElement("p", { className: "text-sm leading-relaxed", style: { color: T.textSec } },
                "Shifting 15–20% of budget from Paid Social & Partnerships to these channels would reduce blended CAC by ~$50 and improve LTV:CAC from 7.3x to ~9.5x.",
              ),
            ),
            React.createElement("div", {
              className: "rounded-lg p-4",
              style: { background: T.surfaceAlt, border: `1px solid ${T.border}` },
            },
              React.createElement("div", { className: "text-xs font-semibold uppercase tracking-wider mb-3", style: { color: T.textMuted } }, "Projected Impact"),
              ...[
                { label: "Blended CAC", from: "$376", to: "$310", color: T.green },
                { label: "LTV:CAC", from: "7.3x", to: "9.5x", color: T.green },
                { label: "Annual savings", from: "—", to: "$175K", color: T.green },
              ].map((item, i) => React.createElement("div", {
                key: i,
                className: "flex justify-between items-center mb-2 text-sm",
              },
                React.createElement("span", { style: { color: T.textSec } }, item.label),
                React.createElement("span", null,
                  React.createElement("span", { className: "line-through mr-2 text-xs", style: { color: T.textDim } }, item.from),
                  React.createElement("span", { className: "font-bold", style: { color: item.color } }, item.to),
                ),
              )),
            ),
          ),
        ),
      ),

      // ── Simulator ──
      activeNav === "simulator" && React.createElement(React.Fragment, null,
        React.createElement("div", {
          className: "rounded-lg p-5 mb-6 border",
          style: { background: T.surface, borderColor: T.border },
        },
          React.createElement("p", { className: "text-lg leading-relaxed", style: { color: T.text } },
            React.createElement("strong", null, "How to use this"),
            " — Move the sliders to model \"what-if\" scenarios. For example: \"What if we improve early retention by 20% through better onboarding?\" or \"What if we shift 15% of paid budget to organic channels?\" The right panel recalculates all unit economics in real time.",
          ),
        ),
        React.createElement(Section, {
          title: "Growth Scenario Simulator",
          sub: "Each lever represents a realistic growth initiative. Combined impact shows incremental ARR and cost savings.",
        },
          React.createElement(Simulator),
        ),

        React.createElement(Section, {
          title: "Pre-Built Scenarios",
          sub: "Common strategies and their expected impact",
        },
          React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
            [
              {
                name: "Retention-First",
                desc: "Invest in onboarding & success team. Target: reduce M1-M3 churn by 25%.",
                ltv: "$3,430", cac: "$376", ratio: "9.1x",
                arr: "+$520K", cost: "$180K", roi: "2.9x",
                color: T.green,
              },
              {
                name: "Channel Rebalance",
                desc: "Shift 20% of paid budget to organic & content. No headcount change.",
                ltv: "$2,744", cac: "$310", ratio: "8.9x",
                arr: "—", cost: "$0", roi: "immediate",
                color: T.accent,
              },
              {
                name: "Annual Push",
                desc: "Offer month-3 annual discount + annual-first pricing on signup page.",
                ltv: "$3,840", cac: "$376", ratio: "10.2x",
                arr: "+$780K", cost: "$95K", roi: "8.2x",
                color: T.cyan,
              },
            ].map((s, i) => React.createElement(Panel, { key: i },
              React.createElement("div", {
                className: "text-xs font-semibold uppercase tracking-wider mb-2",
                style: { color: s.color },
              }, s.name),
              React.createElement("p", {
                className: "text-xs mb-3",
                style: { color: T.textMuted },
              }, s.desc),
              React.createElement("div", { className: "space-y-2" },
                [
                  { k: "Projected LTV", v: s.ltv },
                  { k: "Projected CAC", v: s.cac },
                  { k: "LTV:CAC", v: s.ratio },
                  { k: "ARR Impact", v: s.arr },
                  { k: "Investment", v: s.cost },
                  { k: "ROI", v: s.roi },
                ].map((row, j) => React.createElement("div", {
                  key: j,
                  className: "flex justify-between text-xs",
                },
                  React.createElement("span", { style: { color: T.textMuted } }, row.k),
                  React.createElement("span", { className: "font-medium", style: { color: T.text } }, row.v),
                )),
              ),
            )),
          ),
        ),
      ),
    ),

    // Footer
    React.createElement("footer", {
      className: "border-t mt-8 py-4",
      style: { borderColor: T.border },
    },
      React.createElement("div", {
        className: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px]",
        style: { color: T.textDim },
      },
        React.createElement("span", null,
          "Core data: ",
          React.createElement("a", {
            href: "https://github.com/IBM/telco-customer-churn-on-icp4d",
            target: "_blank",
            className: "underline",
            style: { color: T.textMuted },
          }, "IBM Telco Customer Churn"),
          " (public). Acquisition & MRR movement data simulated.",
        ),
        React.createElement("span", null,
          "Built by ",
          React.createElement("a", {
            href: "https://linkedin.com/in/freena",
            target: "_blank",
            className: "underline",
            style: { color: T.textMuted },
          }, "Freena Wang"),
        ),
      ),
    ),
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
