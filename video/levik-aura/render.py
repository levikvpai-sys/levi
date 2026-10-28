
import numpy as np, subprocess, sys, os, math, json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS=1280,720,24
FF='/home/user/bin/ffmpeg'; WD='/home/user/wow'; FONTS=WD+'/fonts/'
SRC=WD+'/src.mp4'; LION=WD+'/stock/lion2.mp4'
B=60/140; T0=3.387
def bt(k): return round(T0+k*B,3)
DUR=31.0; NF=int(round(DUR*FPS))

def fnt(name,size,var=None):
    f=ImageFont.truetype(FONTS+name,size,layout_engine=ImageFont.Layout.RAQM)
    if var:
        names=f.get_variation_names(); v=var if var in names else (var.replace(b' ',b'')+b' Italic' if (var+b' Italic') in names else None)
        if v is None:
            for n in names:
                if n.replace(b' Italic',b'')==var: v=n
        if v is None: f.set_variation_by_axes([{b'Black':900,b'ExtraBold':800,b'Bold':700,b'SemiBold':600,b'Medium':500}.get(var,700)])
        else: f.set_variation_by_name(v)
    return f

def vgrad(w,h,y0,y1,stops):
    ys=np.arange(h,dtype=np.float32); p=np.clip((ys-y0)/max(1,(y1-y0)),0,1)
    cols=np.zeros((h,3),np.float32); sp=[s[0] for s in stops]
    for c in range(3): cols[:,c]=np.interp(p,sp,[s[1][c] for s in stops])
    return Image.fromarray(np.repeat(cols[:,None,:],w,axis=1).astype(np.uint8),'RGB')

def text_layer(txt,fontname,size,var=b'Black',fill=(255,255,255),grad=None,stroke=0,stroke_fill=(0,0,0),shadow=0,shadow_a=0.6,glow=0,glow_color=(255,255,255),glow_a=1.0,direction='rtl'):
    f=fnt(fontname,size,var)
    d=ImageDraw.Draw(Image.new('L',(8,8)))
    bb=d.textbbox((0,0),txt,font=f,direction=direction,stroke_width=stroke)
    pad=int(size*0.2)+stroke+max(glow,shadow)*3
    w=bb[2]-bb[0]+2*pad; h=bb[3]-bb[1]+2*pad; org=(pad-bb[0],pad-bb[1])
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).text(org,txt,font=f,fill=255,direction=direction)
    out=Image.new('RGBA',(w,h),(0,0,0,0))
    if glow:
        g=m.filter(ImageFilter.GaussianBlur(glow)).point(lambda v:min(255,int(v*2*glow_a)))
        L=Image.new('RGBA',(w,h),tuple(glow_color)+(255,)); L.putalpha(g); out=Image.alpha_composite(out,L)
    if shadow:
        g=m.filter(ImageFilter.GaussianBlur(shadow)).point(lambda v:int(v*shadow_a))
        L=Image.new('RGBA',(w,h),(0,0,0,255)); L.putalpha(g); out=Image.alpha_composite(out,L)
    if stroke:
        sm=Image.new('L',(w,h),0); ImageDraw.Draw(sm).text(org,txt,font=f,fill=255,direction=direction,stroke_width=stroke,stroke_fill=255)
        L=Image.new('RGBA',(w,h),tuple(stroke_fill)+(255,)); L.putalpha(sm); out=Image.alpha_composite(out,L)
    if grad:
        gb=m.getbbox() or (0,0,w,h); G=vgrad(w,h,gb[1],gb[3],grad).convert('RGBA')
    else: G=Image.new('RGBA',(w,h),tuple(fill)+(255,))
    G.putalpha(m); out=Image.alpha_composite(out,G)
    return out

def paste(fr,L,cx,cy,scale=1.0,alpha=1.0,angle=0.0):
    if alpha<=0: return
    if angle: L=L.rotate(angle,resample=Image.BICUBIC,expand=True)
    if abs(scale-1)>1e-3: L=L.resize((max(1,int(L.width*scale)),max(1,int(L.height*scale))),Image.BILINEAR)
    x0=int(round(cx-L.width/2)); y0=int(round(cy-L.height/2))
    xa,ya=max(0,x0),max(0,y0); xb,yb=min(W,x0+L.width),min(H,y0+L.height)
    if xb<=xa or yb<=ya: return
    a=np.asarray(L,dtype=np.float32)[ya-y0:yb-y0,xa-x0:xb-x0]/255.0
    al=a[...,3:4]*alpha
    fr[ya:yb,xa:xb]=fr[ya:yb,xa:xb]*(1-al)+a[...,:3]*al

