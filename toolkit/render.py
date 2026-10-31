import skia, numpy as np, math, subprocess, sys, json, random

W, H = 1080, 1920
T = 1.06      # voice tempo factor
OFF = 0.12    # voice offset in video seconds
FPS = 30
V_END = 74.9
DUR = V_END / T + OFF

FB = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
FM = '/usr/share/fonts/truetype/google-fonts/Poppins-Medium.ttf'
TB = skia.Typeface.MakeFromFile(FB); TM = skia.Typeface.MakeFromFile(FM)
_fc = {}
def F(sz, med=False):
    k = (round(sz * 2) / 2, med)
    if k not in _fc:
        f = skia.Font(TM if med else TB, k[0]); f.setSubpixel(True)
        f.setEdging(skia.Font.Edging.kAntiAlias); _fc[k] = f
    return _fc[k]

RED = '#E01E2B'; BLACK = '#16181D'; WHITE = '#FFFFFF'; GREY = '#8A8E97'; AMBER = '#FFB020'
COLS = {'gruen': '#3BA55C', 'orange': '#F28C28', 'blau': '#2D6FD6', 'gelb': '#F2C42E', 'braun': '#9A6440', 'rosa': '#EE9CC0'}

def rgb(h): h = h.lstrip('#'); return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
def col(h, a=1.0):
    r, g, b = rgb(h); return skia.ColorSetARGB(int(max(0, min(1, a)) * 255), r, g, b)
def shade(h, f):
    r, g, b = rgb(h); return '#%02X%02X%02X' % tuple(int(max(0, min(255, c * f))) for c in (r, g, b))
def P(h, a=1, stroke=None, blur=None, cap=True):
    p = skia.Paint(AntiAlias=True, Color=col(h, a))
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style); p.setStrokeWidth(stroke)
        if cap: p.setStrokeCap(skia.Paint.kRound_Cap)
    if blur: p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    return p

def cl(x): return max(0.0, min(1.0, x))
def eo(x): x = cl(x); return 1 - (1 - x) ** 3
def eio(x): x = cl(x); return 4 * x ** 3 if x < .5 else 1 - (-2 * x + 2) ** 3 / 2
def ob(x):
    x = cl(x); c1 = 1.9; c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
def win(v, a, b, fi=.35, fo=.3): return eo((v - a) / fi) * eo((b - v) / fo)
def lerp(a, b, p): return a + (b - a) * p

def text(cv, s, x, y, sz, h=WHITE, a=1, align='l', med=False):
    f = F(sz, med); w = f.measureText(s)
    if align == 'c': x -= w / 2
    elif align == 'r': x -= w
    cv.drawString(s, x, y, f, P(h, a)); return w

def tracked(cv, s, x, y, sz, h, a, track, med=True, measure=False):
    f = F(sz, med); ws = [f.measureText(ch) for ch in s]; tot = sum(ws) + track * sz * (len(s) - 1)
    if measure: return tot
    xx = x - tot / 2
    for ch, w in zip(s, ws):
        cv.drawString(ch, xx, y, f, P(h, a)); xx += w + track * sz
    return tot

# ---------------------------------------------------------------- voice timing
SEGS = [
 (0.0, 5.36, "Dieser kleine Aufkleber verrät der Polizei sogar auf der Autobahn, ob Ihr Auto überfällig ist."),
 (5.81, 9.48, "Offiziell heißt er nicht TÜV-Plakette, sondern Prüfplakette."),
 (9.88, 13.56, "Denn prüfen dürfen auch DEKRA, GTÜ oder KÜS."),
 (14.06, 15.77, "Gelesen wird er wie eine Uhr."),
 (16.21, 19.35, "Die Zahl in der Mitte ist das Jahr der nächsten Hauptuntersuchung."),
 (19.83, 21.34, "Der Monat steht ganz oben,"),
 (21.63, 24.0, "dort, wo auf einem Zifferblatt die Zwölf wäre."),
 (24.47, 28.33, "Die schwarzen Balken zeigen wie ein Stundenzeiger auf denselben Monat."),
 (28.75, 30.37, "Neun Uhr heißt September."),
 (30.77, 31.94, "Dazu kommt die Farbe."),
 (32.30, 35.38, "Sechs Farben wechseln sich ab, jedes Jahr eine andere."),
 (35.74, 38.13, "Blau steht für 2026,"),
 (38.44, 42.84, "Gelb für 2027, Braun für 2028."),
 (43.30, 45.89, "Wer jetzt noch Blau trägt, ist dieses Jahr dran."),
 (46.31, 49.17, "Neuwagen müssen nach drei Jahren zur ersten Prüfung,"),
 (49.44, 50.93, "danach alle zwei Jahre."),
 (51.27, 56.72, "Wer mehr als acht Monate überzieht, zahlt sechzig Euro und bekommt einen Punkt in Flensburg."),
 (57.12, 59.25, "Und die Prüfung ist keine Formalität:"),
 (59.67, 65.19, "Laut TÜV-Report bekam zuletzt mehr als jedes fünfte Auto die Plakette nicht im ersten Anlauf."),
 (65.61, 68.74, "Die Farbe zeigt das Jahr, die Zahl oben den Monat."),
 (69.08, 71.43, "So liest man die Plakette in einer Sekunde."),
]
SPOK = {'2026': 'zweitausendsechsundzwanzig', '2027': 'zweitausendsiebenundzwanzig', '2028': 'zweitausendachtundzwanzig',
        'GTÜ': 'geeteeüü', 'KÜS': 'küüs', 'TÜV-Report': 'tüffreport', 'TÜV-Plakette': 'tüffplakette'}
