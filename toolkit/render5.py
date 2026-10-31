import render3 as R3
from render3 import *
import render
import subprocess as _sp

OFF5 = 0.15
VE5 = 58.62
VO5 = 58.85
V_END5 = VO5 + 3.2
DUR5 = V_END5 + OFF5
GREYL = '#E2A13A'; CO2C = '#B3121D'; MWSTC = '#FF6B74'; ENC = RED; FUEL = GREYL

SEGS5 = [
 (0.0, 3.76, "Von jedem Liter Benzin geht fast ein Euro an den Staat."),
 (4.21, 8.94, "Ende Oktober kostet ein Liter Super E10 im Schnitt rund 2,10 Euro."),
 (9.35, 11.38, "Der größte Block ist die Energiesteuer."),
 (11.79, 17.00, "Normalerweise sind das 65 Cent pro Liter, egal wie teuer das Benzin gerade ist."),
 (17.34, 21.76, "Bis Ende Dezember ist sie vorübergehend gesenkt, auf rund 51 Cent."),
 (22.14, 24.26, "Dazu kommt der CO2-Preis."),
 (24.53, 27.98, "Er macht derzeit etwa 13 bis 16 Cent pro Liter aus."),
 (28.36, 29.89, "Und dann die Mehrwertsteuer."),
 (30.20, 35.55, "Sie wird auf den ganzen Preis erhoben, also auch auf die Energiesteuer und den CO2-Preis."),
 (35.99, 38.28, "Sie zahlen damit Steuer auf die Steuer."),
 (38.62, 41.60, "Bei 2,10 Euro sind das rund 34 Cent."),
 (41.91, 44.47, "Zusammen sind das fast ein Euro pro Liter,"),
 (44.72, 46.26, "knapp die Hälfte des Preises."),
 (46.60, 51.05, "Der Rest verteilt sich auf Rohöl, Raffinerie, Transport und die Tankstelle."),
 (51.42, 53.92, "Ab Januar gilt wieder die volle Energiesteuer."),
 (54.22, 58.62, "Dann wird der Liter um bis zu 17 Cent teurer, wenn sich sonst nichts ändert."),
]
SP5 = {'2,10': 'zweieurozehn', 'E10': 'eezehn', '65': 'fünfundsechzig', '51': 'einundfünfzig', '13': 'dreizehn', '16': 'sechzehn',
       '34': 'vierunddreißig', '17': 'siebzehn', 'CO2-Preis': 'zeeohzweipreis', 'CO2-Preis.': 'zeeohzweipreis'}
_raw = _sp.run(['ffmpeg', '-loglevel', 'error', '-i', 'up/voice5.mp3', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
_au = np.frombuffer(_raw, dtype=np.float32); _env = np.sqrt(np.convolve(_au ** 2, np.ones(400) / 400, 'same'))[::160]
def _snap(t, a, b):
    lo = max(a + .08, t - .13); hi = min(b - .08, t + .13)
    if hi <= lo: return t
    i0, i1 = int(lo * 100), int(hi * 100)
    if i1 <= i0 or i1 >= len(_env): return t
    return (i0 + int(np.argmin(_env[i0:i1]))) / 100
WORDS5 = []
for a, b, s in SEGS5:
    ws = s.split(); wt = [len(SP5.get(w.strip('.,:?'), w.strip('.,:?'))) + 2 + (3 if w[-1] in ',:' else 0) for w in ws]
    tot = sum(wt); x = a; st0 = len(WORDS5)
    for w, k in zip(ws, wt):
        d = (b - a) * k / tot; WORDS5.append((x, x + d, w)); x += d
    for j in range(len(ws) - 1):
        i_ = st0 + j; t_ = _snap(WORDS5[i_][1], a, b)
        WORDS5[i_] = (WORDS5[i_][0], t_, WORDS5[i_][2]); WORDS5[i_ + 1] = (t_, WORDS5[i_ + 1][1], WORDS5[i_ + 1][2])
def wt5(word, after=0):
    for a, b, w in WORDS5:
        if a >= after and w.strip('.,:?') == word: return a
    raise KeyError(word)
CH5 = []
for a, b, s in SEGS5:
    ws = [w for w in WORDS5 if w[0] >= a - 1e-6 and w[1] <= b + 1e-6]; cur = []
    for w in ws:
        if cur and (len(cur) >= 4 or len(' '.join(x[2] for x in cur + [w])) > 22): CH5.append(cur); cur = []
        cur.append(w)
    if cur: CH5.append(cur)
render.CH = []
for i, c in enumerate(CH5):
    nxt = CH5[i + 1][0][0] if i + 1 < len(CH5) else 99
    render.CH.append((c[0][0], min(nxt - .06, c[-1][1] + .35), c))

T_STAAT = wt5('fast'); T_210 = wt5('2,10'); T_65 = wt5('65'); T_EGAL = wt5('egal'); T_51 = wt5('51')
T_13 = wt5('13'); T_34 = wt5('34'); T_EURO1 = wt5('Euro', 41); T_HALF = wt5('Hälfte'); T_JAN = wt5('Januar'); T_17 = wt5('17')
T_ROH = wt5('Rohöl'); T_RAF = wt5('Raffinerie'); T_TRA = wt5('Transport'); T_TANK = wt5('Tankstelle')
ACC5 = [T_STAAT, T_210, T_65, T_51, T_34, T_EURO1, T_17]

# ---------------------------------------------------------------- geometry
CX, CW, BOT, KCT = 560, 260, 1215, 3.05        # liter column: centre x, width, bottom y, px per cent
ERY = 30
def yct(c): return BOT - c * KCT

def label_tag(cv, x, y, s, a, align='l', sz=26, hl=False):
    if a <= .01: return
    f = F(sz); w = f.measureText(s) + 26; h = sz * 1.6
    x0 = x if align == 'l' else (x - w if align == 'r' else x - w / 2)
    r = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x0, y - h / 2, w, h), h / 2, h / 2)
    cv.drawRRect(r, P(RED if hl else BLACK, .95 * a)); cv.drawRRect(r, P(RED, a, stroke=2.5))
    cv.drawString(s, x0 + 13, y + sz * .36, f, P(WHITE, a))