def mask_full(L,cx,cy,scale=1.0):
    M=Image.new('L',(W,H),0)
    A=L.getchannel('A')
    if abs(scale-1)>1e-3: A=A.resize((max(1,int(A.width*scale)),max(1,int(A.height*scale))),Image.BILINEAR)
    M.paste(A,(int(round(cx-A.width/2)),int(round(cy-A.height/2))))
    return np.asarray(M,dtype=np.float32)[...,None]/255.0

# ---------- grades ----------
def lum(f): return f[...,0]*0.299+f[...,1]*0.587+f[...,2]*0.114
def sc(x): return x*x*(3-2*x)
def grade(f,g):
    if g=='film':
        L=lum(f)[...,None]; f=L+(f-L)*1.08; f=np.clip(0.5+(f-0.48)*1.12,0,1)
        f=f+np.array([-0.012,0.0,0.018],np.float32)*(1-L)
    elif g=='bw':
        L=np.clip((lum(f)-0.05)/0.85,0,1); L=sc(L)*0.85+L*0.15; f=np.stack([L,L,L*1.02],-1)
    elif g=='red':
        L=np.clip((lum(f)-0.04)/0.86,0,1); L=sc(L)
        hi=np.clip((L-0.62)*2.4,0,1)
        f=np.stack([np.clip(L*1.55,0,1), hi*0.85+L*0.03, hi*0.82+L*0.09],-1)
    elif g=='warm':
        L=lum(f)[...,None]; s=np.concatenate([L*1.10+0.03,L*0.96,L*0.74],-1)
        f=np.clip(f*0.35+s*0.65,0,1); f=np.clip(0.5+(f-0.45)*1.28,0,1)
    elif g=='cold':
        L=lum(f)[...,None]; f=L*0.7+f*0.3; f=f*np.array([0.90,0.98,1.08],np.float32); f=np.clip(0.5+(f-0.47)*1.18,0,1)
    elif g=='clean':
        f=np.clip(0.5+(f-0.5)*1.05,0,1)
    return np.clip(f,0,1).astype(np.float32)

