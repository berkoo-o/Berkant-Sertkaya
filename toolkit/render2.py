import render as R0
from render import *
import render

OFF2 = 0.12
VO = 50.4                  # outro start (voice time)
SHIFT = 71.5 - VO
V_END2 = VO + 3.45
DUR2 = V_END2 + OFF2
PLATE = 'BER KO 7'
GREEN = '#2FA84F'; YEL = '#F2C42E'; REDP = '#D9342B'

SEGS2 = [
 (0.0, 4.63, "Über neunzig Prozent aller Autos erfüllen die Vorgaben für die grüne Plakette."),
 (5.00, 6.31, "Wozu gibt es sie dann noch?"),
 (6.78, 9.65, "Eingeführt wurde die Umweltplakette 2007."),
 (10.03, 12.96, "Sie zeigt, wie viel Schadstoff ein Fahrzeug ausstößt."),
 (13.41, 15.03, "Anfangs gab es drei Farben:"),
 (15.33, 17.00, "Rot, Gelb und Grün."),
 (17.45, 19.76, "Heute zählt fast überall nur noch Grün."),
 (20.12, 23.52, "Wer ohne sie in eine Umweltzone fährt, zahlt hundert Euro."),
 (23.94, 25.38, "Doch die Wirkung lässt nach."),
 (25.74, 29.09, "Laut Umweltbundesamt halten die Zonen kaum noch Autos fern."),
 (29.51, 32.44, "Viele Städte haben ihre Umweltzone deshalb aufgehoben."),
 (32.84, 34.67, "Einst waren es sechsundfünfzig,"),
 (34.87, 36.65, "heute sind es noch fünfunddreißig."),
 (37.08, 43.23, "Seit dem 1. Oktober 2026 brauchen Autos mit E-Kennzeichen gar keine Plakette mehr."),
 (43.49, 45.18, "Das E reicht als Nachweis."),
 (45.60, 47.49, "Die grüne Plakette gibt es also noch."),
 (47.79, 50.27, "Aber sie verliert Jahr für Jahr an Bedeutung."),
]
SP = {'2007': 'zweitausendsieben', '2026': 'zweitausendsechsundzwanzig', '1.': 'ersten', 'E-Kennzeichen': 'eekennzeichen', 'E': 'ee'}
DISP = {'neunzig': '90', 'hundert': '100', 'sechsundfünfzig,': '56,', 'fünfunddreißig.': '35.'}
WORDS = []
for a, b, s in SEGS2:
    ws = s.split(); wt = [len(SP.get(w.strip('.,:?'), w.strip('.,:?'))) + 2 + (3 if w[-1] in ',:' else 0) for w in ws]
    tot = sum(wt); x = a
    for w, k in zip(ws, wt):
        d = (b - a) * k / tot; WORDS.append((x, x + d, w)); x += d
def wt2(word, after=0):
    for a, b, w in WORDS:
        if a >= after and w.strip('.,:?') == word: return a
    raise KeyError(word)
CHS = []
for a, b, s in SEGS2:
    ws = [w for w in WORDS if w[0] >= a - 1e-6 and w[1] <= b + 1e-6]; cur = []
    for w in ws:
        if cur and (len(cur) >= 4 or len(' '.join(x[2] for x in cur + [w])) > 22): CHS.append(cur); cur = []
        cur.append(w)
    if cur: CHS.append(cur)
render.CH = []
for i, c in enumerate(CHS):
    nxt = CHS[i + 1][0][0] if i + 1 < len(CHS) else 99
    render.CH.append((c[0][0], min(nxt - .06, c[-1][1] + .35), [(x, y, DISP.get(w, w)) for x, y, w in c]))

T2007 = wt2('2007'); T2026 = wt2('2026'); T56 = wt2('sechsundfünfzig'); T35 = wt2('fünfunddreißig'); T100 = wt2('hundert')
TROT = wt2('Rot'); TGELB = wt2('Gelb'); TGRUEN = wt2('Grün', 15)
ACC = [T2007, T2026, T56, T35, T100]

