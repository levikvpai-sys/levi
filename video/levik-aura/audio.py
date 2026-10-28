
import numpy as np, subprocess, json, sys
FF='/home/user/bin/ffmpeg'; WD='/home/user/wow'; SR=48000
B=60/140; T0=3.387
def bt(k): return round(T0+k*B,3)
DUR=31.0
def load(f,s=0,e=None):
    a=[FF,'-v','error','-ss',f'{s:.3f}','-i',f]+(['-t',f'{e-s:.3f}'] if e else [])+['-vn','-ac','2','-ar',str(SR),'-f','f32le','-']
    return np.frombuffer(subprocess.run(a,capture_output=True).stdout,dtype=np.float32).reshape(-1,2).copy()
mix=np.zeros((int(DUR*SR)+SR,2),np.float32)
def place(x,t,g=1.0,fi=0.01,fo=0.01):
    x=x*g; n=len(x); fi_=int(fi*SR); fo_=int(fo*SR)
    if fi_>0: x[:fi_]*=np.linspace(0,1,fi_)[:,None]
    if fo_>0: x[-fo_:]*=np.linspace(1,0,fo_)[:,None]
    i=int(round(t*SR)); j=min(len(mix),i+n); mix[i:j]+=x[:j-i]
# hook (original film mix)
place(load(WD+'/src.mp4',0,3.42),0.0,1.7,0.0,0.05)
# music with ducking envelope
M0=22.384; mlen=bt(61)-bt(0)
m=load(WD+'/aud/music.mp3',M0,M0+mlen)
env=np.full(len(m),0.42,np.float32)
duck=[(6.91,8.45),(8.87,11.85),(13.24,16.90),(19.24,22.20),(26.93,29.6)]
tt=np.arange(len(m))/SR+bt(0)
for a,b_ in duck:
    r=0.08
    w=np.clip(np.minimum((tt-(a-r))/r,((b_+r)-tt)/r),0,1)
    env=env*(1-0.55*w)
place(m*env[:,None],bt(0),1.0,0.0,0.03)
# dialogue lines (src_start, src_end, global_start)
dia=WD+'/aud/dia.wav'
for s,e,g in [(9.90,11.42,6.91),(31.50,34.42,8.87),(35.30,38.95,13.24),(39.76,43.72,19.24),(57.20,59.75,26.93)]:
    place(load(dia,s,e),g,2.0,0.02,0.04)
# shofar from M&E stem
place(load(WD+'/aud/me.wav',49.75,53.3),bt(44)-0.40,1.9,0.05,0.3)
# sfx
S=WD+'/stock/'
boom=load(S+'boom.mp3'); boom2=load(S+'boom2.mp3'); wh=load(S+'whoosh.mp3'); bwh=load(S+'bwhoosh.mp3'); tg=load(S+'toggle.mp3',0,0.4)
for c in [bt(0),bt(12),bt(44)]: place(boom,c-0.12,0.24,0,0.2)
for c in [bt(30),bt(52),bt(61)]: place(boom2,c-0.16,0.5,0,0.3)
for c in [bt(0),bt(12),bt(44),bt(54)]: place(wh,c-1.0,0.55,0.05,0.05)
for c in [bt(22),bt(37)]: place(bwh,c-1.1,0.6,0.05,0.1)
place(tg,5.53-0.07,6.0,0,0.02)
mix=mix[:int(DUR*SR)]
# fade tail of end card
mix[-int(0.5*SR):]*=np.linspace(1,0,int(0.5*SR))[:,None]
pk=np.abs(mix).max(); print('peak before',pk)
mix=mix/max(1e-6,pk)*0.97
open(WD+'/aud/mix_raw.f32','wb').write(mix.astype(np.float32).tobytes())
subprocess.run([FF,'-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i',WD+'/aud/mix_raw.f32','-af','volume=2.2,alimiter=limit=0.84:attack=4:release=60:level=disabled','-c:a','pcm_s16le',WD+'/aud/mix_pre.wav'])
r=subprocess.run([FF,'-hide_banner','-i',WD+'/aud/mix_pre.wav','-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
js=json.loads(r[r.rfind('{'):r.rfind('}')+1]); print(js)
af=f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true"
subprocess.run([FF,'-v','error','-y','-i',WD+'/aud/mix_pre.wav','-af',af,'-ar','48000','-c:a','pcm_s16le',WD+'/aud/mix.wav'])
r=subprocess.run([FF,'-hide_banner','-i',WD+'/aud/mix.wav','-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True).stderr
print(r[-600:])
