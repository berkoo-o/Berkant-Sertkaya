from render import *
s = skia.Surface(W, H); cv = s.getCanvas()
background(cv, 3.0)
def ex(cv, R, rot):
    for k in range(12):
        cv.save(); cv.rotate(k*30); cv.drawLine(0,-R*1.10,0,-R*1.17,P('#C9CDD4',.55,stroke=4)); cv.restore()
cv.drawCircle(540, 990, 470, P(RED, .10, blur=60))
plaque(cv, 540, 990, 340, RED, '26', 270, 0, 0, glow=.8, extra=ex)
text(cv, 'Wie liest man die', 540, 420, 84, WHITE, 1, 'c')
text(cv, 'TÜV-Plakette?', 540, 520, 100, RED, 1, 'c')
tracked(cv, 'function.', 540, 1600, 96, RED, 1, -.03)
s.makeImageSnapshot().save('/mnt/user-data/outputs/tuev-plakette_cover.png', skia.kPNG)
