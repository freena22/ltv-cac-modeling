# LTV/CAC Modeling — 项目完整解读

> **目标读者**：你自己。读完这份文档，你能在 5–10 分钟内向任何 HM / VP of Data / 面试官清晰讲述这个项目的全貌。

---

## 一、这个项目到底是什么？（30 秒电梯演讲）

> "我为一家虚拟 B2B SaaS 公司 Orbit 建了一套**客户单元经济学分析体系**。它回答了每个增长团队最核心的问题：**下一块钱应该花在哪里，才能最大化可持续收入？** 我用了真实的公开数据集，模拟了获客渠道和成本，做了 cohort retention 分析、LTV 建模、CAC 效率评估，并且建了一个交互式 dashboard 展示所有发现和建议。"

---

## 二、行业背景 & 为什么要做这个

### 行业痛点

1. **获客成本持续上升**
   - 2025 年，中位数 SaaS 公司花 **$2.00 获取 $1.00 的 ARR**，比 2023 年上涨了 14%（a16z 数据）
   - VC-backed 公司在 marketing 上的花费比 bootstrapped 公司高 58%
   - 渠道 CAC 差异巨大：SEO/Content $200–600，LinkedIn Ads $800–2,000，Field Sales 甚至 $2,000–10,000+

2. **NRR（净收入留存率）成为估值分水岭**
   - NRR > 120% 的公司估值是 **12–15x forward revenue**
   - NRR < 100% 的公司估值只有 **5–7x**
   - 这意味着同样 $5M ARR 的公司，NRR 的差距可以造成 **$25M–$50M 的估值差**

3. **大多数增长团队在"盲目飞行"**
   - 很多公司只看 blended metrics（总平均的 CAC、总平均的 LTV），掩盖了渠道级别的巨大效率差异
   - "我们的 LTV:CAC 是 5x" —— 但可能 Organic 是 14x，Paid Social 只有 3x，你的预算却 55% 花在了低效渠道上
   - 缺乏 cohort 级别的留存分析，不知道流失发生在哪个阶段

### 为什么要做这个项目

作为一个 Growth / Marketing Analytics Lead，你需要展示：
- 你理解 **单元经济学**（unit economics），不只是跑 A/B test
- 你能从数据中找到 **可执行的增长杠杆**（actionable levers）
- 你能用 **量化的方式** 给 leadership 讲清楚：问题是什么、影响多大、怎么解决、投资回报是多少

这个项目正好覆盖了这些能力。

---

## 三、数据来源 & 项目架构

### 数据

| 层级 | 来源 | 说明 |
|------|------|------|
| 订阅 & 流失数据 | IBM Telco Customer Churn（公开数据集） | 7,043 个客户，包含 tenure、月费、流失状态、合同类型、增值服务等 |
| 获客渠道 & CAC | 模拟（基于行业 benchmark） | 6 个渠道：Organic Search, Content, Referral, Paid Search, Paid Social, Partnerships |
| 注册日期 & Cohort | 从 tenure 推导 | 观察窗口：2023.1 – 2024.12（24 个月） |

**关键设计决策**：
- CAC 是 **fully loaded**（不仅仅是广告费，还包括团队薪资、工具、内容制作的归因分配），这是 a16z 框架要求的标准做法
- LTV 计算用了 **segment-level churn rate**（分 plan tier 算），而不是整体平均，更准确
- Projected LTV 对活跃客户的剩余生命周期 **封顶 36 个月**，避免过度乐观

### 分析模块（4 个 Python 脚本）

```
prepare_data.py     → 数据清洗 + 模拟获客渠道/CAC + LTV 估算
cohort_analysis.py  → Cohort 留存矩阵 + 分维度留存曲线 + 流失风险因子
ltv_model.py        → LTV 分布 + 分 segment LTV + 高/低价值客户画像 + Revenue at risk
unit_economics.py   → 渠道级 CAC/LTV/ROI + 健康分类 + 预算重新分配模拟 + 推荐
```

### Dashboard（交互式 React）

4 个 Tab：
1. **Overview** — 顶级 KPI + benchmark 对比 + MRR 瀑布 + Executive Diagnosis
2. **Cohorts** — Cohort 留存热力图 + 分 billing cycle 留存对比 + 行动方案
3. **Channels** — CAC vs LTV 气泡图 + 渠道效率表 + Payback 曲线 + 预算重分配建议
4. **Simulator** — 交互式滑块，模拟留存改善/渠道重分配/年付推进的 compounding 影响

---

## 四、核心方法论

