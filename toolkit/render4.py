import render3 as R3
from render3 import *
import render

OFF4 = 0.6           # engine start before the voice
T4 = 1.0             # voice tempo (original speed)
VE = 64.25           # voice end
VO4 = 64.45          # outro start
V_END4 = VO4 + 3.1
DUR4 = V_END4 / T4 + OFF4
ABLUE = '#1F4E9A'

SEGS4 = [
 (0.0, 2.93, "Deutschland hat rund 120 Autobahnen."),
 (3.41, 5.92, "Und jede Nummer verrät, wo Sie gerade sind."),
 (6.32, 8.99, "Das System gilt seit 1975."),
 (9.43, 11.47, "Die Zahl der Ziffern zeigt die Bedeutung."),
 (11.92, 14.85, "Einstellige Autobahnen führen quer durchs ganze Land."),
 (15.24, 17.90, "Gerade oder ungerade verrät die Richtung."),
 (18.36, 21.29, "Ungerade Nummern verlaufen meist von Nord nach Süd,"),
 (21.51, 23.20, "gerade von West nach Ost."),
 (23.60, 25.44, "Die A7 ist das beste Beispiel."),
 (25.80, 30.06, "Mit rund 960 Kilometern ist sie die längste Autobahn Deutschlands,"),
 (30.26, 32.37, "von der dänischen Grenze bis nach Füssen."),
 (32.80, 36.05, "Bei zweistelligen Nummern steht die erste Ziffer für die Region."),
 (36.45, 38.88, "Die 4 für Rhein-Ruhr bis Rhein-Main,"),
 (39.12, 40.69, "die 8 für Baden-Württemberg,"),
 (41.03, 42.37, "die 9 für Südbayern."),
 (42.78, 46.53, "Dreistellige Nummern sind kurze Zubringer und Stadtautobahnen,"),
 (46.70, 49.45, "etwa die A995 bei München."),
 (49.84, 51.65, "Ganz streng ist das System nicht."),
 (51.95, 55.54, "Die A3 verläuft über weite Strecken eher von West nach Ost."),
 (55.92, 58.09, "Die Nummer ist also eine kleine Landkarte:"),
 (58.46, 59.83, "Ziffern für die Bedeutung,"),
 (60.14, 62.34, "gerade oder ungerade für die Richtung,"),
 (62.53, 64.20, "die erste Ziffer für die Region."),
]
SP4 = {'120': 'hundertzwanzig', '1975': 'neunzehnhundertfünfundsiebzig', '960': 'neunhundertsechzig', 'A7': 'aasieben',
       'A995': 'aaneunneunfünf', 'A3': 'aadrei', '4': 'vier', '8': 'acht', '9': 'neun'}
import subprocess as _sp
_raw = _sp.run(['ffmpeg', '-loglevel', 'error', '-i', 'up/voice3.mp3', '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
_au = np.frombuffer(_raw, dtype=np.float32); _hop = 160
_env = np.sqrt(np.convolve(_au ** 2, np.ones(400) / 400, 'same'))[::_hop]
def _snap(t, a, b):
    lo = max(a + .08, t - .13); hi = min(b - .08, t + .13)
    if hi <= lo: return t
    i0, i1 = int(lo * 100), int(hi * 100)
    if i1 <= i0 or i1 >= len(_env): return t
    return (i0 + int(np.argmin(_env[i0:i1]))) / 100
WORDS4 = []
for a, b, s in SEGS4:
    ws = s.split(); wt = [len(SP4.get(w.strip('.,:?'), w.strip('.,:?'))) + 2 + (3 if w[-1] in ',:' else 0) for w in ws]
    tot = sum(wt); x = a
    for w, k in zip(ws, wt):
        d = (b - a) * k / tot; WORDS4.append((x, x + d, w)); x += d
    n_ = len(ws)
    for j in range(n_ - 1):
        i_ = len(WORDS4) - n_ + j; t_ = _snap(WORDS4[i_][1], a, b)
        WORDS4[i_] = (WORDS4[i_][0], t_, WORDS4[i_][2]); WORDS4[i_ + 1] = (t_, WORDS4[i_ + 1][1], WORDS4[i_ + 1][2])
def wt4(word, after=0):
    for a, b, w in WORDS4:
        if a >= after and w.strip('.,:?') == word: return a
    raise KeyError(word)
CH4 = []
for a, b, s in SEGS4:
    ws = [w for w in WORDS4 if w[0] >= a - 1e-6 and w[1] <= b + 1e-6]; cur = []
    for w in ws:
        if cur and (len(cur) >= 4 or len(' '.join(x[2] for x in cur + [w])) > 22): CH4.append(cur); cur = []
        cur.append(w)
    if cur: CH4.append(cur)
render.CH = []
for i, c in enumerate(CH4):
    nxt = CH4[i + 1][0][0] if i + 1 < len(CH4) else 99
    render.CH.append((c[0][0], min(nxt - .06, c[-1][1] + .35), c))
T1975 = wt4('1975'); T960 = wt4('960')
ACC4 = [T1975, wt4('4', 36), wt4('8', 39), wt4('9', 41), wt4('A995'), 18.36, 21.51]
WH4 = [6.15, 9.3, 15.05, 23.45, 32.65, 42.65, 49.75, 55.75, VO4]

# ---------------------------------------------------------------- data
ROUTES = {
 'A1': [(11.0,54.37),(10.69,53.87),(10.05,53.55),(8.8,53.08),(8.05,52.28),(7.63,51.96),(7.47,51.51),(7.15,51.26),(6.96,50.94),(6.72,50.45),None,(6.88,50.2),(6.86,50.0),(6.78,49.82),(6.93,49.6),(7.0,49.3)],
 'A2': [(6.85,51.47),(7.47,51.51),(8.53,52.02),(9.73,52.37),(10.52,52.27),(11.63,52.13),(13.1,52.4)],
 'A3': [(6.2,51.83),(6.85,51.47),(6.96,50.94),(7.9,50.4),(8.68,50.11),(9.93,49.79),(11.08,49.45),(12.1,49.01),(13.46,48.57)],
 'A4': [(6.08,50.78),(6.96,50.94),(7.85,51.03),(9.7,50.87),(10.32,50.98),(11.03,50.98),(11.59,50.93),(12.92,50.83),(13.74,51.05),(14.99,51.15)],
 'A5': [(9.6,50.83),(8.68,50.58),(8.68,50.11),(8.65,49.87),(8.69,49.4),(8.4,49.0),(7.85,48.0),(7.62,47.59)],
 'A6': [(7.0,49.23),(7.77,49.44),(8.47,49.49),(9.22,49.14),(10.0,49.25),(11.08,49.45),(12.5,49.63)],
 'A7': [(9.3,54.8),(9.6,54.45),(9.95,53.55),(9.9,53.0),(9.8,52.37),(9.95,51.8),(9.48,51.31),(9.68,50.55),(9.93,49.79),(10.0,49.1),(9.99,48.4),(10.3,47.95),(10.7,47.57)],
 'A8': [(6.38,49.47),(6.75,49.32),(7.17,49.35),(7.36,49.25),(7.6,49.2),None,(8.4,49.0),(9.18,48.78),(9.99,48.4),(10.9,48.37),(11.58,48.14),(12.3,47.85),(12.95,47.78)],
 'A9': [(13.2,52.35),(12.6,51.9),(12.37,51.34),(11.92,50.31),(11.08,49.45),(11.42,48.76),(11.58,48.14)],
}
ODD = ['A1', 'A3', 'A5', 'A7', 'A9']; EVEN = ['A2', 'A4', 'A6', 'A8']
A7CITIES = [('Dänische Grenze', (9.3, 54.8), -1), ('Hamburg', (9.95, 53.55), 1), ('Hannover', (9.8, 52.37), -1), ('Kassel', (9.48, 51.31), 1),
            ('Würzburg', (9.93, 49.79), -1), ('Ulm', (9.99, 48.4), 1), ('Füssen', (10.7, 47.57), -1)]
ZONES = [(1, (13.0, 52.1)), (2, (9.6, 53.7)), (3, (8.9, 52.45)), (4, (8.2, 50.65)), (5, (6.6, 51.3)), (6, (7.3, 49.65)), (7, (11.1, 50.35)), (8, (9.0, 48.55)), (9, (11.9, 48.05))]

def gpt(lon, lat): return (lon - 10.45) * 57, -(lat - 51.15) * 92

# ---------------------------------------------------------------- shield (Zeichen 405 style)
def shield_geom(h, label):
    f = F(h * .56); tw = f.measureText(label); w = max(h * 1.25, tw + h * .55); return f, tw, w
def shield_face(cv, h, label, hl=(), a=1):
    f, tw, w = shield_geom(h, label)
    r = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-w / 2, -h / 2, w / 2, h / 2), h * .2, h * .2)
    g = skia.GradientShader.MakeLinear([skia.Point(0, -h / 2), skia.Point(0, h / 2)], [col(shade(ABLUE, 1.25), a), col(ABLUE, a), col(shade(ABLUE, .8), a)], [0, .5, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(g); cv.drawRRect(r, p)
    ri = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-w / 2 + h * .07, -h / 2 + h * .07, w / 2 - h * .07, h / 2 - h * .07), h * .15, h * .15)
    cv.drawRRect(ri, P(WHITE, a, stroke=h * .045, cap=False))
    x = -tw / 2; pos = []
    for i, ch in enumerate(label):
        cw = f.measureText(ch)
        if i in hl:
            rr = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x - h * .03, -h * .3, x + cw + h * .03, h * .28), h * .06, h * .06)
            cv.drawRRect(rr, P(RED, .9 * a))
        cv.drawString(ch, x, h * .2, f, P(WHITE, a)); pos.append(x + cw / 2); x += cw
    gl = skia.GradientShader.MakeLinear([skia.Point(-w / 2, -h / 2), skia.Point(w / 2, h / 2)], [col(WHITE, .18 * a), col(WHITE, 0), col(WHITE, 0)], [0, .4, 1])
    p2 = skia.Paint(AntiAlias=True); p2.setShader(gl); cv.drawRRect(r, p2)
    return w, pos

