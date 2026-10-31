from render4 import *
s = skia.Surface(W, H); cv = s.getCanvas()
atmosphere(cv, 6.0)
st = dict(cx=540, cy=1000, rx=36, ry=-6, sc=1.15, a=1)
draw_germany(cv, st, 3.0)
for n in ROUTES: draw_route(cv, st, n, 1, 6, RED, .9, False)
for n in ROUTES:
    [chevrons(cv, q, .3, .35, .8, 3, 9) for q in route_segs(st, n)]
for n in ['A1', 'A2', 'A4', 'A9', 'A3', 'A8']:
    e = point_at(route_screen(st, n), MIDF[n]); shield(cv, e[0], e[1], 46, n, 0, 0, 1, shadow=False)
cv.drawCircle(540, 1000, 360, P(RED, .08, blur=60))
shield(cv, 540, 980, 250, 'A7', 6, -10, 1, glow=.9)
ripple(cv, 540, 980, 1.3, 1.0, 200, 520)
for k, r in enumerate([300, 360]): cv.drawCircle(540, 980, r, P(RED, .35 - k * .15, stroke=2.5))
text(cv, 'Was verrät die', 540, 410, 84, WHITE, 1, 'c'); text(cv, 'Autobahn-Nummer?', 540, 510, 92, RED, 1, 'c')
tracked(cv, 'function.', 540, 1610, 96, RED, 1, -.03)
s.makeImageSnapshot().save('/mnt/user-data/outputs/autobahnnummern_cover.png', skia.kPNG)