WORDS = []  # (start, end, text)
for a, b, s in SEGS:
    ws = s.split(); wt = []
    for w in ws:
        base = w.strip('.,:'); wt.append(len(SPOK.get(base, base)) + 2 + (3 if w[-1] in ',:' else 0))
    tot = sum(wt); x = a
    for w, k in zip(ws, wt):
        d = (b - a) * k / tot; WORDS.append((x, x + d, w)); x += d
def wtime(word, after=0):
    for a, b, w in WORDS:
        if a >= after and w.strip('.,:') == word.strip('.,:'): return a
    raise KeyError(word)
CHUNKS = []
for a, b, s in SEGS:
    ws = [w for w in WORDS if w[0] >= a - 1e-6 and w[1] <= b + 1e-6]
    cur = []
    for w in ws:
        if cur and (len(cur) >= 4 or len(' '.join(x[2] for x in cur + [w])) > 22):
            CHUNKS.append(cur); cur = []
        cur.append(w)
    if cur: CHUNKS.append(cur)
CH = []
for i, c in enumerate(CHUNKS):
    st = c[0][0]; en = c[-1][1]
    nxt = CHUNKS[i + 1][0][0] if i + 1 < len(CHUNKS) else 99
    CH.append((st, min(nxt - .06, en + 0.35), c))

T_2026 = wtime('2026'); T_2027 = wtime('2027'); T_2028 = wtime('2028')
T_SEPT = wtime('September'); T_60 = wtime('sechzig'); T_PUNKT = wtime('Punkt', 54)
T_BLAU = wtime('Blau', 35); T_GELB = wtime('Gelb'); T_BRAUN = wtime('Braun')
ACCENTS = [T_2026, T_2027, T_2028, T_SEPT, T_60, 60.6]

# ---------------------------------------------------------------- 3D helpers
FOC = 1700
def proj(x, y, z, cx, cy, rx, ry, s=1.0):
    a = math.radians(ry); x1 = x * math.cos(a) + z * math.sin(a); z1 = -x * math.sin(a) + z * math.cos(a)
    b = math.radians(rx); y1 = y * math.cos(b) - z1 * math.sin(b); z2 = y * math.sin(b) + z1 * math.cos(b)
    k = FOC / (FOC + z2 * s)
    return cx + x1 * k * s, cy + y1 * k * s
def pmat(hw, hh, z, cx, cy, rx, ry, s=1.0):
    pts = [(-hw, -hh), (hw, -hh), (hw, hh), (-hw, hh)]
    m = skia.Matrix()
    m.setPolyToPoly([skia.Point(*p) for p in pts], [skia.Point(*proj(px, py, z, cx, cy, rx, ry, s)) for px, py in pts])
    return m