def shield(cv, cx, cy, h, label, rx=0, ry=0, a=1, glow=0, hl=(), shadow=True):
    if a <= .01 or h < 3: return
    f, tw, w = shield_geom(h, label)
    if shadow: cv.drawOval(skia.Rect.MakeXYWH(cx - w * .45, cy + h * .62, w * .9, h * .2), P('#000000', .35 * a, blur=h * .1))
    for i in range(6, 0, -1):
        cv.save(); cv.concat(pmat(w / 2, h / 2, h * .1 * i / 6, cx, cy, rx, ry))
        cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-w / 2, -h / 2, w / 2, h / 2), h * .2, h * .2), P('#0E2348', a)); cv.restore()
    cv.save(); cv.concat(pmat(w / 2, h / 2, 0, cx, cy, rx, ry))
    if glow > 0: cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-w / 2 - 6, -h / 2 - 6, w / 2 + 6, h / 2 + 6), h * .22, h * .22), P(RED, .7 * glow * a, stroke=h * .06, blur=h * .07))
    shield_face(cv, h, label, hl, a); cv.restore()

# ---------------------------------------------------------------- map
MUC = (11.58, 48.14)
def _shift_to(s, ll, target):
    p = mproj(s, *ll); s['cx'] += target[0] - p[0]; s['cy'] += target[1] - p[1]; return s
def map_state(v):
    s = dict(cx=540, cy=845, rx=20, ry=-5 + 4 * math.sin(v * .25), sc=1.2, a=0)
    if 5.6 <= v < 9.3:
        p = eio((v - 5.6) / 1.3); s.update(a=eo((v - 5.6) / .6), rx=lerp(62, 20, p), sc=lerp(.75, 1.2, p), cy=lerp(960, 845, p))
    elif 9.3 <= v < 12.6:
        d = eio((v - 9.3) / .6) * (1 - eio((v - 11.85) / .75)); s.update(a=1 - .62 * d, sc=1.2 - .14 * d, cy=845 + 50 * d, rx=20 + 8 * d)
    elif 12.6 <= v < 23.45: s.update(a=1)
    elif 23.45 <= v < 32.65:
        p = eio((v - 23.45) / 1.2); s.update(a=1, rx=lerp(20, 24, p), sc=lerp(1.2, 1.25, p), ry=lerp(s['ry'], -3, p))
    elif 32.65 <= v < 42.7:
        p = eio((v - 32.65) / 1.0); s.update(a=1, rx=lerp(24, 26, p), sc=lerp(1.25, 1.2, p), ry=lerp(-3, -5 + 4 * math.sin(v * .25), p))
    elif 42.7 <= v < 44.4:
        q = eio((v - 42.7) / 1.4); s.update(rx=26, ry=-5 + 4 * math.sin(42.7 * .25))
        p0 = mproj(dict(s), *MUC); s.update(sc=lerp(1.2, 5.5, q), a=1 - eio((v - 43.1) / 1.0))
        _shift_to(s, MUC, (lerp(p0[0], 540, q), lerp(p0[1], 880, q)))
    elif 48.9 <= v < 55.4:
        q = eio((v - 48.9) / 1.2); p0 = mproj(dict(s), *MUC)
        s.update(sc=lerp(5.5, 1.2, q), a=eo((v - 49.0) / .6)); _shift_to(s, MUC, (lerp(540, p0[0], q), lerp(880, p0[1], q)))
    elif 55.4 <= v < 56.7:
        q = eio((v - 55.4) / 1.1); s.update(sc=lerp(1.2, .8, q), cy=lerp(845, 1060, q), rx=lerp(20, 50, q), a=1 - eo((v - 55.5) / .9))
    return s

