# LTV / CAC Modeling — Customer Unit Economics

**Orbit** is a (fictional) B2B SaaS collaboration platform. This project analyzes its customer unit economics: lifetime value prediction, acquisition cost efficiency, cohort retention, and growth channel optimization.

> **[Live Dashboard →](https://freena22.github.io/ltv-cac-modeling/)**

## Why This Matters

Every growth team faces the same question: *where should we spend the next dollar?* This project builds the analytical foundation to answer it — not with gut feel, but with customer-level unit economics.

**Key findings:**
- **7.3x blended LTV:CAC** — healthy, but masks wide channel variance
- **Organic & Content** return 11–14x; **Paid Social** returns only 4.3x
- **Monthly→Annual conversion** is the #1 lever: annual customers have 4x lower churn
- **56% of churn happens in the first 3 months** — onboarding is the critical window
- **$239K ARR at risk** from 501 high-churn-probability accounts

## Data

| Layer | Source | Notes |
|-------|--------|-------|
| Subscriptions & churn | [IBM Telco Customer Churn](https://github.com/IBM/telco-customer-churn-on-icp4d) (public) | 7,043 customers, tenure, monthly charges, churn status |
| Acquisition channels & CAC | Simulated | Based on B2B SaaS benchmarks; channel assignment influenced by plan tier |
| Signup dates & cohorts | Derived | Generated from tenure to enable cohort analysis |

## Analysis

### Cohort Retention
- Monthly survival curves (overall + segmented by plan, billing, channel)
- Churn timing analysis: early (0–3mo) vs mid vs mature
- Retention heatmap by quarterly cohort

### LTV Modeling
- **Cohort-based**: ARPU / monthly churn rate by segment
- **Segmented**: LTV by plan tier, acquisition channel, billing cycle
- Distribution analysis (P10–P90) and high-value customer profiling

### Unit Economics
- Channel-level CAC, LTV:CAC, payback period, ROI
- Channel health classification (Scale / Healthy / Monitor / Cut)
- Budget reallocation simulation: shift spend to efficient channels
- Plan × Channel cross-analysis

## Project Structure

```
├── data/
│   ├── raw/              # IBM Telco dataset
│   └── processed/        # Enriched Orbit SaaS dataset + JSON results
├── model/
│   ├── prepare_data.py   # Data enrichment pipeline
│   ├── cohort_analysis.py
│   ├── ltv_model.py
│   └── unit_economics.py
├── dashboard/
│   └── ltv_cac_dashboard.jsx
├── docs/                 # GitHub Pages
└── requirements.txt
```

## Run Locally

```bash
pip install -r requirements.txt

# Prepare data
python model/prepare_data.py

# Run analysis
python model/cohort_analysis.py
python model/ltv_model.py
python model/unit_economics.py

# View dashboard
cd docs && python -m http.server 8765
# Open http://localhost:8765
```

## Built By

**[Freena Wang](https://linkedin.com/in/freena)** — Marketing & Product Analytics

Part of a portfolio series on growth analytics:
1. [Marketing Mix Model](https://freena22.github.io/marketing-mix-model/)
2. [Experimentation Playbook](https://freena22.github.io/experimentation-playbook/)
3. **LTV / CAC Modeling** ← you are here