def fmt_eur(c): return f'{c / 100:.2f}'.replace('.', ',')

# ---------------------------------------------------------------- state of the liter
EVENTS_SLOSH = [0.4, 2.4, 9.5, 17.3, 22.2, 28.4, 51.5]
def column_state(v):
    """bands (c0, c1, colour, ink progress, seed), total price in cent, january progress"""
    if v < 4.2:
        total = eio((v - .35) / 2.0) * 211
        ph = eio((v - T_STAAT + .1) / 1.0) * (1 - eio((v - 3.9) / .5))
        return [(0, min(99, total), RED, ph, 1)], total, 0
    wig = 0
    if T_EGAL - .2 < v < 17.4: wig = 28 * math.sin((v - T_EGAL + .2) * 4.2) * cl((v - T_EGAL + .2) / .4) * cl((17.4 - v) / .4)
    jan = eio((v - T_JAN + .1) / 1.2) if v > T_JAN - .1 else 0
    en1 = 65.45
    if v > T_51 - .3: en1 = lerp(65.45, 51.41, eio((v - T_51 + .3) / 1.0))
    en1 = lerp(en1, 65.45, jan)
    co, mw = 14.4, 33.7 + 2.67 * jan
    total = 211 + wig + 16.7 * jan
    B = [(0, en1, ENC, eio((v - 9.5) / 1.1), 2),
         (en1, en1 + co, CO2C, eio((v - 22.2) / 1.1), 3),
         (en1 + co, en1 + co + mw, MWSTC, eio((v - 28.4) / 1.1), 4)]
    return B, total, jan

def _band_path(c0, c1):
    x0, x1 = CX - CW / 2, CX + CW / 2; ya, yb = yct(c1), yct(c0)
    p = skia.Path(); p.moveTo(x0, ya); p.arcTo(skia.Rect.MakeLTRB(x0, ya - ERY, x1, ya + ERY), 180, -180, False)
    p.lineTo(x1, yb); p.arcTo(skia.Rect.MakeLTRB(x0, yb - ERY, x1, yb + ERY), 0, 180, False); p.close(); return p