# ---------------------------------------------------------------- Umweltplakette
def uface(cv, R, c, num, plate=PLATE, gray=0):
    if gray: c = '#555960'
    sh = skia.GradientShader.MakeRadial(skia.Point(-R * .35, -R * .45), R * 1.7, [col(shade(c, 1.2)), col(c), col(shade(c, .78))], [0, .5, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(sh); cv.drawCircle(0, 0, R, p)
    cv.drawCircle(0, 0, R * .985, P('#000000', .3, stroke=max(1, R * .014)))
    cv.drawCircle(0, 0, R * .9, P('#000000', .25, stroke=max(1, R * .008)))
    f = F(R * .72); w = f.measureText(num); cv.drawString(num, -w / 2, R * .02, f, P('#101010'))
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-R * .74, R * .13, R * .74, R * .5), R * .05, R * .05)
    cv.drawRRect(rr, P('#F4F3EF')); cv.drawRRect(rr, P('#000000', .35, stroke=max(1, R * .01)))
    f2 = F(R * .23); w2 = f2.measureText(plate); cv.drawString(plate, -w2 / 2, R * .4, f2, P('#141414'))
    gl = skia.GradientShader.MakeLinear([skia.Point(-R, -R), skia.Point(R, R)], [col(WHITE, .22), col(WHITE, 0), col(WHITE, 0)], [0, .45, 1])
    p2 = skia.Paint(AntiAlias=True); p2.setShader(gl); cv.drawCircle(0, 0, R, p2)

def uplq(cv, cx, cy, R, c, num, rx=0, ry=0, a=1, glow=0, gray=0, cross=0):
    if a <= .01 or R < 2: return
    lay = a < .995
    if lay: cv.saveLayerAlpha(None, int(a * 255))
    cv.drawOval(skia.Rect.MakeXYWH(cx - R * .9, cy + R * .78, R * 1.8, R * .4), P('#000000', .3, blur=R * .12))
    for i in range(5, 0, -1):
        cv.save(); cv.concat(pmat(R, R, R * .07 * i / 5, cx, cy, rx, ry)); cv.drawCircle(0, 0, R, P(shade('#555960' if gray else c, .42))); cv.restore()
    cv.save(); cv.concat(pmat(R, R, 0, cx, cy, rx, ry))
    if glow > 0: cv.drawCircle(0, 0, R * 1.05, P(RED, .7 * glow, stroke=R * .06, blur=R * .07))
    uface(cv, R, c, num, gray=gray)
    if cross > 0:
        L = R * .75 * cross
        cv.drawLine(-L, -L, L, L, P(RED, 1, stroke=R * .09)); cv.drawLine(L, -L, -L, L, P(RED, 1, stroke=R * .09))
    cv.restore()
    if lay: cv.restore()