def mproj(st, lon, lat):
    x, y = gpt(lon, lat); return proj(x, y, 0, st['cx'], st['cy'], st['rx'], st['ry'], st['sc'])
def _chaikin(pts, it=2):
    for _ in range(it):
        if len(pts) < 3: break
        q = [pts[0]]
        for a, b in zip(pts[:-1], pts[1:]):
            q.append((a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25)); q.append((a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75))
        q.append(pts[-1]); pts = q
    return pts
_SMOOTH = {}
def _geo_segs(name):
    if name not in _SMOOTH:
        out, cur = [], []
        for p in ROUTES[name]:
            if p is None: out.append(cur); cur = []
            else: cur.append(p)
        out.append(cur); _SMOOTH[name] = [_chaikin(c) for c in out]
    return _SMOOTH[name]
def route_segs(st, name):
    return [[mproj(st, *p) for p in seg] for seg in _geo_segs(name)]
def route_screen(st, name):
    sg = route_segs(st, name); return max(sg, key=lambda q: sum(math.dist(q[i], q[i + 1]) for i in range(len(q) - 1)))
def draw_route(cv, st, name, prog, w, c, a, tip=True):
    sg = route_segs(st, name); L = [sum(math.dist(q[i], q[i + 1]) for i in range(len(q) - 1)) for q in sg]; tot = sum(L); acc = 0; end = None
    for q, l in zip(sg, L):
        pr = cl((prog * tot - acc) / l) if l else 0
        if pr > 0: end = polyline2(cv, q, pr, w, c, a, tip and pr < 1) or end
        acc += l
    return end

def draw_germany(cv, st, v):
    a = st['a']
    if a <= .01: return
    path = skia.Path(); pts = [gpt(*p) for p in DE]; path.moveTo(*pts[0])
    for p in pts[1:]: path.lineTo(*p)
    path.close()
    cv.saveLayerAlpha(None, int(a * 255))
    for i in range(8, 0, -1):
        cv.save(); cv.concat(pmat(330, 330, 4.5 * i, st['cx'], st['cy'], st['rx'], st['ry'], st['sc'])); cv.drawPath(path, P('#101216')); cv.restore()
    cv.save(); cv.concat(pmat(330, 330, 0, st['cx'], st['cy'], st['rx'], st['ry'], st['sc']))
    g = skia.GradientShader.MakeLinear([skia.Point(0, -360), skia.Point(0, 360)], [col('#2C3038'), col('#22252C')], [0, 1])
    pp = skia.Paint(AntiAlias=True); pp.setShader(g); cv.drawPath(path, pp)
    cv.drawPath(path, P('#6B7280', stroke=3)); cv.restore()
    cv.restore()

MIDF = {'A1': .3, 'A2': .45, 'A3': .78, 'A4': .72, 'A5': .72, 'A6': .3, 'A7': .14, 'A8': .28, 'A9': .3}
CITYL = [('Hamburg', (10.0, 53.55), 1), ('Berlin', (13.4, 52.52), 1), ('Köln', (6.96, 50.94), -1), ('Frankfurt', (8.68, 50.11), 1), ('München', (11.58, 48.14), 1)]
def point_at(pts, f):
    L = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; d = sum(L) * f; acc = 0
    for i, l in enumerate(L):
        if acc + l >= d:
            q = (d - acc) / l; return lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)
        acc += l
    return pts[-1]
def cities(cv, st, a):
    if a <= .01: return
    for nm, ll, side in CITYL:
        x, y = mproj(st, *ll)
        cv.drawCircle(x, y, 6, P(WHITE, a)); cv.drawCircle(x, y, 11, P(WHITE, .25 * a, stroke=2))
        text(cv, nm, x + side * 16, y + 8, 22, '#C9CDD4', a, 'l' if side > 0 else 'r')

def chevrons(cv, pts, v, speed, a, n=5, sz=11):
    L = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; tot = sum(L)
    for k in range(n):
        u = ((k / n) + v * speed) % 1; d = u * tot; acc = 0
        for i, l in enumerate(L):
            if acc + l >= d:
                f = (d - acc) / l; x = lerp(pts[i][0], pts[i + 1][0], f); y = lerp(pts[i][1], pts[i + 1][1], f)
                an = math.degrees(math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]))
                cv.save(); cv.translate(x, y); cv.rotate(an); pth = skia.Path()
                pth.moveTo(sz, 0); pth.lineTo(-sz * .6, -sz * .8); pth.lineTo(-sz * .1, 0); pth.lineTo(-sz * .6, sz * .8); pth.close()
                cv.drawPath(pth, P(WHITE, a * math.sin(u * math.pi))); cv.restore(); break
            acc += l

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