def _shade_paint(colr, a=1):
    x0, x1 = CX - CW / 2, CX + CW / 2
    g = skia.GradientShader.MakeLinear([skia.Point(x0, 0), skia.Point(x1, 0)], [col(shade(colr, .62), a), col(shade(colr, 1.18), a), col(shade(colr, .9), a), col(shade(colr, .5), a)], [0, .32, .7, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(g); return p

def _blob(cx, cy, r, v, seed):
    p = skia.Path()
    for i in range(49):
        th = i / 48 * 2 * math.pi
        rr = r * (1 + .16 * math.sin(5 * th + v * 1.7 + seed) + .09 * math.sin(9 * th - v * 2.3 + seed * 2))
        x, y = cx + rr * math.cos(th), cy + rr * math.sin(th) * .8
        p.moveTo(x, y) if i == 0 else p.lineTo(x, y)
    p.close(); return p

def slosh(v):
    return 2 + 7 * max([math.exp(-(v - e) * 2.2) for e in EVENTS_SLOSH if v >= e] + [0])

def draw_column(cv, v, a):
    if a <= .01: return
    B, total, jan = column_state(v)
    x0, x1 = CX - CW / 2, CX + CW / 2
    cv.saveLayerAlpha(None, int(a * 255))
    # back light + floor reflection
    gl = skia.GradientShader.MakeRadial(skia.Point(CX, yct(120)), 420, [col(FUEL, .16), col(FUEL, 0)], [0, 1])
    pp = skia.Paint(AntiAlias=True); pp.setShader(gl); cv.drawCircle(CX, yct(120), 420, pp)
    for k in range(9):
        an = math.radians(-90 + (k - 4) * 14 + 6 * math.sin(v * .4 + k))
        ray = skia.Path(); ray.moveTo(CX, yct(120)); ray.lineTo(CX + math.cos(an - .05) * 700, yct(120) + math.sin(an - .05) * 700); ray.lineTo(CX + math.cos(an + .05) * 700, yct(120) + math.sin(an + .05) * 700); ray.close()
        rg = skia.GradientShader.MakeRadial(skia.Point(CX, yct(120)), 700, [col(FUEL, .07), col(FUEL, 0)], [0, 1]); rp = skia.Paint(AntiAlias=True); rp.setShader(rg); cv.drawPath(ray, rp)
    if total > 1:
        cv.drawOval(skia.Rect.MakeLTRB(x0 - 10, BOT + 10, x1 + 10, BOT + 70), P(FUEL, .14, blur=22))
    cv.drawOval(skia.Rect.MakeLTRB(x0 - 40, BOT - 8, x1 + 40, BOT + 50), P('#000000', .55, blur=18))
    cv.drawOval(skia.Rect.MakeLTRB(x0, yct(230) - ERY, x1, yct(230) + ERY), P(WHITE, .05))
    cv.drawRect(skia.Rect.MakeLTRB(x0, yct(230), x1, BOT), P(WHITE, .035))
    if total > .5:
        body = _band_path(0, total)
        cv.drawPath(body, _shade_paint(FUEL))
        cv.save(); cv.clipPath(body, doAntiAlias=True)
        for c0, c1, colr, p, seed in B:
            if c1 - c0 < .2 or p <= 0: continue
            bp = _band_path(c0, c1)
            if p >= .999: cv.drawPath(bp, _shade_paint(colr)); continue
            cv.save(); cv.clipPath(bp, doAntiAlias=True)
            sx = CX + 40 * math.sin(seed * 2.1); sy = (yct(c0) + yct(c1)) / 2
            r = p * 1.25 * math.hypot(CW, yct(c0) - yct(c1) + 2 * ERY)
            cv.clipPath(_blob(sx, sy, r, v, seed), doAntiAlias=True); cv.drawPath(bp, _shade_paint(colr)); cv.restore()
            cv.save(); cv.clipPath(bp, doAntiAlias=True)   # ink tendrils
            rnd = random.Random(seed * 13)
            for i in range(7):
                an = rnd.uniform(0, 2 * math.pi); L = r * rnd.uniform(1.0, 1.45)
                tp = skia.Path(); tp.moveTo(sx + math.cos(an) * r * .6, sy + math.sin(an) * r * .5)
                tp.quadTo(sx + math.cos(an + .5) * L * .9, sy + math.sin(an + .5) * L * .7, sx + math.cos(an + .2) * L, sy + math.sin(an + .2) * L * .8)
                cv.drawPath(tp, P(colr, .55 * (1 - p), stroke=5 * (1 - p) + 1))
            cv.restore()
        # band boundaries
        for c0, c1, colr, p, seed in B:
            if p > .5 and c0 > .5 and c1 - c0 > .2:
                arc = skia.Path(); arc.addArc(skia.Rect.MakeLTRB(x0, yct(c0) - ERY, x1, yct(c0) + ERY), 0, 180); cv.drawPath(arc, P(WHITE, .22 * p, stroke=2))
        # caustics
        for k in range(6):
            ph = (v * .18 + k / 6) % 1; yy = lerp(BOT + 40, yct(total) - 40, ph)
            cp = skia.Path(); cp.moveTo(x0, yy)
            for j in range(1, 9): cp.lineTo(x0 + j * CW / 8, yy - 18 * math.sin(j * 1.3 + v * 2 + k) - j * 6)
            cv.drawPath(cp, P(WHITE, .07, stroke=3))
        # bubbles
        rnd = random.Random(5); ys = yct(total)
        for i in range(22):
            bx = rnd.uniform(x0 + 18, x1 - 18); sp = rnd.uniform(40, 120); ph = rnd.random(); rr = rnd.uniform(2, 6)
            yy = BOT - ((v * sp + ph * 900) % max(1, (BOT - ys)))
            if yy > ys + 12:
                xx = bx + 5 * math.sin(v * 2 + i); cv.drawCircle(xx, yy, rr, P(WHITE, .22, stroke=1.6)); cv.drawCircle(xx - rr * .35, yy - rr * .35, rr * .3, P(WHITE, .5))
        cv.restore()
        # wavy surface
        ys = yct(total); A = slosh(v)
        topc = FUEL
        for c0, c1, colr, p, seed in B:
            if c1 >= total - .5 and p > .5: topc = colr
        sp_ = skia.Path()
        for i in range(61):
            th = i / 60 * 2 * math.pi; xx = CX + CW / 2 * math.cos(th); tap = abs(math.sin(th)) ** 1.5; yy = ys + ERY * math.sin(th) + tap * (A * .45 * math.sin(2 * math.cos(th) * 2.4 + v * 3.1) + A * .25 * math.sin(3 * math.cos(th) * 2.4 - v * 4.3))
            sp_.moveTo(xx, yy) if i == 0 else sp_.lineTo(xx, yy)
        sp_.close()
        sg = skia.GradientShader.MakeRadial(skia.Point(CX - 40, ys - 8), CW * .7, [col(shade(topc, 1.55)), col(shade(topc, 1.2)), col(shade(topc, .95))], [0, .5, 1])
        spp = skia.Paint(AntiAlias=True); spp.setShader(sg); cv.drawPath(sp_, spp)
        cv.drawPath(sp_, P(WHITE, .35, stroke=2))
        for k in range(3):   # vapour
            ph = (v * .35 + k / 3) % 1
            vp = skia.Path(); bx = CX - 60 + k * 60; vp.moveTo(bx, ys - 10)
            vp.cubicTo(bx + 30 * math.sin(v + k), ys - 50 * ph - 20, bx - 30 * math.sin(v * 1.3 + k), ys - 90 * ph - 30, bx + 10 * math.sin(v * .7 + k), ys - 130 * ph - 40)
            cv.drawPath(vp, P('#C9CDD4', .10 * (1 - ph), stroke=6, blur=3))
    # glass front
    cv.drawLine(x0, yct(230), x0, BOT, P(WHITE, .35, stroke=3)); cv.drawLine(x1, yct(230), x1, BOT, P(WHITE, .35, stroke=3))
    arcb = skia.Path(); arcb.addArc(skia.Rect.MakeLTRB(x0, BOT - ERY, x1, BOT + ERY), 0, 180); cv.drawPath(arcb, P(WHITE, .35, stroke=3))
    cv.drawOval(skia.Rect.MakeLTRB(x0, yct(230) - ERY, x1, yct(230) + ERY), P(WHITE, .3, stroke=3))
    g2 = skia.GradientShader.MakeLinear([skia.Point(x0, 0), skia.Point(x1, 0)], [col(WHITE, 0), col(WHITE, .16), col(WHITE, 0), col(WHITE, 0), col(WHITE, .09)], [0, .16, .28, .82, .93])
    p2 = skia.Paint(AntiAlias=True); p2.setShader(g2); cv.drawRect(skia.Rect.MakeLTRB(x0, yct(230), x1, BOT), p2)
    sw = (v * .12) % 1.6 - .3
    if 0 < sw < 1:
        gx = lerp(x0 - 80, x1 + 80, sw)
        g3 = skia.GradientShader.MakeLinear([skia.Point(gx - 40, 0), skia.Point(gx + 40, 0)], [col(WHITE, 0), col(WHITE, .13), col(WHITE, 0)], [0, .5, 1])
        p3 = skia.Paint(AntiAlias=True); p3.setShader(g3); cv.save(); cv.clipRect(skia.Rect.MakeLTRB(x0, yct(230), x1, BOT)); cv.drawRect(skia.Rect.MakeLTRB(x0, yct(230), x1, BOT), p3); cv.restore()
    cv.restore()

def ruler(cv, v, a):
    if a <= .01: return
    x = CX - CW / 2 - 34
    cv.drawLine(x, BOT, x, yct(230), P('#8A8E97', .6 * a, stroke=2))
    for c in range(0, 231, 10):
        L = 18 if c % 50 == 0 else 9
        cv.drawLine(x, yct(c), x - L, yct(c), P('#8A8E97', .7 * a, stroke=2))
        if c % 50 == 0 and c > 0: text(cv, fmt_eur(c) + ' €', x - 26, yct(c) + 9, 24, '#B8BCC4', a, 'r')

def bracket(cv, c0, c1, x, a, label, side=1, hl=True, sz=28):
    if a <= .01: return
    ya, yb = yct(c1), yct(c0); xm = x + side * 16
    pth = skia.Path(); pth.moveTo(x, ya); pth.lineTo(xm, ya); pth.lineTo(xm, yb); pth.lineTo(x, yb)
    cv.drawPath(pth, P(RED, a, stroke=4)); cv.drawLine(xm, (ya + yb) / 2, xm + side * 18, (ya + yb) / 2, P(RED, a, stroke=4))
    if label: label_tag(cv, xm + side * (24 + 34 * (1 - a)), (ya + yb) / 2, label, a, 'l' if side > 0 else 'r', sz, hl)

# ---------------------------------------------------------------- pump
def pump(cv, v, a, price_ct, liters, hose, flip=None, newp=None):
    if a <= .01: return
    cv.saveLayerAlpha(None, int(a * 255))
    x0, x1, y0, y1 = 70, 300, 590, 1215; d = 34
    cv.drawOval(skia.Rect.MakeLTRB(x0 - 20, y1 - 12, x1 + d + 30, y1 + 30), P('#000000', .55, blur=16))
    side = skia.Path(); side.moveTo(x1, y0); side.lineTo(x1 + d, y0 - 22); side.lineTo(x1 + d, y1 - 22); side.lineTo(x1, y1); side.close()
    cv.drawPath(side, P('#1B1D22'))
    topf = skia.Path(); topf.moveTo(x0, y0); topf.lineTo(x0 + d, y0 - 22); topf.lineTo(x1 + d, y0 - 22); topf.lineTo(x1, y0); topf.close()
    cv.drawPath(topf, P('#3A3E47'))
    g = skia.GradientShader.MakeLinear([skia.Point(x0, 0), skia.Point(x1, 0)], [col('#33363E'), col('#2A2D35'), col('#22252B')], [0, .5, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(g); cv.drawRect(skia.Rect.MakeLTRB(x0, y0, x1, y1), p)
    cv.drawRect(skia.Rect.MakeLTRB(x0, y0, x1, y0 + 64), P(RED)); text(cv, 'Super E10', (x0 + x1) / 2, y0 + 44, 30, WHITE, 1, 'c')
    disp = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x0 + 18, y0 + 90, x1 - 18, y0 + 320), 12, 12)
    cv.drawRRect(disp, P('#0B0C0F')); cv.drawRRect(disp, P('#4A4F5A', stroke=2))
    text(cv, 'EURO', x0 + 32, y0 + 122, 18, '#8A8E97'); text(cv, 'LITER', x0 + 32, y0 + 206, 18, '#8A8E97'); text(cv, '€/L', x0 + 32, y0 + 296, 18, '#8A8E97')
    pc = price_ct; sq = 1
    if flip is not None and newp is not None:
        if flip >= .5: pc = newp
        sq = max(.04, abs(math.cos(min(flip, 1) * math.pi)))
        if flip >= 1: sq = 1
    for (txt_, yy, sz_, cc) in [(fmt_eur(pc * liters), y0 + 172, 46, RED), (f'{pc / 100:.3f}'.replace('.', ','), y0 + 300, 26, '#C9CDD4')]:
        cv.save(); cv.translate(0, yy - sz_ * .35); cv.scale(1, sq); cv.translate(0, -(yy - sz_ * .35)); text(cv, txt_, x1 - 32, yy, sz_, cc, 1, 'r'); cv.restore()
    text(cv, f'{liters:.2f}'.replace('.', ','), x1 - 32, y0 + 252, 40, WHITE, 1, 'r')
    if flip is not None and flip > .5:
        gl_ = cl((flip - .5) * 2) * (.6 + .4 * math.sin(v * 6))
        cv.drawRRect(disp, P(RED, .5 * gl_, stroke=6, blur=6))
    for k in range(3): cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x0 + 30 + k * 62, y0 + 350, x0 + 76 + k * 62, y0 + 380), 8, 8), P('#3A3E47'))
    cv.drawRect(skia.Rect.MakeLTRB(x0 + 30, y0 + 420, x1 - 30, y0 + 560), P('#1E2026'))
    for k in range(6): cv.drawLine(x0 + 40, y0 + 440 + k * 20, x1 - 40, y0 + 440 + k * 20, P('#3A3E47', stroke=3))
    # holster + hose + nozzle
    hx, hy = x1 + d - 6, y0 + 300
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(hx - 8, hy - 40, hx + 20, hy + 40), 8, 8), P('#3A3E47'))
    if hose > 0:
        nx = lerp(hx + 30, CX - 70, hose); ny = lerp(hy, yct(230) - 52, hose)
        hp = skia.Path(); hp.moveTo(hx + 6, hy + 30); hp.cubicTo(hx + 40, hy + 330, nx - 120, hy + 300, nx - 34, ny + 14)
        cv.drawPath(hp, P('#15171B', stroke=16)); cv.drawPath(hp, P('#3A3E47', stroke=10))
        cv.save(); cv.translate(nx, ny); cv.rotate(28 * hose)
        cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-40, -16, 30, 16), 8, 8), P('#2A2D35')); cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-40, -16, 30, 16), 8, 8), P(RED, stroke=3))
        cv.drawRect(skia.Rect.MakeLTRB(26, -5, 70, 5), P('#8A8E97')); cv.restore()
    cv.restore()

