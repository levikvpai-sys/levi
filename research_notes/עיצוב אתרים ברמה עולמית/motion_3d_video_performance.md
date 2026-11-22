# Motion, 3D and Video Performance for a Static Video-Heavy Studio Site (LEVIK Production, 2026)

> Research method note: this session's network blocked direct page fetches of gsap.com, web.dev and vercel.com, so the pages could not be opened and read in full. Findings below come from web-search result extracts of those pages (and of mirrors and third-party guides). Everything with a primary-source URL was seen only as a search extract. The report writer should treat exact numbers as "verify before publishing". Code and ffmpeg recipes in the Inferences sections are practitioner recommendations built on the cited facts. They are not quotations.
>
> Project context: a hero "video wall" of 9–12 muted autoplay clips, 8–12 portfolio films, Hebrew RTL, mobile-first, plain HTML/CSS/JS on Vercel, Blender for 3D.

---

## 1. Motion: GSAP (ScrollTrigger, SplitText), Lenis, View Transitions, CSS scroll-driven animations, tasteful motion, prefers-reduced-motion

### Takeaway
GSAP is now 100% free, including every former "Club" plugin (SplitText, MorphSVG and the rest), even for commercial use. This changed with GSAP 3.13 in spring 2025, after Webflow's involvement. The 2026 stack for a static site is GSAP + ScrollTrigger + SplitText, plus optional Lenis wired into the GSAP ticker. For page-to-page polish there are native cross-document View Transitions. For simple reveals, CSS scroll-driven animations now work in all major engines (Baseline "newly available" as of late 2026). Every layer must respect `prefers-reduced-motion`.