# ---------------------------------------------------------------- Germany map (schematic)
DE = [(6.9,53.4),(7.2,53.7),(8.0,53.7),(8.5,53.55),(8.9,53.9),(8.6,54.3),(8.9,54.9),(9.4,54.85),(10.0,54.7),(10.2,54.4),(10.9,54.4),(11.1,54.5),(10.8,54.0),(11.4,53.95),(12.1,54.18),(13.0,54.45),(13.5,54.65),(14.2,53.95),(14.4,53.3),(14.1,52.85),(14.6,52.6),(14.7,52.1),(14.75,51.6),(15.0,51.15),(14.6,50.9),(13.9,50.8),(13.0,50.5),(12.3,50.25),(12.2,50.0),(12.5,49.7),(12.9,49.35),(13.4,49.0),(13.85,48.75),(13.7,48.5),(13.0,48.3),(12.8,47.95),(13.0,47.7),(12.8,47.55),(12.2,47.65),(11.5,47.5),(10.9,47.45),(10.4,47.4),(10.0,47.55),(9.6,47.55),(9.0,47.65),(8.6,47.65),(8.2,47.6),(7.6,47.6),(7.55,48.0),(7.8,48.5),(8.2,48.97),(7.6,49.05),(6.9,49.2),(6.4,49.45),(6.35,49.8),(6.15,50.2),(6.4,50.35),(6.0,50.75),(5.9,51.05),(6.2,51.4),(5.95,51.8),(6.7,51.9),(7.0,52.25),(6.7,52.5),(7.05,52.65),(7.2,53.25)]
CITIES = [(13.4,52.5),(9.73,52.37),(8.8,53.08),(8.05,52.28),(7.63,51.96),(6.76,51.43),(6.85,51.47),(7.01,51.45),(6.88,51.42),(6.93,51.52),(7.09,51.51),(6.99,51.57),(7.2,51.61),(7.22,51.54),(7.22,51.48),(7.47,51.51),(7.47,51.36),(7.15,51.26),(6.78,51.23),(6.56,51.33),(6.44,51.19),(6.69,51.2),(6.96,50.94),(7.1,50.73),(6.08,50.78),(6.98,51.03),(8.68,50.11),(8.76,50.1),(8.24,50.08),(8.27,50.0),(8.65,49.87),(8.06,50.39),(8.77,50.8),(8.47,49.49),(8.69,49.4),(8.4,49.0),(8.7,48.89),(9.22,49.14),(9.18,48.78),(9.19,48.9),(9.31,48.74),(9.2,48.49),(9.05,48.52),(9.99,48.4),(7.85,48.0),(9.8,48.8),(8.85,48.27),(10.9,48.37),(11.58,48.14),(10.05,48.36),(12.37,51.34),(11.97,51.48),(11.63,52.13),(11.03,50.98),(9.95,52.15),(8.87,48.6)]
GONE = [29, 36, 34, 37, 39, 40, 41, 42, 43, 45, 46, 55, 49, 35, 33, 31, 32, 3, 51, 53, 44]
def geo(lon, lat): return (lon - 10.45) * 50, -(lat - 51.15) * 80
MAPC = (540, 860); MRX = 30

def draw_map(cv, v, a):
    if a <= .01: return
    cv.saveLayerAlpha(None, int(a * 255))
    path = skia.Path(); pts = [geo(*p) for p in DE]; path.moveTo(*pts[0])
    for p in pts[1:]: path.lineTo(*p)
    path.close()
    rx = MRX + 3 * math.sin(v * .7); ry = 6 * math.sin(v * .5)
    for i in range(6, 0, -1):
        cv.save(); cv.concat(pmat(320, 320, 3.5 * i, MAPC[0], MAPC[1], rx, ry)); cv.drawPath(path, P('#141619')); cv.restore()
    cv.save(); cv.concat(pmat(320, 320, 0, MAPC[0], MAPC[1], rx, ry))
    cv.drawPath(path, P('#25282F')); cv.drawPath(path, P('#3E434D', stroke=2.5))
    for i, (lo, la) in enumerate(CITIES):
        x, y = geo(lo, la); ap = eo((v - 29.6 - (i % 14) * .04) / .3)
        if i in GONE:
            k = GONE.index(i); tg = 30.3 + k * .1; g = 1 - eo((v - tg) / .35)
            if 0 < v - tg < .7: cv.drawCircle(x, y, 6 + 26 * eo((v - tg) / .7), P(RED, .5 * (1 - (v - tg) / .7), stroke=2))
            ap *= g
        if ap <= 0: continue
        cv.drawCircle(x, y, 11, P(RED, .45 * ap, blur=6)); cv.drawCircle(x, y, 5.5 * ap, P('#FF4A55', ap))
    cv.restore(); cv.restore()

