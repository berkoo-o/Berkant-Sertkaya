import render2 as R2
from render2 import *
import render

random.seed(21)
VO = R2.VO
# ---------------------------------------------------------------- particles / atmosphere
DUST = [(random.random() * W, random.random() * H, random.uniform(.8, 2.4), random.uniform(6, 30), random.random(), random.uniform(.3, 1)) for _ in range(140)]
BOKEH = [(random.random() * W, random.uniform(300, 1500), random.uniform(18, 60), random.uniform(.15, .5), random.random()) for _ in range(22)]
EMBER = [(random.random() * W, random.random(), random.uniform(40, 110), random.uniform(1.5, 3.5), random.random()) for _ in range(34)]
WHOOSH = [6.7, 13.3, 17.35, 23.85, 29.45, 37.0, 45.5, VO]

def atmosphere(cv, v):
    cv.clear(col('#0A0B0E'))
    sh = skia.GradientShader.MakeRadial(skia.Point(540 + 60 * math.sin(v * .2), 820), 1150, [col('#17191F'), col('#0A0B0E')], [0, 1])
    p = skia.Paint(); p.setShader(sh); cv.drawRect(skia.Rect.MakeWH(W, H), p)
    # drifting red light blobs
    for i, (bx, by, r) in enumerate([(200, 600, 420), (900, 1100, 480), (600, 300, 360)]):
        x = bx + 120 * math.sin(v * .13 + i * 2); y = by + 90 * math.cos(v * .11 + i)
        g = skia.GradientShader.MakeRadial(skia.Point(x, y), r, [col(RED, .07), col(RED, 0)], [0, 1])
        p = skia.Paint(); p.setShader(g); cv.drawCircle(x, y, r, p)
    # perspective floor grid
    hz = 980; vp = 540
    for k in range(-9, 10):
        xb = vp + k * 260
        cv.drawLine(vp + k * 26, hz, xb, 1700, P('#C9CDD4', .035, stroke=1.5))
    for j in range(14):
        z = ((j - (v * .6) % 1)) ; d = 1 / (1 + z * .35) if z > -1 else 0
        y = hz + 700 * (1 - d) ** 1.6 * 1.0
        y = hz + (1700 - hz) * ((j + (v * .6) % 1) / 14) ** 2
        a = .05 * cl((y - hz) / 200)
        cv.drawLine(0, y, W, y, P('#C9CDD4', a, stroke=1.5))
    # bokeh
    for x, y, r, sp, ph in BOKEH:
        xx = (x + v * 14 * sp) % (W + 200) - 100; yy = y + 30 * math.sin(v * sp + ph * 6)
        cv.drawCircle(xx, yy, r, P('#9AA0AA', .035 + .025 * math.sin(v * .7 + ph * 5), blur=r * .45))
    # dust (depth parallax)
    for x, y, r, sp, ph, dp in DUST:
        yy = (y - v * sp) % H; xx = (x + 18 * math.sin(v * .35 + ph * 6) + v * 6 * dp) % W
        cv.drawCircle(xx, yy, r * dp, P('#B8BEC8', (.12 + .1 * math.sin(v * 1.3 + ph * 9)) * dp))
    # rising embers
    for x, y0, sp, r, ph in EMBER:
        yy = H - ((y0 * H + v * sp) % (H + 200)); xx = x + 25 * math.sin(v * .8 + ph * 7)
        a = .35 * (.5 + .5 * math.sin(v * 2 + ph * 11))
        cv.drawCircle(xx, yy, r * 2.6, P(RED, a * .35, blur=r * 2)); cv.drawCircle(xx, yy, r * .7, P('#FF7A82', a))

def streaks(cv, v):
    for i, w0 in enumerate(WHOOSH):
        p = (v - w0 + .25) / .55
        if 0 < p < 1:
            for k, (yy, ln, sp) in enumerate([(700, 420, 1), (980, 300, 1.25), (1180, 220, .85)]):
                x = lerp(-500, 1500, eio(cl(p * sp))); y = yy + 40 * math.sin(i * 3 + k)
                g = skia.GradientShader.MakeLinear([skia.Point(x - ln, y), skia.Point(x, y)], [col(RED, 0), col('#FF8A90', .9 * (1 - p))], [0, 1])
                pp = skia.Paint(AntiAlias=True, StrokeWidth=3, Style=skia.Paint.kStroke_Style); pp.setShader(g)
                cv.drawLine(x - ln, y, x, y, pp); cv.drawCircle(x, y, 5, P(WHITE, .8 * (1 - p), blur=3))

def burst(cv, x, y, v, v0, n=16, spread=170, c=RED, seed=0, dur=.9):
    p = (v - v0) / dur
    if not 0 < p < 1: return
    rnd = random.Random(seed * 997 + int(v0 * 100))
    for i in range(n):
        an = rnd.uniform(0, 2 * math.pi); sp = rnd.uniform(.5, 1) * spread; r = rnd.uniform(2, 4.5)
        d = sp * eo(p); xx = x + math.cos(an) * d; yy = y + math.sin(an) * d + 60 * p * p
        a = (1 - p) ** 1.3
        cv.drawCircle(xx, yy, r * 2.4, P(c, .3 * a, blur=4)); cv.drawCircle(xx, yy, r * (1 - .5 * p), P('#FFD0D4' if c == RED else c, a))

def roll(cv, s, x, y, sz, prog, c=RED, a=1, align='c'):
    f = F(sz); ws = [f.measureText(ch if not ch.isdigit() else '0') for ch in s]; tot = sum(ws)
    xx = x - tot / 2 if align == 'c' else x; lh = sz * 1.05; digs = [i for i, ch in enumerate(s) if ch.isdigit()]
    for i, (ch, w) in enumerate(zip(s, ws)):
        if ch.isdigit():
            k = digs.index(i); pr = eio(cl(prog * 1.25 - k * .08))
            val = int(ch) + 10 * (len(digs) - k - 1) * 0 ; cur = int(ch) * pr + (1 - pr) * 0
            spin = (1 - pr) * 10 * (k + 1); fv = cur + spin; d0 = int(math.floor(fv)) % 10; fr = fv - math.floor(fv)
            cv.save(); cv.clipRect(skia.Rect.MakeLTRB(xx - 4, y - sz * .9, xx + w + 4, y + sz * .2))
            cv.drawString(str(d0), xx, y - fr * lh * -1 + 0 - fr * lh * 0, f, P(c, a * (1 - fr)))
            cv.drawString(str((d0 + 1) % 10), xx, y + (1 - fr) * lh * -1 + lh * 0 + 0, f, P(c, a * fr)) if False else None
            cv.restore()
            cv.save(); cv.clipRect(skia.Rect.MakeLTRB(xx - 4, y - sz * .9, xx + w + 4, y + sz * .2))
            cv.restore()
        else:
            cv.drawString(ch, xx, y, f, P(c, a))
        xx += w
    return tot

