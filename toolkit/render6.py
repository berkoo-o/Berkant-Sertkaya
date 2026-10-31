"""function. – Kennzeichen-Kürzel (Video 6)
Ohne up/voice6.mp3 werden die Satzzeiten geschätzt (Vorschau). Mit Aufnahme:
  python3 render6.py segs   -> segs6.json aus silencedetect (Sätze), danach test/video wie gewohnt.
"""
import render3 as R3
from render3 import *
import render
import os, subprocess as _sp

OFF6 = 0.15
VOICE6 = 'up/voice6.mp3'
GREYP = '#E4E3DF'; EUB = '#1F3C96'

LINES6 = [
 "Warum steht in Köln nur ein K auf dem Kennzeichen, in vielen Landkreisen aber zwei oder drei Buchstaben?",
 "Das System stammt aus dem Jahr 1956.",
 "Seit dem 1. Juli gilt es in der Bundesrepublik.",
 "Jede Stadt und jeder Kreis bekam ein Kürzel aus dem eigenen Namen.",
 "Zum Start waren es fast 500.",
 "Ein einzelner Buchstabe war selten.",
 "Nur zwölf große Städte bekamen einen, von A für Augsburg bis W für Wuppertal.",
 "In den Siebzigern wurden viele Kreise zusammengelegt.",
 "Zahlreiche Kürzel verschwanden.",
 "1991 kamen die neuen Länder dazu.",
 "Seit 2012 dürfen Kreise alte Kürzel zurückholen.",
 "Mehr als 300 sind seitdem wieder da.",
 "Und seit 2015 darf man sein Kennzeichen beim Umzug behalten.",
 "Ein B fährt heute also auch in Hamburg.",
 "Das Kürzel zeigt, wo ein Auto zugelassen wurde.",
 "Wo es heute steht, verrät es nicht unbedingt.",
]
PARA_END = {0, 2, 4, 6, 8, 9, 11, 13}          # Leerzeile im Sprechertext danach
SP6 = {'1956': 'neunzehnhundertsechsundfünfzig', '1.': 'ersten', '500': 'fünfhundert', '1991': 'neunzehnhunderteinundneunzig',
       '2012': 'zweitausendzwölf', '300': 'dreihundert', '2015': 'zweitausendfünfzehn', 'K': 'ka', 'A': 'aa', 'W': 'wee', 'B': 'bee'}

def _syl(w):
    w = SP6.get(w.strip('.,?'), w.strip('.,?')).lower(); n = 0; prev = False
    for ch in w:
        v_ = ch in 'aeiouäöüy'
        if v_ and not prev: n += 1
        prev = v_
    return max(1, n)

def _estimate():
    segs = []; t = 0.0
    for i, s in enumerate(LINES6):
        d = sum(_syl(w) for w in s.split()) / 4.45 + .12 * s.count(',')
        segs.append((round(t, 2), round(t + d, 2), s)); t += d + (.42 if i in PARA_END else .32)
    return segs

if os.path.exists('segs6.json'):
    SEGS6 = [tuple(x) for x in json.load(open('segs6.json'))]
else:
    SEGS6 = _estimate()
VE6 = SEGS6[-1][1]
VO6 = VE6 + .25
V_END6 = VO6 + 3.3
DUR6 = V_END6 + OFF6
S = [a for a, b, s in SEGS6]; E = [b for a, b, s in SEGS6]

