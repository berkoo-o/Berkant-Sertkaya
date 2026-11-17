#!/usr/bin/env python3
"""Build merz/test/modell.html from rundfunk/a3/modell.html plus the Merz fragments."""
import re, sys
import os
SP = os.path.dirname(os.path.abspath(__file__)) + '/'
SRC = SP + '../../rundfunk/a3/modell.html'
OUT = SP + '../full/modell.html'
L = open(SRC, encoding='utf-8').read().split('\n')
def idx(prefix, start=0):
    for i in range(start, len(L)):
        if L[i].startswith(prefix):
            return i
    raise SystemExit('marker not found: ' + prefix)
frag = lambda n: open(SP + n, encoding='utf-8').read().rstrip('\n').split('\n')

i_streets = idx('// streets: a new grid')
i_win = idx('// windows (instanced)')
i_trees_ms = idx('// trees around the market square')
i_ki = idx('const KI=')
i_media = idx('// =================================================================== MEDIA QUARTER')
i_money = idx('// =================================================================== MONEY')
i_traffic = idx('// =================================================================== TRAFFIC')
i_rect = idx('const RECT=')
i_traf = idx('const TRAF=')
i_walk = idx('// two walkers around the hero house')
i_parks = idx('// parks: LED bollards')
i_bollpos = idx('[[-4.4,2.45]')
i_bench = idx('bench(-3.3,2.95')
i_benchp = idx('[[-3.22,3.03')
i_tl = idx('// =================================================================== timeline')
i_focus = idx('// focus light', i_tl)
i_proj = idx('const V=new THREE.Vector3();const proj', i_tl)
i_oc = idx('const oc=document.getElementById')

# lamp helpers from the media quarter: lampPost, LED, ledLamp, flood, PYM, litWin, tMatGrey
helpers = []
for i in range(i_media, i_money):
    s = L[i]
    if s.startswith('function lampPost') or s.startswith('const LED=') or s.startswith('function ledLamp') or s.startswith('function flood') \
       or s.startswith('const PYM=') or s.startswith('function litWin') or s.startswith('function tMatGrey') or s.startswith('const subLamps'):
        helpers.append(s)
        j = i + 1
        while j < i_money and L[j].startswith('  '):
            helpers.append(L[j]); j += 1
helpers = [h.replace(';const SUB={x0:0.35,x1:3.15,z0:-4.55,z1:-2.2};', ';') for h in helpers]

rs = frag('merz_reichstag.js')
k = rs.index('//@@LAMPHELPERS@@'); rs[k:k + 1] = helpers
tl = frag('merz_timeline.js')
k = tl.index('//@@FOCUS_AND_CAM@@'); tl[k:k + 1] = L[i_focus:i_proj + 1]

traffic_new = [
    "const RECT={R1:[-3.2,2.0,-3.2,3.4],R2:[-5.0,-3.2,-3.2,3.4],R3:[2.0,5.0,-3.2,3.4]};",
    L[i_rect + 1],  # CARC / PEDC
    "const TRAF={R1:{cv:0.24,c:[0.05,0.38,0.7],bv:0.13,b:[0.2,0.62],p:[4,4]},R2:{cv:0.22,c:[0.1,0.55],bv:0.13,b:[0.4],p:[3,2]},R3:{cv:0.21,c:[0.2,0.72],bv:0.125,b:[0.15],p:[3,3]}};",
]
assert L[i_rect + 2].startswith('const TRAF=')
parked = [
    "const HX0=99,HX1=99,HZ0=99,HZ1=99;",
    "// parked cars (lights off) on the outer lanes that no loop uses",
    "[[-4.0,-3.33,Math.PI],[0.4,-3.33,Math.PI],[3.4,-3.33,Math.PI],[-4.3,3.53,0],[0.9,3.53,0],[3.2,3.53,0],[-5.13,-1.5,Math.PI/2],[5.13,0.9,-Math.PI/2]].forEach((p,i)=>{const G=mkCar(CARC[(i+3)%CARC.length],false,false);G.position.set(p[0],0,p[1]);G.rotation.y=p[2];KO.push([p[0],p[1],0.16]);});",
]

out = []
out += L[:i_streets]
out += frag('merz_layout.js')
out += L[i_win:i_trees_ms]
out += L[i_ki:i_media]
out += rs
out += L[i_traffic:i_rect]
out += traffic_new
out += L[i_traf + 1:i_walk]
out += parked
out += L[i_parks:i_bollpos]
out += ["[[-1.6,4.1],[-0.4,4.75],[0.3,4.05],[-1.0,4.9]].forEach(p=>bollard(...p));"]
out += L[i_bollpos + 1:i_bench]
out += ["bench(-1.2,4.3,0);bench(0.0,4.55,Math.PI);"]
out += ["[[-1.12,4.38,2.3,0x8a6f4a],[0.06,4.47,-0.6,0x5a4a6a]].forEach(([x,z,ry,c])=>{const o=mkPed(c,0.95);o.G.position.set(x,PAVE_H,z);o.G.rotation.y=ry;KO.push([x,z,0.09]);});"]
out += L[i_benchp + 1:i_tl]
out += tl
out += L[i_oc:]
html = '\n'.join(out)

# street keys: there is no road G any more
html = html.replace(",['G',[-1]]", '')
# outro dot starts at the red lamp on the lectern; no letter in this video
html = html.replace('wpos(tower.lamp,[0,0,0])', 'wpos(rs.lamp,[0,0,0])')
html = html.replace('setTime(t);placeLetter(t);composer.render()', 'setTime(t);composer.render()')
html = html.replace('<div class="tag" id="tag2"></div>', '<div class="tag" id="tag2"></div><div class="tag" id="tag3"></div>')
html = html.replace('<div id="title">Wohin geht dein<br>Rundfunkbeitrag?</div>', '<div id="title"></div>')
for bad in ['tower.', 'MEDIA', 'hero.', 'placeLetter', 'updateCoins', 'busAd', 'ecLed', 'WAVE1']:
    if bad in html:
        for n, line in enumerate(html.split('\n')):
            if bad in line:
                print('leftover', bad, 'line', n + 1, line[:120])
open(OUT, 'w', encoding='utf-8').write(html)
print('ok', len(html))