def bloom(f,amt,thr=0.68):
    if amt<=0: return f
    L=lum(f); m=(np.clip((L-thr)/(1-thr),0,1)[...,None]*f)
    sm=Image.fromarray((m*255).astype(np.uint8)).resize((W//4,H//4),Image.BILINEAR).filter(ImageFilter.GaussianBlur(5))
    up=np.asarray(sm.resize((W,H),Image.BILINEAR),dtype=np.float32)/255.0
    return 1-(1-f)*(1-np.clip(up*amt*1.6,0,1))

def rgbsplit(f,k):
    k=int(round(k))
    if k==0: return f
    o=f.copy(); o[...,0]=np.roll(f[...,0],k,axis=1); o[...,2]=np.roll(f[...,2],-k,axis=1); return o

rng=np.random.default_rng(7)
GRAIN=[(rng.standard_normal((H//2,W//2)).astype(np.float32)) for _ in range(6)]
GRAIN=[np.asarray(Image.fromarray(((g*0.25+0.5).clip(0,1)*255).astype(np.uint8)).resize((W,H),Image.BILINEAR),dtype=np.float32)/255-0.5 for g in GRAIN]
yy,xx=np.mgrid[0:H,0:W]; r2=((xx-W/2)/(W/2))**2+((yy-H/2)/(H/2))**2
VIG=(1-0.28*np.clip(r2,0,1.6)).astype(np.float32)[...,None]

# ---------- sources ----------
SRCSIZE={'src':(1332,720),'lion':(1280,720)}
class Reader:
    def __init__(self,kind,start):
        path=SRC if kind=='src' else LION
        vf=['fps=24','scale=1280:720'] if kind=='lion' else []
        args=[FF,'-v','error','-ss',f'{max(0,start):.3f}','-i',path]+(['-vf',','.join(vf)] if vf else [])+['-an','-f','rawvideo','-pix_fmt','rgb24','-']
        self.w,self.h=SRCSIZE[kind]; self.fs=self.w*self.h*3
        self.p=subprocess.Popen(args,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL); self.idx=-1; self.last=None
    def get(self,j):
        while self.idx<j:
            buf=self.p.stdout.read(self.fs)
            if len(buf)<self.fs: break
            self.last=buf; self.idx+=1
        return Image.frombytes('RGB',(self.w,self.h),self.last)
    def close(self):
        try: self.p.kill()
        except: pass

def xform(img,z,cx,cy,dx=0,dy=0):
    Ws,Hs=img.size
    if Ws/Hs>W/H: bh=Hs; bw=Hs*W/H
    else: bw=Ws; bh=Ws*H/W
    bw/=z; bh/=z
    x0=cx*Ws-bw/2+dx*bw/W; y0=cy*Hs-bh/2+dy*bh/H
    x0=min(max(x0,0),Ws-bw); y0=min(max(y0,0),Hs-bh)
    return img.resize((W,H),Image.BILINEAR,box=(x0,y0,x0+bw,y0+bh))

# ---------- timeline ----------
def S(t0,t1,src,s0,z,c,g,**kw):
    d=dict(t0=t0,t1=t1,src=src,s0=s0,z=z,c=c,g=g); d.update(kw); return d
SEGS=[
 S(0.0,bt(0),'src',0.0,(1.0,1.06),(0.45,0.5),'film'),
 S(bt(0),bt(4),'still',3.30,(1.05,1.16),(0.45,0.5),'cold',kind='title'),
 S(bt(4),bt(6),'src',2.0,(1.0,1.04),(0.45,0.5),'cold',dim=0.42,kind='toggle'),
 S(bt(6),bt(12),'src',7.058,(1.06,1.20),(0.5,0.36),'cold',grain=1.6,zbend=3),
 S(bt(12),bt(14),'src',30.10,(1.15,1.0),(0.5,0.5),'film',bloom=0.3,zb=2),
 S(bt(14),bt(16),'src',31.20,(2.3,2.5),(0.30,0.36),'red'),
 S(bt(16),bt(18),'src',32.20,(2.0,2.15),(0.76,0.28),'bw',bloom=0.4),
 S(bt(18),bt(20),'src',33.40,(1.45,1.35),(0.80,0.30),'film',wipe=4),
 S(bt(20),bt(21),'src',11.20,(1.4,1.2),(0.85,0.40),'red',zb=2),
 S(bt(21),bt(22),'src',13.50,(1.35,1.45),(0.62,0.38),'bw'),
 S(bt(22),bt(23),'lion',9.30,(1.5,1.65),(0.45,0.30),'bw'),
 S(bt(23),bt(27),'src',35.10,(1.0,1.15),(0.55,0.55),'warm',bloom=0.6,zb=2),
 S(bt(27),bt(30),'src',38.00,(1.05,1.2),(0.47,0.42),'warm',bloom=0.6),
 S(bt(30),bt(32),'src',39.10,(2.2,2.5),(0.48,0.26),'bw',bloom=0.3,rgb=4),
 S(bt(32),bt(33),'lion',20.50,(1.8,2.1),(0.48,0.24),'red'),
 S(bt(33),bt(34),'src',23.40,(1.3,1.4),(0.55,0.40),'red'),
 S(bt(34),bt(35),'src',28.30,(1.3,1.4),(0.42,0.32),'bw'),
 S(bt(35),bt(37),'src',10.60,(1.0,1.08),(0.6,0.45),'warm',bloom=0.4),
 S(bt(37),bt(44),'src',40.10,(1.0,1.12),(0.5,0.42),'cold',bloom=0.7,lb=True),
 S(bt(44),bt(47),'src',52.00,(1.15,1.05),(0.5,0.42),'bw',bloom=0.4,zb=2),
 S(bt(47),bt(48),'src',48.20,(1.2,1.3),(0.5,0.45),'bw',bloom=0.8),
 S(bt(48),bt(49),'src',49.20,(1.2,1.35),(0.5,0.40),'warm',bloom=0.7),
 S(bt(49),bt(50),'src',9.70,(1.5,1.9),(0.5,0.33),'bw',rgb=5,zb=2),
 S(bt(50),bt(51),'src',22.80,(1.3,1.45),(0.5,0.40),'red'),
 S(bt(51),bt(52),'src',13.90,(1.3,1.45),(0.62,0.38),'bw'),
 S(bt(52),bt(54),'src',50.40,(1.35,1.15),(0.5,0.60),'warm',bloom=0.5,rgb=3),
 S(bt(54),bt(61),'src',56.77,(1.0,1.07),(0.5,0.45),'clean',grain=0.4,vig=0),
 S(bt(61),DUR+0.01,'none',0,(1,1),(0.5,0.5),'clean',kind='end'),
]
FLASH=[(3.29,2,'red',0.7),(bt(0),2,'white',1.0),(bt(4),1,'white',0.5),(bt(6),1,'white',0.4),(bt(12),2,'white',1.0),(bt(20),1,'white',0.8),
 (bt(22),1,'invert',1),(bt(23),1,'white',0.6),(bt(30),1,'white',1.0),(bt(32),1,'invert',1),(bt(44),1,'white',1.0),(bt(48),1,'invert',1),
 (bt(49),1,'white',0.8),(bt(52),1,'invert',1),(bt(54)-3/24,3,'whiteramp',1.0)]
SHAKE=[(bt(12),0.35,16),(bt(20),0.2,10),(bt(22),0.2,8),(bt(30),0.6,18),(bt(44),0.5,18),(bt(49),0.2,10),(bt(52),0.85,10)]

# ---------- assets ----------
HOOKG=[(0,(255,255,255)),(1,(178,180,186))]
A={}
def build_assets():
    A['regil']=text_layer('רגיל.','Rubik.ttf',230,grad=HOOKG,stroke=4,stroke_fill=(18,18,22),shadow=10)
    A['regilq']=text_layer('רגיל?','Rubik.ttf',190,grad=HOOKG,stroke=4,stroke_fill=(18,18,22),shadow=10)
    A['sub_s']=text_layer('ואז אני מרים את','Rubik.ttf',40,var=b'Medium',shadow=4)
    A['sub_b']=text_layer('העיניים','Rubik.ttf',96,shadow=6)
    for k,t,s in [('p1','לעבודה שלי',170),('p2','לכל פרט',200),('p3','שאני נוגע בו',130),('p4','לעוד צעד',190),('p5','בדרך',260),('p6','גם כשהגוף',170),('p7','כבר מבקש',170)]:
        A[k]=text_layer(t,'Rubik.ttf',s,shadow=8)
    A['p8']=text_layer('לעצור','Rubik.ttf',300,shadow=8,glow=14,glow_color=(220,20,30),glow_a=0.9)
    for k,t in [('q1','לתפילה'),('q2','שבה אני מודה'),('q3','על מה שיש'),('q4','ומבקש')]:
        A[k]=text_layer(t,'Rubik.ttf',64,var=b'Bold',shadow=6)
    A['k1']=text_layer('כוח','Rubik.ttf',560)
    A['k2']=text_layer('להמשיך','Rubik.ttf',360)
    A['f1']=text_layer('הרגע הזה','Rubik.ttf',100,fill=(12,12,14))
    A['f2']=text_layer('להתחיל.','Rubik.ttf',110,fill=(12,12,14))
    LOGO=Image.open(WD+'/brand/levik-production-logo.png').convert('RGBA')
    LOGO=LOGO.resize((int(LOGO.width*1.45),int(LOGO.height*1.45)),Image.LANCZOS)
    pad=60; L=Image.new('RGBA',(LOGO.width+2*pad,LOGO.height+2*pad),(0,0,0,0)); L.paste(LOGO,(pad,pad))
    g=L.getchannel('A').filter(ImageFilter.GaussianBlur(18)).point(lambda v:int(v*0.55)); G=Image.new('RGBA',L.size,(167,98,221,255)); G.putalpha(g)
    A['logo']=Image.alpha_composite(G,L)
    A['icon']=Image.open(WD+'/brand/lv-icon.png').convert('RGBA')
    A['t_top']=text_layer('לויק כהן','Rubik.ttf',44,var=b'Bold',shadow=6)
    A['wm1']=text_layer('LEVIK','Rubik.ttf',78,direction='ltr',shadow=6)
    A['wm2']=text_layer('MODE','Rubik.ttf',78,direction='ltr',shadow=6)
    A['tg1']=text_layer('LEVIK','Rubik.ttf',28,direction='ltr',shadow=3)
    A['tg2']=text_layer('MODE','Rubik.ttf',28,direction='ltr',shadow=3)
    A['end']=text_layer('LEVIK PRODUCTION  ·  לויק כהן','Rubik.ttf',30,var=b'Medium',fill=(15,15,15),direction=None)
    ic=A['icon']; A['end_icon']=ic.resize((84,int(84*ic.height/ic.width)),Image.LANCZOS)
    # brand glow: sky blue from the left, pink from the right (the logo's own gradient)
    yy_,xx_=np.mgrid[0:700,0:1000].astype(np.float32)
    def blob(cx,cy,r): return np.exp(-(((xx_-cx)/r)**2+((yy_-cy)/(r*0.8))**2))
    b1=blob(380,350,300); b2=blob(620,350,300)
    rgb=(np.array([92,167,232],np.float32)*b1[...,None]+np.array([224,110,237],np.float32)*b2[...,None])/np.maximum(1e-3,(b1+b2)[...,None])
    al=np.clip((b1+b2)*0.75,0,1)*255
    A['disc']=Image.fromarray(np.concatenate([rgb,al[...,None]],-1).astype(np.uint8),'RGBA')
    # rays in the brand colours
    R=Image.new('RGBA',(1800,1800),(0,0,0,0)); rd=ImageDraw.Draw(R); rr=np.random.default_rng(3)
    BRC=[(147,213,232),(92,167,232),(167,98,221),(243,136,238)]
    for i in range(26):
        a=rr.uniform(0,2*math.pi); l0=rr.uniform(120,260); l1=rr.uniform(600,900); wd=int(rr.uniform(3,14))
        col=BRC[i%4]+(int(rr.uniform(140,230)),) if i%3 else (255,255,255,int(rr.uniform(140,220)))
        rd.line((900+l0*math.cos(a),900+l0*math.sin(a),900+l1*math.cos(a),900+l1*math.sin(a)),fill=col,width=wd)
    A['rays']=R.filter(ImageFilter.GaussianBlur(3))

BRAND=[(147,213,232),(92,167,232),(167,98,221),(243,136,238)]
def pill(w,h,on,k):
    P=Image.new('RGBA',(w+40,h+40),(0,0,0,0))
    r=h//2; box=(20,20,20+w,20+h)
    m=Image.new('L',P.size,0); ImageDraw.Draw(m).rounded_rectangle(box,radius=r,fill=255)
    if on:
        xs=np.linspace(0,1,w); cols=np.stack([np.interp(xs,[0,0.36,0.68,1],[b[c] for b in BRAND]) for c in range(3)],-1)
        G=Image.new('RGBA',P.size,(0,0,0,0)); G.paste(Image.fromarray(np.repeat(cols[None],h,0).astype(np.uint8),'RGB'),(20,20)); G.putalpha(m)
        gl=Image.new('RGBA',P.size,(243,136,238,255)); gl.putalpha(m.filter(ImageFilter.GaussianBlur(12)).point(lambda v:int(v*0.7)))
        P=Image.alpha_composite(gl,G)
    else:
        ImageDraw.Draw(P).rounded_rectangle(box,radius=r,fill=(38,38,40,255),outline=(167,98,221,255),width=max(2,h//28))
    d=ImageDraw.Draw(P)
    kn=int(h*0.78); mm=(h-kn)//2
    x0=20+mm+int((w-kn-2*mm)*k); y0=20+mm
    d.rounded_rectangle((x0,y0,x0+kn,y0+kn),radius=kn//3,fill=(24,24,26,255))
    iw=int(kn*0.72); ic=A['icon'].resize((iw,int(iw*A['icon'].height/A['icon'].width)),Image.LANCZOS)
    P.alpha_composite(ic,(x0+(kn-ic.width)//2,y0+(kn-ic.height)//2))
    return P

TEXTS=[ # t0,t1,key,cx,cy,opts
 (2.30,bt(0),'regil',930,400,{}),
 (6.00,6.95,'regilq',900,520,{'angle':9}),
 (6.95,8.45,'sub_s',640,90,{'pop':False}),(7.79,8.45,'sub_b',640,165,{}),
 (8.95,9.90,'p1',760,250,{}),(10.29,10.93,'p2',640,330,{}),(10.93,11.85,'p3',640,570,{}),
 (13.30,13.92,'p4',640,300,{}),(13.92,14.75,'p5',640,330,{}),(14.82,15.62,'p6',640,290,{}),(15.62,bt(30),'p7',640,430,{}),
 (16.30,bt(32),'p8',640,360,{'shake':1}),
 (19.30,19.88,'q1',640,585,{'fade':4,'pop':False}),(19.92,20.60,'q2',640,585,{'fade':4,'pop':False}),(20.62,21.40,'q3',640,585,{'fade':4,'pop':False}),(21.72,bt(44),'q4',640,585,{'fade':3,'pop':False}),
 (bt(44),22.60,'k1',640,385,{'ko':1,'pop':False}),(22.60,23.12,'k2',640,375,{'ko':1,'pop':False}),
 (27.55,28.70,'f1',1040,360,{}),(28.79,bt(61),'f2',245,360,{}),
]

def seg_at(t):
    for s in SEGS:
        if s['t0']<=t<s['t1']: return s
    return SEGS[-1]

def shake_at(t):
    dx=dy=0.0; amp=0.0
    for (ts,d,a) in SHAKE:
        if ts<=t<ts+d:
            e=(1-(t-ts)/d)**2*a; amp=max(amp,e)
    if amp>0:
        r=np.random.default_rng(int(t*1000)); dx,dy=r.uniform(-1,1,2)*amp
    return dx,dy,amp

def ease(u): return 1-(1-u)**2

def render_frame(i,get_src,state):
    t=i/FPS; s=seg_at(t); u=(t-s['t0'])/max(1e-6,(s['t1']-s['t0'])); kind=s.get('kind','')
    dx,dy,amp=shake_at(t)
    if kind=='end':
        fr=np.ones((H,W,3),np.float32)
        a=min(1.0,(t-s['t0'])*FPS/8); paste(fr,A['end_icon'],640,300,alpha=a); paste(fr,A['end'],640,372,alpha=a)
        return fr
    img=get_src(s,t)
    z=s['z'][0]+(s['z'][1]-s['z'][0])*ease(u); cx,cy=s['c']
    zb=s.get('zb',0); fi=int(round((t-s['t0'])*FPS)); nseg=int(round((s['t1']-s['t0'])*FPS))
    if (zb and fi<zb) or (s.get('zbend') and nseg-fi<=s['zbend']):
        acc=None
        for q in (1.0,1.05,1.10,1.16):
            a=np.asarray(xform(img,z*q,cx,cy,dx,dy),dtype=np.float32)
            acc=a if acc is None else acc+a
        fr=acc/(4*255.0)
    else:
        fr=np.asarray(xform(img,z,cx,cy,dx,dy),dtype=np.float32)/255.0
    if kind=='title':
        fr=np.asarray(Image.fromarray((fr*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(4)),dtype=np.float32)/255.0
    fr=grade(fr,s['g'])
    if s.get('dim'): fr=fr*s['dim']
    if kind=='title': fr=rgbsplit(fr*0.5,8)
    fr=bloom(fr,s.get('bloom',0))
    rk=s.get('rgb',0)+amp*0.45
    if rk>=1: fr=rgbsplit(fr,rk)
    if s.get('wipe') and fi<s['wipe'] and state.get('prev') is not None:
        pv=grade(state['prev'],'red')*0.8; cut=int(W*0.42); fr[:,:cut]=pv[:,:cut]
    gs=s.get('grain',1.0)
    fr=fr+GRAIN[i%6][...,None]*0.07*gs
    if s.get('vig',1): fr=fr*VIG
    if s.get('lb'):
        bar=int(92*min(1,(t-s['t0'])*FPS/6)); 
        if bar>0: fr[:bar]=0; fr[H-bar:]=0
    # overlays
    if kind=='title':
        tt=t-s['t0']
        paste(fr,A['disc'],640,330,scale=1.0+0.02*math.sin(tt*9))
        Rr=A['rays'].rotate(-tt*14,resample=Image.BILINEAR); paste(fr,Rr,640,330,alpha=0.85)
        sc_=1.28-0.28*ease(min(1,tt/0.18)); jit=(np.random.default_rng(i).uniform(-3,3,2) if tt>1.2 else (0,0))
        paste(fr,A['logo'],640+jit[0],350+jit[1],scale=sc_)
        paste(fr,A['t_top'],640,150,alpha=min(1,tt/0.15))
    if kind=='toggle':
        on=t>=5.53; k=min(1,max(0,(t-5.53)/0.125))
        paste(fr,pill(300,150,on,k),470,360)
        a=1.0 if on else 0.35
        paste(fr,A['wm1'],800,322,alpha=a); paste(fr,A['wm2'],795,398,alpha=a)
    if bt(12)<=t<bt(20):
        paste(fr,pill(104,52,True,1.0),92,62)
        paste(fr,A['tg1'],80,118); paste(fr,A['tg2'],80,146)
    # texts
    for (a0,a1,key,tx,ty,o) in TEXTS:
        if a0<=t<a1:
            L=A[key]; el=(t-a0)*FPS; sc_=1.0; al=1.0
            if o.get('pop',True) and not o.get('ko'): sc_=1.0+0.16*max(0,1-el/3)
            if o.get('fade'):
                al=min(1,el/o['fade'],(a1-t)*FPS/o['fade'])
            sx,sy=(dx*0.6,dy*0.6) if o.get('shake') else (0,0)
            if o.get('ko'):
                bwf=grade(fr,'bw'); m=mask_full(L,tx,ty,1.0+0.05*(el/12))
                fr=1.0*(1-m)+bwf*m
            else:
                paste(fr,L,tx+sx,ty+sy,scale=sc_,alpha=al,angle=o.get('angle',0))
    # flashes
    for (ts,n,kd,st) in FLASH:
        fi2=int(round((t-ts)*FPS))
        if 0<=fi2<n:
            if kd=='white': a=st*(1-fi2/max(1,n))**0.5 if n>1 else st; fr=fr*(1-a)+a
            elif kd=='red': a=st*(0.6 if fi2==0 else 1.0); fr=fr*(1-a)+np.array([0.95,0.08,0.1],np.float32)*a
            elif kd=='invert': fr=1-fr
            elif kd=='whiteramp': a=(fi2+1)/n; fr=fr*(1-a)+a
    return np.clip(fr,0,1)

def make_get_src(test):
    cache={}
    def get_src(s,t):
        if s['src']=='still':
            key=('still',s['s0'])
            if key not in cache:
                r=Reader('src',s['s0']); cache[key]=r.get(0); r.close()
            return cache[key]
        st=s['s0']+(t-s['t0'])
        if test:
            r=Reader(s['src'],st); im=r.get(0); r.close(); return im
        key=id(s)
        if key not in cache:
            for k in list(cache):
                if isinstance(cache[k],Reader): cache[k].close(); del cache[k]
            j0=int(round((t-s['t0'])*FPS))
            cache[key]=Reader(s['src'],s['s0']+j0/FPS); cache[('off',key)]=j0
        j=int(round((t-s['t0'])*FPS))-cache[('off',key)]
        return cache[key].get(j)
    return get_src

def run(out,times=None,rng_=None):
    build_assets()
    test=times is not None
    frames=[int(round(x*FPS)) for x in times] if test else (list(range(rng_[0],min(NF,rng_[1]))) if rng_ else list(range(NF)))
    rate='4' if test else str(FPS)
    enc=subprocess.Popen([FF,'-v','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',rate,'-i','-','-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',out],stdin=subprocess.PIPE)
    gs=make_get_src(test); state={'prev':None}; cur=None
    import time; t0=time.time()
    for n,i in enumerate(frames):
        s=seg_at(i/FPS)
        fr=render_frame(i,gs,state)
        if not test:
            if cur is not s: cur=s
            nxt=seg_at((i+1)/FPS)
            if nxt is not s: state['prev']=fr.copy()
        enc.stdin.write((fr*255+0.5).astype(np.uint8).tobytes())
        if n%48==0:
            with open(WD+'/progress.txt','w') as pf: pf.write(f'{n}/{len(frames)} {time.time()-t0:.1f}s\n')
    enc.stdin.close(); enc.wait()
    with open(WD+'/progress.txt','w') as pf: pf.write(f'DONE {len(frames)} {time.time()-t0:.1f}s\n')

if __name__=='__main__':
    if len(sys.argv)>3 and sys.argv[2]=='range': run(sys.argv[1],None,(int(sys.argv[3]),int(sys.argv[4])))
    elif len(sys.argv)>2: run(sys.argv[1],[float(x) for x in sys.argv[2].split(',')])
    else: run(sys.argv[1])