# ---------------------------------------------------------------- small icons
def icon_barrel(cv, x, y, s, a):
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x - 20 * s, y - 28 * s, x + 20 * s, y + 28 * s), 8 * s, 8 * s), P('#1A1C21', a))
    for k in (-14, 0, 14): cv.drawLine(x - 20 * s, y + k * s, x + 20 * s, y + k * s, P(WHITE, .7 * a, stroke=2))
def icon_factory(cv, x, y, s, a):
    pth = skia.Path(); pth.moveTo(x - 28 * s, y + 24 * s); pth.lineTo(x - 28 * s, y - 4 * s); pth.lineTo(x - 10 * s, y + 6 * s); pth.lineTo(x - 10 * s, y - 4 * s); pth.lineTo(x + 8 * s, y + 6 * s)
    pth.lineTo(x + 8 * s, y - 30 * s); pth.lineTo(x + 20 * s, y - 30 * s); pth.lineTo(x + 20 * s, y + 24 * s); pth.close(); cv.drawPath(pth, P('#1A1C21', a))
    for k in range(3): cv.drawCircle(x + 14 * s + k * 6 * s, y - 38 * s - k * 9 * s, (5 + k * 2) * s, P(WHITE, (.35 - k * .1) * a))
def icon_truck(cv, x, y, s, a):
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x - 32 * s, y - 16 * s, x + 12 * s, y + 12 * s), 8 * s, 8 * s), P('#1A1C21', a))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x + 14 * s, y - 8 * s, x + 32 * s, y + 12 * s), 4 * s, 4 * s), P('#1A1C21', a))
    for wx in (-20, 0, 24): cv.drawCircle(x + wx * s, y + 15 * s, 6 * s, P(WHITE, .8 * a))