def face(cv, R, c, yr, rot, extra=None, glow=0):
    sh = skia.GradientShader.MakeRadial(skia.Point(-R * .35, -R * .45), R * 1.7,
                                        [col(shade(c, 1.2)), col(c), col(shade(c, .8))], [0, .5, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(sh)
    if glow > 0: cv.drawCircle(0, 0, R * 1.05, P(RED, .7 * glow, stroke=R * .06, blur=R * .07))
    cv.drawCircle(0, 0, R, p)
    cv.drawCircle(0, 0, R * .985, P('#000000', .25, stroke=max(1, R * .012)))
    cv.drawCircle(0, 0, R * .62, P('#000000', .5, stroke=max(1, R * .013)))
    fs = R * .17; f = F(fs); ink = P('#121212', .92)
    for k in range(1, 13):
        cv.save(); cv.rotate(rot - k * 30)
        t = str(k); w = f.measureText(t); cv.drawString(t, -w / 2, -R * .72, f, ink)
        if k == 12:
            for sg in (-1, 1):
                cv.save(); cv.rotate(sg * 14)
                cv.drawRect(skia.Rect.MakeLTRB(-R * .035, -R * .97, R * .035, -R * .64), P('#101010')); cv.restore()
        cv.restore()
    cv.save(); cv.rotate(rot)
    fy = F(R * .42); w = fy.measureText(yr); cv.drawString(yr, -w / 2, R * .15, fy, P('#101010'))
    cv.restore()
    gl = skia.GradientShader.MakeLinear([skia.Point(-R, -R), skia.Point(R, R)],
                                        [col(WHITE, .22), col(WHITE, 0), col(WHITE, 0)], [0, .45, 1])
    p2 = skia.Paint(AntiAlias=True); p2.setShader(gl); cv.drawCircle(0, 0, R, p2)
    if extra: extra(cv, R, rot)

def plaque(cv, cx, cy, R, c, yr, rot, rx=0, ry=0, a=1, glow=0, extra=None):
    if a <= .01 or R < 2: return
    lay = a < .995
    if lay: cv.saveLayerAlpha(None, int(a * 255))
    sh = P('#000000', .3, blur=R * .12); cv.drawOval(skia.Rect.MakeXYWH(cx - R * .9, cy + R * .78, R * 1.8, R * .4), sh)
    th = R * .07; n = 5
    for i in range(n, 0, -1):
        cv.save(); cv.concat(pmat(R, R, th * i / n, cx, cy, rx, ry)); cv.drawCircle(0, 0, R, P(shade(c, .42))); cv.restore()
    cv.save(); cv.concat(pmat(R, R, 0, cx, cy, rx, ry)); face(cv, R, c, yr, rot, extra, glow); cv.restore()
    if lay: cv.restore()

def glowtip(cv, x, y, s=1, a=1):
    cv.drawCircle(x, y, 16 * s, P(RED, .55 * a, blur=10 * s))
    cv.drawCircle(x, y, 6 * s, P('#FFD9DC', a))

def polyline(cv, pts, prog, w=5, a=1, tip=True):
    if prog <= 0: return
    L = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; tot = sum(L); tgt = tot * cl(prog)
    path = skia.Path(); path.moveTo(*pts[0]); acc = 0; end = pts[0]
    for i, l in enumerate(L):
        if acc + l >= tgt:
            f = (tgt - acc) / l if l else 0
            end = (lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)); path.lineTo(*end); break
        path.lineTo(*pts[i + 1]); acc += l; end = pts[i + 1]
    cv.drawPath(path, P(RED, a, stroke=w))
    if tip and prog < .999: glowtip(cv, end[0], end[1], 1, a)

def ripple(cv, x, y, v, v0, r0, r1, a=1):
    p = (v - v0) / .9
    if 0 < p < 1: cv.drawCircle(x, y, lerp(r0, r1, eo(p)), P(RED, .6 * (1 - p) * a, stroke=3))

def pill(cv, x, y, s, a, arrow=None, sz=34, sc=1.0, hl=False):
    if a <= .01: return
    f = F(sz); w = f.measureText(s) + 56; h = sz * 1.85
    cv.save(); cv.translate(x, y); cv.scale(sc, sc)
    r = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h), h / 2, h / 2)
    cv.drawRRect(r, P('#000000', .5 * a, blur=10))
    cv.drawRRect(r, P(RED if hl else BLACK, .96 * a)); cv.drawRRect(r, P(RED, a, stroke=3))
    if arrow:
        L = 20; pth = skia.Path()
        if arrow == 'down': pth.moveTo(-13, h / 2 - 1); pth.lineTo(13, h / 2 - 1); pth.lineTo(0, h / 2 + L)
        if arrow == 'up': pth.moveTo(-13, -h / 2 + 1); pth.lineTo(13, -h / 2 + 1); pth.lineTo(0, -h / 2 - L)
        pth.close(); cv.drawPath(pth, P(RED, a))
    cv.drawString(s, -f.measureText(s) / 2, sz * .36, f, P(WHITE, a))
    cv.restore()

def block(cv, cx, base, w, h, d, c, a=1):
    if h <= 0: return
    dx, dy = d * .55, -d * .45
    fr = skia.Rect.MakeLTRB(cx - w / 2, base - h, cx + w / 2, base)
    top = skia.Path(); top.moveTo(cx - w / 2, base - h); top.lineTo(cx - w / 2 + dx, base - h + dy)
    top.lineTo(cx + w / 2 + dx, base - h + dy); top.lineTo(cx + w / 2, base - h); top.close()
    side = skia.Path(); side.moveTo(cx + w / 2, base - h); side.lineTo(cx + w / 2 + dx, base - h + dy)
    side.lineTo(cx + w / 2 + dx, base + dy); side.lineTo(cx + w / 2, base); side.close()
    cv.drawPath(side, P(shade(c, .55), a)); cv.drawRect(fr, P(c, a)); cv.drawPath(top, P(shade(c, 1.35), a))

def car(cv, x, y, c, a=1, s=1):
    cv.save(); cv.translate(x, y); cv.scale(s, s)
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-13, -17, 26, 12), 5, 5), P(c, a))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-22, -8, 44, 14), 5, 5), P(c, a))
    cv.drawCircle(-12, 7, 5, P(shade(c, .5), a)); cv.drawCircle(12, 7, 5, P(shade(c, .5), a))
    cv.restore()

# ---------------------------------------------------------------- static layers
random.seed(7)
PARTS = [(random.random() * W, random.random() * H, random.uniform(1, 3), random.uniform(8, 26), random.random()) for _ in range(70)]
STREAKS = [(random.uniform(500, 1300), random.uniform(200, 900), random.uniform(1.2, 2.6)) for _ in range(16)]
ORDER = list(range(100)); random.shuffle(ORDER); REDRANK = {c: i for i, c in enumerate(ORDER)}

def background(cv, v):
    cv.clear(col('#0A0B0E'))
    sh = skia.GradientShader.MakeRadial(skia.Point(540, 820), 1150, [col('#15171C'), col('#0A0B0E')], [0, 1])
    p = skia.Paint(); p.setShader(sh); cv.drawRect(skia.Rect.MakeWH(W, H), p)
    for x, y, r, sp, ph in PARTS:
        yy = (y - v * sp) % H; xx = x + 14 * math.sin(v * .3 + ph * 6)
        cv.drawCircle(xx, yy, r, P('#9AA0AA', .10 + .08 * math.sin(v + ph * 9)))