# word timing (as in render5): spread by spoken length, snap to dips in the recording if present
_env = None
if os.path.exists(VOICE6):
    _raw = _sp.run(['ffmpeg', '-loglevel', 'error', '-i', VOICE6, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    _au = np.frombuffer(_raw, dtype=np.float32); _env = np.sqrt(np.convolve(_au ** 2, np.ones(400) / 400, 'same'))[::160]
def _snap(t, a, b):
    if _env is None: return t
    lo = max(a + .08, t - .13); hi = min(b - .08, t + .13)
    if hi <= lo: return t
    i0, i1 = int(lo * 100), int(hi * 100)
    if i1 <= i0 or i1 >= len(_env): return t
    return (i0 + int(np.argmin(_env[i0:i1]))) / 100
WORDS6 = []
for a, b, s in SEGS6:
    ws = s.split(); wt = [len(SP6.get(w.strip('.,:?'), w.strip('.,:?'))) + 2 + (3 if w[-1] in ',:' else 0) for w in ws]
    tot = sum(wt); x = a; st0 = len(WORDS6)
    for w, k in zip(ws, wt):
        d = (b - a) * k / tot; WORDS6.append((x, x + d, w)); x += d
    for j in range(len(ws) - 1):
        i_ = st0 + j; t_ = _snap(WORDS6[i_][1], a, b)
        WORDS6[i_] = (WORDS6[i_][0], t_, WORDS6[i_][2]); WORDS6[i_ + 1] = (t_, WORDS6[i_ + 1][1], WORDS6[i_ + 1][2])
def wt6(word, after=0):
    for a, b, w in WORDS6:
        if a >= after - 1e-6 and w.strip('.,:?') == word: return a
    raise KeyError(word)
CH6 = []
for a, b, s in SEGS6:
    ws = [w for w in WORDS6 if w[0] >= a - 1e-6 and w[1] <= b + 1e-6]; cur = []
    for w in ws:
        if cur and (len(cur) >= 4 or len(' '.join(x[2] for x in cur + [w])) > 22): CH6.append(cur); cur = []
        cur.append(w)
    if cur: CH6.append(cur)
render.CH = []
for i, c in enumerate(CH6):
    nxt = CH6[i + 1][0][0] if i + 1 < len(CH6) else 99
    render.CH.append((c[0][0], min(nxt - .06, c[-1][1] + .35), c))

T_K = wt6('K'); T_ZWEI = wt6('zwei'); T_DREI = wt6('drei'); T_1956 = wt6('1956'); T_JULI = wt6('Juli'); T_BRD = wt6('Bundesrepublik')
T_NAMEN = wt6('Namen'); T_500 = wt6('500'); T_12 = wt6('zwölf'); T_AUGS = wt6('Augsburg'); T_WUPP = wt6('Wuppertal')
T_ZUS = wt6('zusammengelegt'); T_VERS = wt6('verschwanden'); T_1991 = wt6('1991'); T_LAEND = wt6('Länder')
T_2012 = wt6('2012'); T_ZUR = wt6('zurückholen'); T_300 = wt6('300'); T_2015 = wt6('2015'); T_UMZ = wt6('Umzug')
T_B = wt6('B', S[13]); T_HH = wt6('Hamburg'); T_ZUG = wt6('zugelassen'); T_STEHT = wt6('steht', S[15]); T_NICHT = wt6('nicht', S[15])
ACC6 = [T_1956, T_500, T_12, T_1991, T_300, T_2015]

# ---------------------------------------------------------------- plate
PHW, PHH = 440, 105
def plate_face(cv, code, rest, v, hl=0, hu='blau'):
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-PHW, -PHH, PHW, PHH), 16, 16)
    cv.drawRRect(rr, P(GREYP)); cv.drawRRect(rr, P('#1A1A1A', stroke=7, cap=False))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-PHW + 10, -PHH + 10, -PHW + 86, PHH - 10), 8, 8), P(EUB))
    for k in range(12):
        an = k * math.pi / 6; cv.drawCircle(-PHW + 48 + 22 * math.sin(an), -38 - 22 * math.cos(an), 3.2, P(AMBER))
    text(cv, 'D', -PHW + 48, 72, 52, WHITE, 1, 'c')
    f = F(128); x0 = -330; wc = f.measureText(code)
    if hl > 0:
        r = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x0 - 16, -84, x0 + wc + 16, 84), 14, 14)
        cv.drawRRect(r, P(RED, .16 * hl)); cv.drawRRect(r, P(RED, .55 * hl, stroke=14, blur=8)); cv.drawRRect(r, P(RED, hl, stroke=6))
    cv.drawString(code, x0, 46, f, P('#141414'))
    xs = x0 + wc + 52
    cv.save(); cv.translate(xs, -34)
    render.face(cv, 30, COLS[hu], '28', 90); cv.restore()
    cv.drawCircle(xs, 42, 30, P('#B9B8B4')); cv.drawCircle(xs, 42, 30, P('#8A8986', stroke=2))
    cv.drawString(rest, xs + 52, 46, f, P('#141414'))
    # wandering light reflex
    ph = (v * .35 + len(code) * .2) % 1.7 - .35
    if 0 < ph < 1:
        cx = lerp(-1.3 * PHW, 1.3 * PHW, ph)
        g = skia.GradientShader.MakeLinear([skia.Point(cx - 90, -PHH), skia.Point(cx + 90, PHH)], [col(WHITE, 0), col(WHITE, .38), col(WHITE, 0)], [0, .5, 1])
        p3 = skia.Paint(AntiAlias=True); p3.setShader(g)
        cv.save(); cv.clipRRect(rr, doAntiAlias=True); cv.drawRect(skia.Rect.MakeLTRB(-PHW, -PHH, PHW, PHH), p3); cv.restore()

def plate_back(cv, k):
    """back of the plate: dark panel, the logo appears on it during the outro"""
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-PHW, -PHH, PHW, PHH), 16, 16)
    cv.drawRRect(rr, P('#1C1E24')); cv.drawRRect(rr, P(RED, k, stroke=6, cap=False))

def plate3d(cv, cx, cy, s, rx, ry, code, rest, a, v, hl=0, glow=0, back_fn=None, shadow=True):
    if a <= .01 or s <= .01: return
    lay = a < .995
    if lay: cv.saveLayerAlpha(None, int(a * 255))
    if shadow: cv.drawOval(skia.Rect.MakeXYWH(cx - PHW * s * .85, cy + PHH * s * 1.25, PHW * s * 1.7, PHH * s * .35), P('#000000', .4, blur=18 * s))
    back = math.cos(math.radians(ry)) * math.cos(math.radians(rx)) < 0
    for i in range(4, 0, -1):
        cv.save(); cv.concat(pmat(PHW, PHH, 6 * i * (-1 if back else 1), cx, cy, rx, ry, s))
        cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-PHW, -PHH, PHW, PHH), 16, 16), P('#5B5C60')); cv.restore()
    cv.save(); cv.concat(pmat(PHW, PHH, 0, cx, cy, rx, ry, s))
    if glow > 0:
        cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-PHW - 8, -PHH - 8, PHW + 8, PHH + 8), 22, 22), P(RED, .6 * glow, stroke=12, blur=14))
    if back:
        cv.scale(-1, 1)
        if back_fn: back_fn(cv)
        else: plate_back(cv, 0)
    else: plate_face(cv, code, rest, v, hl)
    cv.restore()
    if lay: cv.restore()

def code_screen(cx, cy, s, rx, ry, code):
    f = F(128); wc = f.measureText(code); return proj(-330 + wc / 2, 0, 0, cx, cy, rx, ry, s)

def chip(cv, x, y, w, a, c=GREYP, band=True, glow=0):
    if a <= .01 or w < 1: return
    h = w * .32; r = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x - w / 2, y - h / 2, w, h), h * .18, h * .18)
    if glow > 0: cv.drawRRect(r, P(RED, .5 * glow * a, stroke=w * .12, blur=w * .1))
    cv.drawRRect(r, P(c, a))
    if band: cv.drawRect(skia.Rect.MakeXYWH(x - w / 2 + w * .03, y - h / 2 + h * .12, w * .1, h * .76), P(EUB if c == GREYP else shade(c, .6), a))
    cv.drawRRect(r, P('#000000', .35 * a, stroke=max(1, w * .03)))