def icon_pump(cv, x, y, s, a):
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x - 16 * s, y - 28 * s, x + 12 * s, y + 26 * s), 5 * s, 5 * s), P('#1A1C21', a))
    cv.drawRect(skia.Rect.MakeLTRB(x - 10 * s, y - 20 * s, x + 6 * s, y - 8 * s), P(WHITE, .7 * a))
    pth = skia.Path(); pth.moveTo(x + 12 * s, y - 10 * s); pth.quadTo(x + 28 * s, y - 6 * s, x + 24 * s, y + 18 * s); cv.drawPath(pth, P('#1A1C21', a, stroke=4 * s))

def co2_molecule(cv, x, y, s, a, rot):
    cv.save(); cv.translate(x, y); cv.rotate(rot); cv.scale(s, s)
    cv.drawLine(-26, 0, 26, 0, P(WHITE, .7 * a, stroke=4))
    cv.drawCircle(0, 0, 13, P('#2A2D35', a)); cv.drawCircle(-30, 0, 11, P(WHITE, .9 * a)); cv.drawCircle(30, 0, 11, P(WHITE, .9 * a))
    cv.restore()

def calendar(cv, x, y, s, a, flip, top='DEZ', bot='2026', top2='JAN', bot2='2027'):
    if a <= .01: return
    cv.save(); cv.translate(x, y); cv.scale(s, s)
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-70, -70, 70, 80), 14, 14), P('#000000', .5 * a, blur=10))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-70, -70, 70, 80), 14, 14), P('#F4F3EF', a))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-70, -70, 70, -18), 14, 14), P(RED, a)); cv.drawRect(skia.Rect.MakeLTRB(-70, -32, 70, -18), P(RED, a))
    t1, t2 = (top, bot) if flip < .5 else (top2, bot2)
    sy = abs(math.cos(flip * math.pi))
    cv.save(); cv.scale(1, max(.02, sy))
    text(cv, t1, 0, -32, 34, WHITE, a, 'c'); text(cv, t2, 0, 48, 40, '#16181D', a, 'c'); cv.restore()
    for k in (-36, 36): cv.drawCircle(k, -70, 8, P('#8A8E97', a))
    cv.restore()

# ---------------------------------------------------------------- outro: the liter drains into one drop that becomes the logo
def mixc5(a, b, p):
    ra, ga_, ba = rgb(a); rb, gb, bb = rgb(b); return '#%02X%02X%02X' % tuple(int(lerp(x, y, cl(p))) for x, y in zip((ra, ga_, ba), (rb, gb, bb)))
