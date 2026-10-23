import asyncio, subprocess, os, shutil, argparse, time
from playwright.async_api import async_playwright
p=argparse.ArgumentParser()
p.add_argument('html');p.add_argument('out')
p.add_argument('--fps',type=int,default=30);p.add_argument('--dur',type=float,default=50.0)
p.add_argument('--audio');p.add_argument('--frames',help='comma list of seconds -> PNG stills')
p.add_argument('--workers',type=int,default=3);p.add_argument('--keep',action='store_true')
a=p.parse_args()
CHROME='/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
async def page(b):
    pg=await b.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1)
    pg.on('console',lambda m: print('console:',m.text))
    await pg.goto('file://'+os.path.abspath(a.html))
    await pg.wait_for_function('window.ready && window.ready()',timeout=120000)
    return pg
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(executable_path=CHROME,args=['--force-color-profile=srgb'])
        if a.frames:
            pg=await page(b); os.makedirs(a.out,exist_ok=True)
            for s in a.frames.split(','):
                await pg.evaluate(f'window.seek({float(s)})')
                await pg.screenshot(path=f'{a.out}/t{float(s):06.2f}.png')
            await b.close(); return
        d=a.out+'_frames'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
        n=round(a.dur*a.fps); t0=time.time(); done=[0]
        async def worker(k):
            pg=await page(b)
            for i in range(k,n,a.workers):
                await pg.evaluate(f'window.seek({i/a.fps})')
                await pg.screenshot(path=f'{d}/{i:05d}.jpg',type='jpeg',quality=98)
                done[0]+=1
                if done[0]%150==0: print('frames',done[0],'of',n,f'{time.time()-t0:.0f}s',flush=True)
        await asyncio.gather(*[worker(k) for k in range(a.workers)])
        await b.close()
    cmd=['ffmpeg','-v','error','-y','-framerate',str(a.fps),'-i',f'{d}/%05d.jpg']
    if a.audio: cmd+=['-i',a.audio]
    cmd+=['-vf','format=yuv420p','-c:v','libx264','-crf','16','-preset','slow','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart']
    if a.audio: cmd+=['-c:a','aac','-b:a','256k','-shortest']
    cmd+=[a.out]; subprocess.run(cmd,check=True)
    if not a.keep: shutil.rmtree(d)
    print('wrote',a.out,f'{time.time()-t0:.0f}s')
asyncio.run(main())