### 1. LTV 计算方法

**基础公式**：
```
LTV = ARPU × Gross Margin % × (1 / Monthly Churn Rate)
```

**本项目的改进**：
- 不用整体 churn rate，而是 **segment-level**（按 plan tier：Starter / Professional / Business）
- 对活跃客户，计算 expected remaining lifetime，但 **cap 在 36 个月**，避免公式在低 churn 时算出不切实际的 LTV
- 已流失客户直接用 observed TotalCharges 作为 LTV

**为什么这样做更好？** a16z 数据显示，对不成熟 cohort 用公式估算 LTV 会**高估 20–40%**。Segment-level + cap 是更保守也更准确的做法。

### 2. CAC 计算方法

- **Fully loaded CAC** = 总获客支出（广告费 + 团队薪资 + 工具 + 内容）/ 新获客数
- 按 channel 模拟，基于 B2B SaaS benchmark：
  - Organic Search: $180 ± $50
  - Content: $240 ± $60
  - Referral: $280 ± $70
  - Paid Search: $480 ± $100
  - Paid Social: $560 ± $120
  - Partnerships: $750 ± $150
- Enterprise 客户（Business plan）更可能来自 Partnerships 和 Referral
- SMB 客户（Starter plan）更可能来自 Organic 和 Content

### 3. Cohort Retention 分析

- 按季度分 cohort（Q1 2023 → Q4 2024），构建 retention triangle（热力图）
- 计算不同维度的留存曲线：按 plan、按 billing cycle、按获客渠道
- 识别 **关键流失窗口**：Month 1–3（"activation gap"）
- 量化每 1pp 留存改善对 ARR 的 dollar impact

### 4. 渠道健康分类

| 等级 | LTV:CAC 条件 | 含义 |
|------|-------------|------|
| **Scale** | ≥ 5x | 效率已验证，应该加大投入 |
| **Healthy** | 3x – 5x | 运行良好，维持或小幅优化 |
| **Monitor** | 1.5x – 3x | 效率不足，需要 ICP 验证后才能继续投入 |
| **Cut** | < 1.5x | 亏损渠道，应缩减或关停 |

---

## 五、核心发现（Key Findings）

### Finding #1: 表面健康，但 NRR 是隐性炸弹

| 指标 | Orbit 实际值 | 行业 Benchmark | 评价 |
|------|-------------|---------------|------|
| LTV:CAC | 7.3x | Median 3.2x | ✅ 优于 top quartile |
| Payback Period | 7.7 月 | Median 8.8 月 | ✅ 健康 |
| Monthly Churn | 0.82% | Best-in-class < 1.5% | ✅ 良好 |
| **NRR** | **94.2%** | **Good ≥ 100%** | ❌ **低于生存线** |

**解读**：Headline metrics 看起来很好，但 NRR < 100% 意味着现有客户的 revenue base 在持续缩水。每个月大约 $15K 的 revenue 在沉默中流失。这创造了一个"跑步机效应"（treadmill effect）—— 必须不断获取新客户才能维持现状，更不用说增长。

### Finding #2: 渠道效率差异达 3.5x

| 渠道 | CAC | LTV:CAC | Payback | 健康度 |
|------|-----|---------|---------|--------|
| Organic Search | $179 | 13.9x | 3.0 月 | Scale |
| Content | $240 | 10.9x | 3.9 月 | Scale |
| Referral | $277 | 11.2x | 4.0 月 | Scale |
| Paid Search | $480 | 5.5x | 7.4 月 | Healthy |
| Paid Social | $562 | 4.3x | 9.3 月 | Watch |
| Partnerships | $757 | 4.7x | 9.3 月 | Watch |

但 Paid Social + Partnerships 占了 **25% 的客户量**和更高比例的预算。它们的 LTV:CAC 只有 4–5x，而 Organic/Content/Referral 是 11–14x。

### Finding #3: 月付客户是留存黑洞

| Billing Cycle | 12 个月留存率 | Churn Rate |
|---------------|-------------|------------|
| Monthly | 50.8% | 42.7% |
| Annual | 93.1% | 11.3% |
| 2-Year | 96.5% | 2.8% |

年付客户留存率是月付客户的 **近 2 倍**。转化 10% 月付用户到年付，可以减少 blended churn ~3pp，保留约 **$200K ARR/年**。

### Finding #4: 前 3 个月是生死线

