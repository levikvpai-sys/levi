import base64, json
f=lambda w: base64.b64encode(open(f'fonts/package/files/cinzel-latin-{w}-normal.woff2','rb').read()).decode()
h=open('film.template.html').read()
for w in (500,600,700): h=h.replace(f'__CINZEL{w}__',f(w))
h=h.replace('__TIMELINE__',json.dumps(json.load(open('timeline.json')),ensure_ascii=False))
open('film.html','w').write(h); print('film.html',len(h))
