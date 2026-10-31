from render3 import *
s = skia.Surface(W, H); cv = s.getCanvas()
V = 4.0
atmosphere(cv, V)
CX, CY, RR = 540, 1010, 300

# light rays behind
for k in range(14):
    an = k * 360 / 14 + 7
    cv.save(); cv.translate(CX, CY); cv.rotate(an)
    pth = skia.Path(); pth.moveTo(-18, 0); pth.lineTo(18, 0); pth.lineTo(70, -760); pth.lineTo(-70, -760); pth.close()
    g = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, -760)], [col(RED, .14), col(RED, 0)], [0, 1])
    p = skia.Paint(AntiAlias=True); p.setShader(g); cv.drawPath(pth, p); cv.restore()
cv.drawCircle(CX, CY, 480, P(RED, .12, blur=60))
# concentric rings
for r, a in [(360, .55), (420, .32), (490, .18), (570, .1)]:
    cv.drawCircle(CX, CY, r, P(RED, a, stroke=2.5))
for k in range(72):
    an = math.radians(k * 5); r0 = 382 if k % 6 else 372
    cv.drawLine(CX + math.cos(an) * r0, CY + math.sin(an) * r0, CX + math.cos(an) * 398, CY + math.sin(an) * 398, P('#C9CDD4', .35, stroke=2))

def orbit(front):
    for i in range(22):
        an = i * 2 * math.pi / 22 + .3; z = math.sin(an)
        if (z > 0) != front: continue
        ox = CX + math.cos(an) * 470; oy = CY + 215 + z * 120; sc = .95 + .55 * (z + 1) / 2
        bad = i % 7 == 3; al = .45 + .55 * (z + 1) / 2
        car(cv, ox, oy, RED if bad else '#C9CDD4', al, sc * 1.25)
        if not bad: cv.drawCircle(ox + 10 * sc, oy - 13 * sc, 4.5 * sc, P(GREEN, al))
orbit(False)
# floor reflection
cv.drawOval(skia.Rect.MakeLTRB(CX - 300, CY + 290, CX + 300, CY + 360), P('#000000', .55, blur=22))
cv.drawOval(skia.Rect.MakeLTRB(CX - 220, CY + 318, CX + 220, CY + 352), P(GREEN, .18, blur=18))

# side plaques
plq(cv, 205, 900, 140, REDP, '2', 99, 6, 26, a=.55)
plq(cv, 875, 900, 140, YEL, '3', 99, 6, -26, a=.55)

# main plaque with extra detail
def detail(cv, R):
    fa = F(R * .058)
    t = 'UMWELT · SCHADSTOFFGRUPPE 4 · FEINSTAUBPLAKETTE · '
    ws = [fa.measureText(ch) for ch in t]; tot = sum(ws); circ = 2 * math.pi * R * .915
    sc = circ / tot; ang = -90.0
    for ch, w in zip(t, ws):
        cv.save(); cv.rotate(ang + 90 + (w * sc / 2) / (R * .915) * 180 / math.pi)
        cv.drawString(ch, -w / 2, -R * .9, fa, P('#0E3D1F', .75)); cv.restore()
        ang += (w * sc) / (R * .915) * 180 / math.pi
    for k in range(120):
        cv.save(); cv.rotate(k * 3); cv.drawLine(0, -R * .99, 0, -R * .968, P('#0E3D1F', .45, stroke=1.6)); cv.restore()
    # stamp on the field
    sx, sy, sr = R * .5, R * .315, R * .13
    cv.drawCircle(sx, sy, sr, P('#2F55A8', .55, stroke=R * .012))
    cv.drawCircle(sx, sy, sr * .72, P('#2F55A8', .45, stroke=R * .008))
    for k in range(8):
        cv.save(); cv.translate(sx, sy); cv.rotate(k * 45); cv.drawLine(0, -sr * .3, 0, -sr * .55, P('#2F55A8', .45, stroke=R * .008)); cv.restore()
    # writing lines in field
    for k in range(2):
        cv.drawLine(-R * .6, R * (.24 + k * .14), R * .3, R * (.24 + k * .14), P('#9AA0AA', .5, stroke=R * .008))
    # extra glare
    cv.drawOval(skia.Rect.MakeLTRB(-R * .7, -R * .9, R * .1, -R * .55), P(WHITE, .18, blur=R * .08))

rx, ry = 7, -12
for i in range(10, 0, -1):
    cv.save(); cv.concat(pmat(RR, RR, RR * .1 * i / 10, CX, CY, rx, ry)); cv.drawCircle(0, 0, RR, P(shade(GREEN, .35 + .02 * i))); cv.restore()
cv.save(); cv.concat(pmat(RR, RR, 0, CX, CY, rx, ry))
cv.drawCircle(0, 0, RR * 1.06, P(RED, .7, stroke=RR * .06, blur=RR * .08))
uface3(cv, RR, GREEN, '4', 99)
detail(cv, RR)
cv.drawCircle(0, 0, RR * 1.01, P(WHITE, .25, stroke=3))
cv.restore()
orbit(True)

# sparkles + embers near plaque
rnd = random.Random(5)
for i in range(40):
    an = rnd.uniform(0, 2 * math.pi); r = rnd.uniform(330, 620); x = CX + math.cos(an) * r; y = CY + math.sin(an) * r * .8
    if y > 1480 or y < 600: continue
    rr = rnd.uniform(1.5, 4)
    cv.drawCircle(x, y, rr * 3, P(RED, .3, blur=rr * 2)); cv.drawCircle(x, y, rr, P('#FFD0D4', .9))
for (x, y, s_) in [(CX - 210, CY - 250, 1.2), (CX + 250, CY - 160, .8), (CX + 120, CY + 230, .7)]:
    for k in range(4):
        cv.save(); cv.translate(x, y); cv.rotate(k * 45)
        cv.drawLine(0, -26 * s_, 0, 26 * s_, P(WHITE, .9 if k % 2 == 0 else .5, stroke=3 if k % 2 == 0 else 2)); cv.restore()
    cv.drawCircle(x, y, 10 * s_, P(WHITE, .6, blur=8))

text(cv, 'Braucht man die', 540, 400, 84, WHITE, 1, 'c'); text(cv, 'Umweltplakette noch?', 540, 500, 88, RED, 1, 'c')
tracked(cv, 'function.', 540, 1600, 96, RED, 1, -.03)
s.makeImageSnapshot().save('/mnt/user-data/outputs/umweltplakette_cover.png', skia.kPNG)