每个 cohort 在前 3 个月流失 **18–35%** 的客户。这是 LTV 最大的拖累因素，也是最可行动的改善窗口。M1 留存从 82%（Q1 2023）改善到 88%（Q4 2024），说明产品/onboarding 的改进已经开始见效。

---

## 六、建议 & 行动方案（Recommendations）

### Priority 1: 修复 NRR（从 94% → 100%+）

**策略**：四杠杆扩展收入框架（来自 IdeaPlan/a16z best practice）
1. **Seat Expansion** — 随团队增长增加用户数
2. **Feature Upsell** — 高级功能升级（如 SSO, priority support）
3. **Usage-based Pricing** — 引入使用量计费层级
4. **Segment Upsell** — 向相邻业务部门/用例扩展

**投资**：~$180K/年（1 个 CS lead + 自动化工具）
**预期回报**：NRR 提升到 100% → 年均保留 ~$380K ARR + 估值倍数提升

### Priority 2: 渠道预算重分配

**策略**：把 Paid Social 20% 预算转向 Content + Organic
- 不要完全砍掉 paid，而是减少低效支出，资助 2 个 content hires（~$120K/年）
- Content/SEO 有 **compound effect**：今天发布的内容在 24 个月内持续带来客户；paid 一关就停

**预期回报**：
- Blended CAC 从 $376 降到 ~$310
- LTV:CAC 从 7.3x 提升到 ~9.5x
- 年省 ~$175K

### Priority 3: 推动年付转化

**策略**：在 Month 3 提供 15–20% 年付折扣 + 注册页面 annual-first 定价
- HubSpot、Zoom 等公司都这么做，因为留存 ROI 远超折扣成本

**预期回报**：
- 20% 月付转年付 → churn 从 42.7% 降到 ~30%
- 额外保留 ~$780K ARR/年

### Priority 4: Attribution 基础设施

**策略**：实施 server-side tracking（GTM server container 或 Segment）
- 当前 last-click attribution 通常 **高估 paid 渠道 30–40%**，低估 content/organic
- Deepnote（B2B 分析 SaaS）通过重建 attribution stack，CAC 降低 72%

---

## 七、这个项目的价值 / 面试怎么讲

### 对面试官的核心信号

1. **你理解增长不只是 top-of-funnel**
   - 大多数 analytics 项目只做 A/B test 或 dashboard。这个项目展示了你理解整个增长飞轮：获客 → 激活 → 留存 → 扩展 → 变现

2. **你能做 executive-level communication**
   - 不只是展示数据，而是 "The Problem → So What → Action → Impact"
   - Dashboard 的每个 section 都先解释 business context，再展示数据，最后给建议

3. **你用的是真实的行业框架**
   - a16z growth metrics framework（gross-margin-adjusted CAC）
   - ChartMogul retention benchmarks
   - NRR expansion levers（四杠杆模型）
   - Channel health classification system

4. **你量化了一切**
   - 不说"留存有改善空间"，而是"M1-M3 留存每提升 5pp = $380K ARR/年"
   - 不说"CAC 太高"，而是"Paid Social 的 CAC 是 Organic 的 3.1x，但 LTV 几乎一样"

### 讲述框架（5 分钟版本）

**1 分钟：背景**
"SaaS 获客成本在过去两年涨了 14%。大多数增长团队还在用 blended metrics 做决策，掩盖了渠道级别的效率差异。这个项目建了一套 customer-level unit economics 分析框架来解决这个问题。"

**1 分钟：数据 & 方法**
"我用了 IBM 的公开客户数据（7,043 个客户），模拟了 6 个获客渠道和对应的 fully-loaded CAC。分析分三层：cohort retention、segment-level LTV、channel unit economics。所有 CAC 都是 fully loaded 的，LTV 用 segment churn rate + 36 个月 cap，比常见的公式估算更保守准确。"

**2 分钟：核心发现**
"表面上 Orbit 很健康：7.3x LTV:CAC，7.7 月 payback。但我发现两个隐藏问题：
1. NRR 只有 94.2%，低于 100% 生存线。这意味着现有客户在 shrink，而 NRR 直接影响估值倍数（12-15x vs 5-7x）。
2. 高效渠道（Organic/Content）只占 33% 预算，但效率是 paid 渠道的 3x+。"

**1 分钟：建议 & 量化影响**
"三个优先行动：
1. Fix NRR：部署 expansion playbook，目标 100%+，年增 ~$380K preserved ARR
2. 渠道重分配：20% paid 转 content，CAC 降 $66，年省 $175K
3. 年付推进：M3 折扣，额外保留 $780K ARR
三个动作 stacking 起来，年影响 > $1.3M。"