# ---------------------------------------------------------------- map (schematic)
BORDER = [(10.9, 53.96), (10.78, 53.7), (10.95, 53.55), (10.6, 53.37), (11.1, 53.2), (11.55, 53.03), (10.95, 52.85), (11.0, 52.5),
          (11.0, 52.2), (10.6, 51.75), (10.2, 51.4), (9.95, 51.0), (10.05, 50.6), (10.95, 50.3), (11.9, 50.35), (12.1, 50.3)]
def gpt6(lon, lat): return (lon - 10.45) * 57, -(lat - 51.15) * 92
DE_PATH = skia.Path(); _p = [gpt6(*q) for q in R2.DE]; DE_PATH.moveTo(*_p[0]); [DE_PATH.lineTo(*q) for q in _p[1:]]; DE_PATH.close()
EAST_PATH = skia.Path(); _b = [gpt6(*q) for q in BORDER]; EAST_PATH.moveTo(*gpt6(10.9, 55.5)); [EAST_PATH.lineTo(*q) for q in _b]
EAST_PATH.lineTo(*gpt6(12.1, 47)); EAST_PATH.lineTo(*gpt6(16, 47)); EAST_PATH.lineTo(*gpt6(16, 55.5)); EAST_PATH.close()
BER = (13.4, 52.52); HAM = (10.0, 53.55)
random.seed(61)
def _rand_pts(n, east=None):
    out = []
    while len(out) < n:
        lo, la = random.uniform(5.9, 15.0), random.uniform(47.3, 55.0); x, y = gpt6(lo, la)
        if not DE_PATH.contains(x, y): continue
        e = EAST_PATH.contains(x, y)
        if east is not None and e != east: continue
        if (lo - 13.4) ** 2 + (la - 52.52) ** 2 < .3 or (lo - 10) ** 2 + (la - 53.55) ** 2 < .3: continue
        out.append((x, y))
    return out

def map_state(v):
    up = eio((v - S[9] + .5) / 1.1); dn = eio((v - S[14] - .2) / 1.0)
    return dict(cx=540, cy=lerp(1250, 870, up) + 420 * dn, rx=26 + 3 * math.sin(v * .5), ry=4 * math.sin(v * .37), sc=lerp(.7, 1.0, up) * lerp(1, .8, dn),
                a=up * (1 - dn))
def mpt(st, x, y): return proj(x, y, 0, st['cx'], st['cy'], st['rx'], st['ry'], st['sc'])
def mll(st, lon, lat): return mpt(st, *gpt6(lon, lat))

def draw_map(cv, st, v):
    a = st['a']
    if a <= .01: return
    cv.saveLayerAlpha(None, int(a * 255))
    for i in range(8, 0, -1):
        cv.save(); cv.concat(pmat(330, 330, 4.5 * i, st['cx'], st['cy'], st['rx'], st['ry'], st['sc'])); cv.drawPath(DE_PATH, P('#101216')); cv.restore()
    cv.save(); cv.concat(pmat(330, 330, 0, st['cx'], st['cy'], st['rx'], st['ry'], st['sc']))
    g = skia.GradientShader.MakeLinear([skia.Point(0, -360), skia.Point(0, 360)], [col('#2C3038'), col('#22252C')], [0, 1])
    pp = skia.Paint(AntiAlias=True); pp.setShader(g); cv.drawPath(DE_PATH, pp)
    # 1991: the east fills in
    ea = eo((v - T_1991 + .1) / .8) * (1 - .6 * eo((v - S[10]) / .6))
    if ea > 0:
        cv.save(); cv.clipPath(EAST_PATH, doAntiAlias=True)
        sweep = eio((v - T_1991 + .1) / 1.4)
        cv.clipRect(skia.Rect.MakeLTRB(-400, 400 - 800 * sweep, 400, 400))
        cv.drawPath(DE_PATH, P(RED, .22 * ea)); cv.restore()
        bl = skia.Path(); bl.moveTo(*_b[0]); [bl.lineTo(*q) for q in _b[1:]]
        pb = P(RED, .8 * ea * (1 - eo((v - S[10]) / .6)), stroke=3); pb.setPathEffect(skia.DashPathEffect.Make([10, 8], v * 20))
        cv.drawPath(bl, pb)
    cv.drawPath(DE_PATH, P('#6B7280', stroke=3)); cv.restore()
    cv.restore()

# ---------------------------------------------------------------- scene data
A_PLATES = [('K', 'FN 56', 'Köln'), ('EU', 'FN 12', 'Kreis Euskirchen'), ('NEA', 'FN 7', 'Neustadt a. d. Aisch')]
NAMES = [('Köln', [0], 'K'), ('Euskirchen', [0, 1], 'EU'), ('Neustadt/Aisch', [0, 1, 9], 'NEA')]
TILES = list('ABDEFHKMNRSW')
GX, GY = 22, 22                                                   # ~500 chips
G2X, G2Y = 12, 10                                                 # chip grid of the 70s scene
random.seed(62)
GONE = set(random.sample(range(G2X * G2Y), 46))
GONE = {i for i in GONE if i % G2X != 0}
GONE_ORD = sorted(GONE, key=lambda i: random.random())
SURV = [i for i in range(G2X * G2Y) if i not in GONE]
WEST_PTS = _rand_pts(len(SURV), east=False)
EAST_PTS = _rand_pts(34, east=True)
NEW_PTS = _rand_pts(300)
NEW_DEL = [random.random() for _ in NEW_PTS]

