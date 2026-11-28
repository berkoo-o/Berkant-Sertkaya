# erzeugt compositions/hook.html (Teststil HyperFrames: 100 Münzen, zehn Figuren)
VO = 0.15                       # Stimme beginnt bei 0,15 s
def T(v): return round(v + VO, 3)
GROUND = 1270; STEP = 11        # Bodenlinie, Höhe pro Münze im Stapel
X = [100 + i * 86 for i in range(10)]   # Figuren-Mitten
CX = [x + 20 for x in X]                # Münzsäulen stehen halb hinter der Figur, leicht rechts
SH = {9: 54, 5: 5, 6: 8, 7: 12, 8: 18}  # Münzen je Figur (Modell vereinfacht: Bundesbank 54 % oberste 10 %, 2–3 % untere Hälfte)
GX0, GY0, GDX, GDY = 104, 640, 54, 30   # Münzfeld
cells = [(c, r) for c in range(9, -1, -1) for r in range(10)]   # rechte Spalten zuerst (nahe am Turm)
dest = []                        # (cell, ziel)
order = [9] * 54 + [5] * 5 + [6] * 8 + [7] * 12 + [8] * 18 + ['poor'] * 3
# die drei Münzen der ärmeren Hälfte liegen unten links, am nächsten an ihren Figuren
poor_cells = [(0, 9), (0, 8), (0, 7)]
rest = [c for c in cells if c not in poor_cells]
assign = list(zip(rest, order[:97])) + list(zip(poor_cells, ['poor'] * 3))
coins_html = []; js = []
count = {k: 0 for k in SH}
# Flugzeiten
t_red0, st_red = T(1.45), 0.028
t_mid0, st_mid = T(3.35), 0.030
t_poor = [T(8.15), T(8.27), T(8.39)]
DUR = 0.62
mid_n = 0
for idx, ((c, r), who) in enumerate(assign):
    gx, gy = GX0 + c * GDX, GY0 + r * GDY
    cid = f"coin{idx}"
    coins_html.append(f'<div id="{cid}" class="coin{" dim" if who != "poor" else ""}"></div>')
    js.append(f'gsap.set("#{cid}", {{x: {gx - 26}, y: {gy - 11}, zIndex: {10 + r}}});')
    if who == 'poor':
        k = poor_cells.index((c, r)); t0 = t_poor[k]
        tx, ty = X[2] - 26 + (k - 1) * 40, GROUND + 6 - 11 - (k == 1) * 9
        z = 900 + k
    else:
        n = count[who]; count[who] += 1
        if who == 9: t0 = t_red0 + n * st_red
        else: t0 = t_mid0 + mid_n * st_mid; mid_n += 1
        tx, ty = CX[who] - 26, GROUND - 11 - n * STEP
        z = 100 + n
    peak = min(gy - 11, ty) - 40   # low arc: stays under the caption above the tray
    js.append(f'tl.set("#{cid}", {{zIndex: 600 + {idx}}}, {t0:.3f});')
    js.append(f'tl.fromTo("#{cid}", {{x: {gx - 26}}}, {{x: {tx}, duration: {DUR*0.62:.3f}, ease: "power2.inOut"}}, {t0:.3f});')
    js.append(f'tl.fromTo("#{cid}", {{y: {gy - 11}}}, {{y: {peak}, duration: {DUR*0.42:.3f}, ease: "power2.out"}}, {t0:.3f});')
    js.append(f'tl.fromTo("#{cid}", {{y: {peak}}}, {{y: {ty}, duration: {DUR*0.58:.3f}, ease: "power2.in", immediateRender: false}}, {t0 + DUR*0.42:.3f});')
    js.append(f'tl.set("#{cid}", {{zIndex: {z}}}, {t0 + DUR:.3f});')
# Figuren steigen mit ihrem Stapel
figs = []
for i in range(10):
    col = 'red' if i == 9 else 'base'
    figs.append(f'''<div id="fig{i}" class="fig{' dim' if i >= 5 else ''}"><svg width="58" height="169" viewBox="0 0 48 140"><ellipse cx="24" cy="137" rx="20" ry="4" fill="rgba(0,0,0,.45)"/>
<circle cx="24" cy="17" r="15" class="skin"/><rect x="6" y="36" width="36" height="56" rx="14" class="shirt {col}"/><rect x="10" y="78" width="12" height="58" rx="6" class="leg"/><rect x="26" y="78" width="12" height="58" rx="6" class="leg"/></svg></div>''')
    js.append(f'gsap.set("#fig{i}", {{x: {X[i] - 29}, y: {GROUND - 169}}});')
# Zähler 54 % läuft mit den gelandeten Münzen
red_first, red_last = t_red0 + DUR, t_red0 + 53 * st_red + DUR
open('gen/timing.json', 'w').write(__import__('json').dumps({'red_first': red_first, 'red_last': red_last}))
html = open('gen/hook_template.html').read()
html = html.replace('%%COINS%%', '\n    '.join(coins_html)).replace('%%FIGS%%', '\n    '.join(figs)).replace('%%JS%%', '\n    '.join(js))
for k, v in {'%%RF%%': f'{red_first - 0.05:.3f}', '%%RD%%': f'{red_last - red_first + 0.1:.3f}'}.items(): html = html.replace(k, v)
open('compositions/hook.html', 'w').write(html)
print('ok', len(assign), 'Münzen', count, 'rot', red_first, red_last)
