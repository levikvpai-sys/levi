"""Bake each shot's colour grade into its pixels (same maths as the CSS filter functions)."""
import json, os, glob, re
import numpy as np
from PIL import Image
TL=json.load(open('timeline.json'))
GRADE={'riot':'contrast(1.08) saturate(1.06)','damage':'saturate(0.80) contrast(1.06) brightness(0.94)',
 'fire':'contrast(1.04)','symbol':'contrast(1.04)','warm':'contrast(1.06) saturate(1.04) sepia(0.07)','video':'contrast(1.05) saturate(1.03) sepia(0.05)'}
def sat_m(s): return np.array([[.213+.787*s,.715-.715*s,.072-.072*s],[.213-.213*s,.715+.285*s,.072-.072*s],[.213-.213*s,.715-.715*s,.072+.928*s]])
def sep_m(a): a=1-a; return np.array([[.393+.607*a,.769-.769*a,.189-.189*a],[.349-.349*a,.686+.314*a,.168-.168*a],[.272-.272*a,.534-.534*a,.131+.869*a]])
def grade(img,spec):
    x=np.asarray(img.convert('RGB')).astype(np.float32)/255
    for fn,v in re.findall(r'(\w+)\(([\d.]+)\)',spec):
        v=float(v)
        if fn=='contrast': x=(x-.5)*v+.5
        elif fn=='brightness': x=x*v
        elif fn=='saturate': x=x@sat_m(v).T
        elif fn=='sepia': x=x@sep_m(v).T
        x=np.clip(x,0,1)
    return Image.fromarray((x*255+.5).astype(np.uint8))
os.makedirs('assets/img_g',exist_ok=True)
for s in TL['shots']:
    g=GRADE.get(s.get('grade'))
    if not g: continue
    if s.get('src'):
        grade(Image.open(f"assets/img/{s['src']}.jpg"),g).save(f"assets/img_g/{s['src']}.jpg",quality=94)
    if s.get('video'):
        os.makedirs(f"assets/img_g/{s['video']}",exist_ok=True)
        for p in sorted(glob.glob(f"assets/img/{s['video']}/*.jpg")):
            grade(Image.open(p),g).save(f"assets/img_g/{s['video']}/"+os.path.basename(p),quality=92)
print('baked')