# ---------------------------------------------------------------- E plate
def eplate(cv, v, a, ehl):
    if a <= .01: return
    p = eo((v - 37.0) / 3); cx, cy = 560 + 5 * math.sin(v * .8), 900 + 8 * math.sin(v * .7)
    s, rx, ry = lerp(.88, .95, p), lerp(22, 12, p), lerp(-26, -12, p); hw, hh = 440, 105
    cv.saveLayerAlpha(None, int(a * 255))
    for i in range(4, 0, -1):
        cv.save(); cv.concat(pmat(hw, hh, 6 * i, cx, cy, rx, ry, s)); cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw, -hh, hw, hh), 16, 16), P('#5B5C60')); cv.restore()
    cv.save(); cv.concat(pmat(hw, hh, 0, cx, cy, rx, ry, s))
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw, -hh, hw, hh), 16, 16)
    cv.drawRRect(rr, P('#E4E3DF')); cv.drawRRect(rr, P('#1A1A1A', stroke=7, cap=False))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw + 10, -hh + 10, -hw + 86, hh - 10), 8, 8), P('#1F3C96'))
    for k in range(12):
        an = k * math.pi / 6; cv.drawCircle(-hw + 48 + 22 * math.sin(an), -38 - 22 * math.cos(an), 3.2, P(AMBER))
    text(cv, 'D', -hw + 48, 72, 52, WHITE, 1, 'c')
    text(cv, 'BER', -342, 52, 118, '#141414')
    cv.save(); cv.translate(-28, -38); R0.face(cv, 46, COLS['blau'], '27', 90); cv.restore()
    cv.drawCircle(-28, 64, 27, P('#B9B8B4')); cv.drawCircle(-28, 64, 27, P('#8A8986', stroke=2))
    x = 36; f = F(118)
    for ch in 'KO 7':
        cv.drawString(ch, x, 52, f, P('#141414')); x += f.measureText(ch)
    if ehl > 0:
        w = f.measureText('E'); r = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x - 10, -80, x + w + 10, 72), 14, 14)
        cv.drawRRect(r, P(RED, .5 * ehl, blur=14)); cv.drawRRect(r, P(RED, ehl, stroke=6))
    cv.drawString('E', x, 52, f, P('#141414'))
    cv.restore(); cv.restore()

