"""Download the footage shots.json needs into src/ (run on the editing box; it gets reset, so this is step one).

  python3 fetch_sources.py                 -> every source in shots.json
  python3 fetch_sources.py action levik    -> only these keys
  MAG='{"s7DyTOsl8e": "https://..."}' python3 fetch_sources.py   -> Magnific URLs are signed and expire:
                                              get fresh ones with the magnific creations_get tool and pass them here

Refuses sources marked owner=gal or use=never in sources.json.
"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

D = os.environ.get('V3', '/home/user/v3')
HERE = os.path.dirname(os.path.abspath(__file__))
CAT = json.load(open(os.path.join(HERE, 'sources.json')))['sources']
MAG = json.loads(os.environ.get('MAG', '{}'))


def needed():
    keys = set()
    for s in json.load(open(os.path.join(HERE, 'shots.json'))):
        for p in s.get('stack', [s]):
            keys.add(p['src'])
    return sorted(keys)


def fetch(k):
    c = CAT.get(k)
    if c is None: return k, 'not in sources.json'
    if c['owner'] != 'levik' or c['use'] == 'never': return k, f"refused: owner={c['owner']} use={c['use']}"
    url = c['url'] or MAG.get(c.get('magnific', ''))
    if not url: return k, 'no URL: pass a fresh Magnific URL in MAG'
    out = f'{D}/src/{k}.mp4'
    if os.path.exists(out) and os.path.getsize(out) > 0: return k, 'have'
    os.makedirs(os.path.dirname(out), exist_ok=True)
    r = subprocess.run(['curl', '-sSfL', '--retry', '5', '-o', out + '.part', url], capture_output=True, text=True)
    if r.returncode: return k, f'curl {r.returncode} {r.stderr.strip()[-120:]}'
    os.rename(out + '.part', out)
    return k, f'ok {os.path.getsize(out) // 1024} KB'


if __name__ == '__main__':
    keys = sys.argv[1:] or needed()
    with ThreadPoolExecutor(3) as ex:
        for k, msg in ex.map(fetch, keys):
            print(f'{k:16s} {msg}', flush=True)