def grid1_pos(i, v):
    r, c = divmod(i, GX); x = (c - (GX - 1) / 2) * 40; y = (r - (GY - 1) / 2) * 24
    return proj(x, y, 0, 540, 880, 24 + 3 * math.sin(v * .5), 5 * math.sin(v * .3), 1.0)
def tile_pos(k):
    r, c = divmod(k, 4); return 240 + c * 200, 655 + r * 200
def grid2_pos(i):
    r, c = divmod(i, G2X); return 540 + (c - (G2X - 1) / 2) * 76, 850 + (r - (G2Y - 1) / 2) * 52
TILE_SRC = [GX * 3 + 2, GX * 4 + 18, GX * 6 + 7, GX * 8 + 13, GX * 9 + 3, GX * 10 + 19, GX * 11 + 10, GX * 13 + 5, GX * 14 + 16, GX * 16 + 9, GX * 17 + 1, GX * 19 + 14]
TILE_DST = [G2X * 1 + 1, G2X * 1 + 6, G2X * 2 + 10, G2X * 3 + 3, G2X * 4 + 8, G2X * 5 + 1, G2X * 5 + 5, G2X * 6 + 10, G2X * 7 + 3, G2X * 8 + 7, G2X * 8 + 11, G2X * 9 + 4]
for d in TILE_DST: GONE.discard(d)
GONE_ORD = [i for i in GONE_ORD if i in GONE]; SURV = [i for i in range(G2X * G2Y) if i not in GONE]
WEST_PTS = _rand_pts(len(SURV), east=False)

def tile(cv, x, y, s, ch, a, rot=0, hl=0, red=False):
    if a <= .01 or s <= .01: return
    hw = 78
    for i in range(5, 0, -1):
        cv.save(); cv.concat(pmat(hw, hw, 5 * i, x, y, 18 + 4 * math.sin(i), rot, s)); cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw, -hw, hw, hw), 16, 16), P('#4A4C52', a)); cv.restore()
    back = math.cos(math.radians(rot)) < 0
    cv.save(); cv.concat(pmat(hw, hw, 0, x, y, 18, rot, s))
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw, -hw, hw, hw), 16, 16)
    if hl > 0: cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw - 6, -hw - 6, hw + 6, hw + 6), 20, 20), P(RED, .6 * hl * a, stroke=12, blur=12))
    cv.drawRRect(rr, P(RED if red else GREYP, a)); cv.drawRRect(rr, P('#1A1A1A', a, stroke=5, cap=False))
    if not back: text(cv, ch, 0, 40, 112, WHITE if red else '#141414', a, 'c')
    cv.restore()

def calendar6(cv, x, y, s, a, top, bot):
    if a <= .01: return
    cv.save(); cv.translate(x, y); cv.scale(s, s)
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-80, -80, 80, 90), 16, 16), P('#000000', .5 * a, blur=12))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-80, -80, 80, 90), 16, 16), P('#F4F3EF', a))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-80, -80, 80, -22), 16, 16), P(RED, a)); cv.drawRect(skia.Rect.MakeLTRB(-80, -38, 80, -22), P(RED, a))
    text(cv, top, 0, -36, 36, WHITE, a, 'c'); text(cv, bot, 0, 62, 70, '#16181D', a, 'c')
    for k in (-40, 40): cv.drawCircle(k, -80, 9, P('#8A8E97', a))
    cv.restore()

def count_text(cv, v, t0, target, x, y, sz, a, prefix='', suffix='', dur=1.0, start=0, c=RED, align='c'):
    p = eo((v - t0) / dur); val = int(round(lerp(start, target, p)))
    text(cv, f'{prefix}{val}{suffix}', x, y, sz, c, a, align)

def word_hl(cv, s, idx, x, y, sz, a, p):
    f = F(sz); xx = x
    for i, ch in enumerate(s):
        w = f.measureText(ch)
        if i in idx:
            cv.drawString(ch, xx, y - 6 * p, f, P(lerp_col(WHITE, RED, p), a))
        else:
            cv.drawString(ch, xx, y, f, P(WHITE, a * (1 - .65 * p)))
        xx += w
    return xx - x
def lerp_col(a, b, p): return R3.mixc(a, b, p) if hasattr(R3, 'mixc') else (b if p > .5 else a)

def polyline2(cv, pts, prog, w, c, a, tip=True):
    if prog <= 0 or a <= 0: return None
    L = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; tot = sum(L); tgt = tot * cl(prog)
    path = skia.Path(); path.moveTo(*pts[0]); acc = 0; end = pts[0]
    for i, l in enumerate(L):
        if acc + l >= tgt:
            f = (tgt - acc) / l if l else 0; end = (lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)); path.lineTo(*end); break
        path.lineTo(*pts[i + 1]); acc += l; end = pts[i + 1]
    pj = skia.Paint(AntiAlias=True, Color=col(c, a), Style=skia.Paint.kStroke_Style, StrokeWidth=w)
    pj.setStrokeJoin(skia.Paint.kRound_Join); pj.setStrokeCap(skia.Paint.kRound_Cap)
    if c == RED: cv.drawPath(path, P(RED, .35 * a, stroke=w * 3, blur=w))
    cv.drawPath(path, pj)
    if tip and prog < .999: glowtip(cv, end[0], end[1], 1, a)
    return end

def label_tag(cv, x, y, s, a, align='l', sz=26, hl=False):
    if a <= .01: return
    f = F(sz); w = f.measureText(s) + 26; h = sz * 1.6
    x0 = x if align == 'l' else (x - w if align == 'r' else x - w / 2)
    r = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x0, y - h / 2, w, h), h / 2, h / 2)
    cv.drawRRect(r, P(RED if hl else BLACK, .95 * a)); cv.drawRRect(r, P(RED, a, stroke=2.5))
    cv.drawString(s, x0 + 13, y + sz * .36, f, P(WHITE, a))

