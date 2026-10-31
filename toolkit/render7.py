"""function. – Wasserscheide (Video 7)
Ohne up/voice7.mp3 werden die Satzzeiten geschätzt (Vorschau). Mit Aufnahme: segs7.json aus silencedetect anlegen.
"""
import render6 as R6
from render6 import *
import render
import os, subprocess as _sp

OFF7 = 0.15
VOICE7 = 'up/voice7.mp3'
WATER = '#4DA3FF'; WATER_L = '#A9D4FF'; DYE = '#B6F23A'

LINES7 = [
 "Ein Regentropfen im Schwarzwald kann in der Nordsee landen.",
 "Oder im Schwarzen Meer.",
 "Dazwischen liegt eine unsichtbare Linie: die Europäische Hauptwasserscheide.",
 "Sie zieht sich quer durch Süddeutschland, vom Allgäu über den Schwarzwald und die Alb bis ins Fichtelgebirge.",
 "Auf der einen Seite fließt das Wasser über den Rhein in die Nordsee.",
 "Auf der anderen in die Donau, über 2.800 Kilometer bis ins Schwarze Meer.",
 "Bei Furtwangen liegen zwei Quellen nur gut einen Kilometer auseinander.",
 "Die Breg fließt zur Donau, die Elz zum Rhein.",
 "Ganz dicht ist die Linie aber nicht.",
 "Bei Immendingen versickert die Donau im Boden.",
 "Zwölf Kilometer weiter taucht es im Aachtopf wieder auf und fließt in den Rhein.",
 "Nachgewiesen wurde das 1877 mit einem Färbeversuch.",
 "Schiffe überqueren die Linie im Main-Donau-Kanal, auf 406 Metern Höhe.",
 "Wenige Meter entscheiden also, in welchem Meer ein Tropfen ankommt.",
]
PARA_END7 = {1, 2, 3, 5, 7, 9, 11, 12}
SP7 = {'2.800': 'zweitausendachthundert', '1877': 'achtzehnhundertsiebenundsiebzig', '406': 'vierhundertsechs'}

def _syl7(w):
    w = SP7.get(w.strip('.,?:'), w.strip('.,?:')).lower(); n = 0; prev = False
    for ch in w:
        v_ = ch in 'aeiouäöüy'
        if v_ and not prev: n += 1
        prev = v_
    return max(1, n)
def _estimate7():
    segs = []; t = 0.0
    for i, s in enumerate(LINES7):
        d = sum(_syl7(w) for w in s.split()) / 4.45 + .12 * (s.count(',') + s.count(':'))
        segs.append((round(t, 2), round(t + d, 2), s)); t += d + (.42 if i in PARA_END7 else .32)
    return segs
SEGS7 = [tuple(x) for x in json.load(open('segs7.json'))] if os.path.exists('segs7.json') else _estimate7()
VE7 = SEGS7[-1][1]; VO7 = VE7 + .3; V_END7 = VO7 + 3.4; DUR7 = V_END7 + OFF7
S = [a for a, b, s in SEGS7]; E = [b for a, b, s in SEGS7]