---

## 八、常见面试问题 & 回答要点

**Q: 为什么用 simulated data 而不是 real acquisition data？**
A: "IBM 数据集只有订阅和流失数据，没有获客渠道。我基于 B2B SaaS 行业 benchmark（a16z/ChartMogul 发布的数据）模拟了渠道分布和 CAC，确保数值在合理范围内（blended CAC $376，行业 median $300–800）。这是很多 SaaS 分析的标准做法——即使在真实公司，渠道 CAC 也常常需要用 attribution model 估算，很少有 perfect data。"

**Q: LTV:CAC 7.3x 是不是太高了？说明什么？**
A: "7.3x 确实高于 median（3.2x）。在真实场景中，这可能意味着两种情况：(1) 公司获客效率确实优秀，或者 (2) 公司 underinvesting in growth——可能有空间花更多去获客。结合 NRR < 100% 来看，我的判断是后者占一部分——应该把省下来的 acquisition budget 投资到 retention 和 expansion。"

**Q: 如果你在真实公司做这个分析，有什么不同？**
A: "三个主要区别：
1. **数据**：会用 Stripe/Chargebee 的实际付款数据 + CRM 的渠道归因 + product analytics（Amplitude/Mixpanel）的行为数据
2. **LTV 模型**：会用 BG/NBD 或 Pareto/NBD 等概率模型来预测 customer lifetime，而不是简单的 1/churn 公式
3. **归因**：会用 multi-touch attribution model（data-driven 或 Shapley value），而不是 last-click
但核心框架——cohort retention → segmented LTV → channel unit economics → budget optimization——是完全一样的。"

**Q: NRR 94.2% 你会怎么具体提升？**
A: "四个杠杆：
1. **Seat expansion**：产品内设置协作场景，团队增长自然带来更多 seats
2. **Feature upsell**：数据显示有 3+ add-ons 的客户 churn 低 50%。用 in-app 推荐在 Day 7/14/30 推动功能采用
3. **Usage-based tier**：引入基于用量的定价层级（比如 API calls、storage），让 power users 自然升级
4. **Proactive CS**：对 high-MRR 但低 engagement 的客户做定向 outreach，防止 silent churn
目标是 6 个月内 NRR 从 94% 到 100%+。"

**Q: Dashboard 是怎么搭建的？**
A: "纯前端方案：React + Recharts + Tailwind CSS，通过 Babel Standalone 在浏览器内编译 JSX。不需要 build 工具或 Node.js 环境。Python 脚本处理数据并输出 JSON，dashboard 直接读取静态数据渲染。这个架构的好处是：可以直接部署到 GitHub Pages，零运维成本。"

---

## 九、术语速查表

| 术语 | 解释 | 为什么重要 |
|------|------|-----------|
| **ARR** | Annual Recurring Revenue，年经常性收入 | SaaS 公司最核心的收入指标 |
| **MRR** | Monthly Recurring Revenue，月经常性收入 | ARR 的月度版本，跟踪月度变化更灵敏 |
| **ARPU** | Average Revenue Per User，每用户平均收入 | 衡量单个客户的价值密度 |
| **LTV** | Lifetime Value，客户生命周期价值 | 一个客户在整个关系期内带来的总收入 |
| **CAC** | Customer Acquisition Cost，客户获取成本 | 获取一个新客户的全部成本 |
| **LTV:CAC** | 生命周期价值与获客成本的比值 | <1x=亏损，3x=健康，>5x=高效或可能投入不足 |
| **Payback Period** | CAC 回本时间 | 多久能收回获客成本。<12 月为好 |
| **NRR** | Net Revenue Retention，净收入留存率 | 去年的客户今年贡献了多少收入。>100%=自然增长 |
| **GRR** | Gross Revenue Retention，毛收入留存率 | 不算 expansion，纯看保留。>90% 为好 |
| **Churn Rate** | 流失率 | 单位时间内失去的客户/收入比例 |
| **Cohort** | 同期群 | 同一时间段注册的一组客户 |
| **Quick Ratio** | SaaS 健康度指标 | (New MRR + Expansion) / (Churned + Contracted)。>4 为好 |
| **Burn Multiple** | 烧钱效率 | Net Burn / Net New ARR。<1 为好 |
| **Rule of 40** | 增长率 + 利润率 ≥ 40% | SaaS 健康度的综合指标 |
| **Fully Loaded CAC** | 包含所有成本的 CAC | 不只是广告费，还有薪资、工具、内容制作等 |