def roll2(cv, s, x, y, sz, prog, c=RED, a=1, align='c'):
    """odometer: every digit spins and settles, staggered left to right"""
    f = F(sz); ws = [f.measureText('0') if ch.isdigit() else f.measureText(ch) for ch in s]; tot = sum(ws)
    xx = x - tot / 2 if align == 'c' else x; lh = sz * .95; digs = [i for i, ch in enumerate(s) if ch.isdigit()]
    for i, (ch, w) in enumerate(zip(s, ws)):
        if ch.isdigit():
            k = digs.index(i); pr = eo(cl(prog * 1.3 - k * .1))
            fv = int(ch) + (1 - pr) * (8 + 3 * k); d0 = int(math.floor(fv)) % 10; fr = fv - math.floor(fv)
            cv.save(); cv.clipRect(skia.Rect.MakeLTRB(xx - 6, y - sz * .82, xx + w + 6, y + sz * .14))
            cv.drawString(str(d0), xx, y + fr * lh, f, P(c, a))
            cv.drawString(str((d0 + 1) % 10), xx, y + fr * lh - lh, f, P(c, a))
            cv.restore()
        else: cv.drawString(ch, xx, y, f, P(c, a))
        xx += w
    return tot

def headline3(cv, v, a, b, lines, base=300):
    k = 0
    for i, segs in enumerate(lines):
        sz = 78; f = F(sz); tot = sum(f.measureText(s) for s, _ in segs)
        if tot > 920: sz = 78 * 920 / tot; f = F(sz)
        x = 80; y0 = base + i * 88
        for s, red in segs:
            for wd in s.split(' '):
                if wd == '':
                    x += f.measureText(' '); continue
                p = (v - a - k * .07) / .45; al = eo(p) * eo((b - v) / .3); k += 1
                ww = f.measureText(wd)
                if al > 0:
                    yy = y0 + 34 * (1 - eo(p)) - 20 * eo((v - b + .3) / .3)
                    cv.save(); cv.clipRect(skia.Rect.MakeLTRB(x - 6, y0 - sz * .95, x + ww + 8, y0 + sz * .3))
                    cv.drawString(wd, x, yy, f, P(RED if red else WHITE, al)); cv.restore()
                    if red:
                        up = eio((v - a - k * .07 - .25) / .5) * eo((b - v) / .3)
                        if up > 0: cv.drawLine(x, y0 + 16, x + ww * up, y0 + 16, P(RED, .9, stroke=5))
                x += ww + f.measureText(' ')

# ---------------------------------------------------------------- plaque without plate text + shine + flip
def uface3(cv, R, c, num, v, gray=0, sat=1.0):
    if gray: c = '#555960'
    if sat < 1:
        r, g, b = rgb(c); m = (r + g + b) / 3; c = '#%02X%02X%02X' % tuple(int(lerp(m, q, sat)) for q in (r, g, b))
    sh = skia.GradientShader.MakeRadial(skia.Point(-R * .35, -R * .45), R * 1.7, [col(shade(c, 1.22)), col(c), col(shade(c, .76))], [0, .5, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(sh); cv.drawCircle(0, 0, R, p)
    cv.drawCircle(0, 0, R * .985, P('#000000', .3, stroke=max(1, R * .014)))
    cv.drawCircle(0, 0, R * .88, P('#000000', .22, stroke=max(1, R * .008)))
    # fine ring text dots (detail)
    for k in range(48):
        an = k * 7.5; cv.save(); cv.rotate(an); cv.drawCircle(0, -R * .935, R * .008, P('#000000', .35)); cv.restore()
    if num:
        f = F(R * .72); w = f.measureText(num); cv.drawString(num, -w / 2, R * .02, f, P('#101010'))
        rr = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-R * .74, R * .13, R * .74, R * .5), R * .05, R * .05)
        cv.drawRRect(rr, P('#F4F3EF')); cv.drawRRect(rr, P('#000000', .35, stroke=max(1, R * .01)))
    gl = skia.GradientShader.MakeLinear([skia.Point(-R, -R), skia.Point(R, R)], [col(WHITE, .22), col(WHITE, 0), col(WHITE, 0)], [0, .45, 1])
    p2 = skia.Paint(AntiAlias=True); p2.setShader(gl); cv.drawCircle(0, 0, R, p2)
    # moving shine sweep
    ph = (v * .45) % 1.6 - .3
    if 0 < ph < 1:
        cx = lerp(-1.6 * R, 1.6 * R, ph)
        g = skia.GradientShader.MakeLinear([skia.Point(cx - R * .35, -R), skia.Point(cx + R * .35, R)], [col(WHITE, 0), col(WHITE, .32), col(WHITE, 0)], [0, .5, 1])
        p3 = skia.Paint(AntiAlias=True); p3.setShader(g)
        cv.save(); cv.clipPath(skia.Path.Circle(0, 0, R), doAntiAlias=True); cv.drawRect(skia.Rect.MakeLTRB(-R, -R, R, R), p3); cv.restore()

def plq(cv, cx, cy, R, c, num, v, rx=0, ry=0, a=1, glow=0, gray=0, cross=0, sat=1.0, shadow=True):
    if a <= .01 or R < 2: return
    lay = a < .995
    if lay: cv.saveLayerAlpha(None, int(a * 255))
    if shadow: cv.drawOval(skia.Rect.MakeXYWH(cx - R * .9, cy + R * 1.0, R * 1.8, R * .35), P('#000000', .35, blur=R * .12))
    back = math.cos(math.radians(ry)) * math.cos(math.radians(rx)) < 0
    for i in range(6, 0, -1):
        cv.save(); cv.concat(pmat(R, R, R * .08 * i / 6 * (-1 if back else 1), cx, cy, rx, ry)); cv.drawCircle(0, 0, R, P(shade('#555960' if gray else c, .4))); cv.restore()
    cv.save(); cv.concat(pmat(R, R, 0, cx, cy, rx, ry))
    if back:
        bsh = skia.GradientShader.MakeRadial(skia.Point(R * .3, -R * .4), R * 1.7, [col(shade(c, 1.1)), col(shade(c, .85)), col(shade(c, .62))], [0, .5, 1])
        bp = skia.Paint(AntiAlias=True); bp.setShader(bsh); cv.drawCircle(0, 0, R, bp)
        cv.drawCircle(0, 0, R * .985, P('#000000', .3, stroke=R * .014)); cv.drawCircle(0, 0, R * .88, P('#000000', .2, stroke=R * .008))
    else:
        if glow > 0: cv.drawCircle(0, 0, R * 1.06, P(RED, .7 * glow, stroke=R * .06, blur=R * .08))
        uface3(cv, R, c, num, v, gray, sat)
        if cross > 0:
            L = R * .75
            cv.drawLine(-L, -L, -L + 2 * L * cl(cross * 2), -L + 2 * L * cl(cross * 2), P(RED, 1, stroke=R * .1))
            if cross > .5: cv.drawLine(L, -L, L - 2 * L * cl(cross * 2 - 1), -L + 2 * L * cl(cross * 2 - 1), P(RED, 1, stroke=R * .1))
    cv.restore()
    if lay: cv.restore()

