"""
Composite preview: 2 panels, content-driven height.
Left: Retention Problem — Right: CAC Problem
"""
from PIL import Image, ImageDraw, ImageFont
import os

BG = "#0F1923"
SURFACE = "#15202E"
BORDER = "#233044"
TEXT = "#E8EDF2"
TEXT_SEC = "#9BAFC4"
TEXT_MUTED = "#6B839E"
TEXT_DIM = "#4E6680"
ACCENT = "#5AAFCA"
TEAL = "#4ECDB4"
GOLD = "#D4A86A"
LAVENDER = "#9B8EC4"
COPPER = "#C48E6A"

W = 2400
PAD = 36
GAP = 28

def hx(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

fp_b = ["/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/Library/Fonts/Arial Bold.ttf"]
fp_r = ["/System/Library/Fonts/Supplemental/Arial.ttf", "/Library/Fonts/Arial.ttf"]
def lf(sz, bold=True):
    for fp in (fp_b if bold else fp_r):
        if os.path.exists(fp):
            try: return ImageFont.truetype(fp, sz)
            except: pass
    return ImageFont.load_default()

f_hero      = lf(52)
f_hero_sub  = lf(26, False)
f_section   = lf(28)
f_ctx       = lf(18, False)
f_ctx_b     = lf(18)
f_kpi_val   = lf(44)
f_kpi_lbl   = lf(15, False)
f_sub_title = lf(22)
f_hm_hdr    = lf(14, False)
f_hm_cell   = lf(14, False)
f_hm_cohort = lf(14, False)
f_ch_hdr    = lf(15, False)
f_ch_row    = lf(17, False)
f_ch_row_b  = lf(17)
f_badge     = lf(13)
f_act_title = lf(14)
f_act       = lf(16, False)
f_act_b     = lf(16)
f_bar_lbl   = lf(15, False)
f_bar_val   = lf(14)
f_insight   = lf(17)
f_bottom    = lf(17, False)

COL_W = (W - PAD*2 - GAP) // 2

# ── First pass: compute how tall each panel's content is ──

# Left panel content height
L_HEIGHTS = []
L_HEIGHTS.append(18 + 28 + 10)             # top pad + section title + gap
L_HEIGHTS.append(3 * 26 + 14)              # 3 bullets + gap
L_HEIGHTS.append(90 + 16)                  # KPI cards + gap
L_HEIGHTS.append(28 + 4)                   # heatmap title + gap
L_HEIGHTS.append(20)                       # header row
L_HEIGHTS.append(8 * 38 + 8)              # 8 heatmap rows + gap
L_HEIGHTS.append(12)                       # spacer before action
L_HEIGHTS.append(110)                      # action box
L_HEIGHTS.append(12)                       # bottom pad
left_h = sum(L_HEIGHTS)

# Right panel content height
R_HEIGHTS = []
R_HEIGHTS.append(18 + 28 + 10)             # top pad + section title + gap
R_HEIGHTS.append(3 * 26 + 14)              # 3 bullets + gap
R_HEIGHTS.append(22 + 8)                   # table header + gap
R_HEIGHTS.append(6 * 32 + 14)              # 6 rows + gap
R_HEIGHTS.append(28 + 4)                   # efficiency title + gap
R_HEIGHTS.append(3 * 48 + 4)              # 3 bars + gap
R_HEIGHTS.append(24 + 12)                  # insight line + spacer
R_HEIGHTS.append(110)                      # action box
R_HEIGHTS.append(12)                       # bottom pad
right_h = sum(R_HEIGHTS)

panel_h = max(left_h, right_h)
hero_h = 95
BOTTOM_BAR = 38
H = hero_h + PAD + panel_h + PAD + BOTTOM_BAR

print(f"Left content: {left_h}px, Right content: {right_h}px, Panel: {panel_h}px, Image: {W}x{H}")

# ── Now draw ──
img = Image.new("RGB", (W, H), hx(BG))
draw = ImageDraw.Draw(img)

def tx(x, y, s, f=f_ctx, c=TEXT):
    draw.text((x, y), s, fill=hx(c), font=f)

def bx(x, y, w, h, fill=SURFACE, bd=BORDER, r=10):
    draw.rounded_rectangle([(x, y), (x+w, y+h)], radius=r, fill=hx(fill), outline=hx(bd), width=1)

# ─── Hero ───
draw.rectangle([(0, 0), (W, hero_h)], fill=hx(SURFACE))
draw.line([(0, hero_h), (W, hero_h)], fill=hx(BORDER), width=1)
tx(PAD, 20, "SaaS Unit Economics — Where Is the Growth Leaking?", f_hero, TEXT)
tx(PAD, 68, "Two problems hiding behind a healthy 7.3x LTV:CAC ratio", f_hero_sub, TEXT_MUTED)
draw.rectangle([(PAD, hero_h), (PAD+100, hero_h+3)], fill=hx(TEAL))
draw.rectangle([(PAD+110, hero_h), (PAD+210, hero_h+3)], fill=hx(GOLD))

top = hero_h + PAD

# ═══════════════════════════════════════════════════
# LEFT: THE RETENTION PROBLEM
# ═══════════════════════════════════════════════════
lx = PAD
ly = top
bx(lx, ly, COL_W, panel_h)

y = ly + 18
tx(lx+24, y, "THE RETENTION PROBLEM", f_section, GOLD)
y += 38

bullets_l = [
    ("5% monthly churn", " silently kills 46% of your customer base per year"),
    ("NRR below 100%", " = your revenue base is a depreciating asset"),
    ("NRR 94.2%", " → $15K/month in silent revenue erosion"),
]
for bp, rest in bullets_l:
    tx(lx+28, y, "▸", f_ctx_b, GOLD)
    tx(lx+46, y, bp, f_ctx_b, TEXT)
    bw = draw.textbbox((0,0), bp, font=f_ctx_b)[2]
    tx(lx+46+bw, y, rest, f_ctx, TEXT_SEC)
    y += 26
y += 14

# KPI cards
kpis = [
    ("18–35%", "churn in M1–M3", COPPER),
    ("82% → 88%", "M1 retention improving", TEAL),
    ("$380K", "ARR/yr from 5pp fix", GOLD),
]
kw = (COL_W - 76) // 3
for i, (val, lbl, clr) in enumerate(kpis):
    kx = lx + 24 + i*(kw+12)
    bx(kx, y, kw, 90, fill="#1A2940", bd=BORDER)
    tx(kx+14, y+10, val, f_kpi_val, clr)
    tx(kx+14, y+60, lbl, f_kpi_lbl, TEXT_MUTED)
y += 106

# Heatmap
tx(lx+24, y, "Cohort Retention Heatmap", f_sub_title, ACCENT)
y += 32

heatmap = [
    ("Q1'23", [100,82,72,65,60,56,52,50,48,46,44,43,42]),
    ("Q2'23", [100,80,70,63,58,55,51,49,47,45,43,42,41]),
    ("Q3'23", [100,83,73,67,62,58,55,52,50,48,47,None,None]),
    ("Q4'23", [100,85,76,69,64,61,57,55,53,None,None,None,None]),
    ("Q1'24", [100,84,75,68,63,59,56,None,None,None,None,None,None]),
    ("Q2'24", [100,86,77,71,66,None,None,None,None,None,None,None,None]),
    ("Q3'24", [100,87,78,None,None,None,None,None,None,None,None,None,None]),
    ("Q4'24", [100,88,None,None,None,None,None,None,None,None,None,None,None]),
]
ms = ["M0","M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12"]
cw_cell = (COL_W - 108) // 13
ch_cell = 38

for j, m in enumerate(ms):
    cx = lx+80+j*cw_cell
    bb = draw.textbbox((0,0), m, font=f_hm_hdr)
    tx(cx+(cw_cell-bb[2]+bb[0])//2, y, m, f_hm_hdr, TEXT_MUTED)
y += 20

for i, (cohort, vals) in enumerate(heatmap):
    ry = y + i*ch_cell
    tx(lx+24, ry+ch_cell//2-7, cohort, f_hm_cohort, TEXT_SEC)
    for j, v in enumerate(vals):
        cx = lx+80+j*cw_cell
        if v is None:
            draw.rounded_rectangle([(cx,ry),(cx+cw_cell-3,ry+ch_cell-3)], radius=4, fill=hx("#1A2940"))
        else:
            if v>=80: r,g,b=78,205,180
            elif v>=60: t=(v-60)/20; r,g,b=int(90+(78-90)*t),int(175+(205-175)*t),int(202+(180-202)*t)
            elif v>=45: t=(v-45)/15; r,g,b=int(212+(90-212)*t),int(168+(175-168)*t),int(106+(202-106)*t)
            else: r,g,b=212,168,106
            a=0.65
            draw.rounded_rectangle([(cx,ry),(cx+cw_cell-3,ry+ch_cell-3)], radius=4,
                                   fill=(int(r*a+15*(1-a)),int(g*a+32*(1-a)),int(b*a+46*(1-a))))
            vt=str(v); bb=draw.textbbox((0,0),vt,font=f_hm_cell)
            draw.text((cx+(cw_cell-3-bb[2]+bb[0])//2,ry+ch_cell//2-7),vt,
                      fill=(255,255,255) if v>=55 else hx(TEXT), font=f_hm_cell)
y += len(heatmap)*ch_cell + 20

# Action box — right after content
bx(lx+18, y, COL_W-36, 110, fill="#0F1923", bd="#4ECDB430")
tx(lx+34, y+10, "ACTION PLAN", f_act_title, TEAL)
for ai, (label, desc, color) in enumerate([
    ("Immediate:", " Build 14-day onboarding health score → intervene at risk signals", TEAL),
    ("Month 2:", " Launch churn prediction model (adds 10–15% to LTV per industry data)", ACCENT),
    ("Month 3:", " Target NRR 94%→100%.  Each 1pp M1 improvement = ~$56K ARR/yr", GOLD),
]):
    ay = y + 34 + ai*26
    tx(lx+34, ay, label, f_act_b, color)
    lw = draw.textbbox((0,0), label, font=f_act_b)[2]
    tx(lx+34+lw, ay, desc, f_act, TEXT_SEC)


# ═══════════════════════════════════════════════════
# RIGHT: THE CAC PROBLEM
# ═══════════════════════════════════════════════════
rx = PAD + COL_W + GAP
ry = top
bx(rx, ry, COL_W, panel_h)

y = ry + 18
tx(rx+24, y, "THE CAC PROBLEM", f_section, COPPER)
y += 38

for bp, rest in [
    ("CAC up 40–60%", " since 2021. Median SaaS: $2 to acquire $1 ARR"),
    ("55% of budget", " → channels delivering 3x less efficiency"),
    ("Last-click attribution", " overvalues paid channels by 30–40%"),
]:
    tx(rx+28, y, "▸", f_ctx_b, COPPER)
    tx(rx+46, y, bp, f_ctx_b, TEXT)
    bw = draw.textbbox((0,0), bp, font=f_ctx_b)[2]
    tx(rx+46+bw, y, rest, f_ctx, TEXT_SEC)
    y += 26
y += 14

# Channel table
hdrs = ["Channel", "CAC", "LTV:CAC", "Payback", "Health"]
col_pos = [0, 200, 300, 400, 490]
for ci, h in enumerate(hdrs):
    tx(rx+24+col_pos[ci], y, h, f_ch_hdr, TEXT_MUTED)
y += 22
draw.line([(rx+24, y), (rx+COL_W-24, y)], fill=hx(BORDER), width=1)
y += 8

channels = [
    ("Organic Search", "$179", "13.9x", "3.0 mo", "Scale", TEAL),
    ("Content", "$240", "10.9x", "3.9 mo", "Scale", TEAL),
    ("Referral", "$277", "11.2x", "4.0 mo", "Scale", TEAL),
    ("Paid Search", "$480", "5.5x", "7.4 mo", "Healthy", ACCENT),
    ("Paid Social", "$562", "4.3x", "9.3 mo", "Watch", GOLD),
    ("Partnerships", "$757", "4.7x", "9.3 mo", "Watch", GOLD),
]
row_h = 32
for i, (name, cac, ratio, payback, health, color) in enumerate(channels):
    draw.ellipse([(rx+24, y+7), (rx+34, y+17)], fill=hx(color))
    tx(rx+42, y+2, name, f_ch_row, TEXT)
    tx(rx+24+col_pos[1], y+2, cac, f_ch_row, TEXT_SEC)
    rv = float(ratio.replace("x",""))
    rc = TEAL if rv>=5 else (ACCENT if rv>=3 else GOLD)
    tx(rx+24+col_pos[2], y+2, ratio, f_ch_row_b, rc)
    tx(rx+24+col_pos[3], y+2, payback, f_ch_row, TEXT_MUTED)
    bc = {"Scale":TEAL,"Healthy":ACCENT,"Watch":GOLD}[health]
    bw2 = draw.textbbox((0,0),health,font=f_badge)[2]
    bbx = rx+24+col_pos[4]
    draw.rounded_rectangle([(bbx,y+1),(bbx+bw2+14,y+19)], radius=8, fill=hx(bc+"20"))
    tx(bbx+7, y+3, health, f_badge, bc)
    y += row_h
    if i < len(channels)-1:
        draw.line([(rx+24, y-4), (rx+COL_W-24, y-4)], fill=hx(BORDER), width=1)
y += 14

# Efficiency gap
tx(rx+24, y, "Channel Efficiency Gap", f_sub_title, ACCENT)
y += 32
bar_full = COL_W - 160
for label, val, color, disp in [
    ("Organic / Content / Referral", 11.9, TEAL, "11–14x"),
    ("Paid Search", 5.5, ACCENT, "5.5x"),
    ("Paid Social / Partnerships", 4.5, GOLD, "4.3–4.7x"),
]:
    tx(rx+24, y, label, f_bar_lbl, TEXT_SEC)
    y += 20
    bw3 = int(bar_full * val / 14)
    draw.rounded_rectangle([(rx+24,y),(rx+24+bar_full,y+18)], radius=5, fill=hx("#1A2940"))
    draw.rounded_rectangle([(rx+24,y),(rx+24+bw3,y+18)], radius=5, fill=hx(color))
    tx(rx+34+bw3, y+1, disp, f_bar_val, color)
    y += 28

tx(rx+24, y, "3.5x efficiency gap between best and worst channels", f_insight, COPPER)
y += 32

# Action box — right after content
bx(rx+18, y, COL_W-36, 110, fill="#0F1923", bd="#C48E6A30")
tx(rx+34, y+10, "RECOMMENDATION", f_act_title, COPPER)
for ai, (label, desc, color) in enumerate([
    ("Rebalance:", " Shift 20% Paid Social → Content/Organic (compounds 24mo+)", COPPER),
    ("Fix attribution:", " Server-side tracking reveals true multi-touch CAC", ACCENT),
    ("Impact:", " CAC $376→$310  |  LTV:CAC 7.3x→9.5x  |  Save $175K/yr", TEAL),
]):
    ay = y + 34 + ai*26
    tx(rx+34, ay, label, f_act_b, color)
    lw = draw.textbbox((0,0), label, font=f_act_b)[2]
    tx(rx+34+lw, ay, desc, f_act, TEXT_SEC)

# ─── Bottom strip ───
sy = H - BOTTOM_BAR
draw.line([(0, sy), (W, sy)], fill=hx(BORDER), width=1)
tx(PAD, sy+10, "Freena Wang  ·  freena22.github.io/ltv-cac-modeling  ·  Part 3 of Growth Analytics Series", f_bottom, TEXT_DIM)

# ─── Save ───
out = os.path.join(os.path.dirname(__file__), "docs", "ltv-preview-composite.png")
img.save(out, "PNG", optimize=True)
print(f"Saved: {out} — {W}x{H} ({os.path.getsize(out)/1024:.0f} KB)")
out2 = os.path.join(os.path.dirname(__file__), "docs", "og-card.png")
img.resize((1200, int(H * 1200 / W)), Image.LANCZOS).save(out2, "PNG", optimize=True)
print(f"OG: {out2} ({os.path.getsize(out2)/1024:.0f} KB)")