### Cited Findings
- **GSAP is free (verified, changed 2025).** Webflow's announcement says Webflow "makes GSAP 100% free for the web community". It also lists 14 new SplitText features, and says all GSAP plugins are now hosted in Webflow. — [Webflow blog](https://webflow.com/blog/gsap-becomes-free)
- The GSAP 3.13 release notes say the bonus plugins "like SplitText, MorphSVG, and all the others that were previously Club-only, are now free, even for commercial use". All of them were added to the main GitHub repo and the `gsap` npm package. Club members were asked to move off the private repo by June 1, 2025. — [GSAP 3.13 blog](https://gsap.com/blog/3-13/)
- SplitText was rewritten in 3.13. Some rarely used features were removed or changed to make it more efficient, so old SplitText code may break. — [GSAP 3.13 blog](https://gsap.com/blog/3-13/)
- `gsap-trial` is deprecated. The jsDelivr README states "GSAP-TRIAL IS DEPRECATED". — [jsDelivr gsap-trial README](https://cdn.jsdelivr.net/npm/gsap-trial@3.13.0/README.md)
- There is a GSAP 3.15 README on jsDelivr. One search extract said it still mentions excluding "members-only" plugins from an "all" export. This is probably leftover text, and it conflicts with "everything is free". — [jsDelivr gsap@3.15.0 README](https://cdn.jsdelivr.net/npm/gsap@3.15.0/README.md)
- Several third-party pages describe the change as following a "Webflow acquisition" of GSAP. I did not confirm this wording on a primary page in this session. — [Webflow community post](https://community.webflow.com/updates/post/webflow-makes-gsap-100-free-fugRRt8eUL1we1k)
- Codrops published "From SplitText to MorphSVG: 5 Creative Demos Using Free GSAP Plugins". These are reference demos for the newly free plugins. — [Codrops](https://tympanus.net/codrops/?p=93244)
- **Lenis + reduced motion.** A mirror of the official Lenis docs says Lenis automatically honors `prefers-reduced-motion` by disabling smoothing (lerp forced to 1). — [Lenis docs mirror (Algolia DocSearch)](https://docsearch.algolia.com/mcp/docs/repo/darkroomengineering/lenis)
- **Lenis + ScrollTrigger wiring.** The same docs say to call `ScrollTrigger.update` on every Lenis `scroll` event, add `lenis.raf` to `gsap.ticker`, and disable GSAP lag smoothing (`gsap.ticker.lagSmoothing(0)`). Lenis 1.3.x is current on npm. — [Lenis docs mirror](https://docsearch.algolia.com/mcp/docs/repo/darkroomengineering/lenis); [lenis@1.3.18 README](https://cdn.jsdelivr.net/npm/lenis@1.3.18/README.md)
- A React-focused skill says to set `autoRaf: false` when GSAP drives the RAF loop. — [skillsmp Lenis React](https://skillsmp.com/creators/12-studio/tackl/skills-lenis-react)
- A community template warns that Lenis can desync DOM `scrollTop` from the visual scroll position, so screen readers may jump to the wrong place. — [learnwithhasan Lenis](https://learnwithhasan.com/js-libraries/lenis/)
- **CSS scroll-driven animations are cross-browser (changed 2025–2026).** Apple's WWDC 2025 session "What's new in Safari and WebKit" covers scroll-driven animations (including `view()` timelines) and cross-document view transitions. — [Apple WWDC25 session 233](https://developer.apple.com/videos/play/wwdc2025/233/)
- A search summary attributed these to "Safari 19". Apple renumbered its releases to Safari 26 in 2025, so the shipping version is most likely Safari 26 (fall 2025). Verify on MDN. — [Apple WWDC25 session 233](https://developer.apple.com/videos/play/wwdc2025/233/)
- web.dev "New to the web platform in October [2026]" reports that Firefox 159 enables scroll-driven animations by default. With that, the feature is Baseline "Newly available". — [web.dev blog, Oct 2026](https://web.dev/blog/web-platform-10-2026)
- Older blog posts disagree. One claims Firefox 133 shipped the feature; another says it was still behind a flag and on the Interop 2026 list. The October 2026 web.dev post supersedes both. — [buildmvpfast](https://www.buildmvpfast.com/blog/css-scroll-driven-animations-replace-js-2026); [drweb.de](https://www.drweb.de/css-scroll-animationen-ohne-javascript/); [web.dev Oct 2026](https://web.dev/blog/web-platform-10-2026)
- A Mozilla community thread reported `view()` timelines not triggering reliably in Firefox in earlier versions. — [Mozilla support](https://support.mozilla.org/ln/questions/1520788)
- **View Transitions.** One 2026 blog says the same-document View Transitions API reached Firefox (it cites v130), with cross-document transitions following in all three engines. Safari's cross-document support is covered in the WWDC25 session. — [codercops 2026](https://blog.codercops.com/blog/css-view-transitions-scroll-animations-2026); [Apple WWDC25](https://developer.apple.com/videos/play/wwdc2025/233/)
- Webflow forum users report that GSAP plugins enabled in Webflow load on all pages, even pages that don't use them. This is a reminder to load plugins only where needed. — [Webflow discourse](https://discourse.webflow.com/t/webflow-makes-gsap-100-free/319967)

### Inferences
- **Recommended motion stack for LEVIK (static, no bundler needed):**
  - `gsap` + `ScrollTrigger` + `SplitText` from the npm package or a CDN pinned to an exact version (for example 3.13+). Load SplitText only on pages with display headlines.
  - Use Lenis only on desktop, and only if the "cinematic" feel is wanted. Skip it on touch devices, where native momentum scrolling is better, and when `prefers-reduced-motion: reduce` matches.
  - Use CSS `@view-transition { navigation: auto; }` for MPA page transitions between the home page and film pages, with zero JS.
  - Use CSS `animation-timeline: view()` for simple fade/translate reveals, so they cost no main-thread JS. Keep GSAP for the single orchestrated hero moment.
- **Lenis + GSAP wiring (static site):**
  ```js
  import Lenis from 'lenis'; import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  if (!reduce && fine) {
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  ```
- **One orchestrated moment versus scattered effects.** Award-level studio sites typically have one signature sequence, for example the hero video wall assembling with a SplitText headline, and then restrained, consistent reveals elsewhere. The following are common practitioner heuristics, not sourced in this session (see Gaps):
  - UI micro-interactions: 150–250 ms.
  - Reveals: 400–800 ms.
  - Hero sequence: about 1.2–2 s total.
  - Easing: ease-out for entrances (`power3.out` / `expo.out`), ease-in-out for scrubbed motion.
  - Stagger: 40–80 ms per item, for example across the 9–12 wall tiles.
- **RTL.** SplitText by words and lines works on Hebrew. Avoid splitting into characters, because it breaks ligatures and niqqud and gives poor results for RTL shaping. Horizontal offsets should be mirrored: use `x: 40` for "enter from the left" in LTR and `x: -40` in RTL, or use logical properties in CSS. The ScrollTrigger horizontal-scroll sections need `direction: rtl` testing.
- **SplitText accessibility.** The 3.13 rewrite reportedly added aria handling, masking and auto re-split options (Webflow mentions "14 new features"). Keep the original text accessible, either with an `aria-label` on the parent or by relying on SplitText's built-in aria option.
- **Reduced motion.** Use `gsap.matchMedia()` with `(prefers-reduced-motion: no-preference)` to create animations only when motion is allowed. Under `reduce`:
  - render final states;
  - swap the autoplaying wall for posters plus a play button;
  - disable View Transitions with `@media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation: none; } }`.

### Gaps
- I could not open gsap.com directly, so the exact 3.13 release date (about late April or May 2025), the exact license text and any restrictions (for example on building Webflow competitors) are unverified.
- I found no authoritative source in this session for specific "tasteful motion" durations and easings. The numbers above are common practitioner heuristics and should be labelled as such.
- The exact Safari version that shipped scroll-driven animations (26.0 versus a point release) and the exact Firefox version for cross-document View Transitions were not confirmed on MDN.

---

## 2. 3D on the web: Three.js / R3F / Spline / shaders, Blender → web workflow, realtime 3D versus pre-rendered video

### Takeaway
For a video-first film studio, render Blender scenes to video loops or image sequences by default. Use realtime Three.js only for one interactive centerpiece, such as a logo or object the user can rotate, or a shader effect on the video wall. When realtime is used, export glTF/GLB from Blender and compress it with `gltf-transform` (Meshopt geometry + KTX2 textures, about 1024 px). Bake the lighting.

### Cited Findings
- A 2026 asset-pipeline guide recommends `gltf-transform optimize` with `--compress meshopt --texture-compress ktx2`, plus `--texture-size 1024` for smaller textures. It cites the current tool versions gltf-transform v4+, meshoptimizer v0.21+, Basis Universal v1.16+ and Blender 4.2+. — [Cinevva: optimize GLB for web](https://app.cinevva.com/guides/optimize-glb-for-web)
- **Draco versus Meshopt.** Draco compresses only triangle-mesh geometry; animation, morph targets, points and lines pass through uncompressed. Meshopt suits animated assets. Draco can produce slightly smaller files, but it decodes more slowly, and its decoder is described as about 10× larger. — [Cinevva guide](https://app.cinevva.com/guides/optimize-glb-for-web); [threejs-asset-pipeline skill](https://www.ui-skills.com/skills/cloudai-x/threejs-asset-pipeline)
- In gltf-transform, `--texture-compress` defaults to "auto", which recompresses textures in their original format. Set it explicitly. — [Cinevva guide](https://app.cinevva.com/guides/optimize-glb-for-web)
- Three.js needs a matching decoder for each codec: `DRACOLoader` for Draco, `MeshoptDecoder` for Meshopt, `KTX2Loader` (Basis transcoder) for KTX2. — [threejs-asset-pipeline skill](https://www.ui-skills.com/skills/cloudai-x/threejs-asset-pipeline)
- Don't mix gltfpack Meshopt output with gltf-transform Draco on the same asset, because the formats are incompatible. — [skills.sh model optimizer](https://skills.sh/openaec-foundation/three.js-claude-skill-package/threejs-agents-model-optimizer)
- Blender-side advice from one pipeline guide: apply scale or transforms before export, pack textures, then run gltf-transform for compression. — [asset-pipeline-3d skill](https://skills.cat/skills/anthemflynn/dwc/asset-pipeline-3d)

### Inferences
- **Decision rule, realtime versus pre-rendered**, for an AI film studio whose product is moving images:
  - **Pre-rendered** (Blender → Cycles or EEVEE → ProRes or PNG sequence → encode with the section 3 recipes) when:
    - the 3D is decorative;
    - it needs cinematic lighting, volumetrics or depth of field;
    - it must look identical on every phone;
    - it would otherwise add more than about 1 MB of JS and GLB.
    - Performance cost: one H.264/AV1 loop of about 1–2 MB. No GPU risk, no JS parse cost.
  - **Realtime** (Three.js) only if interaction is the point, for example the visitor rotates a 3D LEVIK logo or camera, or there is a cursor-reactive shader distortion over the video wall. Rough budget for one hero 3D object on mobile (practitioner heuristic, not sourced here):
    - GLB under about 1–2 MB after compression;
    - under about 100k triangles;
    - 1–2 textures at 1024² KTX2;
    - three.js core about 150 KB gzip, plus decoders;
    - initialise lazily after LCP;
    - pause the render loop when off-screen (IntersectionObserver) or when the tab is hidden.
  - **Scroll-scrubbed "3D"** (an Apple-style turntable) can be faked with a pre-rendered image sequence (60–120 WebP or AVIF frames drawn to `<canvas>`) or a video scrubbed by `currentTime`. This is often lighter and more reliable than realtime.
- **Tools.**
  - Plain Three.js suits a no-framework static site.
  - React Three Fiber only makes sense if the site moves to React.
  - Spline is fast to author, but its runtime and scene files are heavy. Use it only for prototypes or a single embed, and test mobile performance.
  - Custom WebGL fragment shaders are cheap and high-impact: an RGB-shift or displacement hover on film thumbnails, or a "film grain" overlay. Libraries like OGL, or a single full-screen quad in Three.js, keep the cost small.
- **Blender export checklist.**
  - File › Export › glTF 2.0 (.glb).
  - Apply modifiers, +Y up, selected objects only.
  - Bake lighting and AO into the base colour (Cycles Bake) so the web scene can use unlit or `MeshBasicMaterial` and needs no realtime lights.
  - Keep textures power-of-two.
  - Then run: `npx @gltf-transform/cli optimize in.glb out.glb --compress meshopt --texture-compress ktx2 --texture-size 1024`
  - Serve with long cache headers.

### Gaps
- I could not read Blender's own glTF exporter docs, so the exact option names in Blender 4.x/5.x and whether Draco is built into the exporter are unverified in this session. (From general knowledge, the exporter has a built-in Draco "Compression" option.)
- I found no authoritative published performance budget (triangles or MB) for mobile WebGL in this session.
- I found no sourced data on Spline runtime size.

---

## 3. Heavy video performance: codecs, bitrates, sizes, posters, preload, IntersectionObserver, streaming services versus Vercel, iOS rules

### Takeaway
For short muted hero loops, self-hosted progressive MP4 is fine:
- Use H.264 as the universal fallback, with an AV1 version in front for capable browsers.
- Target about 0.5–1.5 MB per clip at mobile resolution.
- Use `muted playsinline autoplay loop`, `preload="none"` or `"metadata"`, posters, and IntersectionObserver play/pause.
- Never autoplay all 12 tiles at full resolution on mobile.

Full portfolio films (minutes long, watched with sound) belong on an adaptive-streaming service: Cloudflare Stream, Mux or Bunny Stream. On Vercel, Hobby is non-commercial only and Pro includes 1 TB of transfer, billed at about $0.15 per GB beyond that.

### Cited Findings
**Encoding**
- CRF scales differ by codec: H.264 runs 0–51 and AV1 runs 0–63. Approximate equivalence: H.264 CRF 23 ≈ AV1 CRF about 33. — [Evil Martians: Better web video with AV1](https://dev.to/evilmartians/better-web-video-with-av1-codec-52kd)
- For H.264 web delivery, CRF 25–27 is suggested, and each +6 CRF roughly halves file size. — [ffmpeg-micro CRF explained](https://www.ffmpeg-micro.com/blog/ffmpeg-crf-explained)
- AV1 example settings: `libsvtav1 -crf 35 -preset 6`, or `libaom-av1 -crf 30 -b:v 0`. — [FFmpeg cookbook AV1](https://ffmpeg-cookbook.com/en/articles/av1-encode/)
- A hero-video guide targets about 1–1.5 MB at 1024×576, 24 fps, no audio, using `libx264 -crf 28 -preset slow -an`. — [konadu.dev video hero without killing LCP](https://konadu.dev/video-hero-section-without-killing-lcp)
- Another guide scales hero video to 1280 px wide with CRF 26, preset slow. It explains that `-movflags +faststart` moves the MP4 index (moov atom) to the front so playback can start before the whole file downloads. — [DEV: hero video is 10× heavier than needed](https://dev.to/mauberme/your-hero-video-is-probably-10x-heavier-than-it-needs-to-be-and-how-to-fix-it-without-installing-1h87)

**AV1 support on Apple devices**
- Safari decodes AV1 only on devices with hardware AV1 decode. That means iPhone 15 Pro and Pro Max (A17 Pro), the iPhone 16 family (A18), and M3-and-later Macs.
- M1 and M2 Macs, Intel Macs and older iPhones cannot play AV1 in Safari, so an H.264 (or HEVC) fallback is mandatory.
- Sources: [Bitmovin: Apple AV1 support](https://bitmovin.com/apple-av1-support); [Bitmovin AV1 playback support](https://bitmovin.com/av1-playback-support/); [Apple developer forums](https://developer.apple.com/forums/thread/739953)

**Loading and LCP**
- Video elements with `autoplay` begin downloading immediately, even when they are outside the initial viewport. — [web.dev Learn Performance: video](https://web.dev/learn/performance/video-performance)
- Since Chrome 116 (Aug 2023), a `<video>` can be an LCP candidate. Its timestamp is the first frame painted, or the poster if one is set. The poster render usually counts, and the video replacing the poster does not normally trigger a new LCP. Older web.dev wording that "videos without poster are not considered" is outdated. — [Chromium LCP changelog 2023_08](https://chromium.googlesource.com/chromium/src/+/main/docs/speed/metrics_changelog/2023_08_lcp.md); [Chrome speed-metrics announcement](https://groups.google.com/a/chromium.org/g/speed-metrics-announce/c/TeyEcSbnVio); [DebugBear: optimize video LCP](https://www.debugbear.com/blog/optimize-video-lcp)
- If the video is the LCP element, the poster should be correct and appear early. If it isn't, preloading the poster competes with more critical resources. — [DebugBear](https://www.debugbear.com/blog/optimize-video-lcp)

**iOS autoplay and Low Power Mode**
- Muted `autoplay` video does not autoplay in iOS Low Power Mode. Safari instead shows a play-button overlay, even for `<video muted autoplay playsinline>`. This is tracked in WebKit bugs 216887 ("Low Power mode is disabling video autoplay") and 219889 (play button overlay in Low Power Mode). — [WebKit Bugzilla 216887](https://bugs.webkit.org/show_bug.cgi?id=216887); [WebKit Bugzilla 219889](https://bugs.webkit.org/show_bug.cgi?id=219889)
- Veriff's docs describe this as intentional WebKit behaviour to save battery, with "no reliable workarounds" to hide the controls. — [Veriff known issues](https://devdocs.veriff.com/docs/known-issues)
- User-initiated playback still works in Low Power Mode. Only autoplay without a user gesture is blocked. — [Webflow forum](https://discourse.webflow.com/t/autoplay-video-not-playing-on-low-power-mode/215057)
- The common mitigation is to catch the rejected `video.play()` promise and fall back to the poster, an animated WebP, or a custom play UI. — [lesniakrafal: autoplay in low power mode](https://lesniakrafal.pages.dev/en/article/how-to-enable-autoplay-video-in-low-power-mode-on-ios-and-macos)
- These sources date from 2020–2023. I found no 2025–2026 Apple documentation confirming or changing the behaviour, so test on current iOS.

**Streaming services (secondary sources; verify on vendor pages)**
- **Mux:** a free tier of 100,000 delivered minutes per month is reported. After that, delivery costs about $0.0008/min at 720p and about $0.001/min at 1080p. Storage is about $0.0024 per minute-month (720p). Basic encoding is free. — [apicostcalc Mux vs Cloudflare vs Bunny](https://apicostcalc.com/mux-vs-cloudflare-stream-vs-bunny-stream-cost-calculator.html); [mintec 2026 comparison](https://mintec.co/blog/video-hosting-platform-comparison-2026/)
- **Cloudflare Stream:** $5 per 1,000 minutes stored and $1 per 1,000 minutes delivered. Encoding and ingest are free, bandwidth is included, and there is reportedly no free tier. — [buildmvpfast Cloudflare Stream alternatives](https://www.buildmvpfast.com/alternatives/cloudflare-stream); [apicostcalc](https://apicostcalc.com/mux-vs-cloudflare-stream-vs-bunny-stream-cost-calculator.html)
- **Bunny Stream:** CDN delivery is billed per GB (from about $0.005/GB). Standard H.264 encoding up to 1080p is free, and premium encoding is $0.025–0.15/min. It is usually the cheapest at volume. — [Swarmify Bunny Stream review](https://swarmify.com/blog/bunny-stream-review/); [forasoft 2026 server cost](https://www.forasoft.com/blog/article/how-to-estimate-the-server-cost-for-a-video-platform-249)
- One comparison lists Bunny per-minute figures that conflict with its per-GB model, so treat the numbers as approximate. — [apicostcalc](https://apicostcalc.com/mux-vs-cloudflare-stream-vs-bunny-stream-cost-calculator.html)

**Vercel**
- The Hobby plan is restricted to non-commercial personal use; commercial use needs Pro or Enterprise. — [Vercel fair use policy](https://vercel.com/docs/limits/fair-use-guidelines); [Vercel Hobby plan docs](https://vercel.com/docs/plans/hobby-plan)
- Fast Data Transfer is 100 GB/month on Hobby and 1 TB/month on Pro. — [Vercel limits](https://docs.vercel.com/docs/limits)
- Pro costs $20 per seat per month. Overage is $0.15/GB to $0.35/GB depending on the region where requests originate. — [Vercel regional pricing](https://vercel.com/docs/pricing/regional-pricing.md); [Vercel pricing](https://vercel.com/pricing); [schematichq Vercel pricing](https://schematichq.com/blog/vercel-pricing)
- Fast Origin Transfer is a separate meter (from $0.06/GB after the included allowance). — [Vercel pricing docs](https://vercel.com/docs/pricing)
- I found no video-specific carve-out in Vercel's fair-use pages. Video served from `/public` is billed as ordinary Fast Data Transfer. — [Vercel fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines)

### Inferences
- **Budget math for LEVIK.** One home-page visit on mobile that autoplays 6 visible tiles of about 0.8 MB each, plus posters, comes to about 5–6 MB. 10,000 mobile visits ≈ 55 GB. On desktop with 12 tiles of about 1.5 MB each, about 18 MB per visit, 10,000 visits ≈ 180 GB.
  - This fits comfortably within Pro's 1 TB, which is about 55k–180k home-page visits per month. Overage costs about $0.15–0.35/GB.
  - The full films are the danger. A 3-minute 1080p film at about 5 Mbps is about 110 MB per view, so 1,000 views ≈ 110 GB. That is why films belong on a streaming service.
  - Cloudflare Stream for 12 films of 3 min each costs about $0.18/month in storage, plus $1 per 1,000 minutes watched. This is much cheaper than Vercel overage and gives HLS adaptive bitrate.
- **Recommended split.**
  - Hero-wall loops: self-host on Vercel, or on Bunny CDN storage for cheaper GB. Serve progressive MP4/WebM, which needs no HLS.js.
  - Portfolio films: Cloudflare Stream (simplest pricing, iframe or HLS) or Mux (best developer experience and analytics; free tier of 100k min). Bunny Stream if cost is the priority.
  - Vimeo Pro or Business is an acceptable alternative if the owner already pays for it. I did not price it in this session.
- **Hero-wall clip spec (recommendation):**
  - 4–8 s seamless loop, no audio track (`-an`), 24 fps.
  - Mobile: 480–540 px on the short side. With 2–3 columns, each tile is about 200–400 CSS px, so 540p is plenty even at DPR 3 for a cropped tile.
  - Desktop: 720p per tile. Only the one "featured" tile is 1080p.
  - Size targets: about 300–800 KB per mobile clip and about 0.8–1.5 MB per desktop clip.
  - Total initial video transfer: under about 5 MB on mobile and under about 12 MB on desktop.
- **ffmpeg recipes:**
  ```bash
  # H.264 MP4 fallback (universal), mobile tile 540p
  ffmpeg -i in.mov -an -vf "scale=-2:540:flags=lanczos,fps=24" -c:v libx264 -preset slow -crf 27 \
    -profile:v high -pix_fmt yuv420p -movflags +faststart -g 48 tile_540.mp4
  # AV1 in MP4 or WebM (Chrome/Edge/Firefox/Android + iPhone 15 Pro+/M3+ Safari), ~30–50% smaller
  ffmpeg -i in.mov -an -vf "scale=-2:540,fps=24" -c:v libsvtav1 -preset 6 -crf 38 -pix_fmt yuv420p10le \
    -svtav1-params tune=0 -movflags +faststart tile_540.av1.mp4
  # Optional VP9 WebM (older Android/Chromium without AV1)
  ffmpeg -i in.mov -an -vf "scale=-2:540,fps=24" -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 tile_540.webm
  # Poster from the first frame (AVIF + WebP)
  ffmpeg -i tile_540.mp4 -frames:v 1 -q:v 2 poster.png && avifenc -q 50 poster.png poster.avif && cwebp -q 75 poster.png -o poster.webp
  ```
  - Use `-g` (a GOP of about 2 s) and a loop whose first and last frames match, to avoid a visible jump.
  - HandBrake equivalent: Web preset "Vimeo YouTube 720p30" or "Creator 720p", turn on "Web Optimized" (= faststart), remove the audio track, and use RF 26–28.
  - HEVC: optional. It is mainly useful for alpha-channel video on Safari (HEVC with alpha). Otherwise AV1 + H.264 covers everyone.
- **Markup pattern:**
  ```html
  <video class="tile" muted playsinline loop preload="none" poster="/v/01.avif"
         width="540" height="960" aria-hidden="true" disablepictureinpicture>
    <source src="/v/01.av1.mp4" type='video/mp4; codecs="av01.0.05M.08"'>
    <source src="/v/01.mp4"     type='video/mp4; codecs="avc1.640028"'>
  </video>
  ```
  - Don't put the `autoplay` attribute on all tiles. Let JS start only visible tiles.
  - Give the first 1–2 above-the-fold tiles `preload="metadata"` plus `fetchpriority="high"` on their poster image if they are the LCP element.
- **JS controller.** IntersectionObserver play/pause, limited concurrency, and handling of Low Power Mode, data saver, reduced motion and tab visibility:
  ```js
  const saveData = navigator.connection?.saveData;
  const slow = /(^|-)2g$/.test(navigator.connection?.effectiveType || '');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const allowAuto = !(saveData || slow || reduce);
  const MAX_PLAYING = matchMedia('(max-width: 768px)').matches ? 4 : 9;
  const playing = new Set();
  const io = new IntersectionObserver(entries => {
    for (const e of entries) {
      const v = e.target;
      if (e.isIntersecting && allowAuto && playing.size < MAX_PLAYING) {
        if (v.preload === 'none') v.preload = 'auto';
        v.play().then(() => playing.add(v))
          .catch(() => v.classList.add('show-poster')); // Low Power Mode / blocked → keep poster
      } else { v.pause(); playing.delete(v); }
    }
  }, { rootMargin: '200px 0px', threshold: 0.25 });
  document.querySelectorAll('video.tile').forEach(v => io.observe(v));
  document.addEventListener('visibilitychange', () =>
    document.hidden && document.querySelectorAll('video.tile').forEach(v => v.pause()));
  ```
  - On mobile, a strong alternative to 9–12 simultaneous decodes is a single pre-composited "wall" video. Edit the grid into one 1080×1920 (or 720×1280) clip in DaVinci or Blender, about 2–3 MB. One decoder, one request, perfect sync.
  - Keep individual tiles for desktop hover interactions.
- **iOS specifics.** `muted` + `playsinline` are mandatory, and set `video.muted = true` in JS too. Expect posters in Low Power Mode, so design the poster grid to look intentional (a still "contact sheet") rather than broken. Hide the native play overlay where possible, and offer a single "▶ הפעל" (Play) button that starts all tiles on a user gesture.

### Gaps
- I could not verify Mux, Cloudflare Stream or Bunny prices on the vendors' own pricing pages (network-blocked). The figures come from 2026 secondary comparison sites and should be re-checked.
- I found no current (2025–2026) Apple documentation on Low Power Mode autoplay. The evidence is WebKit bugs and developer reports.
- I found no source on whether iOS limits the number of simultaneously playing inline videos. The device-decoder limits for 9–12 simultaneous decodes on mid-range Android are unverified, and real-device testing is needed.
- Vimeo pricing was not researched.
- Current HEVC browser support (Chrome/Edge hardware HEVC) was not confirmed in this session.

---

## 4. Core Web Vitals targets for video-heavy sites; balancing spectacle with speed

### Takeaway
The targets are the same for every site, measured at the 75th percentile of real visits, separately for mobile and desktop:
- LCP ≤ 2.5 s
- INP ≤ 200 ms
- CLS ≤ 0.1

On a video wall, the LCP element is usually a poster or the first video frame. Win by serving a small, early AVIF poster, reserving every tile's space to prevent CLS, and keeping GSAP, Three.js and video-control JS off the critical path to protect INP.

### Cited Findings
- "Good" thresholds: INP ≤ 200 ms and CLS ≤ 0.1, assessed at the 75th percentile of all visits. A page passes when all three metrics are "good". The same thresholds apply to mobile and desktop. — [web.dev: Defining the Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- LCP "good" is ≤ 2.5 s; "needs improvement" is ≤ 4.0 s. — [corewebvitals.io LCP](https://corewebvitals.io/core-web-vitals/largest-contentful-paint); [web.dev thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- INP replaced FID as a Core Web Vital in March 2024. — [web.dev thresholds (via search extract)](https://web.dev/articles/defining-core-web-vitals-thresholds)
- Video is an LCP candidate (poster or first frame) since Chrome 116. — [Chromium changelog](https://chromium.googlesource.com/chromium/src/+/main/docs/speed/metrics_changelog/2023_08_lcp.md)
- Autoplay videos download immediately even off-screen, which hurts LCP and bandwidth. — [web.dev video performance](https://web.dev/learn/performance/video-performance)
- web.dev publishes a video pattern for Web Vitals. — [web.dev patterns: video](https://web.dev/patterns/web-vitals-patterns/video/video/)

### Inferences
- **Practical targets for LEVIK (stricter than "good", to leave headroom):**
  - Mobile LCP under about 2.0 s on 4G, from a poster AVIF of about 30–60 KB inlined or preloaded.
  - INP under about 150 ms.
  - CLS of essentially 0. Use `width`/`height` or `aspect-ratio` on every video tile, and `font-display: optional`/`swap` with size-adjusted Hebrew web fonts (for example a subset Heebo/Assistant/Rubik WOFF2 with only the Hebrew and Latin ranges).
- **How award sites keep spectacle and speed together (playbook):**
  1. Static, meaningful first paint: posters plus the headline in HTML.
  2. Intro animation starts after LCP. It animates from the already-painted state; it does not hide content with `opacity:0` before JS loads, since that delays LCP.
  3. Defer JS: `type="module"` / `defer`. Lazy-import ScrollTrigger and Three.js with dynamic `import()` on idle or on visibility.
  4. Animate only `transform` and `opacity`.
  5. Pause offscreen work (video, WebGL loops).
  6. Preload only the LCP poster and one font.
- **Spectacle that costs nothing.** CSS scroll-driven reveals and View Transitions run off the main thread or in the compositor, which helps INP compared with JS scroll listeners.
- **Measure** with PageSpeed Insights or CrUX (field data, p75), the Vercel Speed Insights add-on (real-user CWV), and Chrome DevTools Performance with 4× CPU throttling plus "Slow 4G".

### Gaps
- I found no published CWV field data for specific award-winning studio sites (Awwwards SOTD and similar) to benchmark against.
- I did not confirm Vercel Speed Insights pricing or limits for 2026.

---

## 5. Compression tools for video (ffmpeg, HandBrake) and images (AVIF/WebP)

### Takeaway
Use ffmpeg for repeatable batch encoding: H.264 `libx264` CRF 26–28 preset slow with `+faststart` and no audio; AV1 `libsvtav1` CRF about 35–40 preset 6. HandBrake is the GUI equivalent ("Web Optimized" = faststart). Use AVIF for posters with WebP/JPEG fallbacks via `<picture>`, from `avifenc`/`cwebp`, Squoosh, or `sharp` in a build script.

### Cited Findings
- `-movflags +faststart` moves the MP4 index to the start so playback begins before a full download. Scaling to 1280 px wide and CRF 26 preset slow is a sensible hero baseline. — [DEV: hero video 10× heavier](https://dev.to/mauberme/your-hero-video-is-probably-10x-heavier-than-it-needs-to-be-and-how-to-fix-it-without-installing-1h87)
- `libx264 -crf 28 -preset slow -an` at 1024×576 and 24 fps gives about 1–1.5 MB hero clips. — [konadu.dev](https://konadu.dev/video-hero-section-without-killing-lcp)
- AV1 via SVT-AV1: `-c:v libsvtav1 -crf 35 -preset 6` (WebM with Opus if audio is needed). Via libaom: `-crf 30 -b:v 0`. — [FFmpeg cookbook AV1](https://ffmpeg-cookbook.com/en/articles/av1-encode/)
- AV1 gives better compression than H.264/VP9 and is royalty-free, but encodes slowly. — [ffmpeg-micro CRF](https://www.ffmpeg-micro.com/blog/ffmpeg-crf-explained); [Wikipedia AV1](https://en.wikipedia.org/wiki/AV1)
- A CRF comparison across H.264, H.265, VP9 and AV1 is available for picking equivalent quality levels. — [vibbit FFmpeg CRF examples 2026](https://vibbit.ai/blog/ffmpeg-crf-examples)

### Inferences
- **Batch script idea.** One `encode.sh` loops over `/src/*.mov` and outputs, per clip: `NN_540.av1.mp4`, `NN_540.mp4`, `NN_720.av1.mp4`, `NN_720.mp4` and `NN.avif`/`NN.webp` posters. Commit only the outputs, or upload them to Bunny/Cloudflare R2 to keep the Git repo light. Large binaries in Git slow down Vercel deploys; Git LFS or external storage is better.
- **Images:**
  ```html
  <picture><source srcset="poster.avif" type="image/avif"><source srcset="poster.webp" type="image/webp">
  <img src="poster.jpg" width="540" height="960" alt="" decoding="async" fetchpriority="high"></picture>
  ```
  - Indicative quality settings: AVIF `avifenc -q 45–55` (or Squoosh about 50), WebP `cwebp -q 70–80`.
  - Thumbnails for 8–12 films: 2 widths (about 640 and 1280) via `srcset`/`sizes`, `loading="lazy"` below the fold.
- **Quality control.** Check sizes with `ffprobe -v error -show_entries format=size,bit_rate -of default=nw=1 file.mp4`. Watch loops on a real iPhone (non-Pro, which has no AV1, so the H.264 path is used) and on a mid-range Android.

### Gaps
- I did not retrieve official ffmpeg or HandBrake documentation in this session. Flags follow standard ffmpeg usage and the cited guides; verify against your installed ffmpeg version (SVT-AV1 parameter names change between releases).
- I did not source specific AVIF/WebP quality-to-size benchmarks.