def logo_small(cv, a):
    tracked(cv, 'function.', 80 + tracked(cv, 'function.', 0, 0, 40, RED, 0, -.02, measure=True) / 2, 132, 40, RED, .82 * a, -.02)

def headline(cv, v, a, b, lines, base=300):
    for i, segs in enumerate(lines):
        al = eo((v - a - i * .08) / .4) * eo((b - v) / .3)
        if al <= 0: continue
        sz = 78; f = F(sz); tot = sum(f.measureText(s) for s, _ in segs)
        if tot > 920: sz = 78 * 920 / tot; f = F(sz)
        x = 80; y = base + i * 88 + 26 * (1 - eo((v - a - i * .08) / .45))
        for s, red in segs:
            cv.drawString(s, x, y, f, P(RED if red else WHITE, al)); x += f.measureText(s)

def source(cv, v, a, b, s):
    al = win(v, a, b)
    if al > 0: text(cv, s, 80, 1470, 24, '#7D818A', al)

def subtitles(cv, v):
    for st, en, ch in CH:
        if st - .05 <= v < en:
            al = eo((v - st + .05) / .15); f = F(56); sp = f.measureText(' ')
            ws = [w for _, _, w in ch]; wid = [f.measureText(w) for w in ws]; tot = sum(wid) + sp * (len(ws) - 1)
            sc = min(1, 940 / tot); 
            if sc < 1: f = F(56 * sc); sp = f.measureText(' '); wid = [f.measureText(w) for w in ws]; tot = sum(wid) + sp * (len(ws) - 1)
            x = 540 - tot / 2; y = 1360 + 10 * (1 - al)
            for (a, b, w), wd in zip(ch, wid):
                if a <= v < b + .04:
                    pp = eo((v - a) / .12)
                    r = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x - 12, y - 50, x + wd + 12, y + 16), 12, 12)
                    cv.save(); cx = x + wd / 2; cv.translate(cx, y - 17); s = .85 + .15 * pp; cv.scale(s, s); cv.translate(-cx, -(y - 17))
                    cv.drawRRect(r, P(RED, al * pp)); cv.restore()
                cv.drawString(w, x, y, f, P(WHITE, al)); x += wd + sp

# ---------------------------------------------------------------- scene geometry
RING_C = (540, 820); RING_R = 290; RING_PR = 92
RING = [('gruen', '24'), ('orange', '25'), ('blau', '26'), ('gelb', '27'), ('braun', '28'), ('rosa', '29')]
def ring_pos(i): a = math.radians(i * 60); return RING_C[0] + RING_R * math.sin(a), RING_C[1] - RING_R * math.cos(a)

def plate_params(v):
    p = eo(v / 5.2)
    return dict(cx=556 + 6 * math.sin(v * .8), cy=860 + 8 * math.sin(v * .7), s=lerp(.98, 1.07, p), rx=lerp(26, 14, p), ry=lerp(-32, -14, p))

def draw_plate(cv, v, a, show_plq):
    if a <= .01: return
    q = plate_params(v); hw, hh = 440, 105
    cv.saveLayerAlpha(None, int(a * 255))
    for i in range(4, 0, -1):
        cv.save(); cv.concat(pmat(hw, hh, 6 * i, q['cx'], q['cy'], q['rx'], q['ry'], q['s']))
        cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw, -hh, hw, hh), 16, 16), P('#5B5C60')); cv.restore()
    cv.save(); cv.concat(pmat(hw, hh, 0, q['cx'], q['cy'], q['rx'], q['ry'], q['s']))
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw, -hh, hw, hh), 16, 16)
    cv.drawRRect(rr, P('#E4E3DF')); cv.drawRRect(rr, P('#1A1A1A', stroke=7, cap=False))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw + 10, -hh + 10, -hw + 86, hh - 10), 8, 8), P('#1F3C96'))
    for k in range(12):
        an = k * math.pi / 6; cv.drawCircle(-hw + 48 + 22 * math.sin(an), -38 - 22 * math.cos(an), 3.2, P(AMBER))
    text(cv, 'D', -hw + 48, 72, 52, WHITE, 1, 'c')
    text(cv, 'B', -300, 58, 150, '#141414', 1, 'c')
    cv.drawCircle(-170, 62, 30, P('#B9B8B4')); cv.drawCircle(-170, 62, 30, P('#8A8986', stroke=2))
    text(cv, 'FN 101', -100, 58, 132, '#141414')
    if show_plq:
        cv.save(); cv.translate(-170, -36)
        g = .5 + .5 * math.sin(v * 5) if v > .6 else 0
        face(cv, 58, COLS['blau'], '26', 90, glow=g * eo((v - .6) / .4)); cv.restore()
    cv.restore(); cv.restore()

def plate_plq_screen(v):
    q = plate_params(v); x, y = proj(-170, -36, 0, q['cx'], q['cy'], q['rx'], q['ry'], q['s'])
    return x, y, 58 * q['s'] * .97, q['rx'], q['ry']

A2 = (540, 760, 220); B3 = (540, 860, 290); D10 = (540, 860, 250); E14 = (540, 860, 280)
def breath(v): return 7 * math.sin(v * .9), 10 * math.sin(v * .6 + 1)