_env7 = None
if os.path.exists(VOICE7):
    _raw = _sp.run(['ffmpeg', '-loglevel', 'error', '-i', VOICE7, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    _au = np.frombuffer(_raw, dtype=np.float32); _env7 = np.sqrt(np.convolve(_au ** 2, np.ones(400) / 400, 'same'))[::160]
def _snap7(t, a, b):
    if _env7 is None: return t
    lo = max(a + .08, t - .13); hi = min(b - .08, t + .13)
    if hi <= lo: return t
    i0, i1 = int(lo * 100), int(hi * 100)
    if i1 <= i0 or i1 >= len(_env7): return t
    return (i0 + int(np.argmin(_env7[i0:i1]))) / 100
WORDS7 = []
for a, b, s in SEGS7:
    ws = s.split(); wt = [len(SP7.get(w.strip('.,:?'), w.strip('.,:?'))) + 2 + (3 if w[-1] in ',:' else 0) for w in ws]
    tot = sum(wt); x = a; st0 = len(WORDS7)
    for w, k in zip(ws, wt):
        d = (b - a) * k / tot; WORDS7.append((x, x + d, w)); x += d
    for j in range(len(ws) - 1):
        i_ = st0 + j; t_ = _snap7(WORDS7[i_][1], a, b)
        WORDS7[i_] = (WORDS7[i_][0], t_, WORDS7[i_][2]); WORDS7[i_ + 1] = (t_, WORDS7[i_ + 1][1], WORDS7[i_ + 1][2])
def wt7(word, after=0):
    for a, b, w in WORDS7:
        if a >= after - 1e-6 and w.strip('.,:?') == word: return a
    raise KeyError(word)
CH7 = []
for a, b, s in SEGS7:
    ws = [w for w in WORDS7 if w[0] >= a - 1e-6 and w[1] <= b + 1e-6]; cur = []
    for w in ws:
        if cur and (len(cur) >= 4 or len(' '.join(x[2] for x in cur + [w])) > 22): CH7.append(cur); cur = []
        cur.append(w)
    if cur: CH7.append(cur)
render.CH = []
for i, c in enumerate(CH7):
    nxt = CH7[i + 1][0][0] if i + 1 < len(CH7) else 99
    render.CH.append((c[0][0], min(nxt - .06, c[-1][1] + .35), c))

T_KANN = wt7('kann'); T_NORD = wt7('Nordsee'); T_SCHWM = wt7('Schwarzen'); T_LINIE = wt7('Linie')
T_ALLG = wt7('Allgäu'); T_SCHW = wt7('Schwarzwald', S[3]); T_ALB = wt7('Alb'); T_FICHT = wt7('Fichtelgebirge')
T_RHEIN = wt7('Rhein', S[4]); T_NORD2 = wt7('Nordsee', S[4]); T_DONAU = wt7('Donau', S[5]); T_2800 = wt7('2.800'); T_SCHWM2 = wt7('Schwarze', S[5])
T_QUELL = wt7('Quellen'); T_KM = wt7('Kilometer', S[6]); T_BREG = wt7('Breg'); T_ELZ = wt7('Elz')
T_VERS = wt7('versickert'); T_AACH = wt7('Aachtopf'); T_BOD = wt7('Rhein', S[10]); T_1877 = wt7('1877'); T_FARB = wt7('Färbeversuch')
T_KANAL = wt7('Main-Donau-Kanal,'.strip(',')) if False else wt7('Main-Donau-Kanal'); T_406 = wt7('406')
T_TROPF = wt7('Tropfen')
ACC7 = [T_NORD, T_2800, T_1877, T_406]

# ---------------------------------------------------------------- drawing helpers
def drop(cv, x, y, s, a=1, stretch=1.0, c=WATER):
    if a <= .01 or s <= .01: return
    cv.save(); cv.translate(x, y); cv.scale(s / stretch ** .5, s * stretch)
    pth = skia.Path(); pth.moveTo(0, -70); pth.cubicTo(30, -24, 42, 6, 42, 24); pth.cubicTo(42, 50, 22, 66, 0, 66)
    pth.cubicTo(-22, 66, -42, 50, -42, 24); pth.cubicTo(-42, 6, -30, -24, 0, -70); pth.close()
    g = skia.GradientShader.MakeRadial(skia.Point(-12, 10), 70, [col(WATER_L if c == WATER else '#E9FFB0', a), col(c, a), col(shade(c, .6), a)], [0, .45, 1])
    pp = skia.Paint(AntiAlias=True); pp.setShader(g)
    cv.drawPath(pth, P(c, .45 * a, blur=16)); cv.drawPath(pth, pp); cv.drawCircle(-14, 14, 9, P(WHITE, .55 * a))
    cv.restore()

def chaikin(pts, it=2):
    for _ in range(it):
        out = [pts[0]]
        for p, q in zip(pts[:-1], pts[1:]):
            out += [(.75 * p[0] + .25 * q[0], .75 * p[1] + .25 * q[1]), (.25 * p[0] + .75 * q[0], .25 * p[1] + .75 * q[1])]
        out.append(pts[-1]); pts = out
    return pts

def sub_path(pts, prog):
    """first part of a polyline (by length)"""
    if prog <= 0: return [pts[0]]
    L = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; tot = sum(L); tgt = tot * cl(prog); acc = 0; out = [pts[0]]
    for i, l in enumerate(L):
        if acc + l >= tgt:
            f = (tgt - acc) / l if l else 0; out.append((lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f))); return out
        out.append(pts[i + 1]); acc += l
    return out

def river(cv, pts, prog, a, v, w=7, c=WATER, flow=True, tip=True):
    if a <= .01 or prog <= 0: return
    sp = sub_path(pts, prog)
    if len(sp) < 2: return
    path = skia.Path(); path.moveTo(*sp[0]); [path.lineTo(*q) for q in sp[1:]]
    pj = P(c, a, stroke=w); pj.setStrokeJoin(skia.Paint.kRound_Join)
    cv.drawPath(path, P(c, .35 * a, stroke=w * 3, blur=w)); cv.drawPath(path, pj)
    if flow:   # moving highlights along the stream
        L = [math.dist(sp[i], sp[i + 1]) for i in range(len(sp) - 1)]; tot = sum(L)
        for k in range(int(tot / 70) + 1):
            d = (k * 70 + v * 90) % max(1, tot); acc = 0
            for i, l in enumerate(L):
                if acc + l >= d:
                    f = (d - acc) / l if l else 0; x = lerp(sp[i][0], sp[i + 1][0], f); y = lerp(sp[i][1], sp[i + 1][1], f)
                    cv.drawCircle(x, y, w * .35, P(WATER_L if c == WATER else WHITE, .8 * a)); break
                acc += l
    if tip and prog < .995:
        x, y = sp[-1]; cv.drawCircle(x, y, 14, P(c, .5 * a, blur=8)); cv.drawCircle(x, y, 5, P(WHITE, a))

def dashed_v(cv, x, y0, y1, a, v, w=4):
    if a <= .01: return
    p = P(RED, a, stroke=w); p.setPathEffect(skia.DashPathEffect.Make([14, 10], -v * 30))
    cv.drawLine(x, y0, x, y1, p); cv.drawLine(x, y0, x, y1, P(RED, .25 * a, stroke=w * 4, blur=6))

def hbracket(cv, x0, x1, y, a, label, up=True, hl=False):
    if a <= .01: return
    d = -14 if up else 14
    pth = skia.Path(); pth.moveTo(x0, y + d); pth.lineTo(x0, y); pth.lineTo(x1, y); pth.lineTo(x1, y + d)
    cv.drawPath(pth, P(RED, a, stroke=4)); cv.drawLine((x0 + x1) / 2, y, (x0 + x1) / 2, y - d * 1.3, P(RED, a, stroke=4))
    label_tag(cv, (x0 + x1) / 2, y - d * 1.3 - (24 if up else -24), label, a, 'c', 28, hl)

# ---------------------------------------------------------------- the ridge (3D prism, its crest is the watershed)
RW = 400; Z0, Z1 = -380, 1900; NZ = 30
def ridge_h(z): return 255 + 20 * math.sin(z / 380 + .6) + 9 * math.sin(z / 170)
def ridge_cam(v, st):
    return dict(cx=560, cy=st['cy'], rx=34 + 2 * math.sin(v * .4), ry=26 + 4 * math.sin(v * .27), s=st['s'] * .7)
def rp(c, x, y, z): return proj(x, y, z, c['cx'], c['cy'], c['rx'], c['ry'], c['s'])
def draw_ridge(cv, v, st, crest=0.0, crest_a=1.0):
    a = st['a']
    if a <= .01: return None
    c = ridge_cam(v, st)
    cv.saveLayerAlpha(None, int(a * 255))
    zs = [Z0 + (Z1 - Z0) * i / NZ for i in range(NZ + 1)]
    sh = skia.Path(); sh.moveTo(*rp(c, -RW - 40, 0, Z0)); sh.lineTo(*rp(c, RW + 40, 0, Z0)); sh.lineTo(*rp(c, RW + 40, 0, Z1)); sh.lineTo(*rp(c, -RW - 40, 0, Z1)); sh.close()
    cv.drawPath(sh, P('#000000', .35, blur=30))
    for i in range(NZ, 0, -1):
        z0, z1 = zs[i - 1], zs[i]; h0, h1 = ridge_h(z0), ridge_h(z1); fog = cl((z0 - Z0) / (Z1 - Z0)) ** 1.3 * .8
        for side, base in ((-1, '#262A31'), (1, '#3D424C')):
            q = skia.Path(); q.moveTo(*rp(c, side * RW, 0, z0)); q.lineTo(*rp(c, 0, -h0, z0)); q.lineTo(*rp(c, 0, -h1, z1)); q.lineTo(*rp(c, side * RW, 0, z1)); q.close()
            cc = mixc(base, '#0E1014', fog); cv.drawPath(q, P(cc)); cv.drawPath(q, P(cc, stroke=1.5))
            for f in (.35, .7):
                cv.drawLine(*rp(c, side * RW * f, -h0 * (1 - f), z0), *rp(c, side * RW * f, -h1 * (1 - f), z1), P('#FFFFFF', .035 * (1 - fog)))
    # front face (cross-section) with rock layers
    h = ridge_h(Z0); tri = skia.Path(); tri.moveTo(*rp(c, -RW, 0, Z0)); tri.lineTo(*rp(c, 0, -h, Z0)); tri.lineTo(*rp(c, RW, 0, Z0)); tri.close()
    top = rp(c, 0, -h, Z0); bot = rp(c, 0, 0, Z0)
    g = skia.GradientShader.MakeLinear([skia.Point(*top), skia.Point(*bot)], [col('#3A3530'), col('#1E1B18')], [0, 1])
    pp = skia.Paint(AntiAlias=True); pp.setShader(g); cv.drawPath(tri, pp)
    cv.save(); cv.clipPath(tri, doAntiAlias=True)
    for k in range(1, 7):
        y = -h * k / 7; cv.drawLine(*rp(c, -RW, y + 8 * math.sin(k), Z0), *rp(c, RW, y - 8 * math.sin(k * 2), Z0), P('#000000', .3, stroke=2))
    cv.restore(); cv.drawPath(tri, P('#5A5550', .6, stroke=2))
    # crest = watershed (drawn from the middle outwards)
    pts = [rp(c, 0, -ridge_h(z), z) for z in zs]
    if crest > 0:
        mid = NZ * (0 - Z0) // (Z1 - Z0)
        for part in (pts[mid::-1], pts[mid:]):
            sub = sub_path(part, crest)
            if len(sub) < 2: continue
            path = skia.Path(); path.moveTo(*sub[0]); [path.lineTo(*q) for q in sub[1:]]
            cv.drawPath(path, P(RED, .45 * crest_a, stroke=14, blur=8)); cv.drawPath(path, P(RED, crest_a, stroke=5))
            if crest < .995: glowtip(cv, *sub[-1], 1, crest_a)
    cv.restore()
    return c, pts

def ridge_slide_pts(c, side, z=0, out=520, f0=0.0):
    """screen path: crest -> down the slope -> along the ground outwards"""
    h = ridge_h(z); pts = []
    for k in range(13): f = f0 + (1 - f0) * k / 12; pts.append(rp(c, side * RW * f, -h * (1 - f), z))
    for k in range(1, 9): f = k / 8; pts.append(rp(c, side * (RW + out * f), 0, z))
    return pts

def split_drop(cv, v, c, t0, a, pills=None, labels=None):
    """drop falls onto the crest at t0, splits into two streams (left: Rhein/Nordsee, right: Donau/Schwarzes Meer)"""
    top = rp(c, 0, -ridge_h(0), 0)
    fall = (v - (t0 - .75)) / .75
    if 0 < fall < 1:
        y = lerp(top[1] - 520, top[1] - 26, fall * fall); drop(cv, top[0], y, .55 * eo(fall / .3), a, 1 + .35 * fall)
    o = v - t0
    if o > 0:
        ripple(cv, top[0], top[1], v, t0, 8, 140, a); R3.burst(cv, top[0], top[1], v, t0, 16, 120, WATER_L, seed=int(t0 * 10))
        for side in (-1, 1):
            ts = t0 + (pills[0 if side < 0 else 1] if pills else 0)
            pr = eio((v - ts) / 1.6)
            if pr > 0: river(cv, ridge_slide_pts(c, side), pr, a, v, 7)
            if 0 < pr < .98:
                x, y = point_at(ridge_slide_pts(c, side), pr); drop(cv, x, y - 10, .22, a)

# ---------------------------------------------------------------- map
def gpt7(lon, lat): return (lon - 10.3) * 100, -(lat - 49.3) * 160
WS = [(10.05, 47.45), (9.95, 47.7), (9.6, 47.95), (9.2, 47.93), (8.85, 47.88), (8.5, 47.88), (8.3, 47.95), (8.2, 48.06), (8.35, 48.15), (8.55, 48.05),
      (8.8, 48.1), (9.1, 48.25), (9.5, 48.42), (9.9, 48.6), (10.3, 48.8), (10.6, 49.0), (11.0, 49.12), (11.4, 49.25), (11.6, 49.55), (11.75, 49.85), (11.9, 50.05), (12.2, 50.15)]
RHEIN = [(9.05, 47.66), (8.6, 47.68), (8.2, 47.6), (7.6, 47.57), (7.55, 47.9), (7.6, 48.3), (7.8, 48.6), (8.1, 48.9), (8.35, 49.1), (8.45, 49.5), (8.3, 49.95),
         (7.9, 49.98), (7.6, 50.35), (7.2, 50.7), (6.96, 50.94), (6.75, 51.3), (6.65, 51.6), (6.2, 51.85), (5.7, 52.05)]
DONAU = [(8.5, 47.95), (8.8, 47.98), (9.2, 48.07), (9.6, 48.2), (10.0, 48.4), (10.5, 48.6), (11.0, 48.72), (11.42, 48.76), (11.9, 48.9), (12.1, 49.01),
         (12.6, 48.85), (13.0, 48.7), (13.46, 48.57), (14.3, 48.35)]
I_FURT = 7; I_ALB = 12
def _cum(pts):
    L = [0]; [L.append(L[-1] + math.dist(gpt7(*pts[i]), gpt7(*pts[i + 1]))) for i in range(len(pts) - 1)]; return [x / L[-1] for x in L]
WS_F = _cum(WS)
DE7 = skia.Path(); _p7 = [gpt7(*q) for q in R2.DE]; DE7.moveTo(*_p7[0]); [DE7.lineTo(*q) for q in _p7[1:]]; DE7.close()
FURT = (8.2, 48.06)

def map7_state(v):
    up = eio((v - S[3] + .45) / 1.1)
    zin = eio((v - S[6] + .25) / 1.1)
    return dict(cx=540, cy=lerp(1300, 860, up), rx=22 + 3 * math.sin(v * .5), ry=3 * math.sin(v * .37), sc=lerp(.7, .95, up), a=up * (1 - eo((zin - .45) / .4)), zin=zin)
def m7(st, lon, lat): x, y = gpt7(lon, lat); return proj(x, y, 0, st['cx'], st['cy'], st['rx'], st['ry'], st['sc'])

def ws_prog(v):
    keys = [(T_ALLG - .25, 0), (T_SCHW, WS_F[I_FURT]), (T_ALB, WS_F[I_ALB]), (T_FICHT + .3, 1.0)]
    if v <= keys[0][0]: return 0
    for (t0, f0), (t1, f1) in zip(keys[:-1], keys[1:]):
        if v <= t1: return lerp(f0, f1, eio((v - t0) / max(.05, t1 - t0)))
    return 1

def draw_map7(cv, v, st):
    a = st['a']
    if a <= .01: return
    cv.saveLayerAlpha(None, int(a * 255))
    z = lerp(1, 7, st['zin'] ** 1.6)
    fx, fy = m7(st, *FURT)
    cv.save(); cv.translate(fx, fy); cv.scale(z, z); cv.translate(-fx, -fy)
    for i in range(8, 0, -1):
        cv.save(); cv.concat(pmat(330, 330, 6 * i, st['cx'], st['cy'], st['rx'], st['ry'], st['sc'])); cv.drawPath(DE7, P('#101216')); cv.restore()
    cv.save(); cv.concat(pmat(330, 330, 0, st['cx'], st['cy'], st['rx'], st['ry'], st['sc']))
    g = skia.GradientShader.MakeLinear([skia.Point(0, -360), skia.Point(0, 360)], [col('#2C3038'), col('#22252C')], [0, 1])
    pp = skia.Paint(AntiAlias=True); pp.setShader(g); cv.drawPath(DE7, pp); cv.drawPath(DE7, P('#6B7280', stroke=3))
    cv.restore()
    # Bodensee
    bx, by = m7(st, 9.35, 47.6); cv.drawOval(skia.Rect.MakeLTRB(bx - 22, by - 8, bx + 22, by + 8), P(WATER, .8))
    # rivers
    rp_ = eio((v - T_RHEIN + .2) / 1.8); dp_ = eio((v - T_DONAU + .2) / 1.8)
    river(cv, chaikin([m7(st, *q) for q in RHEIN]), rp_, 1, v, 5)
    river(cv, chaikin([m7(st, *q) for q in DONAU]), dp_, 1, v, 5)
    # watershed
    wp = ws_prog(v)
    if wp > 0:
        pts = chaikin([m7(st, *q) for q in WS], 2)
        polyline2(cv, pts, wp, 6, RED, 1, wp < .995)
    cv.restore()
    # fade the north out so nothing reaches the headline
    m = skia.GradientShader.MakeLinear([skia.Point(0, 470), skia.Point(0, 640)], [col(WHITE, 0), col(WHITE, 1)], [0, 1])
    mp = skia.Paint(); mp.setShader(m); mp.setBlendMode(skia.BlendMode.kDstIn); cv.drawRect(skia.Rect.MakeLTRB(-200, -400, W + 200, H + 400), mp)
    cv.restore()

def point_at(pts, f):
    L = [math.dist(pts[i], pts[i + 1]) for i in range(len(pts) - 1)]; d = sum(L) * cl(f); acc = 0
    for i, l in enumerate(L):
        if acc + l >= d:
            q = (d - acc) / l if l else 0; return lerp(pts[i][0], pts[i + 1][0], q), lerp(pts[i][1], pts[i + 1][1], q)
        acc += l
    return pts[-1]

# ---------------------------------------------------------------- underground (Immendingen -> Aachtopf)
GX0, GX1, GTOP, GBOT = 110, 970, 790, 1160
CAVE = chaikin([(830, GTOP + 8), (815, 900), (760, 990), (640, 1040), (500, 1060), (380, 1035), (300, 980), (250, 900), (235, GTOP + 8)], 3)
def ground(cv, v, a, dx=0, dy=0, dry=0, dye=0, fill=0):
    if a <= .01: return
    cv.save(); cv.translate(dx, dy); cv.saveLayerAlpha(None, int(a * 255))
    render.block(cv, 540, GBOT, GX1 - GX0, GBOT - GTOP, 90, '#5E5A53')
    cv.drawRect(skia.Rect.MakeLTRB(GX0, GTOP, GX1, GTOP + 34), P('#3E3226'))
    # limestone texture
    rnd = random.Random(77)
    for i in range(46):
        x = rnd.uniform(GX0 + 10, GX1 - 40); y = rnd.uniform(GTOP + 50, GBOT - 20); w = rnd.uniform(40, 120)
        cv.drawLine(x, y, x + w, y + rnd.uniform(-6, 6), P('#000000', .18, stroke=2))
    for k in range(1, 5): cv.drawLine(GX0, GTOP + 34 + k * 80, GX1, GTOP + 34 + k * 80 + 6 * math.sin(k), P('#000000', .22, stroke=2))
    # karst cave
    path = skia.Path(); path.moveTo(*CAVE[0]); [path.lineTo(*q) for q in CAVE[1:]]
    cv.drawPath(path, P('#1E1C19', 1, stroke=30)); cv.drawPath(path, P('#000000', .4, stroke=34, blur=4))
    # Danube channel (right) drying up
    ch = skia.Path(); ch.moveTo(760, GTOP); ch.cubicTo(780, GTOP + 40, 880, GTOP + 40, 900, GTOP); ch.close()
    cv.drawPath(ch, P('#2A2620')); cv.drawPath(ch, P(WATER, .9 * (1 - dry)))
    # Aachtopf pool (left)
    pool = skia.Path(); pool.moveTo(180, GTOP); pool.cubicTo(195, GTOP + 44, 285, GTOP + 44, 300, GTOP); pool.close()
    cv.drawPath(pool, P('#2A2620')); cv.drawPath(pool, P(mixc(WATER, DYE, dye), .9 * fill))
    cv.restore(); cv.restore()

def cave_flow(cv, v, t0, a, dye_t=99, dx=0):
    """particles running through the cave from the Danube (right) to the Aachtopf (left)"""
    if a <= .01 or v < t0: return
    L = [math.dist(CAVE[i], CAVE[i + 1]) for i in range(len(CAVE) - 1)]; tot = sum(L)
    head = cl((v - t0) / 2.2)
    for k in range(60):
        u = ((k / 60) + v * .22) % 1
        if u > head: continue
        x, y = point_at(CAVE, u); x += dx + 4 * math.sin(k * 7 + v * 3)
        age_dye = v - dye_t - (u * 2.0)
        c = DYE if age_dye > 0 else WATER
        cv.drawCircle(x, y, 8, P(c, .3 * a, blur=5)); cv.drawCircle(x, y, 3.6, P(WATER_L if c == WATER else '#E9FFB0', a))

# ---------------------------------------------------------------- canal profile (Main-Donau-Kanal)
def alt_y(m): return 1215 - (m - 200) * 2.2
def canal_steps():
    xs_up = [90 + i * 34 for i in range(12)]; up = [231 + 175 * i / 11 for i in range(12)]
    xs_dn = [650 + i * 66 for i in range(6)]; dn = [406 - 68 * i / 5 for i in range(6)]
    pts = []
    for i in range(11): pts += [(xs_up[i], alt_y(up[i])), (xs_up[i + 1], alt_y(up[i]))] if False else [(xs_up[i], alt_y(up[i])), (xs_up[i] + 34, alt_y(up[i]))]
    pts += [(xs_up[-1], alt_y(406)), (650, alt_y(406))]
    for i in range(5): pts += [(xs_dn[i], alt_y(dn[i + 1])), (xs_dn[i] + 66, alt_y(dn[i + 1]))]
    return pts
STEPS = canal_steps()
def canal(cv, v, a, dy=0):
    if a <= .01: return
    cv.save(); cv.translate(0, dy); cv.saveLayerAlpha(None, int(a * 255))
    path = skia.Path(); path.moveTo(60, 1230); path.lineTo(60, STEPS[0][1] + 6)
    for x, y in STEPS: path.lineTo(x, y + 6)
    path.lineTo(1000, STEPS[-1][1] + 6); path.lineTo(1000, 1230); path.close()
    g = skia.GradientShader.MakeLinear([skia.Point(0, 760), skia.Point(0, 1230)], [col('#3A3F49'), col('#1A1C21')], [0, 1])
    pp = skia.Paint(AntiAlias=True); pp.setShader(g); cv.drawPath(path, pp); cv.drawPath(path, P('#5A606C', stroke=2))
    for i in range(0, len(STEPS) - 1, 2):
        (x0, y0), (x1, _) = STEPS[i], STEPS[i + 1]; cv.drawLine(x0 + 3, y0 + 2, x1 - 3, y0 + 2, P(WATER, .9, stroke=6))
    cv.restore(); cv.restore()
def ship_pos(p):
    """position along the canal: climbs lock by lock"""
    n = len(STEPS) // 2; f = p * (n - 1); i = int(min(n - 2, f)); q = f - i
    (x0, y0), (x1, _) = STEPS[2 * i], STEPS[2 * i + 1]; (x2, y2), (x3, _) = STEPS[2 * i + 2], STEPS[2 * i + 3]
    if q < .6: x = lerp(x0, x1, q / .6); y = y0
    else: x = x1; y = lerp(y0, y2, eio((q - .6) / .4))
    return (x0 + x1) / 2 if False else x, y
def ship(cv, x, y, a):
    if a <= .01: return
    cv.save(); cv.translate(x, y)
    hull = skia.Path(); hull.moveTo(-34, -10); hull.lineTo(34, -10); hull.lineTo(28, 0); hull.lineTo(-30, 0); hull.close()
    cv.drawPath(hull, P('#C9CDD4', a)); cv.drawRect(skia.Rect.MakeLTRB(14, -22, 28, -10), P('#E4E3DF', a)); cv.drawRect(skia.Rect.MakeLTRB(-26, -16, 8, -10), P(RED, a))
    cv.restore()

# ---------------------------------------------------------------- frame
def frame7(cv, t):
    v = t - OFF7
    atmosphere(cv, v + 4)
    push = 1.02 + .018 * math.sin(v * .21) + .008 * math.sin(v * .53)
    acc = 1 + sum(.035 * math.exp(-(v - x) * 5) * cl((v - x) / .06) for x in ACC7 if v > x)
    cv.save(); cv.translate(540, 880); cv.scale(push * acc, push * acc); cv.rotate(.3 * math.sin(v * .3)); cv.translate(-540, -880)

    # ---------- A/B: ridge, drop, crest ignites
    sink = eio((v - S[3] + .35) / 1.0)
    if v < S[3] + 1.0:
        st = dict(cy=960 + 600 * sink * sink, s=lerp(.8, 1, eo((v + .2) / 2.5)), a=cl((v + .2) / .4) * (1 - eo((sink - .5) / .5)))
        crest = eio((v - T_LINIE + .2) / 1.4); ca = .35 + .65 * eo((v - T_LINIE) / .4)
        r = draw_ridge(cv, v, st, max(crest, .0001 if v < T_LINIE else crest), ca)
        if r:
            c, cpts = r
            split_drop(cv, v, c, T_KANN, st['a'], pills=(T_NORD - T_KANN - .2, T_SCHWM - T_KANN - .2))
            pa = st['a'] * (1 - eo((v - S[2] + .2) / .4))
            pill(cv, 230, 1255, 'Nordsee', eo((v - T_NORD + .1) / .4) * pa, None, 30)
            pill(cv, 820, 1255, 'Schwarzes Meer', eo((v - T_SCHWM + .1) / .4) * pa, None, 30)
            if v > T_LINIE: R3.burst(cv, *cpts[0], v, T_LINIE + .1, 18, 180, seed=2)
    # crest line contracts into the start of the map line (shared object)
    if S[3] - .5 < v < S[3] + 1.1 and sink > 0:
        st = dict(cy=960 + 600 * sink * sink, s=1, a=1)
        c = ridge_cam(v, st); pts = [rp(c, 0, -ridge_h(Z0 + (Z1 - Z0) * i / NZ), Z0 + (Z1 - Z0) * i / NZ) for i in range(NZ + 1)]
        ms = map7_state(v); target = m7(ms, *WS[0]); q = eio((v - S[3] + .35) / .9)
        mp = [(lerp(x, target[0], q), lerp(y, target[1], q)) for x, y in pts]
        path = skia.Path(); path.moveTo(*mp[0]); [path.lineTo(*p) for p in mp[1:]]
        cv.drawPath(path, P(RED, .45 * (1 - q * .5), stroke=14, blur=8)); cv.drawPath(path, P(RED, 1, stroke=5)); glowtip(cv, *target, 1, q)

    # ---------- C/D: map
    ms = map7_state(v)
    if ms['a'] > .01:
        draw_map7(cv, v, ms)
        la = ms['a'] * (1 - eo((v - S[4] + .2) / .4))
        for nm, ll, t0, al in [('Allgäu', (10.05, 47.45), T_ALLG, 'l'), ('Schwarzwald', (8.2, 48.06), T_SCHW, 'r'), ('Schwäbische Alb', (9.5, 48.42), T_ALB, 'l'),
                               ('Fichtelgebirge', (11.9, 50.05), T_FICHT, 'l')]:
            x, y = m7(ms, *ll); q = eo((v - t0 + .05) / .4) * la
            if q > 0:
                cv.drawCircle(x, y, 8, P(WHITE, q)); ripple(cv, x, y, v, t0, 8, 60, la)
                off = 22 if al == 'l' else -22
                yy = y + (30 if nm == 'Allgäu' else (-30 if nm == 'Schwäbische Alb' else 0))
                label_tag(cv, x + off, yy, nm, q, al, 26)
        # exits + counter
        nx, ny = m7(ms, *RHEIN[-1]); dx_, dy_ = m7(ms, *DONAU[-1])
        oa = ms['a'] * (1 - eo((v - S[6] + .3) / .4))
        kx, ky = m7(ms, 6.96, 50.94); label_tag(cv, kx - 20, ky, 'Nordsee', eo((v - T_NORD2 + .1) / .4) * oa, 'r', 28, True)
        px_, py_ = m7(ms, 13.46, 48.57); label_tag(cv, 1040, py_ + 46, 'Schwarzes Meer', eo((v - T_SCHWM2 + .1) / .4) * oa, 'r', 28, True)
        ca = eo((v - T_2800 + .2) / .4) * oa
        if ca > 0:
            n = int(round(2800 * eo((v - T_2800 + .2) / 1.1)))
            text(cv, f'über {n:,} km'.replace(',', '.'), 1000, 1195, 54, RED, ca, 'r')
            text(cv, 'Donau bis ins Schwarze Meer', 1000, 1232, 24, '#C9CDD4', ca, 'r')
        fx, fy = m7(ms, *FURT)
        if S[6] - .4 < v < S[6] + .6:
            ripple(cv, fx, fy, v, S[6] - .3, 10, 120, ms['a']); cv.drawCircle(fx, fy, 10, P(WHITE, ms['a']))

    # ---------- E: Furtwangen – two springs on the ridge
    ein = eio((v - S[6] - .35) / .9); eout = eio((v - S[8] + .2) / .9)
    if ein > 0 and eout < 1:
        st = dict(cy=960 + 500 * eout * eout, s=lerp(.25, 1, ein), a=ein * (1 - eo((eout - .4) / .5)))
        r = draw_ridge(cv, v, st, 1, 1)
        if r:
            c, _ = r; z = 0; h = ridge_h(z)
            sp = {}
            for side, nm, t0 in ((-1, 'Elz', T_ELZ), (1, 'Breg', T_BREG)):
                f0 = .2; x0, y0 = rp(c, side * RW * f0, -h * (1 - f0), z)
                pts = [rp(c, side * RW * f, -h * (1 - f), z) for f in [f0 + (1 - f0) * k / 10 for k in range(11)]]
                pts += [rp(c, side * (RW + 480 * k / 6), 0, z) for k in range(1, 7)]
                q = ob((v - T_QUELL + .2 - (.15 if side > 0 else 0)) / .5)
                if q > 0:
                    cv.drawCircle(x0, y0, 22 * q, P(WATER, .45 * st['a'], blur=10)); cv.drawCircle(x0, y0, 9 * q, P(WATER_L, st['a']))
                    ripple(cv, x0, y0, v, T_QUELL, 8, 70, st['a'])
                river(cv, pts, eio((v - t0 + .1) / 1.4), st['a'], v, 6)
                sp[side] = (x0, y0)
            if -1 in sp and 1 in sp:
                (xa, ya), (xb, yb) = sp[-1], sp[1]
                hbracket(cv, xa, xb, min(ya, yb) - 150, eo((v - T_KM + .2) / .4) * st['a'], '≈ 1,3 km', True, True)
            pa = st['a'] * (1 - eo((eout - .2) / .3))
            pill(cv, 230, 1255, 'Elz: zum Rhein', eo((v - T_ELZ + .1) / .4) * pa, None, 30)
            pill(cv, 830, 1255, 'Breg: zur Donau', eo((v - T_BREG + .1) / .4) * pa, None, 30)

    # ---------- F/G: underground
    gin = eio((v - S[8] + .1) / 1.0); gout = eio((v - S[12] + .2) / .9)
    if gin > 0 and gout < 1:
        ga = gin * (1 - gout); dy = 500 * (1 - gin) ** 2 + 0; dx = -700 * gout ** 2
        dry = eio((v - T_VERS - .2) / 1.6); dye = eo((v - T_FARB - 1.6) / .8)
        ground(cv, v, ga, dx, dy, dry, dye, eo((v - S[10] - 1.5) / .7))
        cv.save(); cv.translate(dx, dy)
        dashed_v(cv, 540, 610, GTOP - 4, ga * eo((v - S[8] - .4) / .5), v)
        cv.drawLine(540, GTOP + 40, 540, GBOT - 10, P(RED, .25 * ga, stroke=3))
        # seeping: drops through the riverbed
        if v > T_VERS - .1:
            rnd = random.Random(5)
            for i in range(16):
                ph = (v * .9 + i / 16) % 1; x = 780 + rnd.uniform(0, 100)
                y = lerp(GTOP + 30, 900, ph); cv.drawCircle(x, y, 3.5, P(WATER_L, ga * (1 - ph) * eo((v - T_VERS) / .4)))
        cave_flow(cv, v, S[10] - .1, ga, T_FARB)
        if v > S[10] + 1.6:   # spring bubbling
            for k in range(6):
                ph = (v * 1.3 + k / 6) % 1; cv.drawCircle(240 + 12 * math.sin(k * 3), GTOP + 14 - 26 * ph, 4 * (1 - ph), P(DYE if v > T_FARB + 2.0 else WATER_L, ga * (1 - ph)))
        pill(cv, 830, 700, 'Donau', ga * eo((v - S[9] + .1) / .4), 'down', 30)
        pill(cv, 240, 700, 'Aachtopf', ga * eo((v - T_AACH + .1) / .4), 'down', 30)
        pill(cv, 540, 588, 'Wasserscheide', ga * eo((v - S[8] - .4) / .4), None, 26)
        # stream onward: Aachtopf -> Bodensee -> Rhein
        rp2 = eio((v - T_BOD + .2) / 1.2)
        if rp2 > 0:
            river(cv, [(185, GTOP + 6), (140, GTOP + 6), (60, GTOP + 6), (-40, GTOP + 6)], rp2, ga, v, 6, mixc(WATER, DYE, dye))
        hbracket(cv, 240, 830, GBOT + 50, ga * eo((v - S[10] - .6) / .4) * (1 - eo((v - S[11] + .2) / .3)), '≈ 12 km', False, False)
        ya = eo((v - T_1877 + .4) / .4) * ga
        if ya > 0:
            n = int(round(lerp(1800, 1877, eo((v - T_1877 + .4) / .9))))
            text(cv, str(n), 540, 515, 96, RED, ya, 'c')
            if v > T_1877: ripple(cv, 540, 480, v, T_1877 + .5, 60, 300, ga)
        cv.restore()

    # ---------- H: canal
    kin = eio((v - S[12] - .1) / .9); kout = eio((v - S[13] + .25) / .8)
    if kin > 0 and kout < 1:
        ka = kin * (1 - kout); dy = 500 * (1 - kin) ** 2 + 500 * kout ** 2
        canal(cv, v, ka, dy)
        cv.save(); cv.translate(0, dy)
        p = eio((v - S[12] - .3) / (E[12] - S[12] + .3))
        sx, sy = ship_pos(p); ship(cv, sx, sy, ka)
        dashed_v(cv, 560, 640, alt_y(406) - 4, ka * eo((v - S[12] - .6) / .4), v)
        ca = eo((v - T_406 + .3) / .4) * ka
        if ca > 0:
            n = int(round(lerp(231, 406, eo((v - T_406 + .3) / 1.0))))
            text(cv, f'{n} m', 560, 610, 84, RED, ca, 'c')
        lk = eo((kin - .85) / .15) * (1 - eo(kout / .25))
        label_tag(cv, 80, 1262, 'Bamberg · Main', lk * eo((v - S[12] - .5) / .4), 'l', 26)
        label_tag(cv, 1000, alt_y(338) + 60, 'Kelheim · Donau', lk * eo((v - S[12] - .9) / .4), 'r', 26)
        cv.restore()

    # ---------- I: back to the ridge
    iin = eio((v - S[13] + .1) / .9); iout = eio((v - VO7) / .8)
    if iin > 0 and iout < 1:
        st = dict(cy=960 + 520 * (1 - iin) ** 2 + 520 * iout * iout, s=1, a=iin * (1 - iout))
        r = draw_ridge(cv, v, st, 1, 1)
        if r:
            c, _ = r; split_drop(cv, v, c, S[13] + 1.0, st['a'], pills=(.0, .0))
    cv.restore()

    # ---------- outro: a new drop splits into two streams that draw the logo line
    o = v - VO7
    if o > 0:
        fall = (o - .3) / .6
        if 0 < fall < 1: drop(cv, 540, lerp(380, 958, fall * fall), .45, 1, 1 + .3 * fall)
        imp = .9
        if o > imp:
            q = o - imp; ripple(cv, 540, 985, v, VO7 + imp, 10, 260); R3.burst(cv, 540, 985, v, VO7 + imp, 18, 150, WATER_L, seed=7)
            lw = 230 * eio(q / .9); cc = mixc(WATER, RED, cl((q - .5) / .5))
            for sx in (-1, 1):
                cv.drawLine(540, 985, 540 + sx * lw, 985, P(cc, .4, stroke=14, blur=6)); cv.drawLine(540, 985, 540 + sx * lw, 985, P(cc, 1, stroke=5))
                glowtip(cv, 540 + sx * lw, 985, .8, 1 - eo((q - 1.4) / .4))
            la = eo((q - .5) / .6)
            if la > 0:
                cv.save(); cv.clipRect(skia.Rect.MakeLTRB(0, 0, W, 975))
                tracked(cv, 'function.', 540, 950 + 90 * (1 - la), 150, RED, la, -.03); cv.restore()

    # ---------- headlines, sources, logo, subtitles
    HL = [(0.0, S[2] - .1, [[('Nordsee oder', 0)], [('Schwarzes Meer?', 1)]]),
          (S[2], S[3] - .1, [[('Europäische', 0)], [('Hauptwasserscheide', 1)]]),
          (S[3], S[4] - .1, [[('Quer durch', 0)], [('Süddeutschland', 1)]]),
          (S[4], S[5] - .1, [[('Auf der einen Seite:', 0)], [('der ', 0), ('Rhein', 1)]]),
          (S[5], S[6] - .1, [[('Auf der anderen:', 0)], [('die ', 0), ('Donau', 1)]]),
          (S[6], S[8] - .1, [[('Zwei Quellen,', 0)], [('zwei ', 0), ('Meere', 1)]]),
          (S[8], S[10] - .1, [[('Die Donau', 0)], [('versickert', 1)]]),
          (S[10], S[11] - .1, [[('Wieder da im', 0)], [('Aachtopf', 1)]]),
          (S[11], S[12] - .1, [[('Nachgewiesen', 0)], [('mit Farbe', 1)]]),
          (S[12], S[13] - .1, [[('Main-Donau-Kanal:', 0)], [('über die ', 0), ('Linie', 1)]]),
          (S[13], VO7, [[('Wenige Meter', 0)], [('entscheiden', 1)]])]
    for a, b, ln in HL:
        if a - .1 < v < b + .4: headline3(cv, v, a, b, ln, base=255)
    for a, b, s in [(S[3], S[6] - .1, 'Karte schematisch · Quellen: ICPDR, LGRB'),
                    (S[6], S[8] - .1, 'Quelle: LGRB Baden-Württemberg · schematisch'),
                    (S[8], S[12] - .1, 'Quellen: LGRB, Markierungsversuch Knop 1877 · schematisch'),
                    (S[12], S[13] - .1, 'Quelle: Bayerische Staatsregierung · schematisch')]:
        source(cv, v, a, b, s)
    logo_small(cv, cl((v - .3) / .5) * (1 - eo((v - VO7) / .4)))
    if 0 <= v < VE7 + .3: subtitles(cv, v)

if __name__ == '__main__':
    mode = sys.argv[1]; surf = skia.Surface(W, H); cv = surf.getCanvas()
    if mode == 'test':
        for t in [float(x) for x in sys.argv[2].split(',')]:
            frame7(cv, t); surf.makeImageSnapshot().save(f'w_{t:05.1f}.png', skia.kPNG)
    elif mode == 'video':
        a0, a1, out = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
        ff = _sp.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-c:v', 'libx264', '-preset', 'faster', '-crf', '19', '-pix_fmt', 'yuv420p', out], stdin=_sp.PIPE)
        for i in range(a0, a1):
            frame7(cv, i / FPS); ff.stdin.write(surf.makeImageSnapshot().toarray().tobytes())
            if i % 150 == 0: print(i, a1, flush=True)
        ff.stdin.close(); ff.wait(); print('done', flush=True)
    elif mode == 'events':
        json.dump({'dur': DUR7, 'OFF': OFF7, 'VO': VO7, 'acc': ACC7, 'n': int(DUR7 * FPS), 'S': S, 'E': E, 'kann': T_KANN, 'linie': T_LINIE,
                   'allg': T_ALLG, 'schw': T_SCHW, 'alb': T_ALB, 'ficht': T_FICHT, 'rhein': T_RHEIN, 'donau': T_DONAU, 't2800': T_2800,
                   'quell': T_QUELL, 'breg': T_BREG, 'elz': T_ELZ, 'vers': T_VERS, 'aach': T_AACH, 'bod': T_BOD, 't1877': T_1877, 'farb': T_FARB,
                   'kanal': T_KANAL, 't406': T_406, 'voice': os.path.exists(VOICE7)}, open('events7.json', 'w'))