def shatter(cv, cx, cy, R, c, v, v0, seed):
    p = v - v0
    if p < 0 or p > 1.4: return
    rnd = random.Random(seed)
    for i in range(14):
        a0 = i * 360 / 14; a1 = a0 + 360 / 14; mid = math.radians((a0 + a1) / 2)
        vx = math.sin(mid) * rnd.uniform(120, 300); vy = -math.cos(mid) * rnd.uniform(120, 260) - 120
        x = cx + vx * p; y = cy + vy * p + 900 * p * p; rot = rnd.uniform(-400, 400) * p
        al = cl(1 - p / 1.3)
        cv.save(); cv.translate(x, y); cv.rotate(rot)
        pth = skia.Path(); pth.moveTo(0, 0); pth.arcTo(skia.Rect.MakeLTRB(-R, -R, R, R), a0 - 90, a1 - a0, False); pth.close()
        cv.drawPath(pth, P(c, al)); cv.drawPath(pth, P(shade(c, .5), al, stroke=2))
        cv.restore()
    burst(cv, cx, cy, v, v0, 22, 260, c, seed)

# ---------------------------------------------------------------- side-view car with smoke
def side_car(cv, x, y, s, v, a=1, wheel=0):
    cv.save(); cv.translate(x, y); cv.scale(s, s)
    cv.drawOval(skia.Rect.MakeLTRB(-230, -12, 230, 16), P('#000000', .5 * a, blur=10))
    body = skia.Path(); body.moveTo(-212, -32); body.lineTo(-206, -86); body.lineTo(-150, -98); body.lineTo(-92, -152)
    body.lineTo(58, -152); body.lineTo(122, -98); body.lineTo(198, -88); body.lineTo(212, -50); body.lineTo(208, -24); body.lineTo(-208, -24); body.close()
    g = skia.GradientShader.MakeLinear([skia.Point(0, -152), skia.Point(0, -24)], [col('#4A4F5A', a), col('#2A2D35', a), col('#1C1E24', a)], [0, .45, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(g); cv.drawPath(body, p); cv.drawPath(body, P('#5A606C', a, stroke=2.5))
    for poly in [[(-84, -142), (-16, -142), (-16, -102), (-128, -102)], [(-2, -142), (52, -142), (104, -102), (-2, -102)]]:
        w = skia.Path(); w.moveTo(*poly[0]); [w.lineTo(*q) for q in poly[1:]]; w.close()
        cv.drawPath(w, P('#14161A', a)); cv.drawPath(w, P('#6B7280', .5 * a, stroke=2))
    cv.drawLine(-200, -60, 200, -60, P('#5A606C', .5 * a, stroke=2))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(186, -76, 210, -62), 4, 4), P(AMBER, .9 * a))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-212, -78, -196, -60), 4, 4), P(RED, .9 * a))
    for wx in (-128, 128):
        cv.drawCircle(wx, -24, 36, P('#0E0F12', a)); cv.drawCircle(wx, -24, 22, P('#3A3E47', a))
        for k in range(5):
            cv.save(); cv.translate(wx, -24); cv.rotate(wheel + k * 72); cv.drawLine(0, 0, 0, -20, P('#8A8E97', a, stroke=4)); cv.restore()
        cv.drawCircle(wx, -24, 6, P('#C9CDD4', a))
    cv.restore()

def smoke(cv, v, t0, t1, getpos, rate=.09, seed=1):
    rnd = random.Random(seed)
    k = 0; t = t0
    while t < min(v, t1):
        age = v - t
        if age < 1.8:
            ex, ey = getpos(t); dx = -80 * age - rnd.uniform(0, 40) * age; dy = -30 * age - rnd.uniform(0, 30) * age
            r = 8 + 40 * eo(age / 1.8); a = .32 * (1 - age / 1.8)
            cv.drawCircle(ex + dx, ey + dy, r, P('#8A8E97', a, blur=r * .35))
        else: rnd.uniform(0, 1); rnd.uniform(0, 1)
        t += rate; k += 1

def rear_car(cv, x, y, s, a=1, brake=0):
    cv.save(); cv.translate(x, y); cv.scale(s, s)
    cv.drawOval(skia.Rect.MakeLTRB(-70, -8, 70, 10), P('#000000', .55 * a, blur=8))
    for wx in (-48, 48): cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(wx - 11, -16, wx + 11, 4), 4, 4), P('#0E0F12', a))
    cab = skia.Path(); cab.moveTo(-46, -56); cab.lineTo(46, -56); cab.lineTo(35, -92); cab.lineTo(-35, -92); cab.close()
    cv.drawPath(cab, P('#5E636E', a))
    win = skia.Path(); win.moveTo(-38, -60); win.lineTo(38, -60); win.lineTo(30, -86); win.lineTo(-30, -86); win.close()
    cv.drawPath(win, P('#16181D', a)); cv.drawLine(-20, -64, -6, -84, P(WHITE, .12 * a, stroke=5))
    g = skia.GradientShader.MakeLinear([skia.Point(0, -60), skia.Point(0, -8)], [col('#9A9FA9', a), col('#5E636E', a)], [0, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(g)
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-62, -60, 62, -10), 14, 14), p)
    for lx in (-50, 50):
        r = skia.Rect.MakeLTRB(lx - 10, -48, lx + 10, -38)
        if brake > 0: cv.drawRect(skia.Rect.MakeLTRB(lx - 18, -54, lx + 18, -32), P(RED, .6 * brake * a, blur=10))
        cv.drawRRect(skia.RRect.MakeRectXY(r, 3, 3), P(RED if brake > .3 else '#A8141E', a))
    cv.drawRect(skia.Rect.MakeLTRB(-18, -32, 18, -22), P('#E4E3DF', a))
    cv.restore()