# ---------------------------------------------------------------- frame
def frame6(cv, t):
    v = t - OFF6
    atmosphere(cv, v + 2)
    push = 1.02 + .018 * math.sin(v * .21) + .008 * math.sin(v * .53)
    acc = 1 + sum(.035 * math.exp(-(v - x) * 5) * cl((v - x) / .06) for x in ACC6 if v > x)
    cv.save(); cv.translate(540, 880); cv.scale(push * acc, push * acc); cv.rotate(.3 * math.sin(v * .3)); cv.translate(-540, -880)

    # ---------- A: hook, three plates
    ex1 = eio((v - S[1] + .1) / .9)
    for k, (code, rest, lab) in enumerate(A_PLATES):
        t0 = [-.15, T_ZWEI - .15, T_DREI - .15][k]
        q = ob((v - t0) / .7)
        if q <= 0: continue
        y0 = [560, 810, 1060][k]
        if k == 0:
            # plate K continues into scenes B and C
            p2 = eio((v - S[3] + .2) / .9); p3 = eio((v - S[4] + .1) / .8)
            cx = 540 + 6 * math.sin(v * .8); cy = lerp(lerp(y0, 640, ex1), 600, p2) + 8 * math.sin(v * .7)
            s = lerp(lerp(.78, .82, ex1), .62, p2) * lerp(.3, 1, q)
            if p3 > 0:
                gx, gy = grid1_pos(GX * 11 + 11, v); cx = lerp(cx, gx, p3); cy = lerp(cy, gy, p3); s = lerp(s, .045, p3)
            rx = 14 + 4 * math.sin(v * .6); ry = -12 + 8 * math.sin(v * .4) + (1 - eo((v + .15) / .9)) * -60
            hl = eo((v - T_K + .1) / .3) * (1 - eo((v - S[1]) / .5)) + eo((v - S[3] - .2) / .4) * (1 - p3)
            a = cl((v + .15) / .2) * (1 - eo((p3 - .85) / .15))
            plate3d(cv, cx, cy, s, rx, ry, code, rest, a, v, hl=hl, glow=.5 * hl * (.6 + .4 * math.sin(v * 5)))
            if 0 < v < S[1] + .3:
                pa = eo((v - T_K - .1) / .4) * (1 - ex1)
                pill(cv, 540, y0 + 125, lab, pa, 'up', 30)
            if T_K - .1 < v < T_K + 1: R3.burst(cv, *code_screen(cx, cy, s, rx, ry, code), v, T_K, 14, 150, seed=1)
        else:
            sink = ex1
            a = cl((v - t0) / .2) * (1 - sink)
            if a <= .01: continue
            cx = 540 + 6 * math.sin(v * .8 + k); cy = y0 + 8 * math.sin(v * .7 + k) + 380 * sink * sink
            s = .78 * lerp(.4, 1, q) * (1 - .3 * sink); rx = 14 + 4 * math.sin(v * .6 + k) + 30 * sink; ry = -12 + 8 * math.sin(v * .4 + k) + (1 - q) * 50
            plate3d(cv, cx, cy, s, rx, ry, code, rest, a, v, hl=eo((v - t0 - .3) / .3))
            pill(cv, 540, y0 + 125, lab, a * eo((v - t0 - .4) / .4), 'up', 30)

    # ---------- B: 1956 / 1. Juli
    if S[1] - .3 < v < S[3] + .8:
        ba = eo((v - T_1956 + .55) / .3); out = eio((v - S[3] + .1) / .7)
        ya = 920 + 300 * out * out
        sh = eio((v - S[2] + .1) / .8)
        yx = lerp(540, 330, sh); ysz = lerp(210, 150, sh)
        cv.save(); cv.translate(yx, ya); sc = 1 + .08 * math.exp(-(v - T_1956) * 4) * (v > T_1956)
        cv.scale(sc, sc)
        p = eo((v - T_1956 + .4) / 1.0)
        yr = int(round(lerp(1900, 1956, p)))
        text(cv, str(yr), 0, ysz * .36, ysz, RED, ba * (1 - out), 'c')
        cv.restore()
        if v > T_1956 - .05: ripple(cv, yx, ya, v, T_1956 + .5, 80, 360, 1 - out)
        ca = eo((v - T_JULI + .3) / .4) * (1 - out)
        if ca > 0:
            fl = ob((v - T_JULI + .3) / .6)
            cv.save(); cv.translate(800, ya - 10); cv.scale(1, max(.05, fl)); calendar6(cv, 0, 0, 1.15, ca, 'JULI', '1.'); cv.restore()
        pill(cv, 540, 1150 + 300 * out * out, 'Bundesrepublik', eo((v - T_BRD + .1) / .4) * (1 - out), None, 30)

    # ---------- C: names -> codes
    if S[3] - .2 < v < S[4] + 1:
        out = eio((v - S[4] + .1) / .5)
        for k, (nm, idx, code) in enumerate(NAMES):
            t0 = S[3] + .15 + k * (E[3] - S[3] - .4) / 3
            a = eo((v - t0) / .35) * (1 - out)
            if a <= .01: continue
            y = 860 + k * 135 + 30 * (1 - eo((v - t0) / .35)) + 260 * out * out
            hp = eio((v - t0 - .45) / .5)
            word_hl(cv, nm, idx, 110, y, 64, a, hp)
            lp = eio((v - t0 - .6) / .5)
            if lp > 0:
                cv.drawLine(690, y - 22, 690 + 110 * lp, y - 22, P(RED, a, stroke=4))
                if lp < .99: glowtip(cv, 690 + 110 * lp, y - 22, .8, a)
                else:
                    pth = skia.Path(); pth.moveTo(800, y - 22); pth.lineTo(784, y - 32); pth.lineTo(784, y - 12); pth.close(); cv.drawPath(pth, P(RED, a))
            text(cv, code, 970, y, 72, RED, a * eo((v - t0 - 1.0) / .3), 'r')

    # ---------- D: ~500 chips
    if S[4] - .3 < v < S[6] + 1.5:
        gin = S[4] + .3; fly = eio((v - S[5] - .1) / 1.0)
        items = []
        for i in range(GX * GY):
            x, y = grid1_pos(i, v); r, c = divmod(i, GX); d = math.hypot(c - 10.5, r - 10.5)
            items.append((y, x, i, d))
        for y, x, i, d in sorted(items):
            if i in TILE_SRC: continue
            q = ob((v - gin - d * .045) / .4)
            if q <= 0: continue
            sink = eio((v - S[5] - .1 - (d % 3) * .08) / .9)
            a = cl((v - gin - d * .045) / .15) * (1 - sink)
            chip(cv, x, y + 300 * sink * sink, 34 * q, a * (1 - .5 * eo((v - S[5]) / .4)))
        for k, i in enumerate(TILE_SRC):
            x, y = grid1_pos(i, v); r, c = divmod(i, GX); d = math.hypot(c - 10.5, r - 10.5)
            q = ob((v - gin - d * .045) / .4)
            if q <= 0: continue
            g = eo((v - S[5] + .1 - k * .03) / .4)
            if fly <= 0:
                chip(cv, x, y, 34 * q * (1 + .25 * g), cl((v - gin - d * .045) / .15), mixc(GREYP, RED, g), True, g)
        # counter
        ca = eo((v - T_500 + .2) / .4) * (1 - eo((v - S[5]) / .4))
        if ca > 0:
            n = int(round(500 * eo((v - T_500 + .2) / 1.0)))
            pill(cv, 540, 1255, f'fast {n} Kürzel', ca, None, 36)
        if T_500 < v < T_500 + 1.2: ripple(cv, 540, 880, v, T_500 + .1, 100, 520)

    # ---------- E: twelve single letters
    if S[5] - .2 < v < S[8] + .5:
        fly = eio((v - S[5] - .1) / 1.0); back = eio((v - S[7] + .05) / .9)
        for k, ch in enumerate(TILES):
            fl = eio((v - S[5] - .1 - k * .05) / 1.0)
            if fl <= 0: continue
            sx, sy = grid1_pos(TILE_SRC[k], v); tx, ty = tile_pos(k)
            x = lerp(sx, tx, fl); y = lerp(sy, ty, fl) - 120 * math.sin(fl * math.pi)
            s = lerp(.22, 1, fl)
            rot = (1 - fl) * 180 + 6 * math.sin(v * .7 + k)
            hl = 0; red = False
            if ch == 'A': hl = eo((v - T_AUGS + .15) / .3)
            if ch == 'W': hl = eo((v - T_WUPP + .15) / .3)
            if ch == 'K': hl = .5 * eo((v - S[6]) / .5)
            if back > 0:
                dx, dy = grid2_pos(TILE_DST[k]); x = lerp(x, dx, back); y = lerp(y, dy, back); s = lerp(s, .41, back)
                rot += 180 * back; hl *= 1 - back
            red = hl > .5 and ch in 'AW'
            tile(cv, x, y, s, ch, cl(fl * 3) * (1 - eo((back - .7) / .3)), rot, hl, red)
            if ch in 'AW':
                t0 = T_AUGS if ch == 'A' else T_WUPP
                if t0 - .15 < v < t0 + 1: R3.burst(cv, x, y, v, t0, 14, 160, seed=k)
        pa = eo((v - T_AUGS + .1) / .4) * (1 - back)
        pill(cv, tile_pos(0)[0] + 40, 470, 'A = Augsburg', pa, 'down', 30)
        pw = eo((v - T_WUPP + .1) / .4) * (1 - back)
        pill(cv, tile_pos(11)[0] - 60, 1235, 'W = Wuppertal', pw, 'up', 30)

    # ---------- F: 70s – districts merge, codes vanish
    if S[7] - .2 < v < S[9] + 1.6:
        grow = eo((v - S[7] - .3) / .6); tomap = eio((v - S[9] + .3) / 1.1)
        st = map_state(v)
        for i in range(G2X * G2Y):
            x, y = grid2_pos(i); r, c = divmod(i, G2X)
            if i in TILE_DST: base_a = eo((v - S[7] - .7) / .2)
            else: base_a = eo((v - S[7] - .1 - (r + c) * .03) / .3)
            if base_a <= 0: continue
            w = 64
            if i in GONE:
                k = GONE_ORD.index(i); tg = S[7] + 1.2 + k * (E[8] - S[7] - 1.6) / len(GONE_ORD)
                m = eio((v - tg) / .5); fall = cl((v - tg - .45) / .8)
                xx = x - 76 * m * .82; yy = y + 420 * fall * fall
                cc = mixc(GREYP, '#5A5D64', m)
                chip(cv, xx, yy, w * (1 - .2 * m), base_a * (1 - fall), cc)
                if 0 < v - tg < .6: cv.drawCircle(x - 76, y, 20 + 40 * (v - tg), P(RED, .5 * (1 - (v - tg) / .6), stroke=2))
            else:
                j = SURV.index(i)
                if tomap > 0:
                    mx, my = mpt(st, *WEST_PTS[j]); d = tomap
                    x = lerp(x, mx, d); y = lerp(y, my, d) - 80 * math.sin(d * math.pi)
                    w = lerp(64, 9, d)
                    if d > .97: continue
                chip(cv, x, y, w, base_a, GREYP)

    # ---------- G/H/I: map
    st = map_state(v)
    if st['a'] > .01:
        draw_map(cv, st, v)
        dim = 1 - .75 * eo((v - S[12] - .1) / .6)
        for j, (x, y) in enumerate(WEST_PTS):
            a = st['a'] * eo((v - S[9] - .55) / .3) * dim
            if a > 0:
                px, py = mpt(st, x, y); cv.drawCircle(px, py, 8, P(RED, .3 * a, blur=5)); cv.drawCircle(px, py, 4.2, P('#FF4A55', a))
        for j, (x, y) in enumerate(EAST_PTS):
            tg = T_LAEND - .3 + j * .02; q = ob((v - tg) / .4)
            if q > 0:
                px, py = mpt(st, x, y); a = st['a'] * cl((v - tg) / .1) * dim
                cv.drawCircle(px, py, 8, P(RED, .3 * a, blur=5)); cv.drawCircle(px, py, 4.2 * q, P('#FF4A55', a))
                if v - tg < .5: cv.drawCircle(px, py, 6 + 30 * (v - tg), P(RED, .5 * (1 - 2 * (v - tg)) * st['a'], stroke=1.5))
        t0n = T_ZUR - .2; t1n = E[11] - .2
        for j, (x, y) in enumerate(NEW_PTS):
            tg = lerp(t0n, t1n, NEW_DEL[j] ** 1.4); q = ob((v - tg) / .35)
            if q > 0:
                px, py = mpt(st, x, y); a = st['a'] * cl((v - tg) / .1) * dim
                g = eo((v - tg) / .6)
                cv.drawCircle(px, py, 3.6 * q, P(mixc(WHITE, '#FF6B74', g), a))
        # counter pill 300
        ca = eo((v - T_ZUR) / .4) * (1 - eo((v - S[12]) / .4)) * st['a']
        if ca > 0:
            pr = cl((v - t0n) / (t1n - t0n + .35)); n = int(round(300 * (pr ** .7 if pr < 1 else 1)))
            pill(cv, 540, 1262, f'über {n} Kürzel zurück' if pr >= 1 else f'{n} Kürzel zurück', ca, None, 34)
        # 2015: B moves from Berlin to Hamburg
        ia = eo((v - S[12] - .2) / .5) * st['a']
        if ia > 0:
            bx, by = mll(st, *BER); hx, hy = mll(st, *HAM)
            for (nm, (x_, y_), side) in [('Berlin', (bx, by), 1), ('Hamburg', (hx, hy), -1)]:
                cv.drawCircle(x_, y_, 9, P(WHITE, ia)); cv.drawCircle(x_, y_, 16, P(WHITE, .3 * ia, stroke=2))
            ctrl = mll(st, 11.9, 53.95)
            pts = [(lerp(lerp(bx, ctrl[0], u), lerp(ctrl[0], hx, u), u), lerp(lerp(by, ctrl[1], u), lerp(ctrl[1], hy, u), u)) for u in [i / 30 for i in range(31)]]
            mv = eio((v - T_UMZ + .1) / (max(1.4, S[13] + .2 - T_UMZ)))
            if mv > 0: polyline2(cv, pts, mv, 6, RED, ia, mv < .99)
            if mv >= .99: ripple(cv, hx, hy, v, T_UMZ + max(1.4, S[13] + .2 - T_UMZ), 10, 90)
            label_tag(cv, bx + 24, by + 34, 'Berlin', ia * (1 - eo((v - S[14]) / .3)), 'l', 26)
            label_tag(cv, hx - 24, hy - 2, 'Hamburg', ia * eo((v - T_HH + .1) / .4) * (1 - eo((v - S[14]) / .3)), 'r', 26, True)
    # mini plate rides along and then becomes the hero plate
    if S[12] < v < VO6 + 3.5:
        st = map_state(v)
        bx, by = mll(st, *BER); hx, hy = mll(st, *HAM); ctrl = mll(st, 11.9, 53.95)
        mv = eio((v - T_UMZ + .1) / (max(1.4, S[13] + .2 - T_UMZ)))
        u = mv; px = lerp(lerp(bx, ctrl[0], u), lerp(ctrl[0], hx, u), u); py = lerp(lerp(by, ctrl[1], u), lerp(ctrl[1], hy, u), u) - 88
        q = ob((v - S[12] - .3) / .5); s = .24 * q
        hero = eio((v - S[14] + .1) / 1.1)
        cx = lerp(px, 540, hero); cy = lerp(py, 760, hero) - 140 * math.sin(hero * math.pi); s = lerp(s, .9, hero)
        rx = lerp(10, 12 + 4 * math.sin(v * .6), hero); ry = lerp(0, -10 + 6 * math.sin(v * .4), hero) + 360 * hero
        # outro flip
        o = v - VO6; fl = eio((o - .1) / .9)
        ry += 180 * fl; cy = lerp(cy, 880, eio(o / 1.0)); s *= lerp(1, 1.02, fl)
        hl = eo((v - T_B + .1) / .3) * (1 - eo((v - S[14] - .2) / .4)) + eo((v - T_ZUG) / .4) * (1 - eo((o + .1) / .3))
        def _back(c):
            plate_back(c, eo((o - .5) / .4))
            tracked(c, 'function.', 0, 40, 130, RED, eo((o - .55) / .4), -.03)
        ga = 1 - eo((o - 1.7) / .5)
        plate3d(cv, cx, cy, s, rx, ry, 'B', 'FN 15', cl((v - S[12] - .3) / .15) * ga, v, hl=hl, glow=hl * .5, back_fn=_back)
        if T_B - .1 < v < T_B + 1: R3.burst(cv, *code_screen(cx, cy, s, rx, ry, 'B'), v, T_B, 12, 120, seed=4)
        # J: pills
        ja = 1 - eo((o + .2) / .3)
        pill(cv, 290, 1000, 'Zugelassen: Berlin', eo((v - T_ZUG + .1) / .4) * ja, 'up', 30, hl=True)
        pill(cv, 800, 1000, 'Standort: ?', eo((v - T_STEHT + .1) / .4) * ja, None, 30)
    cv.restore()

    # ---------- outro: logo stays after the plate fades
    o = v - VO6
    if o > 1.5:
        la = eo((o - 1.5) / .5); gq = eio((o - 1.9) / 1.0)
        tracked(cv, 'function.', 540, lerp(917, 940, gq), lerp(119, 150, gq), RED, la, -.03)
        lw = 440 * eio((o - 1.7) / .9)
        if lw > 0:
            cv.drawLine(540 - lw / 2, 985, 540 + lw / 2, 985, P(RED, .9, stroke=5))
            for sx in (-1, 1): glowtip(cv, 540 + sx * lw / 2, 985, .8, 1 - eo((o - 2.6) / .4))
        ripple(cv, 540, 900, v, VO6 + 1.6, 100, 520)
    if 0 < o < 1.2: R3.burst(cv, 540, 880, v, VO6 + .55, 20, 260, seed=9)

    # ---------- headlines, sources, logo, subtitles
    HL = [(0.0, S[1] - .1, [[('Warum nur', 0)], [('ein ', 0), ('K?', 1)]]),
          (S[1], S[3] - .1, [[('Das System', 0)], [('stammt von ', 0), ('1956', 1)]]),
          (S[3], S[4] - .1, [[('Kürzel aus dem', 0)], [('eigenen ', 0), ('Namen', 1)]]),
          (S[4], S[5] - .1, [[('Zum Start', 0)], [('fast ', 0), ('500', 1)]]),
          (S[5], S[7] - .1, [[('Nur ', 0), ('12 Städte', 1)], [('mit einem Buchstaben', 0)]]),
          (S[7], S[9] - .1, [[('70er: Kreise', 0)], [('zusammengelegt', 1)]]),
          (S[9], S[10] - .1, [[('1991:', 1)], [('die neuen Länder', 0)]]),
          (S[10], S[12] - .1, [[('Seit 2012:', 0)], [('alte Kürzel ', 0), ('zurück', 1)]]),
          (S[12], S[14] - .1, [[('Seit 2015:', 0)], [('Kennzeichen ', 0), ('behalten', 1)]]),
          (S[14], VO6, [[('Zeigt die ', 0), ('Zulassung', 1)], [('nicht den Standort', 0)]])]
    for a, b, ln in HL:
        if a - .1 < v < b + .4: headline3(cv, v, a, b, ln, base=255)
    for a, b, s in [(S[1], S[3] - .1, 'Quelle: StVZO, Bundesgesetzblatt 30.04.1956'),
                    (S[4], S[7] - .1, 'Quelle: Bundesgesetzblatt 1956 · gerundet'),
                    (S[9], S[10] - .1, 'Karte schematisch'),
                    (S[10], S[12] - .1, 'Quelle: BMV (Stand 2024) · Karte schematisch'),
                    (S[12], S[14] - .1, 'Quelle: FZV, seit 01.01.2015 · schematisch')]:
        source(cv, v, a, b, s)
    logo_small(cv, cl((v - .3) / .5) * (1 - eo((v - VO6) / .4)))
    if 0 <= v < VE6 + .3: subtitles(cv, v)