def main_plq(v):
    rx, ry = breath(v); rot = 90
    if v < 4.6: return None
    if v < 5.9:
        p = eio((v - 4.6) / 1.3); x, y, R, prx, pry = plate_plq_screen(min(v, 5.2))
        return dict(cx=lerp(x, A2[0], p), cy=lerp(y, A2[1], p), R=lerp(R, A2[2], p), rot=rot, rx=lerp(prx, rx, p), ry=lerp(pry, ry, p))
    if v < 13.8: return dict(cx=A2[0], cy=A2[1] + 6 * math.sin(v), R=A2[2], rot=rot, rx=rx, ry=ry)
    if v < 30.6:
        p = eio((v - 13.8) / .8); rot = 90 + 180 * eio((v - 28.75) / 1.0)
        return dict(cx=lerp(A2[0], B3[0], p), cy=lerp(A2[1], B3[1], p), R=lerp(A2[2], B3[2], p), rot=rot, rx=rx, ry=ry)
    if v < 31.5:
        p = eio((v - 30.6) / .9); x, y = ring_pos(2)
        return dict(cx=lerp(B3[0], x, p), cy=lerp(B3[1], y, p), R=lerp(B3[2], RING_PR, p), rot=270, rx=rx, ry=ry)
    if v < 43.07: return None
    if v < 46.6:
        p = eio((v - 43.07) / .8); x, y = ring_pos(2); fo = 1 - eo((v - 46.1) / .45)
        return dict(cx=lerp(x, D10[0], p), cy=lerp(y, D10[1], p), R=lerp(RING_PR * 1.15, D10[2], p) * (0.7 + .3 * fo), rot=270, rx=rx, ry=ry, a=fo)
    if v < 65.4: return None
    p = ob((v - 65.4) / .8); a = eo((v - 65.4) / .3) * (1 - eo((v - 71.55) / .35))
    if a <= 0: return None
    return dict(cx=E14[0], cy=E14[1], R=E14[2] * lerp(.6, 1, p), rot=270 + 150 * (1 - eio((v - 65.4) / 1.0)), rx=rx, ry=ry, a=a)

# ---------------------------------------------------------------- extras drawn inside the plaque face
def ex_main(v):
    def f(cv, R, rot):
        if 13.9 < v < 30.7:  # clock ticks
            for k in range(12):
                tp = eo((v - 13.95 - k * .05) / .25) * (1 - eo((v - 30.2) / .4))
                if tp <= 0: continue
                cv.save(); cv.rotate(k * 30)
                cv.drawLine(0, -R * 1.10, 0, -R * (1.10 + .07 * tp), P('#C9CDD4', .55 * tp, stroke=4)); cv.restore()
            sw = (v - 14.1) / 1.6
            if 0 < sw < 1:
                an = math.radians(360 * eio(sw)); x, y = R * .85 * math.sin(an), -R * .85 * math.cos(an)
                cv.drawLine(0, 0, x, y, P(RED, 1 - sw ** 3, stroke=R * .02)); glowtip(cv, x, y, .9, 1 - sw ** 3)
        a = win(v, 16.3, 19.6)
        if a > 0:
            cv.drawCircle(0, 0, R * .5, P(RED, .6 * a, stroke=R * .05, blur=R * .04))
            cv.drawCircle(0, 0, R * .5, P(RED, a, stroke=R * .022))
        a = win(v, 19.9, 24.2) + win(v, 28.9, 30.5) + win(v, 65.6, 71.4) * cl((v - 66.9) / .3)
        if a > 0:
            cv.drawCircle(0, -R * .78, R * .13, P(RED, a, stroke=R * .022))
        a = win(v, 24.5, 30.5)
        if a > 0:
            pr = eo((v - 24.55) / .9); an = math.radians(rot); L = R * .62 * pr
            x, y = L * math.sin(an), -L * math.cos(an)
            cv.drawLine(0, 0, x, y, P(RED, a, stroke=R * .045)); cv.drawCircle(0, 0, R * .05, P(RED, a))
            if pr < 1: glowtip(cv, x, y, 1, a)
            cv.save(); cv.rotate(rot)
            for sg in (-1, 1):
                cv.save(); cv.rotate(sg * 14)
                cv.drawRect(skia.Rect.MakeLTRB(-R * .05, -R * .985, R * .05, -R * .625), P(RED, a * (.6 + .4 * math.sin(v * 6)), stroke=R * .016, cap=False))
                cv.restore()
            cv.restore()
    return f