def outro5(cv, v):
    if v < VO5: return
    o = v - VO5; imp = 1.2
    cimp = mixc5(FUEL, RED, (o - imp + .05) / .25)
    if o < imp + .05:
        f = eio((o - .4) / .8); y = lerp(560, 905, f * f); s = lerp(.2, 1, eo(o / .5))
        stretch = 1 + .3 * f
        cv.save(); cv.translate(540, y); cv.scale(s / stretch ** .5, s * stretch)
        pth = skia.Path(); pth.moveTo(0, -70); pth.cubicTo(30, -24, 42, 6, 42, 24); pth.cubicTo(42, 50, 22, 66, 0, 66); pth.cubicTo(-22, 66, -42, 50, -42, 24); pth.cubicTo(-42, 6, -30, -24, 0, -70); pth.close()
        g = skia.GradientShader.MakeRadial(skia.Point(-12, 10), 70, [col('#FFE6A8'), col(FUEL), col(shade(FUEL, .7))], [0, .45, 1])
        pp = skia.Paint(AntiAlias=True); pp.setShader(g)
        cv.drawPath(pth, P(FUEL, .5, blur=16)); cv.drawPath(pth, pp); cv.drawCircle(-14, 14, 9, P(WHITE, .55))
        cv.restore()
        if o > .4:
            for k in range(5):
                q = cl((o - .4) / .8 - k * .06); yy = lerp(560, 905, q * q) - 70
                cv.drawCircle(540, yy, 6 - k, P(FUEL, .25 * (1 - k / 5)))
    if o > imp:
        q = o - imp; rnd = random.Random(8)
        for i in range(30):
            an = rnd.uniform(math.pi * 1.05, math.pi * 1.95); spd = rnd.uniform(180, 420); rr = rnd.uniform(3, 8)
            x = 540 + math.cos(an) * spd * q; y = 955 + math.sin(an) * spd * q + 900 * q * q
            if q < 1.0: cv.drawCircle(x, y, rr * (1 - q * .6), P(mixc5(FUEL, RED, q * 3 + rnd.random() * .5), 1 - q))
        crown = eo(q / .35) * (1 - eo((q - .3) / .5))
        if crown > 0:
            cr = skia.Path(); cr.moveTo(470, 958)
            for j in range(9): cr.lineTo(470 + j * 17.5, 958 - (40 if j % 2 else 12) * crown)
            cr.lineTo(610, 958); cv.drawPath(cr, P(cimp, crown, stroke=6))
    ripple(cv, 540, 960, v, VO5 + imp, 20, 520); ripple(cv, 540, 960, v, VO5 + imp + .15, 20, 380)
    if o > imp - .05:
        cv.drawOval(skia.Rect.MakeLTRB(540 - 200 * eo((o - imp) / .6), 950, 540 + 200 * eo((o - imp) / .6), 975), P(cimp, .35 * (1 - eo((o - imp - .4) / .8)), blur=8))
    if o > imp - .05:
        p = eo((o - imp + .05) / .8); sz = lerp(110, 150, p)
        cv.save(); cv.translate(540, 1000 - 40 * p); tracked(cv, 'function.', 0, 0, sz, RED, cl((o - imp + .05) / .35), -.03); cv.restore()
        lw = 420 * eio((o - imp - .35) / .9)
        if lw > 0:
            y = 1040; cv.drawLine(540 - lw / 2, y, 540 + lw / 2, y, P(RED, .9, stroke=5))
            for sx in (-1, 1): glowtip(cv, 540 + sx * lw / 2, y, .8, 1 - eo((o - imp - 1.2) / .4))