def segs_from_voice():
    out = _sp.run(['ffmpeg', '-i', VOICE6, '-af', 'silencedetect=noise=-40dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(l.split('silence_start: ')[1]) for l in out.splitlines() if 'silence_start' in l]
    en = [float(l.split('silence_end: ')[1].split()[0]) for l in out.splitlines() if 'silence_end' in l]
    return st, en

if __name__ == '__main__':
    mode = sys.argv[1]; surf = skia.Surface(W, H); cv = surf.getCanvas()
    if mode == 'test':
        for t in [float(x) for x in sys.argv[2].split(',')]:
            frame6(cv, t); surf.makeImageSnapshot().save(f'k_{t:05.1f}.png', skia.kPNG)
    elif mode == 'video':
        a0, a1, out = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
        ff = _sp.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-preset', 'faster', '-crf', '19', '-pix_fmt', 'yuv420p', out], stdin=_sp.PIPE)
        for i in range(a0, a1):
            frame6(cv, i / FPS); ff.stdin.write(surf.makeImageSnapshot().toarray().tobytes())
            if i % 150 == 0: print(i, a1, flush=True)
        ff.stdin.close(); ff.wait(); print('done', flush=True)
    elif mode == 'events':
        json.dump({'dur': DUR6, 'OFF': OFF6, 'VO': VO6, 'acc': ACC6, 'n': int(DUR6 * FPS), 'S': S, 'E': E,
                   'k': T_K, 'zwei': T_ZWEI, 'drei': T_DREI, 'y1956': T_1956, 'juli': T_JULI, 'brd': T_BRD, 't500': T_500, 'augs': T_AUGS, 'wupp': T_WUPP,
                   'y1991': T_1991, 'laender': T_LAEND, 'y2012': T_2012, 'zur': T_ZUR, 't300': T_300, 'y2015': T_2015, 'umzug': T_UMZ, 'b': T_B, 'hh': T_HH,
                   'zug': T_ZUG, 'steht': T_STEHT, 'voice': os.path.exists(VOICE6)}, open('events6.json', 'w'))
    elif mode == 'segs':
        st, en = segs_from_voice(); print('silence starts', st); print('silence ends', en)