# ---------------------------------------------------------------- frame
random.seed(11); ORD = list(range(100)); random.shuffle(ORD); BAD = set(ORD[:9])
def frame2(cv, t):
    v = t - OFF2
    background(cv, v)
    acc = 1 + sum(.028 * math.exp(-(v - x) * 5) * cl((v - x) / .06) for x in ACC if v > x)
    cv.save(); cv.translate(540, 860); cv.scale(acc, acc); cv.translate(-540, -860)
    bx, by = breath(v)

    # main green plaque path
    m = None
    if v < 13.3: m = (540, 840, 260, 1)
    elif v < 17.25:
        p = eio((v - 13.3) / .8); m = (lerp(540, 850, p), lerp(840, 860, p), lerp(260, 135, p), 1)
    elif v < 23.75:
        p = eio((v - 17.3) / .9); m = (lerp(850, 540, p), lerp(860, 820, p), lerp(135, 230, p), 1)
    elif v < 24.4:
        p = eio((v - 23.75) / .6); m = (540, 820, 230 * (1 - .4 * p), 1 - p)
    elif v < 36.9: m = None
    elif v < 43.4:
        p = eo((v - 37.0) / .6); fade = 1 - eo((v - 42.0) / .9)
        m = (300, 600, 105 * ob((v - 37.0) / .6), p * fade)
    elif v > 45.45:
        p = ob((v - 45.45) / .7); m = (540, 840, 250 * lerp(.6, 1, p), eo((v - 45.45) / .3) * lerp(1, .78, eo((v - 47.8) / 2.5)) * (1 - eo((v - VO - .05) / .35)))
    # S8 decline line
    a8 = win(v, 47.6, VO, .3, .35)
    if a8 > 0:
        pts = [(110, 600), (260, 640), (360, 700), (470, 690), (590, 820), (700, 860), (820, 980), (970, 1090)]
        polyline(cv, pts, eo((v - 47.8) / 2.2), 6, a8)
    if m:
        cx, cy, Rr, a = m
        cross = eo((v - 41.4) / .4) if 36.9 < v < 43.5 else 0
        uplq(cv, cx, cy + 6 * math.sin(v), Rr, GREEN, '4', bx, by, a, glow=win(v, TGRUEN, 19.8) * (.6 + .4 * math.sin(v * 6)), cross=cross)
    ripple(cv, 540, 840, v, .15, 260, 420); ripple(cv, 540, 840, v, 1.2, 260, 420)

    # S1/S2 pills
    pill(cv, 540, 1215, 'Wozu noch?', win(v, 5.0, 6.65), 'up', sc=ob((v - 5.0) / .45), hl=True)
    ts = wt2('Schadstoff'); pill(cv, 540, 486, 'Schadstoffgruppe 4', win(v, ts, 13.2), 'down', sc=ob((v - ts) / .45))
    tf = wt2('Fahrzeug'); pill(cv, 540, 1215, 'Kennzeichen', win(v, tf, 13.2), 'up', sc=ob((v - tf) / .45))
    pill(cv, 540, 1215, 'eingeführt 2007', win(v, T2007 - .1, 9.9), 'up', sc=ob((v - T2007 + .1) / .45), hl=True)

    # S3/S4 red + yellow
    for x, c, n, t0 in [(230, REDP, '2', TROT), (540, YEL, '3', TGELB)]:
        if 13.3 < v < 24.0:
            a = eo((v - t0 + .1) / .3) * (1 - eo((v - 23.4) / .4))
            dg = eo((v - 17.6) / .7); yy = 860 + 260 * dg + 6 * math.sin(v + x)
            xx = x if x == 230 else lerp(540, 850, dg)
            uplq(cv, xx, yy, 135 * ob((v - t0 + .1) / .5) * (1 - .3 * dg), c, n, bx, by, a * (1 - .55 * dg), gray=dg > .5, cross=eo((v - 18.0) / .4))
            ripple(cv, x, 860, v, t0 - .1, 135, 230)
    a = win(v, 13.5, 17.3)
    if a > 0:
        for x, lab in [(230, 'Gruppe 2'), (540, 'Gruppe 3'), (850, 'Gruppe 4')]:
            tt = {230: TROT, 540: TGELB, 850: TGRUEN}[x]
            text(cv, lab, x, 1060, 30, '#B8BCC4', a * eo((v - tt) / .3), 'c')
    a = win(v, T100 - .1, 23.7)
    if a > 0:
        val = int(100 * eo((v - T100 + .1) / .8))
        text(cv, f'{val} €', 540, 1170, 96, RED, a, 'c'); text(cv, 'ohne grüne Plakette', 540, 1225, 32, WHITE, a, 'c')

    # S5 car grid
    a5 = win(v, 24.0, 29.35)
    if a5 > 0:
        gx, gy, cs = 279, 590, 58
        for idx in range(100):
            r, c = divmod(idx, 10); x = gx + c * cs; y = gy + r * cs
            pa = eo((v - 24.1 - (r + c) * .035) / .3); bad = idx in BAD
            good = eo((v - 25.8 - REDRANK[idx] * .012) / .3)
            cc = '#3A3E47'
            car(cv, x, y, cc, a5 * pa, .95 * ob((v - 24.1 - (r + c) * .035) / .45))
            if bad: car(cv, x, y, RED, a5 * pa * eo((v - 26.0) / .4), .95)
            else:
                car(cv, x, y, '#C9CDD4', a5 * good, .95); cv.drawCircle(x + 9, y - 11, 4, P(GREEN, a5 * good))
        pill(cv, 540, 1215, 'über 90 % erfüllen Grün', a5 * eo((v - 26.4) / .3), 'up', sc=ob((v - 26.4) / .45))

    # S6 map
    a6 = win(v, 29.35, 36.95)
    draw_map(cv, v, a6)
    if a6 > 0 and v > T56 - .1:
        n = 56 if v < T35 - .3 else int(round(lerp(56, 35, eio((v - T35 + .3) / 1.0))))
        al = a6 * eo((v - T56 + .1) / .3)
        text(cv, str(n), 905, 780, 120, RED, al, 'c'); text(cv, 'Umwelt-', 905, 830, 30, WHITE, al, 'c'); text(cv, 'zonen', 905, 866, 30, WHITE, al, 'c')

    # S7 E plate
    a7 = win(v, 37.0, 45.45)
    eplate(cv, v, a7, eo((v - 43.5) / .3) * (.75 + .25 * math.sin(v * 6)))
    pill(cv, 540, 1215, 'seit 1. Oktober 2026', win(v, T2026 - .2, 45.4), 'up', sc=ob((v - T2026 + .2) / .45), hl=True)
    if 43 < v < 45.5: ripple(cv, 760, 870, v, 43.5, 60, 220)

    cv.restore()

    HL = [(0.0, 6.6, [[('Über 90 %', 1)], [('erfüllen die Vorgabe', 0)]]),
          (6.7, 13.25, [[('Seit ', 0), ('2007', 1)], [('an der Scheibe', 0)]]),
          (13.35, 17.25, [[('Anfangs ', 0), ('drei', 1)], [('Farben', 0)]]),
          (17.35, 23.75, [[('Heute zählt', 0)], [('nur Grün', 1)]]),
          (23.85, 29.35, [[('Kaum noch', 0)], [('Wirkung', 1)]]),
          (29.45, 36.95, [[('Weniger', 0)], [('Umweltzonen', 1)]]),
          (37.0, 45.45, [[('E-Kennzeichen', 1)], [('statt Plakette', 0)]]),
          (45.55, VO, [[('Noch da, aber', 0)], [('immer unwichtiger', 1)]])]
    for a, b, ln in HL:
        if a - .1 < v < b + .4: headline(cv, v, a, b, ln)
    for a, b, s in [(6.7, 23.7, 'Quelle: 35. BImSchV, Bußgeldkatalog'), (23.9, 29.3, 'Quelle: Umweltbundesamt'),
                    (29.45, 36.9, 'Quelle: Umweltbundesamt · Karte schematisch'), (37.0, 45.4, 'Quelle: 35. BImSchV, Bundesrat 25.09.2026')]:
        source(cv, v, a, b, s)
    logo_small(cv, 1 - eo((v - VO) / .4))
    if v < VO: subtitles(cv, v)
    outro(cv, v + SHIFT)