# ---------------------------------------------------------------- Umweltzone sign
def zone_sign(cv, x, y, s, a):
    if a <= .01: return
    cv.save(); cv.translate(x, y); cv.scale(s, s)
    cv.drawRect(skia.Rect.MakeLTRB(-8, 0, 8, 380), P('#6B7280', a))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-118, -300, 118, 10), 14, 14), P('#000000', .4 * a, blur=12))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-115, -300, 115, 0), 14, 14), P('#F4F3EF', a))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-107, -292, 107, -8), 10, 10), P('#111111', a, stroke=3))
    cv.drawCircle(0, -185, 78, P(RED, a, stroke=18))
    text(cv, 'Umwelt', 0, -175, 34, '#111111', a, 'c')
    text(cv, 'ZONE', 0, -40, 58, '#111111', a, 'c')
    cv.restore()

# ---------------------------------------------------------------- gauge
def gauge(cv, cx, cy, Rg, val, a):
    if a <= .01: return
    pth = skia.Path(); pth.addArc(skia.Rect.MakeLTRB(cx - Rg, cy - Rg, cx + Rg, cy + Rg), 180, 180)
    cv.drawPath(pth, P('#2A2D35', a, stroke=30, cap=False))
    p2 = skia.Path(); p2.addArc(skia.Rect.MakeLTRB(cx - Rg, cy - Rg, cx + Rg, cy + Rg), 180, 180 * val)
    cv.drawPath(p2, P(RED, .45 * a, stroke=40, blur=10)); cv.drawPath(p2, P(RED, a, stroke=30, cap=False))
    for k in range(21):
        an = math.radians(180 + k * 9); r0 = Rg - 30 if k % 5 else Rg - 44
        cv.drawLine(cx + math.cos(an) * (Rg - 22), cy + math.sin(an) * (Rg - 22), cx + math.cos(an) * r0, cy + math.sin(an) * r0, P('#C9CDD4', .6 * a, stroke=3 if k % 5 == 0 else 2))
    an = math.radians(180 + 180 * val); L = Rg - 50
    cv.drawLine(cx, cy, cx + math.cos(an) * L, cy + math.sin(an) * L, P(WHITE, a, stroke=7))
    cv.drawCircle(cx, cy, 16, P(WHITE, a)); cv.drawCircle(cx, cy, 7, P(RED, a))
    text(cv, 'hoch', cx + Rg - 10, cy + 44, 26, '#8A8E97', a, 'c'); text(cv, 'niedrig', cx - Rg + 14, cy + 44, 26, '#8A8E97', a, 'c')
    text(cv, 'Wirkung', cx, cy + 62, 34, WHITE, a, 'c')

# ---------------------------------------------------------------- E plate
def eplate3(cv, v, a, ehl, scan):
    if a <= .01: return
    p = eo((v - 37.0) / 1.0); cx = lerp(1300, 560, p) + 5 * math.sin(v * .8); cy = 1010 + 8 * math.sin(v * .7)
    s = .9; rx = lerp(30, 12, p) + 3 * math.sin(v * .9); ry = lerp(-70, -12, p) + 4 * math.sin(v * .6); hw, hh = 440, 105
    for i in range(4, 0, -1):
        cv.save(); cv.concat(pmat(hw, hh, 6 * i, cx, cy, rx, ry, s)); cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw, -hh, hw, hh), 16, 16), P('#5B5C60', a)); cv.restore()
    cv.save(); cv.concat(pmat(hw, hh, 0, cx, cy, rx, ry, s))
    rr = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw, -hh, hw, hh), 16, 16)
    cv.drawRRect(rr, P('#E4E3DF', a)); cv.drawRRect(rr, P('#1A1A1A', a, stroke=7, cap=False))
    cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-hw + 10, -hh + 10, -hw + 86, hh - 10), 8, 8), P('#1F3C96', a))
    for k in range(12):
        an = k * math.pi / 6; cv.drawCircle(-hw + 48 + 22 * math.sin(an), -38 - 22 * math.cos(an), 3.2, P(AMBER, a))
    text(cv, 'D', -hw + 48, 72, 52, WHITE, a, 'c')
    text(cv, 'B', -300, 58, 150, '#141414', a, 'c')
    cv.save(); cv.translate(-170, -36); render.face(cv, 58, COLS['blau'], '26', 90); cv.restore()
    cv.drawCircle(-170, 62, 30, P('#B9B8B4', a))
    x = -95; f = F(132)
    for ch in 'FN 101':
        cv.drawString(ch, x, 58, f, P('#141414', a)); x += f.measureText(ch)
    w = f.measureText('E')
    if ehl > 0:
        r = skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(x - 8, -84, x + w + 8, 78), 14, 14)
        cv.drawRRect(r, P(RED, .55 * ehl, blur=16)); cv.drawRRect(r, P(RED, ehl * a, stroke=6))
    cv.drawString('E', x, 58, f, P(RED if ehl > .5 else '#141414', a))
    if 0 < scan < 1:
        sx = lerp(-hw - 100, hw + 100, scan)
        g = skia.GradientShader.MakeLinear([skia.Point(sx - 90, 0), skia.Point(sx + 90, 0)], [col(WHITE, 0), col(WHITE, .55), col(WHITE, 0)], [0, .5, 1])
        pp = skia.Paint(AntiAlias=True); pp.setShader(g); cv.save(); cv.clipRRect(rr, True); cv.drawRect(skia.Rect.MakeLTRB(-hw, -hh, hw, hh), pp); cv.restore()
    cv.restore()
    return cx, cy