# ---------------------------------------------------------------- road (S1)
random.seed(4)
SIGNS = [(random.choice(['A7', 'A1', 'A44', 'A99', 'A9', 'A995', 'A3', 'A61', 'A8', 'A24', 'A2', 'A81']), random.choice([-1, 1]), random.uniform(330, 520), random.uniform(-300, -140)) for _ in range(20)]
def road(cv, v, a):
    if a <= .01: return
    vp = (540, 700)
    rp = skia.Path(); rp.moveTo(vp[0] - 10, vp[1]); rp.lineTo(vp[0] + 10, vp[1]); rp.lineTo(1250, 1560); rp.lineTo(-170, 1560); rp.close()
    g = skia.GradientShader.MakeLinear([skia.Point(0, vp[1]), skia.Point(0, 1560)], [col('#15171B', 0), col('#24272E', a)], [0, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(g); cv.drawPath(rp, p)
    # headlight beams
    hl = cl((v + .85) / .08) * (.85 + .15 * math.sin(v * 40) * cl(-v * 2)) if v > -.85 else 0
    if hl > 0:
        for sx in (-1, 1):
            bp = skia.Path(); bp.moveTo(540 + sx * 230, 1560); bp.lineTo(540 + sx * 420, 1560); bp.lineTo(540 + sx * 40, 760); bp.lineTo(540 + sx * 5, 760); bp.close()
            bg = skia.GradientShader.MakeLinear([skia.Point(0, 1560), skia.Point(0, 760)], [col('#FFF4D6', .28 * hl * a), col('#FFF4D6', 0)], [0, 1])
            pp = skia.Paint(AntiAlias=True); pp.setShader(bg); cv.drawPath(bp, pp)
            cv.drawCircle(540 + sx * 320, 1560, 120, P('#FFF4D6', .35 * hl * a, blur=50))
    spd = 1.4 if v > -.3 else .2
    for side in (-1, 0, 1):
        for k in range(10):
            u = ((k / 10) + v * spd * .35) % 1; z = u ** 2.2
            y = lerp(vp[1], 1560, z); xx = vp[0] + side * lerp(4, 360, z); L = lerp(4, 150, z); w = lerp(1, 10, z)
            if side == 0:
                cv.drawLine(xx, y, xx, min(1560, y + L), P('#D8DCE2', a * cl(u * 4) * .8, stroke=w))
            else:
                cv.drawLine(xx, y, xx + side * lerp(1, 40, z) * .3, min(1560, y + L * .8), P('#D8DCE2', a * cl(u * 4) * .45, stroke=w * .7))
    for side in (-1, 1):  # reflector posts
        for k in range(7):
            u = ((k / 7) + v * spd * .35) % 1; z = u ** 2.2; y = lerp(vp[1], 1560, z); xx = vp[0] + side * lerp(14, 640, z); hh = lerp(4, 120, z)
            cv.drawLine(xx, y, xx, y - hh, P('#C9CDD4', a * cl(u * 4) * .7, stroke=lerp(1, 12, z)))
            cv.drawRect(skia.Rect.MakeLTRB(xx - lerp(.5, 6, z), y - hh * .85, xx + lerp(.5, 6, z), y - hh * .7), P(AMBER if side > 0 else WHITE, a * cl(u * 4)))
    # signs flying past
    for i, (lab, side, lat, hgt) in enumerate(SIGNS):
        t0 = -.3 + i * .32; u = (v - t0) / 1.6
        if not 0 < u < 1 or v > 3.6 + (1.6 if t0 < 3.4 else 0): continue
        z = u ** 2.4; k = lerp(.06, 1.6, z)
        x = vp[0] + side * lat * k; y = vp[1] + hgt * k
        if -200 < x < 1280:
            shield(cv, x, y, 120 * k, lab, 0, -side * 18 * z, a * cl(u * 5) * cl((1 - u) * 6), shadow=False)

LABELS = ['A1','A2','A3','A4','A5','A6','A7','A8','A9','A10','A11','A12','A13','A14','A15','A17','A19','A20','A21','A23','A24','A25','A26','A27','A28','A29','A30','A31','A33','A37','A38','A39','A40','A42','A43','A44','A45','A46','A48','A49','A52','A57','A59','A60','A61','A62','A63','A64','A65','A66','A67','A70','A71','A72','A73','A81','A92','A93','A94','A95','A96','A98','A99','A100','A103','A111','A113','A114','A115','A143','A210','A215','A226','A250','A255','A261','A270','A280','A281','A293','A352','A391','A395','A445','A480','A485','A516','A524','A535','A540','A542','A544','A553','A555','A559','A562','A565','A571','A573','A602','A620','A623','A643','A648','A650','A656','A659','A661','A671','A672','A831','A861','A864','A952','A980','A995','A36','A104','A560','A392']
random.seed(12); WALL = LABELS[:]; random.shuffle(WALL); WALL = WALL[:120]
if 'A7' in WALL: WALL.remove('A7')
WALL.insert(54, 'A7')
def shield_wall(cv, v, a):
    if a <= .01 or v < .3: return
    rx = 22 + 4 * math.sin(v * .6); ry = -14 + 10 * math.sin(v * .35); sc = lerp(.82, 1.0, eo((v - .3) / 2.5)) * lerp(1, .85, eo((v - 3.4) / 1.2))
    dim = 1 - .7 * eo((v - 3.45) / .6)
    items = []
    for idx, lab in enumerate(WALL):
        r, c = divmod(idx, 10); x = (c - 4.5) * 92; y = (r - 5.5) * 62
        sx, sy = proj(x, y, 0, 540, 880, rx, ry, sc); d = math.hypot(c - 4.5, r - 5.5)
        items.append((sy, sx, lab, d, idx))
    for sy, sx, lab, d, idx in sorted(items):
        t0 = .45 + d * .16; q = ob((v - t0) / .45)
        if q <= 0: continue
        if lab == 'A7' and v > 3.4: continue
        ex = eio((v - 5.45) / 1.0)
        if ex >= 1: continue
        hh = 40 * q * sc * (1 + .5 * ex)
        sx = sx + (sx - 540) * 1.1 * ex; sy = sy + (sy - 880) * .8 * ex + 260 * ex * ex
        shield(cv, sx, sy, hh, lab, rx * .6, ry * .6, a * dim * cl((v - t0) / .15) * (1 - ex) ** 2.2, shadow=False)
        if 0 < v - t0 < .5 and idx % 3 == 0: cv.drawCircle(sx, sy, 30 * (v - t0) * 4, P(RED, .4 * (1 - (v - t0) * 2), stroke=2))
    # counter pill once the wall is complete
    # A7 leaves the wall and comes forward
    if 3.4 < v < 5.6:
        sy, sx = [(i[0], i[1]) for i in items if i[2] == 'A7'][0]
        q = eio((v - 3.4) / .8); x = lerp(sx, 540, q); y = lerp(sy, 840, q); h = lerp(40, 210, q)
        shield(cv, x, y, h, 'A7', 6 * math.sin(v), (1 - q) * 360 + 8 * math.sin(v * .8), a, glow=q * (.5 + .5 * math.sin(v * 4)))
        ripple(cv, 540, 840, v, 4.2, 170, 430, a); burst(cv, 540, 840, v, 4.2, 24, 300, seed=3)
        pq = ob((v - 4.5) / .5)
        if pq > 0:
            py = 680 - 120 * (1 - pq)
            pth = skia.Path(); pth.moveTo(540, py + 40); pth.cubicTo(500, py - 5, 505, py - 45, 540, py - 45); pth.cubicTo(575, py - 45, 580, py - 5, 540, py + 40)
            cv.drawPath(pth, P(RED, a)); cv.drawCircle(540, py - 15, 11, P(WHITE, a)); ripple(cv, 540, py + 40, v, 4.95, 6, 70, a)

def car_front(cv, v):
    on = cl((v + .19) / .05) * (1 if v > -.08 else .6 + .4 * math.sin(v * 90)) if v > -.19 else 0
    shake = (1.5 * math.sin(v * 70) if v > -.19 else (2.5 * math.sin(v * 55) if v > -.6 else 0))
    push = 1 + 3.2 * eio(v / .55) if v > 0 else 1
    al = 1 - cl((v - .35) / .2)
    if al <= 0: return
    cv.save(); cv.translate(540, 880 + shake); cv.scale(push, push); cv.translate(0, 40)
    cv.saveLayerAlpha(None, int(al * 255))
    cv.drawOval(skia.Rect.MakeLTRB(-420, 150, 420, 230), P('#000000', .7, blur=24))
    roof = skia.Path(); roof.moveTo(-250, -60); roof.lineTo(-195, -235); roof.quadTo(0, -262, 195, -235); roof.lineTo(250, -60); roof.close()
    cv.drawPath(roof, P('#1E2026'))
    ws = skia.Path(); ws.moveTo(-232, -66); ws.lineTo(-185, -220); ws.quadTo(0, -244, 185, -220); ws.lineTo(232, -66); ws.close()
    g = skia.GradientShader.MakeLinear([skia.Point(0, -240), skia.Point(0, -66)], [col('#2E3540'), col('#111317')], [0, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(g); cv.drawPath(ws, p)
    cv.save(); cv.clipPath(ws, doAntiAlias=True); cv.drawLine(-120, -240, -220, -60, P(WHITE, .08, stroke=36)); cv.drawLine(40, -240, -40, -60, P(WHITE, .05, stroke=20)); cv.restore()
    body = skia.Path(); body.moveTo(-370, 40); body.quadTo(-360, -50, -250, -66); body.lineTo(250, -66); body.quadTo(360, -50, 370, 40)
    body.lineTo(375, 140); body.quadTo(370, 168, 330, 170); body.lineTo(-330, 170); body.quadTo(-370, 168, -375, 140); body.close()
    g2 = skia.GradientShader.MakeLinear([skia.Point(0, -66), skia.Point(0, 170)], [col('#3A3E47'), col('#24272E'), col('#15171B')], [0, .5, 1])
    p2 = skia.Paint(AntiAlias=True); p2.setShader(g2); cv.drawPath(body, p2); cv.drawPath(body, P('#5A606C', stroke=2))
    for mx in (-1, 1):
        cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(mx * 300 - 34, -100, mx * 300 + 34, -64), 10, 10), P('#2A2D35'))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-150, 40, 150, 112), 22, 22), P('#0B0C0F'))
    for k in range(4): cv.drawLine(-130, 54 + k * 16, 130, 54 + k * 16, P('#3A3E47', stroke=3))
    for wx in (-1, 1):
        cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(wx * 330 - 40, 150, wx * 330 + 40, 215), 12, 12), P('#0B0C0F'))
        hx = wx * 250
        lamp = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(hx - 95, -14, hx + 95, 34), 22, 22)
        cv.drawRRect(lamp, P('#101216')); cv.drawRRect(lamp, P('#4A4F5A', stroke=2))
        cv.drawLine(hx - 80, -6, hx + 80, -6, P(RED, .35 + .65 * on, stroke=5))
        if on > 0:
            cv.drawRRect(lamp, P('#FFF4E6', on))
            cv.drawCircle(hx, 10, 150, P('#FFF4E6', .45 * on, blur=60)); cv.drawCircle(hx, 10, 60, P(WHITE, .7 * on, blur=18))
            cv.drawLine(hx - 520, 10, hx + 520, 10, P('#FFE8E0', .25 * on, stroke=6, blur=4))
            cv.drawCircle(-hx * .4, 10 + 120, 18, P('#FF8A90', .25 * on, blur=8))
    cv.restore(); cv.restore()