if __name__ == '__main__':
    mode = sys.argv[1]; surf = skia.Surface(W, H); cv = surf.getCanvas()
    if mode == 'test':
        for t in [float(x) for x in sys.argv[2].split(',')]:
            frame2(cv, t); surf.makeImageSnapshot().save(f'u_{t:05.1f}.png', skia.kPNG)
    elif mode == 'video':
        n = int(DUR2 * FPS)
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'faster', '-crf', '19', '-pix_fmt', 'yuv420p', 'video2.mp4'], stdin=subprocess.PIPE)
        for i in range(n):
            frame2(cv, i / FPS); ff.stdin.write(surf.makeImageSnapshot().toarray().tobytes())
            if i % 150 == 0: print(i, n, flush=True)
        ff.stdin.close(); ff.wait(); print('done', flush=True)
    elif mode == 'cover':
        background(cv, 3)
        cv.drawCircle(540, 990, 470, P(RED, .10, blur=60))
        uplq(cv, 540, 990, 330, GREEN, '4', 0, 0, glow=.8)
        text(cv, 'Braucht man die', 540, 420, 84, WHITE, 1, 'c'); text(cv, 'grüne Plakette?', 540, 520, 100, RED, 1, 'c')
        tracked(cv, 'function.', 540, 1600, 96, RED, 1, -.03)
        surf.makeImageSnapshot().save('/mnt/user-data/outputs/umweltplakette_cover.png', skia.kPNG)
    elif mode == 'events':
        json.dump({'dur': DUR2, 'OFF': OFF2, 'acc': ACC, 'T2007': T2007, 'T2026': T2026, 'T100': T100, 'T56': T56, 'T35': T35,
                   'pops': [5.0, wt2('Schadstoff'), wt2('Fahrzeug'), TROT, TGELB, TGRUEN, 26.4, 41.4, 43.5, 47.8],
                   'whoosh': [6.7, 13.3, 17.35, 23.85, 29.45, 37.0, 45.5, VO], 'VO': VO}, open('events2.json', 'w'))