# ---------------------------------------------------------------- frame
def frame(cv, t, cover=False):
    v = (t - OFF) * T
    background(cv, v)
    # camera accent
    acc = 1 + sum(.028 * math.exp(-(v - x) * 5) * cl((v - x) / .06) for x in ACCENTS if v > x)
    cv.save(); cv.translate(540, 860); cv.scale(acc, acc); cv.translate(-540, -860)

    # S1 streaks + plate
    sa = 1 - eo((v - 4.8) / .8)
    if sa > 0:
        for y0, x0, sp in STREAKS:
            x = (x0 * 3 - v * 900 * sp) % 1600 - 260; y = 540 + (y0 % 700)
            if 1000 < y < 1150 or y < 560: continue
            cv.drawLine(x, y, x + 140 * sp, y, P('#C9CDD4', .07 * sa, stroke=2))
        pa = (1 - eo((v - 4.9) / .7)) * eo((v + .1) / .25)
        draw_plate(cv, v + .0, pa, v < 4.6)
        if v < 4.6:
            x, y, R, _, _ = plate_plq_screen(v)
            ripple(cv, x, y, v, .6, R, R * 2.4); ripple(cv, x, y, v, 2.2, R, R * 2.4)
            pill(cv, x, y - R - 70, 'Fällig: März 2026', win(v, 2.4, 4.7), 'down', sc=ob((v - 2.4) / .45))

    # S2 provider pills
    if 9.5 < v < 14.2:
        names = [('TÜV', wtime('prüfen')), ('DEKRA', wtime('DEKRA,')), ('GTÜ', wtime('GTÜ')), ('KÜS', wtime('KÜS.'))]
        f = F(34); ws = [f.measureText(n) + 56 for n, _ in names]; gap = 28; tot = sum(ws) + gap * 3; x = 540 - tot / 2
        for (n, tt), w in zip(names, ws):
            cx = x + w / 2; a = win(v, tt, 13.75)
            if a > 0:
                pr = eo((v - tt) / .5); ty = A2[1] + A2[2] * .98
                tx = lerp(540, cx, .35)
                polyline(cv, [(cx, 1100 - 32), (cx, 1030), (tx, ty + 18)], pr, 3, a * .9)
                pill(cv, cx, 1100, n, a, sc=ob((v - tt) / .45))
            x += w + gap

    m = main_plq(v)
    if m:
        plaque(cv, m['cx'], m['cy'], m['R'], COLS['blau'], '26', m['rot'], m['rx'], m['ry'], m.get('a', 1),
               glow=(win(v, 43.4, 46.0) * (.6 + .4 * math.sin(v * 6))), extra=ex_main(v))
    if 4.6 < v < 7: ripple(cv, A2[0], A2[1], v, 5.6, 200, 330)

    # S4-S7 pills
    pill(cv, 540, 1236, 'Mitte = Jahr', win(v, 16.4, 19.6), 'up', sc=ob((v - 16.4) / .45))
    pill(cv, 540, 466, 'Oben = Monat', win(v, 19.9, 24.2), 'down', sc=ob((v - 19.9) / .45))
    pill(cv, 540, 1236, 'Balken = Stundenzeiger', win(v, 24.7, 28.6), 'up', sc=ob((v - 24.7) / .45))
    pill(cv, 540, 1236, '9 Uhr = September', win(v, 28.8, 30.55), 'up', sc=ob((v - 28.8) / .45), hl=True)

    # S8-S10 colour ring
    if 30.6 < v < 46.6:
        ga = 1 - eo((v - 43.0) / .6)
        # ring line
        rp = eo((v - 32.3) / 2.9)
        if rp > 0 and ga > 0:
            pth = skia.Path(); pth.addArc(skia.Rect.MakeXYWH(RING_C[0] - RING_R, RING_C[1] - RING_R, 2 * RING_R, 2 * RING_R), -90, 359.9 * rp)
            cv.drawPath(pth, P(RED, .85 * ga, stroke=4))
            an = math.radians(360 * rp); tx, ty = RING_C[0] + RING_R * math.sin(an), RING_C[1] - RING_R * math.cos(an)
            if rp < 1: glowtip(cv, tx, ty, 1, ga)
            for k in range(6):
                am = k * 60 + 30
                if rp * 360 > am + 4:
                    a2 = math.radians(am); x, y = RING_C[0] + RING_R * math.sin(a2), RING_C[1] - RING_R * math.cos(a2)
                    cv.save(); cv.translate(x, y); cv.rotate(am + 90); pth2 = skia.Path()
                    pth2.moveTo(10, 0); pth2.lineTo(-8, -10); pth2.lineTo(-8, 10); pth2.close(); cv.drawPath(pth2, P(RED, ga)); cv.restore()
        # counter
        ca = win(v, 32.2, 35.5)
        if ca > 0:
            n = min(6, max(1, int((v - 32.3) / .2) + 1))
            text(cv, str(n), RING_C[0], RING_C[1] + 62, 190, RED, ca, 'c')
            text(cv, 'Farben', RING_C[0], RING_C[1] + 118, 38, WHITE, ca, 'c')
        hl = {2: (T_BLAU, 38.3), 3: (T_GELB, T_BRAUN), 4: (T_BRAUN, 43.0)}
        for i, (cn, yr) in enumerate(RING):
            x, y = ring_pos(i); ap = 30.75 + abs(i - 2) * .12
            if i == 2 and v < 31.5: continue
            a = eo((v - ap) / .3) * ga if i != 2 else ga
            R = RING_PR * (ob((v - ap) / .5) if i != 2 else 1)
            h = 0
            if i in hl: h = win(v, hl[i][0], hl[i][1], .3, .3)
            dim = 1 - .55 * win(v, T_BLAU, 43.0, .4, .3) * (1 if i not in hl else 1 - cl(h * 3))
            if 43.0 < v and i == 2: continue
            plaque(cv, x, y + 6 * math.sin(v + i), R * (1 + .14 * h), COLS[cn], yr, 270, *breath(v + i), a=a * dim, glow=h)
            ripple(cv, x, y, v, ap, RING_PR, RING_PR * 1.7, ga)
            if i in hl:
                yrs = {2: '2026', 3: '2027', 4: '2028'}[i]; t0 = {2: T_2026, 3: T_2027, 4: T_2028}[i]
                pa = win(v, t0 - .15, 43.0)
                ly = y + RING_PR + 46 if i != 3 else y + RING_PR + 42
                pill(cv, x, ly + 6 * math.sin(v + i), yrs, pa, sc=ob((v - t0 + .15) / .45), hl=h > .5)
        pill(cv, 540, 1205, 'fällig: 2026', win(v, 43.5, 46.1), 'up', sc=ob((v - 43.5) / .45), hl=True)
        if 43 < v < 46.2: ripple(cv, 540, 860, v, 43.9, 250, 380); ripple(cv, 540, 860, v, 44.9, 250, 380)

    # S11 timeline
    a11 = win(v, 46.2, 51.05)
    if a11 > 0:
        y0 = 900; x0 = 120; k = (977 - 120) / 84
        cv.drawLine(x0 - 20, y0 + 30, 1000, y0 + 30, P('#3A3E47', a11, stroke=3))
        segs = [(0, 36, 46.35, 48.6, '36 Monate'), (36, 60, 49.45, 50.25, '24 Monate'), (60, 84, 50.0, 50.8, '24 Monate')]
        for m0, m1, ta, tb, lab in segs:
            pr = eio((v - ta) / (tb - ta))
            if pr <= 0: continue
            xa = x0 + m0 * k; xb = xa + (m1 - m0) * k * pr
            block(cv, (xa + xb) / 2, y0 + 30, xb - xa - 6, 26, 26, RED, a11)
            if pr < 1: glowtip(cv, xb, y0 + 17, 1, a11)
            pill(cv, x0 + (m0 + m1) / 2 * k, y0 - 105, lab, a11 * eo((v - ta - .2) / .3), 'down', sz=28, sc=ob((v - ta - .2) / .45))
        for mm, lab, tt in [(0, 'Zulassung', 46.3), (36, '1. HU', 48.4), (60, '2. HU', 49.9), (84, '3. HU', 50.6)]:
            aa = a11 * eo((v - tt) / .3); xx = x0 + mm * k
            cv.drawCircle(xx, y0 + 30, 9, P(WHITE, aa)); text(cv, lab, min(max(xx, 105), 975), y0 + 95, 28, '#B8BCC4', aa, 'c')
            ripple(cv, xx, y0 + 30, v, tt, 9, 50, a11)
        car(cv, x0 + min(84, max(0, (v - 46.35) / (50.8 - 46.35) * 84)) * k, y0 - 2, WHITE, a11 * .9, 1.0)

    # S12 fines
    a12 = win(v, 51.2, 56.95)
    if a12 > 0:
        base = 1150
        data = [(250, 15, 51.5, '> 2 Monate', '#3A3E47'), (540, 25, 52.2, '> 4 Monate', '#4A4F5A'), (830, 60, T_60 - .3, '> 8 Monate', RED)]
        for x, val, t0, lab, c in data:
            pr = eo((v - t0) / 1.0); h = val * 6.0 * pr
            cv.drawOval(skia.Rect.MakeXYWH(x - 95, base - 14, 210, 34), P('#000000', .5 * a12, blur=12))
            block(cv, x, base, 150, h, 40, c, a12 * eo((v - t0) / .2))
            if pr > 0:
                text(cv, f'{int(round(val * pr))} €', x + 11, base - h - 42, 56, RED if val == 60 else WHITE, a12 * eo((v - t0) / .2), 'c')
                text(cv, lab, x, base + 62, 30, '#B8BCC4', a12 * eo((v - t0) / .2), 'c')
                ripple(cv, x, base, v, t0, 40, 140, a12)
        pill(cv, 830, base - 60 * 6 - 160, '+ 1 Punkt', a12 * eo((v - T_PUNKT) / .3), 'down', sc=ob((v - T_PUNKT) / .45), hl=True)

    # S13 report grid
    a13 = win(v, 57.0, 65.35)
    if a13 > 0:
        gx, gy, cs = 466, 600, 58
        red_n = 21.5 * eio((v - 60.5) / 3.1)
        for idx in range(100):
            r, c = divmod(idx, 10); x = gx + c * cs; y = gy + r * cs
            pa = eo((v - 57.25 - (r + c) * .045) / .3)
            rk = REDRANK[idx]; f = cl(red_n - rk)
            cc = RED if f > 0 else '#3A3E47'
            car(cv, x, y, '#3A3E47', a13 * pa, .95 * ob((v - 57.25 - (r + c) * .045) / .45))
            if f > 0:
                car(cv, x, y, RED, a13 * f, .95 + .25 * (1 - eo((red_n - rk) / 1.5)))
        ca = a13 * eo((v - 60.3) / .4)
        if ca > 0:
            val = red_n; s = f'{val:.1f}'.replace('.', ',') + ' %'
            text(cv, s, 80, 880, 92, RED, ca)
            text(cv, 'ohne Plakette', 80, 940, 34, WHITE, ca)
            text(cv, 'im 1. Anlauf', 80, 985, 34, WHITE, ca)

    # S14 summary pills
    pill(cv, 540, 466, 'Zahl oben = Monat', win(v, 66.9, 71.45), 'down', sc=ob((v - 66.9) / .45))
    pill(cv, 540, 1236, 'Farbe = Jahr', win(v, 65.7, 71.45), 'up', sc=ob((v - 65.7) / .45))
    cv.restore()  # camera

    # headlines
    HL = [(0.0, 5.3, [[('Was dieser Aufkleber', 0)], [('verrät', 1)]]),
          (5.75, 13.75, [[('Nicht TÜV, sondern', 0)], [('Prüfplakette', 1)]]),
          (13.85, 30.55, [[('Lesen wie', 0)], [('eine ', 0), ('Uhr', 1)]]),
          (30.7, 35.55, [[('6 Farben', 1)], [('im Wechsel', 0)]]),
          (35.65, 43.0, [[('Die Farbe', 0)], [('zeigt das ', 0), ('Jahr', 1)]]),
          (43.1, 46.1, [[('Blau ist', 0)], [('jetzt dran', 1)]]),
          (46.2, 51.05, [[('Die ', 0), ('Fristen', 1)], [('für Pkw', 0)]]),
          (51.2, 56.95, [[('Überzogen?', 0)], [('Bußgeld', 1)]]),
          (57.05, 65.35, [[('Keine', 0)], [('Formalität', 1)]]),
          (65.5, 71.5, [[('In einer', 0)], [('Sekunde', 1), (' gelesen', 0)]])]
    for a, b, ln in HL:
        if a - .1 < v < b + .4: headline(cv, v, a, b, ln)
    SRC = [(5.8, 13.7, 'Quelle: § 29 StVZO'), (13.9, 46.1, 'Quelle: ADAC, TÜV SÜD'), (46.2, 51.0, 'Quelle: TÜV SÜD'),
           (51.2, 56.9, 'Quelle: Bußgeldkatalog, TÜV NORD'), (57.1, 65.3, 'Quelle: TÜV-Report 2026 (rund 9,5 Mio. Hauptuntersuchungen)')]
    for a, b, s in SRC: source(cv, v, a, b, s)
    logo_small(cv, 1 - eo((v - 71.5) / .4))
    if v < 71.5: subtitles(cv, v)
    outro(cv, v)