# ---------------------------------------------------------------- München (S7)
MUC_R = [('A9', -95, 1), ('A92', -50, 1), ('A94', 10, 1), ('A8', 55, 1), ('A995', 100, 0), ('A95', 140, 1), ('A96', 185, 1), ('A8 ', 225, 1)]
def munich(cv, v, a):
    if a <= .01: return
    cx, cy = 540, 880; rx = 38; ry = 6 * math.sin(v * .4); sc = lerp(.15, 1, eio((v - 42.95) / 1.15)) * lerp(1, .15, eio((v - 48.85) / .9))
    def pj(x, y): return proj(x, y, 0, cx, cy, rx, ry, sc)
    cv.saveLayerAlpha(None, int(a * 255))
    cv.save(); cv.concat(pmat(420, 420, 0, cx, cy, rx, ry, sc))
    g = skia.GradientShader.MakeRadial(skia.Point(0, 0), 420, [col('#2A2D35'), col('#1A1C21'), col('#1A1C21', 0)], [0, .7, 1])
    pp = skia.Paint(AntiAlias=True); pp.setShader(g); cv.drawCircle(0, 0, 420, pp)
    for k in range(1, 6): cv.drawCircle(0, 0, k * 75, P(WHITE, .04, stroke=1.5))
    cv.drawCircle(0, 0, 70, P('#3A3E47', .9)); cv.restore()
    # ring A99 (not closed in the south-west)
    rp = eo((v - 43.5) / 1.0)
    pts = [pj(math.cos(math.radians(an)) * 200, math.sin(math.radians(an)) * 200) for an in range(130, 130 + int(330 * rp) + 1, 6)]
    if len(pts) > 1: polyline2(cv, pts, 1, 7, '#8A8E97', 1, False)
    for name, an, grey in MUC_R:
        t0 = 43.7 + MUC_R.index((name, an, grey)) * .12
        p0 = pj(math.cos(math.radians(an)) * 30, math.sin(math.radians(an)) * 30)
        L = 160 if name == 'A995' else 400
        p1 = pj(math.cos(math.radians(an)) * L, math.sin(math.radians(an)) * L)
        if name == 'A995':
            q = eo((v - wt4('A995') + .1) / .9)
            polyline2(cv, [p0, p1], q, 10, RED, 1)
            if q > .9:
                shield(cv, p1[0] + 70, p1[1] + 70, 74 * ob((v - wt4('A995') - .8) / .5), 'A995', 0, 0, 1, glow=.6 + .4 * math.sin(v * 5))
                ripple(cv, p1[0], p1[1], v, wt4('A995') + .8, 10, 120)
        else:
            polyline2(cv, [p0, p1], eo((v - t0) / .7), 6, '#8A8E97', .9, False)
            if v > t0 + .5:
                ep = pj(math.cos(math.radians(an)) * 360, math.sin(math.radians(an)) * 360)
                shield(cv, ep[0], ep[1], 44 * ob((v - t0 - .5) / .4), name.strip(), 0, 0, .95, shadow=False)
    ap = pj(-173, 100)
    if rp > .6: label_tag(cv, ap[0] - 24, ap[1] + 34, 'A99 Ring', eo((v - 44.2) / .3), 'r', 24)
    c0 = pj(0, 0); cv.drawCircle(c0[0], c0[1], 12, P(RED)); cv.drawCircle(c0[0], c0[1], 26, P(RED, .4, blur=10))
    label_tag(cv, c0[0], c0[1] - 52, 'München', eo((v - 43.6) / .3), 'c', 28)
    cv.restore()
    pill(cv, 540, 1240, 'kurzer Zubringer', win(v, wt4('A995') + .6, 49.4), sc=ob((v - wt4('A995') - .6) / .45), hl=True)