# ---------------------------------------------------------------- frame
def frame5(cv, t):
    v = t - OFF5
    atmosphere(cv, v + 1)
    push = 1.02 + .018 * math.sin(v * .21) + .008 * math.sin(v * .53)
    acc = 1 + sum(.03 * math.exp(-(v - x) * 5) * cl((v - x) / .06) for x in ACC5 if v > x)
    FOC = [(0, 880), (9.4, yct(30)), (22.1, yct(58)), (28.3, yct(82)), (41.8, yct(100)), (46.6, yct(150)), (51.4, yct(140)), (VO5, 880)]
    fy = FOC[0][1]
    for (t0, y0), (t1, y1) in zip(FOC[:-1], FOC[1:]):
        if v >= t1: fy = y1
        elif v >= t0: fy = lerp(fy, y1, 0) if False else y0
    prev = FOC[0]
    for (t0, y0) in FOC:
        if v >= t0: prev = (t0, y0)
    idx = [t for t, _ in FOC].index(prev[0]); fy_prev = FOC[idx - 1][1] if idx > 0 else prev[1]
    fy = lerp(fy_prev, prev[1], eio((v - prev[0]) / 1.2))
    sh = max(-45, min(45, (880 - fy) * .22))
    cv.save(); cv.translate(0, sh); cv.translate(540, 880); cv.scale(push * acc, push * acc); cv.rotate(.3 * math.sin(v * .3)); cv.translate(-540, -880)
    ga = 1 - eo((v - VO5 - .1) / .5)

    # pump: price/litres
    L, total, jan = column_state(v)
    liters = cl((v - .35) / 2.0) if v < 4.2 else 1.0
    price = 211 + 16.7 * jan
    hose = (eio((v - .0) / .4) if v < 3.0 else 1 - eio((v - 3.0) / .7))
    pa = ga * eo((v + .1) / .3) * (1 - eio((v - 9.0) / .7))
    if pa > 0:
        cv.save(); cv.translate(-320 * eio((v - 9.0) / .8), 0); pump(cv, v, pa, 211, liters if v < 4.2 else 1.0, hose); cv.restore()
    if 0 < v < 2.6:  # fuel stream
        ny = yct(230) - 20; top = yct(max(total, 0)); sa_ = eo(v / .3) * (1 - eo((v - 2.3) / .3))
        st_ = skia.Path(); st_.moveTo(CX - 26, ny)
        for j in range(1, 13):
            yy = lerp(ny, top, j / 12); st_.lineTo(CX - 26 + 2.5 * math.sin(v * 25 + j * 1.7) + j * .3, yy)
        cv.drawPath(st_, P(FUEL, .35 * sa_, stroke=16, blur=4)); cv.drawPath(st_, P(FUEL, .9 * sa_, stroke=9)); cv.drawPath(st_, P('#FFE6A8', .7 * sa_, stroke=2.5))
        rnd = random.Random(int(v * 30))
        for i in range(14):
            age = (v * 3 + i / 14) % 1; an = rnd.uniform(-2.6, -.5); spd = rnd.uniform(90, 200)
            dx = math.cos(an) * spd * age; dy = math.sin(an) * spd * age + 260 * age * age
            cv.drawCircle(CX - 24 + dx, top + dy, 3.5 * (1 - age), P(shade(FUEL, 1.2), sa_ * (1 - age)))
        cv.drawCircle(CX - 24, top, 22, P('#FFF1C9', .35 * sa_, blur=10))
    ruler(cv, v, ga * eo((v - 9.7) / .5) * (1 - eo((v - 17.2) / .4)))
    draw_column(cv, v, ga * (1 - .0))

    # S1 hook bracket
    bracket(cv, 0, 99 * eio((v - T_STAAT + .1) / .9), CX + CW / 2 + 14, win(v, T_STAAT, 4.3) * ga, '≈ 1 € Staat', 1, True, 30)
    # S2 price
    a2 = win(v, T_210 - .2, 9.3)
    if a2 > 0:
        text(cv, fmt_eur(211 * eo((v - T_210 + .2) / .9)) + ' €', CX + CW / 2 + 160, yct(211) + 20, 66, RED, a2, 'c')
        text(cv, 'Ø Super E10', CX + CW / 2 + 160, yct(211) + 62, 26, WHITE, a2, 'c'); text(cv, 'ADAC, 21.10.2026', CX + CW / 2 + 160, yct(211) + 94, 22, '#8A8E97', a2, 'c')
    # S3/S4 Energiesteuer
    enc = 65 if v < T_51 - .3 else lerp(65, 51.41, eio((v - T_51 + .3) / .9))
    a3 = win(v, 9.6, 46.5, .4, .3) * (1 - win(v, 51.3, 99, .3, .3) * 0)
    if a3 > 0 and v < 51.3:
        lab = f'Energiesteuer {int(round(enc))} ct'
        bracket(cv, 0, enc, CX + CW / 2 + 14, a3, lab, 1, v < 22.1 or 41.8 < v, 24)
    if T_EGAL - .2 < v < 17.5:  # fixed while price moves
        aa = win(v, T_EGAL - .2, 17.4)
        label_tag(cv, CX, yct(total) - 64, f'Preis {fmt_eur(total)} €', aa, 'c', 26)
        label_tag(cv, CX, yct(65) - 34, 'bleibt fest', aa, 'c', 24, True)
    if T_51 - .3 < v < 22.3:  # 14 ct chunk breaks away
        q = eio((v - T_51 + .3) / 1.2); a4 = win(v, T_51 - .3, 22.1)
        yb, ya = yct(51.4), yct(65.45)
        if 0.05 < q < .95:
            rnd = random.Random(9)
            for i in range(26):
                px = rnd.uniform(CX - CW / 2, CX + CW / 2); py = ya - 40 * q - rnd.uniform(0, 160) * q
                cv.drawCircle(px, py, rnd.uniform(2, 4), P(RED, a4 * (1 - q)))
        label_tag(cv, 170, yct(58) - 40, '−14 ct', a4 * eo((v - T_51) / .3), 'c', 32, True)
        calendar(cv, 170, yct(58) + 90, .9, a4 * eo((v - T_51 + .1) / .4), 0, 'BIS', '31.12.')
    # S5 CO2
    a5 = win(v, 22.2, 46.5, .4, .3)
    if a5 > 0:
        en_now = 51.41
        bracket(cv, en_now, en_now + 14.4, CX + CW / 2 + 14, a5 * eo((v - 22.4) / .3) * (1 if v < 28.3 or v > 41.8 else .55), 'CO2 13–16 ct' if v > T_13 else 'CO2-Preis', 1, 22.1 < v < 28.3, 24)
    # S6/S7/S8 MwSt
    a6 = win(v, 28.4, 46.5, .4, .3)
    if a6 > 0:
        c0 = 51.41 + 14.4; mwv = 33.7
        lab = 'MwSt. 19 %' if v < T_34 - .2 else 'MwSt. 34 ct'
        bracket(cv, c0, c0 + mwv, CX + CW / 2 + 14, a6, lab, 1, 28.3 < v < 41.7, 24)
        sa = win(v, 35.95, 41.6, .4, .4)
        if sa > 0:
            xl = CX - CW / 2 - 18
            bracket(cv, 0, c0, xl, sa, '', -1, True)
            ym = (yct(0) + yct(c0)) / 2
            label_tag(cv, xl - 64, ym - 26, '19 % auch hierauf', sa * eo((v - 36.2) / .3), 'r', 24, True)
            label_tag(cv, xl - 64, ym + 26, '≈ 12 ct', sa * eo((v - 36.4) / .3), 'r', 28)
            pu = .5 + .5 * math.sin(v * 5)
            cv.drawPath(_band_path(0, c0), P(MWSTC, sa * (.35 + .4 * pu), stroke=5, blur=2))
            cv.drawPath(_band_path(c0, c0 + mwv), P(WHITE, sa * .25 * pu, stroke=3))
        if v > T_34 - .2:
            burst(cv, CX + CW / 2 + 60, yct(c0 + mwv / 2), v, T_34, 12, 120, seed=7)
    # S9 total
    a9 = win(v, T_EURO1 - .3, 46.5)
    if a9 > 0:
        bracket(cv, 0, 99.5, CX - CW / 2 - 18, a9, '', -1, True)
        text(cv, f'{int(99 * eo((v - T_EURO1 + .3) / 1.0))} ct', 190, yct(60), 92, RED, a9, 'c')
        text(cv, 'für den Staat', 190, yct(60) + 46, 30, WHITE, a9, 'c')
        hp = eo((v - T_HALF + .1) / .6)
        if hp > 0:
            cxr, cyr = 190, yct(60) + 170; cv.drawCircle(cxr, cyr, 62, P('#2A2D35', a9, stroke=18))
            pth = skia.Path(); pth.addArc(skia.Rect.MakeLTRB(cxr - 62, cyr - 62, cxr + 62, cyr + 62), -90, 360 * .47 * hp)
            cv.drawPath(pth, P(RED, a9, stroke=18)); text(cv, f'{int(47 * hp)} %', cxr, cyr + 12, 34, WHITE, a9, 'c')
    # S10 rest icons inside the grey part
    a10 = win(v, 46.6, 51.35, .4, .4)
    if a10 > 0:
        ys = (yct(211) + yct(99.5)) / 2
        bracket(cv, 99.5, 211, CX + CW / 2 + 14, a10, 'Rest ≈ 1,12 €', 1, False, 26)
        for i, (fn, lab, tt) in enumerate([(icon_barrel, 'Rohöl', T_ROH), (icon_factory, 'Raffinerie', T_RAF), (icon_truck, 'Transport', T_TRA), (icon_pump, 'Tankstelle', T_TANK)]):
            gx = 110; gy = yct(205) + 30 + i * 100; q = ob((v - tt + .05) / .45)
            if q > 0:
                cv.drawCircle(gx, gy, 40 * q, P('#E6E8EC', a10)); cv.save(); cv.translate(gx, gy); cv.scale(q * .85, q * .85); fn(cv, 0, 0, 1, a10); cv.restore()
                text(cv, lab, gx + 60, gy + 10, 30, WHITE, a10 * eo((v - tt) / .3))
    # S11 January: pump returns, display flips to the new price
    a11 = win(v, 51.45, VO5 + .1, .4, .4)
    if a11 > 0:
        pin = eio((v - T_JAN - .1) / .9)
        cv.save(); cv.translate(-340 * (1 - pin), 0)
        pump(cv, v, a11 * pin, 211, 1.0, 0, cl((v - T_17 + .25) / .5), 227.7)
        cv.restore()
        if v > T_17 + .1: burst(cv, 185, 750, v, T_17 + .1, 18, 170, seed=17)
        calendar(cv, 185, 470, .9, a11 * eo((v - T_JAN) / .4), eio((v - T_JAN - .2) / .6))
        bracket(cv, 211, 211 + 16.7 * jan, CX + CW / 2 + 14, eo((v - T_17 + .2) / .4) * a11, '+ bis zu 17 ct', 1, True, 28)
        bracket(cv, 0, 65.45, CX + CW / 2 + 14, a11 * eo((v - T_JAN - .4) / .4), 'Energiesteuer 65 ct', 1, False, 24)
    cv.restore()

    HL = [(0.0, 4.15, [[('Fast ', 0), ('1 Euro', 1)], [('pro Liter für den Staat', 0)]]),
          (4.25, 9.3, [[('Super E10:', 0)], [('rund ', 0), ('2,10 €', 1)]]),
          (9.4, 17.3, [[('Block 1:', 0)], [('Energiesteuer', 1)]]),
          (17.35, 22.1, [[('Tankrabatt', 1)], [('bis Ende Dezember', 0)]]),
          (22.15, 28.3, [[('Block 2:', 0)], [('CO2-Preis', 1)]]),
          (28.38, 35.95, [[('Block 3:', 0)], [('Mehrwertsteuer', 1)]]),
          (36.0, 41.6, [[('Steuer auf', 0)], [('die Steuer', 1)]]),
          (41.9, 46.55, [[('Zusammen', 0)], [('fast 1 Euro', 1)]]),
          (46.62, 51.4, [[('Und der ', 0), ('Rest?', 1)]]),
          (51.45, VO5, [[('Ab Januar', 0)], [('bis zu +17 Cent', 1)]])]
    for a, b, ln in HL:
        if a - .1 < v < b + .4: headline3(cv, v, a, b, ln, base=255)
    for a, b, s in [(4.3, 9.3, 'Quelle: ADAC (21.10.2026)'), (9.4, 22.1, 'Quelle: Energiesteuergesetz, Bundesrat'),
                    (22.15, 41.6, 'Quelle: en2x, Energiesteuergesetz · gerundet'), (41.9, 51.4, 'Eigene Berechnung bei 2,11 €/l · Quellen: ADAC, en2x'),
                    (51.45, VO5, 'Quelle: Bundesrat · bei sonst gleichem Preis')]:
        source(cv, v, a, b, s)
    logo_small(cv, cl((v - .3) / .5) * (1 - eo((v - VO5) / .4)))
    if 0 <= v < VE5 + .3: subtitles(cv, v)
    outro5(cv, v)

if __name__ == '__main__':
    mode = sys.argv[1]; surf = skia.Surface(W, H); cv = surf.getCanvas()
    if mode == 'test':
        for t in [float(x) for x in sys.argv[2].split(',')]:
            frame5(cv, t); surf.makeImageSnapshot().save(f'y_{t:05.1f}.png', skia.kPNG)
    elif mode == 'video':
        a0, a1, out = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'faster', '-crf', '19', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
        for i in range(a0, a1):
            frame5(cv, i / FPS); ff.stdin.write(surf.makeImageSnapshot().toarray().tobytes())
            if i % 150 == 0: print(i, a1, flush=True)
        ff.stdin.close(); ff.wait(); print('done', flush=True)
    elif mode == 'events':
        json.dump({'dur': DUR5, 'OFF': OFF5, 'VO': VO5, 'acc': ACC5, 'n': int(DUR5 * FPS), 'staat': T_STAAT, 't210': T_210, 't51': T_51, 't34': T_34,
                   'euro1': T_EURO1, 'jan': T_JAN, 't17': T_17, 'icons': [T_ROH, T_RAF, T_TRA, T_TANK], 'egal': T_EGAL, 't13': T_13}, open('events5.json', 'w'))