# ---------------------------------------------------------------- outro
def logo_points():
    s = skia.Surface(W, 400); c = s.getCanvas(); c.clear(0)
    tracked(c, 'function.', 540, 250, 170, RED, 1, -.03)
    a = s.makeImageSnapshot().toarray()[:, :, 3]
    ys, xs = np.nonzero(a[::6, ::6] > 128); pts = list(zip(xs * 6, ys * 6 + 1000 - 250))
    random.seed(3); random.shuffle(pts); return pts[:240]
LPTS = logo_points()
SRCP = []
random.seed(5)
for i in range(len(LPTS)):
    an = random.uniform(0, 2 * math.pi); r = 280 * math.sqrt(random.random()); SRCP.append((540 + r * math.sin(an), 860 - r * math.cos(an), random.uniform(0, .5)))

def outro(cv, v):
    if v < 71.5: return
    la = eo((v - 73.0) / .5)
    for (lx, ly), (sx, sy, d) in zip(LPTS, SRCP):
        p = eio((v - 71.6 - d) / 1.3)
        if v < 71.55 + d * .3: continue
        mx = lerp(sx, lx, p) + 120 * math.sin(p * math.pi) * math.cos(d * 20); my = lerp(sy, ly, p) - 160 * math.sin(p * math.pi) * (d + .2)
        a = eo((v - 71.55 - d * .3) / .2) * (1 - la)
        cv.drawCircle(mx, my, 7, P(RED, .35 * a, blur=6)); cv.drawCircle(mx, my, 3.2, P('#FF6B74', a))
    if la > 0:
        sc = lerp(1.06, 1, eo((v - 73.0) / .8))
        cv.save(); cv.translate(540, 940); cv.scale(sc, sc); cv.translate(-540, -940)
        tracked(cv, 'function.', 540, 1000, 170, RED, la, -.03); cv.restore()
        ripple(cv, 540, 940, v, 73.0, 120, 520)