# ---------------------------------------------------------------- outro: shield flips to logo
def outro4(cv, v):
    if v < VO4 - .2: return
    o = v - VO4
    fl = eio(o / .9); ry = 180 * fl
    cx, cy, h = 540, 880, 260
    f, tw, w = shield_geom(h, 'A81')
    if fl < .5:
        shield(cv, cx, cy, h, 'A81', 0, ry, 1)
    else:
        a = 1 - eo((o - 1.4) / .6)
        if a > 0:
            for i in range(6, 0, -1):
                cv.save(); cv.concat(pmat(w / 2, h / 2, h * .1 * i / 6, cx, cy, 0, ry - 180)); cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-w / 2, -h / 2, w / 2, h / 2), h * .2, h * .2), P('#08090B', a)); cv.restore()
            cv.save(); cv.concat(pmat(w / 2, h / 2, 0, cx, cy, 0, ry - 180))
            cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-w / 2, -h / 2, w / 2, h / 2), h * .2, h * .2), P('#16181D', a))
            cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-w / 2 + 14, -h / 2 + 14, w / 2 - 14, h / 2 - 14), h * .15, h * .15), P(RED, a, stroke=6, cap=False))
            cv.restore()
        ta = eo((o - .5) / .4); sz = lerp(110, 150, eo((o - 1.4) / .8))
        tracked(cv, 'function.', 540, cy + sz * .35, sz, RED, ta, -.03)
        # road underline with moving lane marks
        lw = eo((o - 1.5) / .8) * 520
        if lw > 0:
            y = cy + 110
            cv.drawLine(540 - lw / 2, y, 540 + lw / 2, y, P('#2A2D35', 1, stroke=18))
            for k in range(8):
                x = 540 - lw / 2 + ((k * 70 + o * 260) % max(1, lw))
                cv.drawLine(x, y, min(540 + lw / 2, x + 30), y, P(WHITE, .8, stroke=4))
            glowtip(cv, 540 + lw / 2, y, .9, 1 - eo((o - 2.3) / .4)); glowtip(cv, 540 - lw / 2, y, .9, 1 - eo((o - 2.3) / .4))
    burst(cv, cx, cy, v, VO4 + .45, 26, 300, seed=44); ripple(cv, cx, cy, v, VO4 + .45, 150, 560)

