from render5 import *
s = skia.Surface(W, H); cv = s.getCanvas()
atmosphere(cv, 5.0)
cv.drawCircle(560, 1000, 460, P(RED, .10, blur=60))
import render5 as R5
cv.save(); cv.translate(0, 110)
pump(cv, 1.0, 1, 211, 1.0, 1.0)
draw_column(cv, 45.0, 1)
bracket(cv, 0, 99.5, R5.CX + R5.CW / 2 + 14, 1, '≈ 1 € Staat', 1, True, 32)
cv.restore()
text(cv, 'Wie viel vom Liter', 540, 400, 84, WHITE, 1, 'c'); text(cv, 'geht an den Staat?', 540, 500, 88, RED, 1, 'c')
tracked(cv, 'function.', 540, 1610, 96, RED, 1, -.03)
s.makeImageSnapshot().save('/mnt/user-data/outputs/benzinpreis_cover.png', skia.kPNG)