if __name__ == '__main__':
    mode = sys.argv[1]
    surf = skia.Surface(W, H); cv = surf.getCanvas()
    if mode == 'test':
        ts = [float(x) for x in sys.argv[2].split(',')]
        for t in ts:
            frame(cv, t); surf.makeImageSnapshot().save(f'test_{t:05.1f}.png', skia.kPNG)
    elif mode == 'video':
        n = int(DUR * FPS)
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'faster', '-crf', '19', '-pix_fmt', 'yuv420p', 'video.mp4'], stdin=subprocess.PIPE)
        for i in range(n):
            frame(cv, i / FPS); ff.stdin.write(surf.makeImageSnapshot().toarray().tobytes())
            if i % 150 == 0: print(i, n, flush=True)
        ff.stdin.close(); ff.wait(); print('done', flush=True)
    elif mode == 'events':
        ev = {'dur': DUR, 'T': T, 'OFF': OFF, 'years': [T_2026, T_2027, T_2028], 'sept': T_SEPT, 'sixty': T_60, 'punkt': T_PUNKT,
              'words': {'prüfen': wtime('prüfen'), 'DEKRA': wtime('DEKRA,'), 'GTÜ': wtime('GTÜ'), 'KÜS': wtime('KÜS.')}}
        json.dump(ev, open('events.json', 'w'))