# ---------------------------------------------------------------- frame
def frame4(cv, t):
    v = (t - OFF4) * T4
    atmosphere(cv, max(v, 0) + 2)
    if v < 0:  # darkness before the engine starts
        cv.drawRect(skia.Rect.MakeWH(W, H), P('#000000', .6 * cl(-v / 1.2)))
    push = 1.02 + .018 * math.sin(v * .21) + .008 * math.sin(v * .53)
    acc = 1 + sum(.03 * math.exp(-(v - x) * 5) * cl((v - x) / .06) for x in ACC4 if v > x)
    cv.save(); cv.translate(540, 880); cv.scale(push * acc, push * acc); cv.rotate(.35 * math.sin(v * .3)); cv.translate(-540, -880)

    # ===== S1 new opening: car front lights up, push through the light into a wall of 120 signs
    if v < 6.7:
        shield_wall(cv, v, 1)
        if v < .9: car_front(cv, v)
        fl = cl(1 - abs(v - .42) / .32)
        if fl > 0: cv.drawRect(skia.Rect.MakeWH(W, H), P('#FFF6F0', .85 * fl ** 1.5))
    # ===== map layers
    st = map_state(v)
    draw_germany(cv, st, v)
    if st['a'] > .02:
        a = st['a']
        for i, (n, pts) in enumerate(ROUTES.items()):
            base = eo((v - 6.5 - i * .2) / .9) if v < 11.9 else 1
            draw_route(cv, st, n, base, 3, '#7A808C', a * .8, False)
        ca_ = st['a'] * (1 - win(v, 23.4, 42.7, .3, .3)) * (1 - win(v, 49.6, 99, .3, .3) * 0)
        cities(cv, st, ca_ * (0 if 9.4 < v < 11.9 else 1))
        # S3: single-digit routes drawn red
        if 11.9 < v < 23.45:
            for i, n in enumerate(ROUTES):
                sp = route_screen(st, n); pr = eo((v - 11.95 - i * .28) / 1.0)
                hi = 1
                if v > 18.2: hi = .25 + .75 * (eo((v - 18.36) / .3) if (n in ODD and v < 21.45) else 0) + .75 * (eo((v - 21.5) / .3) if n in EVEN else 0)
                if 15.0 < v < 18.2: hi = 1 - .6 * eo((v - 15.1) / .4)
                end = draw_route(cv, st, n, pr, 6, RED, a * hi)
                if pr > .98:
                    e = point_at(sp, MIDF[n]); show = (hi - .25) / .75 if v > 18.2 else (1 if v < 15.0 else 1 - eo((v - 15.1) / .4))
                    shield(cv, e[0], e[1], 44 * ob((v - 11.95 - i * .28 - .9) / .4), n, 0, 0, a * cl(show), shadow=False)
                    if n == 'A8':
                        w8 = point_at(route_segs(st, 'A8')[0], .62)
                        shield(cv, w8[0], w8[1] + 4, 32 * ob((v - 11.95 - i * .28 - .9) / .4), 'A8', 0, 0, a * cl(show), shadow=False)
                if v > 18.36 and ((n in ODD and v < 21.45) or (n in EVEN and v > 21.5)):
                    for q in route_segs(st, n): chevrons(cv, q, v, .35, a * hi, 4, 10)
        # S5: A7 travel
        if 23.45 < v < 32.7:
            for n in ROUTES:
                if n != 'A7': draw_route(cv, st, n, 1, 6, RED, st['a'] * .2, False)
            sp = route_screen(st, 'A7'); pr = eio((v - 25.8) / 6.2)
            polyline2(cv, sp, 1, 6, RED, .3 * st['a'], False)
            end = polyline2(cv, sp, pr, 9, RED, st['a'], False)
            if end and pr < 1:
                cv.drawCircle(end[0], end[1], 22, P(WHITE, .35, blur=10)); cv.drawCircle(end[0], end[1], 9, P(WHITE))
            for i, (nm, ll, side) in enumerate(A7CITIES):
                x, y = mproj(st, *ll); need = i / (len(A7CITIES) - 1)
                ap = eo((pr - need + .02) / .04) if v > 25.7 else 0
                if ap > 0:
                    cv.drawCircle(x, y, 8, P(WHITE, ap)); cv.drawCircle(x, y, 8, P(RED, ap, stroke=3))
                    label_tag(cv, x + side * 26, y, nm, ap, 'l' if side > 0 else 'r', 24, hl=(i in (0, 6)))
            km = int(962 * pr) if v > 25.8 else 0
            al = eo((v - 25.6) / .3) * (1 - eo((v - 32.4) / .3))
            if al > 0:
                text(cv, f'{km}', 935, 650, 88, RED, al, 'c'); text(cv, 'Kilometer', 935, 692, 28, WHITE, al, 'c')
            shield(cv, 935, 530, 70 * ob((v - 23.6) / .5), 'A7', 0, 8 * math.sin(v), eo((v - 23.6) / .3) * (1 - eo((v - 32.4) / .3)), glow=.5)
        # S6: region blocks
        if 32.65 < v < 42.75:
            ga = 1 - eo((v - 42.3) / .4)
            hlz = {4: wt4('4', 36), 8: wt4('8', 39), 9: wt4('9', 41)}
            ex = {4: 'z. B. A40', 8: 'z. B. A81', 9: 'z. B. A99'}
            items = []
            for d, ll in ZONES:
                x, y = mproj(st, *ll); items.append((y, x, d))
            for y, x, d in sorted(items):
                t0 = 33.0 + d * .1; gr = eo((v - t0) / .5)
                hv = eo((v - hlz[d]) / .4) if d in hlz and v > hlz[d] else 0
                h = 26 * gr + 70 * hv
                block(cv, x, y, 40, h, 18, RED if hv > .3 else '#4A4F5A', ga * gr)
                if gr > .1:
                    text(cv, str(d), x + 5, y - h - 8, 34 + 10 * hv, WHITE, ga * gr, 'c')
                    ripple(cv, x, y, v, t0, 10, 60, ga)
                if hv > 0:
                    burst(cv, x, y - h, v, hlz[d] + .2, 14, 120, seed=d)
                    if d == 4: label_tag(cv, x + 46, y - h * .55, ex[d], ga * hv, 'l', 28, hl=True)
                    else:
                        side = -1 if d == 8 else 1
                        label_tag(cv, x + side * 40, y - h * .5, ex[d], ga * hv, 'r' if side < 0 else 'l', 28, hl=True)
        # S8: A3 exception
        if 49.6 < v < 56.7:
            sp = route_screen(st, 'A3'); pr = eio((v - 51.95) / 2.4)
            for n in ROUTES:
                if n != 'A3': draw_route(cv, st, n, 1, 5, '#6B7280', st['a'] * .5, False)
            end = polyline2(cv, sp, pr, 9, RED, st['a'])
            if pr > .98: chevrons(cv, sp, v, .3, st['a'], 5, 12); e3 = point_at(sp, .5); shield(cv, e3[0], e3[1] - 60, 60 * ob((v - 54.4) / .4), 'A3', 0, 0, st['a'], glow=.6)
            # expected vs actual arrows
            ea = eo((v - 50.2) / .4) * (1 - eo((v - 55.5) / .3))
            if ea > 0:
                x0 = 105
                for k in range(8): cv.drawLine(x0, 600 + k * 34, x0, 618 + k * 34, P('#8A8E97', ea, stroke=5))
                pth = skia.Path(); pth.moveTo(x0 - 14, 872); pth.lineTo(x0 + 14, 872); pth.lineTo(x0, 896); pth.close(); cv.drawPath(pth, P('#8A8E97', ea))
                text(cv, 'erwartet', x0, 580, 24, '#8A8E97', ea, 'c')
                cv.drawLine(x0 - 30, 700, x0 + 30, 780, P(RED, ea * eo((v - 52.5) / .3), stroke=6)); cv.drawLine(x0 + 30, 700, x0 - 30, 780, P(RED, ea * eo((v - 52.5) / .3), stroke=6))
            wa = ob((v - 49.9) / .5)
            if wa > 0 and v < 55.7:
                cx, cy = 955, 560; s = 54 * wa
                tri = skia.Path(); tri.moveTo(cx, cy - s); tri.lineTo(cx + s * 1.05, cy + s * .75); tri.lineTo(cx - s * 1.05, cy + s * .75); tri.close()
                cv.drawPath(tri, P(AMBER, .4, blur=12)); cv.drawPath(tri, P(AMBER)); text(cv, '!', cx, cy + s * .55, s * 1.1, BLACK, 1, 'c')
    # A7 as one continuous object: centre -> its place on the map -> comparison row
    if 5.6 <= v < 9.3:
        tg = point_at(route_screen(map_state(v), 'A7'), MIDF['A7']); q2 = eio((v - 5.6) / 1.3)
        shield(cv, lerp(540, tg[0], q2), lerp(840, tg[1], q2), lerp(210, 50, q2), 'A7', 6 * math.sin(v) * (1 - q2), 360 * q2, 1, glow=.6 * (1 - q2) + .3)
        ripple(cv, tg[0], tg[1], v, 6.9, 30, 140)
    # S2: 1975 roll
    a2 = win(v, T1975 - .1, 9.3)
    if a2 > 0:
        roll2(cv, '1975', 190, 1170, 96, cl((v - T1975 + .1) / 1.0), RED, a2); text(cv, 'Einführung', 190, 1215, 28, WHITE, a2, 'c'); burst(cv, 190, 1130, v, T1975 + .6, 18, 200, seed=8)

    # S3 part 1: three shields compare digit counts
    if 9.3 <= v < 12.7:
        ga = 1
        ex = eio((v - 11.85) / .75)
        for i, (lab, l1, l2) in enumerate([('A7', '1 Ziffer', 'bundesweit'), ('A44', '2 Ziffern', 'regional'), ('A995', '3 Ziffern', 'Zubringer')]):
            x = [230, 540, 850][i]; t0 = 9.5 + i * .35; q = ob((v - t0) / .5); yy = 840; hs = 118 * q; al = eo((v - t0) / .25)
            if i == 0:
                p0 = point_at(route_screen(map_state(9.3), 'A7'), MIDF['A7']); qq = eio((v - 9.3) / .7)
                p1 = point_at(route_screen(map_state(min(v, 12.6)), 'A7'), MIDF['A7'])
                x = lerp(lerp(p0[0], 230, qq), p1[0], ex); yy = lerp(lerp(p0[1], 840, qq), p1[1], ex); hs = lerp(lerp(50, 118, qq), 50, ex); al = 1 - eo((v - 12.3) / .3)
            else:
                yy = 840 + 140 * ex; al *= 1 - ex
            shield(cv, x, yy, hs, lab, 4 * math.sin(v + i), 10 * math.sin(v * .7 + i), al, hl=tuple(range(1, len(lab))) if 10.0 < v < 11.85 and v > t0 + .6 else ())
            ga = 1 - eo((v - 11.85) / .35)
            lx = [230, 540, 850][i]
            text(cv, l1, lx, 955, 32, WHITE, ga * eo((v - t0 - .3) / .3), 'c'); text(cv, l2, lx, 992, 26, '#8A8E97', ga * eo((v - t0 - .4) / .3), 'c')
            ripple(cv, x, 840, v, t0 + .2, 60, 170, ga)

    # S4: compass + pills
    ca = win(v, 15.1, 23.4)
    if ca > 0:
        cx, cy = 955, 1150; rot = 360 * (1 - eo((v - 15.1) / 1.2))
        cv.save(); cv.translate(cx, cy); cv.rotate(rot)
        cv.drawCircle(0, 0, 70, P(BLACK, .9 * ca)); cv.drawCircle(0, 0, 70, P('#4A4F5A', ca, stroke=3))
        for k, (lab, an) in enumerate([('N', 0), ('O', 90), ('S', 180), ('W', 270)]):
            hot = (lab in 'NS' and 18.36 < v < 21.45) or (lab in 'OW' and v > 21.5)
            cv.save(); cv.rotate(an); pth = skia.Path(); pth.moveTo(0, -60); pth.lineTo(10, -14); pth.lineTo(-10, -14); pth.close()
            cv.drawPath(pth, P(RED if hot else '#8A8E97', ca)); cv.restore()
        cv.restore()
        for lab, an in [('N', 0), ('O', 90), ('S', 180), ('W', 270)]:
            hot = (lab in 'NS' and 18.36 < v < 21.45) or (lab in 'OW' and v > 21.5)
            x = cx + math.sin(math.radians(an - rot)) * 94; y = cy - math.cos(math.radians(an - rot)) * 94
            text(cv, lab, x, y + 10, 28, RED if hot else WHITE, ca, 'c')
    pill(cv, 540, 1240, 'ungerade = Nord–Süd', win(v, 18.36, 21.4), sc=ob((v - 18.36) / .45), hl=True)
    pill(cv, 540, 1240, 'gerade = West–Ost', win(v, 21.5, 23.4), sc=ob((v - 21.5) / .45), hl=True)
    pill(cv, 540, 1240, 'längste Autobahn', win(v, 26.6, 32.5), sc=ob((v - 26.6) / .45))
    pill(cv, 540, 1240, 'ungerade, aber West–Ost', win(v, 52.2, 55.6), sc=ob((v - 52.2) / .45), hl=True)

    # S7 Munich
    ma = eo((v - 42.95) / .45) * (1 - eo((v - 49.2) / .55))
    munich(cv, v, ma)

    # S9 summary: A81 explained
    if v > 55.75:
        sa = 1
        qq = eio((v - 55.75) / 1.1); bw = mproj(map_state(55.75), 9.15, 48.95)
        h = lerp(46, 260, qq); rot = (1 - qq) * 180
        cxs, cys = 540, 880; sxx = lerp(bw[0], cxs, qq); syy = lerp(bw[1], cys, qq)
        if v < VO4:
            shield(cv, sxx, syy, h, 'A81', 3 * math.sin(v), rot + 5 * math.sin(v * .7), sa, glow=.4 + .3 * math.sin(v * 3),
                   hl=((1, 2) if 58.46 < v < 60.1 else ((2,) if 60.14 < v < 62.5 else ((1,) if v > 62.53 else ()))))
            ripple(cv, cxs, cys, v, 56.4, 180, 480)
            f, tw, w = shield_geom(260, 'A81')
            x0 = cxs - tw / 2; xs = []
            for ch in 'A81': cw = f.measureText(ch); xs.append(x0 + cw / 2); x0 += cw
            a1_ = win(v, 58.46, VO4 - .1)
            if a1_ > 0:
                polyline(cv, [(xs[1] - 40, cys - 150), (xs[1] - 40, cys - 175), (xs[2] + 40, cys - 175), (xs[2] + 40, cys - 150)], eo((v - 58.5) / .5), 4, a1_, False)
                label_tag(cv, (xs[1] + xs[2]) / 2, cys - 230, '2 Ziffern = regional', a1_ * eo((v - 58.6) / .3), 'c', 30)
            a2_ = win(v, 60.14, VO4 - .1)
            if a2_ > 0:
                polyline(cv, [(xs[2], cys + 140), (xs[2], cys + 230), (xs[2] + 20, cys + 250)], eo((v - 60.2) / .5), 4, a2_, False)
                label_tag(cv, xs[2] - 60, cys + 290, '1 ungerade = Nord–Süd', a2_ * eo((v - 60.4) / .3), 'l', 28)
            a3_ = win(v, 62.53, VO4 - .1)
            if a3_ > 0:
                polyline(cv, [(xs[1], cys + 140), (xs[1], cys + 170)], eo((v - 62.6) / .4), 4, a3_, False)
                label_tag(cv, xs[1] + 40, cys + 205, '8 = Baden-Württemberg', a3_ * eo((v - 62.7) / .3), 'r', 28)
    cv.restore()

    HL = [(-1.2, .15, [[('Was verrät die', 0)], [('Autobahnnummer?', 1)]]),
          (.25, 6.1, [[('Rund ', 0), ('120', 1)], [('Autobahnen', 0)]]),
          (6.2, 9.25, [[('Ein System', 0)], [('seit ', 0), ('1975', 1)]]),
          (9.35, 15.0, [[('Ziffern zeigen', 0)], [('die ', 0), ('Bedeutung', 1)]]),
          (15.1, 23.4, [[('Gerade oder', 0)], [('ungerade?', 1)]]),
          (23.5, 32.6, [[('A7: die ', 0), ('längste', 1)], [('Autobahn', 0)]]),
          (32.7, 42.65, [[('Erste Ziffer', 0)], [('= ', 0), ('Region', 1)]]),
          (42.75, 49.7, [[('Drei Ziffern:', 0)], [('Zubringer', 1)]]),
          (49.8, 55.7, [[('Die ', 0), ('Ausnahme', 1)]]),
          (55.8, VO4, [[('Eine kleine', 0)], [('Landkarte', 1)]])]
    for a, b, ln in HL:
        if a - .1 < v < b + .4: headline3(cv, v, a, b, ln, base=255)
    for a, b, s in [(0.2, 6.0, 'Quelle: ADAC'), (6.2, 23.4, 'Quelle: ADAC · Streckenverläufe schematisch'),
                    (23.5, 32.6, 'Quelle: ADAC (962 km) · schematisch'), (32.7, 49.7, 'Quelle: ADAC · schematisch'),
                    (49.8, 55.7, 'Quelle: ADAC, Auto Zeitung · schematisch')]:
        source(cv, v, a, b, s)
    logo_small(cv, cl((v - .6) / .5) * (1 - eo((v - VO4) / .4)))
    if 0 <= v < VE + .3: subtitles(cv, v)
    outro4(cv, v)

def streaks4(cv, v):
    R3.WHOOSH[:] = WH4; streaks(cv, v)

if __name__ == '__main__':
    mode = sys.argv[1]; surf = skia.Surface(W, H); cv = surf.getCanvas()
    if mode == 'test':
        for t in [float(x) for x in sys.argv[2].split(',')]:
            frame4(cv, t); surf.makeImageSnapshot().save(f'x_{t:05.1f}.png', skia.kPNG)
    elif mode == 'video':
        a0, a1, out = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'faster', '-crf', '19', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
        for i in range(a0, a1):
            frame4(cv, i / FPS); ff.stdin.write(surf.makeImageSnapshot().toarray().tobytes())
            if i % 150 == 0: print(i, a1, flush=True)
        ff.stdin.close(); ff.wait(); print('done', flush=True)
    elif mode == 'events':
        json.dump({'dur': DUR4, 'OFF': OFF4, 'T': T4, 'VO': VO4, 'T1975': T1975, 'acc': ACC4, 'whoosh': WH4, 'A995': wt4('A995'),
                   'zones': [wt4('4', 36), wt4('8', 39), wt4('9', 41)], 'n': int(DUR4 * FPS)}, open('events4.json', 'w'))