def windshield(cv, v, a):
    if a <= .01: return
    dy = 30 * (1 - eo((v - 37.0) / .8))
    pth = skia.Path(); pth.moveTo(250, 520 + dy); pth.lineTo(830, 520 + dy); pth.lineTo(930, 790 + dy); pth.lineTo(150, 790 + dy); pth.close()
    g = skia.GradientShader.MakeLinear([skia.Point(0, 520), skia.Point(0, 790)], [col('#2A3038', a), col('#15181D', a)], [0, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(g); cv.drawPath(pth, p); cv.drawPath(pth, P('#4A4F5A', a, stroke=10, cap=False))
    for k in range(2):
        sx = 300 + ((v * 120 + k * 300) % 700)
        cv.save(); cv.clipPath(pth, doAntiAlias=True)
        cv.drawLine(sx, 520, sx - 140, 800, P(WHITE, .07 * a, stroke=40)); cv.restore()
    text(cv, 'Windschutzscheibe', 540, 850 + dy, 26, '#7D818A', a, 'c')

# ---------------------------------------------------------------- new outro: plaque becomes the dot of the logo
LOGO_SZ = 170; LOGO_Y = 1000
_lf = F(LOGO_SZ, True); _chars = 'function.'; _ws = [_lf.measureText(ch) for ch in _chars]
_tot = sum(_ws) + (-.03 * LOGO_SZ) * (len(_chars) - 1); LX = []; _x = 540 - _tot / 2
for w in _ws: LX.append(_x); _x += w - .03 * LOGO_SZ
def _dot_geom():
    sf = skia.Surface(W, 300); c = sf.getCanvas(); c.clear(0)
    c.drawString('.', LX[-1], 220, _lf, P(WHITE)); a = sf.makeImageSnapshot().toarray()[:, :, 3]
    ys, xs = np.nonzero(a > 128); return (xs.min() + xs.max()) / 2, LOGO_Y - 220 + (ys.min() + ys.max()) / 2, (xs.max() - xs.min()) / 2
DOTX, DOTY, DOTR = _dot_geom()
def mixc(a, b, p):
    ra, ga, ba = rgb(a); rb, gb, bb = rgb(b); return '#%02X%02X%02X' % tuple(int(lerp(x, y, p)) for x, y in zip((ra, ga, ba), (rb, gb, bb)))

def outro3(cv, v):
    if v < VO: return
    o = v - VO
    # phase 1: plaque spins, shrinks, turns red, flies to the dot position
    p = eio(o / .75); land = o > .75
    if not land:
        cx = lerp(540, DOTX, p); cy = lerp(840, DOTY, p) - 160 * math.sin(p * math.pi)
        R = lerp(250, DOTR * 1.05, p ** .8); c = mixc(GREEN, RED, cl(p * 1.6))
        plq(cv, cx, cy, R, c, '4' if p < .4 else '', v, 10 * (1 - p), 720 * p, lerp(.82, 1, p), sat=lerp(.25, 1, cl(p * 2)), shadow=False)
        for k in range(10):
            q = p - k * .025
            if q > 0:
                tx = lerp(540, DOTX, q); ty = lerp(840, DOTY, q) - 160 * math.sin(q * math.pi)
                cv.drawCircle(tx, ty, max(2, 9 - k * .7), P(RED, .5 * (1 - k / 10) * (1 - p * .3), blur=4))
    else:
        sq = 1 + .35 * math.exp(-(o - .75) * 9) * math.cos((o - .75) * 30)
        cv.save(); cv.translate(DOTX, DOTY + DOTR); cv.scale(1 / sq ** .5, sq ** .5 if False else 1 / sq); cv.scale(1, 1); cv.restore()
        rx_ = DOTR * (2 - sq) ** .5 if sq < 2 else DOTR; ry_ = DOTR * sq ** -.0
        sxs = 1 + .3 * math.exp(-(o - .75) * 8) * math.sin((o - .75) * 28)
        cv.drawOval(skia.Rect.MakeLTRB(DOTX - DOTR * sxs, DOTY - DOTR / sxs, DOTX + DOTR * sxs, DOTY + DOTR / sxs), P(RED))
        cv.drawCircle(DOTX, DOTY, DOTR * 2.2, P(RED, .35 * math.exp(-(o - .75) * 2.5), blur=10))
    ripple(cv, DOTX, DOTY, v, VO + .78, DOTR, 300); ripple(cv, DOTX, DOTY, v, VO + .95, DOTR, 520)
    burst(cv, DOTX, DOTY, v, VO + .78, 26, 240, seed=31)
    # phase 2: the word slides out from behind the dot, letters settle with a small stagger
    q = eo((v - VO - .95) / 1.0)
    if q > 0:
        off = (DOTX - DOTR - LX[0]) * (1 - q)
        cv.save(); cv.clipRect(skia.Rect.MakeLTRB(0, 0, DOTX - DOTR * .7, H))
        for i in range(len(_chars) - 1):
            qi = eo((v - VO - 1.0 - (len(_chars) - 2 - i) * .06) / .5)
            cv.drawString(_chars[i], LX[i] + off, LOGO_Y + 16 * (1 - qi), _lf, P(RED, cl(.3 + qi)))
        cv.restore()
    # underline sweeping out and back
    u1 = eio((v - VO - 1.0) / .9); u2 = eio((v - VO - 2.1) / .7)
    if u1 > 0 and u2 < 1:
        xa = lerp(DOTX, LX[0], u1); xb = lerp(DOTX, LX[0], u2)
        cv.drawLine(min(xa, xb), LOGO_Y + 42, max(xa, xb) if u2 > 0 else DOTX, LOGO_Y + 42, P(RED, .9, stroke=5))
        glowtip(cv, xa if u2 == 0 else xb, LOGO_Y + 42, .8)
    # gentle hold glow
    if o > 2.2:
        g = .5 + .5 * math.sin((o - 2.2) * 3)
        cv.drawCircle(DOTX, DOTY, DOTR * 2.6, P(RED, .18 * g, blur=12))

# ---------------------------------------------------------------- frame
CITY_SEED = [random.random() for _ in CITIES]
def frame3(cv, t):
    v = t - OFF2
    atmosphere(cv, v)
    # scene push-in
    sc_start = max([0] + [w for w in WHOOSH if w <= v]); push = 1 + .045 * eo((v - sc_start) / 6)
    acc = 1 + sum(.03 * math.exp(-(v - x) * 5) * cl((v - x) / .06) for x in ACC if v > x)
    cv.save(); cv.translate(540, 860); cv.scale(push * acc, push * acc); cv.rotate(.4 * math.sin(v * .3)); cv.translate(-540, -860)
    bx, by = breath(v)

    # ===== S1 hook: plaque flies in, orbiting cars
    a1 = 1 - eo((v - 6.5) / .5)
    if v < 7.1:
        p = eo((v - 0.0) / 1.2); spin = (1 - eo((v) / 1.6)) * 540
        Rr = lerp(60, 250, p); cy = 820
        # orbit ring behind
        for front in (False, True):
            for i in range(26):
                an = v * .5 + i * 2 * math.pi / 26; z = math.sin(an)
                if (z > 0) != front: continue
                ox = 540 + math.cos(an) * 400 * eo((v - .3) / 1.2); oy = cy + 30 + z * 120 * eo((v - .3) / 1.2)
                s = .9 + .45 * (z + 1) / 2; bad = i % 11 == 4
                al = a1 * eo((v - .3 - i * .03) / .4) * (.45 + .55 * (z + 1) / 2)
                car(cv, ox, oy, RED if bad else '#C9CDD4', al, s * 1.2)
                if not bad: cv.drawCircle(ox + 10 * s, oy - 13 * s, 4.5 * s, P(GREEN, al))
            if not front:
                plq(cv, 540, cy + 8 * math.sin(v * 1.3), Rr, GREEN, '4', v, bx + 8 * math.sin(v * 2) * cl(v - 4.9), by + spin, a1, glow=.5 + .5 * math.sin(v * 4))
        burst(cv, 540, cy, v, 1.0, 26, 320, seed=1); ripple(cv, 540, cy, v, 1.0, 250, 460); ripple(cv, 540, cy, v, 2.4, 250, 460)
        pill(cv, 540, 1215, 'Wozu noch?', win(v, 5.0, 6.65), 'up', sc=ob((v - 5.0) / .45), hl=True)

    # ===== S2 car drives in, smoke, plaque sticks
    if 6.4 < v < 13.8:
        a2 = eo((v - 6.6) / .4) * (1 - eo((v - 13.2) / .4))
        carx = lerp(-400, 540, eo((v - 6.7) / 2.2)) + lerp(0, 900, eio((v - 13.0) / .8))
        cary = 1080; bob = 2 * math.sin(v * 18) * cl(1 - (v - 8.9))
        wheel = -(carx * 1.6)
        smoke(cv, v, 6.7, 13.6, lambda tt: (lerp(-400, 540, eo((tt - 6.7) / 2.2)) - 212 * 1.15, cary - 28 * 1.15), .08, 3)
        side_car(cv, carx, cary + bob, 1.15, v, a2, wheel)
        tf = wt2('Fahrzeug')
        # plaque: from top area onto windscreen
        q = eio((v - tf + .3) / .8)
        px = lerp(780, carx + 50 * 1.15, q); py = lerp(640, cary - 122 * 1.15, q); pr = lerp(150, 30, q)
        plq(cv, px, py + 6 * math.sin(v * 1.2) * (1 - q), pr, GREEN, '4', v, bx * (1 - q), by * (1 - q) + 360 * (1 - eo((v - 6.7) / 1.0)), a2, glow=(1 - q) * .4, shadow=q < .5)
        if v > tf + .5: ripple(cv, px, py, v, tf + .5, 30, 120, a2); burst(cv, px, py, v, tf + .5, 14, 110, seed=2)
        ts = wt2('Schadstoff')
        pill(cv, 680, 470, 'Schadstoffgruppe 4', win(v, ts, tf + .2), 'down', sc=ob((v - ts) / .45))
        tt7 = T2007
        al = win(v, tt7 - .1, 13.2)
        if al > 0:
            roll2(cv, '2007', 300, 700, 150, cl((v - tt7 + .1) / 1.0), RED, al)
            text(cv, 'eingeführt', 300, 760, 32, WHITE, al, 'c')
            burst(cv, 300, 640, v, tt7 + .5, 16, 180, seed=5)
        pill(cv, 540, 1215, 'Schadstoffausstoß', win(v, ts + .1, 13.2), 'up', sc=ob((v - ts - .1) / .45))

    # ===== S3 three colours: card flips + emission bars
    if 13.2 < v < 19.6:
        for i, (x, c, n, t0, em) in enumerate([(230, REDP, '2', TROT, 1.0), (540, YEL, '3', TGELB, .65), (850, GREEN, '4', TGRUEN, .3)]):
            fl = eo((v - t0 + .15) / .7); ryf = (1 - fl) * 180
            a = eo((v - t0 + .15) / .2)
            if x == 850:
                a *= 1
            if v > 17.5 and x != 850:
                shatter(cv, x, 840, 120, c, v, 17.7 + i * .15, 40 + i)
                if v > 17.7 + i * .15: continue
            if v > 17.5 and x == 850: continue
            plq(cv, x, 840 + 6 * math.sin(v + i), 120 * ob((v - t0 + .15) / .5), c, n, v, bx, by + ryf, a)
            ripple(cv, x, 840, v, t0 + .2, 120, 230); burst(cv, x, 840, v, t0 + .25, 14, 170, c if c != YEL else AMBER, seed=10 + i)
            aa = a * (1 - eo((v - 17.4) / .3))
            if aa > 0:
                text(cv, f'Gruppe {n}', x, 1040, 30, '#B8BCC4', aa, 'c')
                bh = 105 * em * eo((v - t0 - .2) / .6)
                block(cv, x - 8, 1205, 70, bh, 24, c, aa)
        al = win(v, 13.6, 17.4)
        if al > 0: text(cv, 'Schadstoffausstoß', 540, 1262, 26, '#7D818A', al, 'c')

    # ===== S4 only green: road, sign, ticket
    if 17.3 < v < 24.2:
        a4 = eo((v - 17.5) / .5) * (1 - eo((v - 23.7) / .45))
        # road
        road = skia.Path(); road.moveTo(330, 1290); road.lineTo(750, 1290); road.lineTo(585, 640); road.lineTo(495, 640); road.close()
        g = skia.GradientShader.MakeLinear([skia.Point(0, 640), skia.Point(0, 1290)], [col('#1A1C21', 0), col('#24272E', a4)], [0, 1])
        pp = skia.Paint(AntiAlias=True); pp.setShader(g); cv.drawPath(road, pp)
        for k in range(9):
            u = ((k / 9) + v * .35) % 1; y = lerp(640, 1290, u ** 1.7); w = lerp(2, 9, u ** 1.7); L = lerp(6, 60, u ** 1.7)
            cv.drawLine(540, y, 540, y + L, P('#C9CDD4', .6 * a4 * cl(u * 3), stroke=w))
        # sign rises
        zone_sign(cv, 860, 820 + 600 * (1 - ob((v - 17.6) / .8)), .85, a4)
        # green plaque moves to left top, glows
        p = eio((v - 17.4) / .9)
        plq(cv, lerp(850, 220, p), lerp(840, 650, p) + 6 * math.sin(v), lerp(120, 115, p), GREEN, '4', v, bx, by, a4 if v > 17.6 else 1, glow=win(v, TGRUEN, 19.9) * (.6 + .4 * math.sin(v * 6)))
        al = a4 * eo((v - 18.4) / .3)
        if al > 0:
            cv.drawCircle(300, 570, 26, P(GREEN, al)); cv.drawLine(288, 570, 297, 580, P(WHITE, al, stroke=6)); cv.drawLine(297, 580, 314, 560, P(WHITE, al, stroke=6))
        # car without plaque approaching, stops
        cu = eo((v - 19.9) / 2.0); cyy = lerp(1300, 900, cu); cs = lerp(2.6, 1.3, cu)
        if v > 19.9:
            cyy = lerp(1270, 905, cu); hwr = 45 + (cyy - 640) / 650 * 165; sc = .78 * hwr / 120
            rear_car(cv, 540 + hwr * .5, cyy, sc, a4, brake=eo((v - 21.4) / .3))
            if v > 21.6: burst(cv, 540 + hwr * .5, cyy - 40 * sc, v, 21.7, 10, 90, seed=7)
        # ticket
        tp = eo((v - T100 + .2) / .6)
        if tp > 0:
            ty = lerp(1300, 1130, tp); cv.save(); cv.translate(540, ty); cv.rotate(-3 + 3 * tp)
            cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-170, -78, 170, 78), 12, 12), P('#000000', .5 * a4, blur=14))
            cv.drawRRect(skia.RRect.MakeRectXY(skia.Rect.MakeLTRB(-170, -78, 170, 78), 12, 12), P('#F4F3EF', a4))
            for k in range(6): cv.drawLine(-150, 40 + k * 0, -150, 40, P('#000000', 0))
            text(cv, 'BUSSGELD', -150, -36, 24, '#7D818A', a4)
            roll2(cv, '100 €', -150, 50, 86, cl((v - T100 + .1) / .9), RED, a4, 'l')
            cv.restore()

    # ===== S5 gauge + lanes through gate
    a5 = win(v, 24.0, 29.4)
    if a5 > 0:
        val = .9 if v < 24.3 else lerp(.9, .14, eo((v - 24.3) / 1.1)) + .04 * math.sin((v - 24.3) * 14) * math.exp(-(v - 24.3) * 2.5)
        gauge(cv, 540, 770, 230, cl(val), a5 * eo((v - 24.0) / .35))
        # gate
        gx = 540
        for k in range(10):
            yy = 880 + k * 28 + (v * 60) % 28
            cv.drawLine(gx, yy, gx, yy + 14, P(RED, a5 * .9, stroke=5))
        cv.drawLine(gx, 880, gx, 1170, P(RED, a5 * .25, stroke=16, blur=10))
        for li, ly in enumerate([930, 1025, 1120]):
            for k in range(6):
                base = (v - 25.4) * (230 + 25 * li) + k * 300 + li * 110
                x = base % 1800 - 300; idx = (k * 7 + li * 3 + int(base // 1800) * 5)
                bad = idx % 10 == 3
                if bad and x > gx - 80:
                    x = gx - 80 + (x - (gx - 80)) * .05
                al = a5 * eo((v - 25.2) / .4) * cl((x + 250) / 120) * cl((1330 - x) / 120)
                if al <= 0: continue
                car(cv, x, ly, RED if bad else '#C9CDD4', al, 1.4)
                if not bad: cv.drawCircle(x + 13, ly - 18, 5.5, P(GREEN, al))
        pill(cv, 540, 1240, 'über 90 % erfüllen Grün', a5 * eo((v - 26.4) / .3), sc=ob((v - 26.4) / .45))

    # ===== S6 map with 3D pillars
    a6 = win(v, 29.35, 36.95)
    if a6 > 0:
        rx = 36 + 4 * math.sin(v * .5); ry = lerp(-16, 12, eio((v - 29.4) / 7.5)); cx, cy = 540, 880
        path = skia.Path(); pts = [geo(*p) for p in DE]; path.moveTo(*pts[0])
        for p in pts[1:]: path.lineTo(*p)
        path.close()
        rise = eo((v - 29.4) / .7)
        cv.saveLayerAlpha(None, int(a6 * 255))
        for i in range(7, 0, -1):
            cv.save(); cv.concat(pmat(320, 320, 4 * i, cx, cy, rx, ry, rise)); cv.drawPath(path, P('#121418')); cv.restore()
        cv.save(); cv.concat(pmat(320, 320, 0, cx, cy, rx, ry, rise))
        g = skia.GradientShader.MakeLinear([skia.Point(0, -320), skia.Point(0, 320)], [col('#2E323A'), col('#1E2026')], [0, 1])
        pp = skia.Paint(AntiAlias=True); pp.setShader(g); cv.drawPath(path, pp); cv.drawPath(path, P('#4A4F5A', stroke=2.5))
        pr = (v * .25) % 1
        cv.save(); cv.clipPath(path, doAntiAlias=True)
        cv.drawLine(-400, lerp(-400, 400, pr), 400, lerp(-400, 400, pr) - 200, P(WHITE, .06, stroke=60)); cv.restore()
        cv.restore()
        pil = []
        for i, (lo, la) in enumerate(CITIES):
            x, y = geo(lo, la); sx, sy = proj(x, y, 0, cx, cy, rx, ry, rise)
            h = 46 * eo((v - 29.7 - CITY_SEED[i] * 1.2) / .5)
            if i in GONE:
                kk = GONE.index(i); tg = 30.4 + kk * .09; h *= 1 - eio((v - tg) / .5)
                if 0 < v - tg < 1.2:
                    age = v - tg
                    for j in range(3):
                        cv.drawCircle(sx + (j - 1) * 6, sy - 10 - 40 * age - j * 8, 6 + 14 * age, P('#8A8E97', .3 * (1 - age / 1.2), blur=5))
            pil.append((sy, sx, h, i))
        for sy, sx, h, i in sorted(pil):
            if h < .5: continue
            cv.drawCircle(sx, sy, 10, P(RED, .35, blur=6))
            cv.drawRect(skia.Rect.MakeLTRB(sx - 4.5, sy - h, sx + 4.5, sy), P('#A8141E'))
            cv.drawRect(skia.Rect.MakeLTRB(sx - 4.5, sy - h, sx, sy), P(RED))
            cv.drawOval(skia.Rect.MakeLTRB(sx - 4.5, sy - h - 2.5, sx + 4.5, sy - h + 2.5), P('#FF6B74'))
            cv.drawCircle(sx, sy - h, 7, P(RED, .5, blur=5))
        cv.restore()
        if v > T56 - .1:
            al = a6 * eo((v - T56 + .1) / .3)
            s = '56' if v < T35 - .3 else '35'
            prg = cl((v - T56 + .1) / .8) if v < T35 - .3 else cl((v - T35 + .3) / .9)
            roll2(cv, s, 900, 690, 130, prg, RED, al)
            text(cv, 'Umweltzonen', 900, 740, 30, WHITE, al, 'c')
            if v > T35: burst(cv, 900, 640, v, T35 + .4, 14, 150, seed=9)

    # ===== S7 windshield + E plate
    a7 = win(v, 37.0, 45.45)
    if a7 > 0:
        windshield(cv, v, a7)
        tdet = 41.4
        if v < tdet:
            plq(cv, 790, 715 + 30 * (1 - eo((v - 37.0) / .8)), 62, GREEN, '4', v, 0, 0, a7 * eo((v - 37.4) / .4), shadow=False)
        else:
            q = v - tdet
            plq(cv, 790 + 60 * q, 715 + 260 * q * q - 40 * q, 62, GREEN, '4', v, min(80, 160 * q), 300 * q, a7 * cl(1 - q / 1.4), cross=eo(q / .4), shadow=False)
            burst(cv, 790, 715, v, tdet, 20, 160, GREEN, seed=12)
        ehl = eo((v - 43.45) / .3) * (.75 + .25 * math.sin(v * 6))
        eplate3(cv, v, a7, ehl, (v - 43.4) / .9)
        if v > 43.4: burst(cv, 900, 1000, v, 43.6, 18, 200, seed=13); ripple(cv, 900, 1000, v, 43.6, 60, 260)
        pill(cv, 540, 1240, 'seit 1. Oktober 2026', win(v, T2026 - .2, 45.4), sc=ob((v - T2026 + .2) / .45), hl=True)

    # ===== S8 fading plaque, erosion, decline line
    if v > 45.4:
        a8 = win(v, 45.5, VO + .4, .3, .35)
        pts = [(110, 600), (260, 650), (360, 700), (470, 690), (590, 820), (700, 860), (820, 980), (970, 1090)]
        if a8 > 0:
            polyline(cv, pts, eo((v - 47.8) / 2.2), 6, a8)
            if v > 50.0: text(cv, 'Bedeutung', 960, 1150, 30, RED, a8 * eo((v - 50.0) / .3), 'r')
        p = ob((v - 45.45) / .7); fade = eo((v - 45.45) / .3) * (1 if v < VO else 0)
        sat = lerp(1, .25, eo((v - 47.8) / 2.6))
        plq(cv, 540, 840 + 6 * math.sin(v), 250 * lerp(.6, 1, p), GREEN, '4', v, bx, by + 12 * math.sin(v * .8), fade * lerp(1, .82, eo((v - 47.8) / 2.5)), sat=sat)
        rnd = random.Random(77)
        for i in range(60):
            t0 = 46.0 + i * .07; age = v - t0
            if 0 < age < 2.2 and v < VO + .1:
                an = rnd.uniform(0, 2 * math.pi); x = 540 + math.cos(an) * 250 + math.cos(an) * 60 * age; y = 840 + math.sin(an) * 250 - 90 * age
                cv.drawCircle(x, y, 3.5, P(GREEN if i % 3 else RED, .8 * (1 - age / 2.2)))
            else: rnd.uniform(0, 1)

    cv.restore()  # camera
    streaks(cv, v)

    HL = [(0.0, 6.6, [[('Über 90 %', 1)], [('erfüllen die Vorgabe', 0)]]),
          (6.7, 13.25, [[('Seit ', 0), ('2007', 1)], [('an der Scheibe', 0)]]),
          (13.35, 17.25, [[('Anfangs ', 0), ('drei', 1)], [('Farben', 0)]]),
          (17.35, 23.75, [[('Heute zählt', 0)], [('nur Grün', 1)]]),
          (23.85, 29.35, [[('Kaum noch', 0)], [('Wirkung', 1)]]),
          (29.45, 36.95, [[('Weniger', 0)], [('Umweltzonen', 1)]]),
          (37.0, 45.45, [[('E-Kennzeichen', 1)], [('statt Plakette', 0)]]),
          (45.55, VO, [[('Noch da, aber', 0)], [('immer unwichtiger', 1)]])]
    for a, b, ln in HL:
        if a - .1 < v < b + .4: headline3(cv, v, a, b, ln)
    for a, b, s in [(6.7, 23.7, 'Quelle: 35. BImSchV, Bußgeldkatalog'), (23.9, 29.3, 'Quelle: Umweltbundesamt'),
                    (29.45, 36.9, 'Quelle: Umweltbundesamt · Karte schematisch'), (37.0, 45.4, 'Quelle: 35. BImSchV, Bundesrat 25.09.2026')]:
        source(cv, v, a, b, s)
    logo_small(cv, 1 - eo((v - VO) / .4))
    if v < VO: subtitles(cv, v)
    outro3(cv, v)

if __name__ == '__main__':
    mode = sys.argv[1]; surf = skia.Surface(W, H); cv = surf.getCanvas()
    if mode == 'test':
        for t in [float(x) for x in sys.argv[2].split(',')]:
            frame3(cv, t); surf.makeImageSnapshot().save(f'w_{t:05.1f}.png', skia.kPNG)
    elif mode == 'video':
        a0, a1 = int(sys.argv[2]), int(sys.argv[3]); out = sys.argv[4]
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgra', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                               '-c:v', 'libx264', '-preset', 'faster', '-crf', '19', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
        for i in range(a0, a1):
            frame3(cv, i / FPS); ff.stdin.write(surf.makeImageSnapshot().toarray().tobytes())
            if i % 150 == 0: print(i, a1, flush=True)
        ff.stdin.close(); ff.wait(); print('done', flush=True)
    elif mode == 'cover':
        atmosphere(cv, 3)
        cv.drawCircle(540, 990, 470, P(RED, .10, blur=60))
        plq(cv, 540, 990, 330, GREEN, '4', 99, 0, 0, glow=.8)
        text(cv, 'Braucht man die', 540, 420, 84, WHITE, 1, 'c'); text(cv, 'grüne Plakette?', 540, 520, 100, RED, 1, 'c')
        tracked(cv, 'function.', 540, 1600, 96, RED, 1, -.03)
        surf.makeImageSnapshot().save('/mnt/user-data/outputs/umweltplakette_cover.png', skia.kPNG)
