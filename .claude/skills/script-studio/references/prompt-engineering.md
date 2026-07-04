# Prompt Engineering — world-class, hyper-realistic generation prompts

This specialist takes the whole studio's output and assembles/refines it into the most
realistic, complex generation prompts possible — image and video — that DON'T look like AI.
It researches state-of-the-art prompt techniques and elevates every prompt to that bar.

## The anatomy of a world-class prompt (order matters)
1. **Subject** — who/what, specific (age, build, wardrobe, expression).
2. **Action / emotion** — what they're doing and feeling (from `emotions.md`/`movement.md`).
3. **Environment** — location, era, time of day, weather, background depth.
4. **Composition & camera** — shot size, angle, framing (from `camera-angles.md`).
5. **Camera movement** (video) — the move + speed (from `camera-movement.md`).
6. **Lens & format** — focal length + aperture (e.g. `85mm f/1.4`), shallow/deep DoF.
7. **Lighting** — setup + direction + quality + color temp (from `cinematography-color.md`).
8. **Color & mood** — palette, grade, atmosphere.
9. **Style / era / film stock** — the look reference (from `period-design.md`).
10. **Detail & imperfection** — the realism layer (see below).
11. **Negative prompt** — what to exclude.

## Photorealism levers (kill the "AI look")
Models are trained on real photos with EXIF data — speak the language of a real camera operator:
- **Name real gear**: `shot on Sony VENICE, 50mm` / `Canon EOS R5, 85mm f/1.4`.
- **Name a film stock**: `Kodak Portra 400`, `Kodak 2383 print`, `CineStill 800T` — massively
  boosts perceived realism.
- **Add imperfection**: visible **skin texture, pores, fine lines, flyaway hair**, **film grain**,
  **halation**, dust motes, lens flare, subtle motion blur, natural asymmetry, sweat/moisture.
- **Real light behavior**: `natural light scatter`, `soft window key + spill`, practical sources,
  bounce/fill — not flat even illumination.
- **Tactile surfaces**: describe materials (worn leather, wet concrete, brushed metal) not buzzwords.
- **Avoid** the tells: plastic skin, perfect symmetry, over-smooth, over-saturated, "8k hyperreal
  render," extra fingers — push these to the **negative prompt**.

## Crowds & many characters (staying real with lots of people)
Rendering many people is the #1 source of AI distortion — warped/duplicated faces, merged
limbs, extra fingers. Multiple faces at full detail is still a frontier, so **compose around
the limitation**, don't fight it:
- **Depth-of-field is your best friend** — put the 1–3 hero subjects **sharp in the foreground**
  and push the crowd **soft** (shallow DoF, bokeh, `background crowd out of focus`). Blur hides
  what the model can't render cleanly. This single move fixes most crowd shots.
- **Layer the frame** — hero (sharp) / midground (slightly soft) / crowd (very soft or motion-
  blurred). Never ask for 20 equally-detailed faces.
- **Let the crowd read as a crowd** — backs of heads, silhouettes, turned-away bodies, partial
  figures at the edges; a crowd is a *texture/mass*, not 20 portraits.
- **Minimize overlap & interaction** — motion and detail degrade where bodies overlap; stage
  clear spacing so limbs don't merge.
- **Motion blur / long-exposure feel** on moving crowds (`crowd in motion blur`) both looks
  cinematic and masks artifacts.
- **Load the negative prompt hard**: `deformed faces, duplicated faces, extra limbs, extra
  fingers, fused bodies, warped hands, cloned people, distorted background people`.
- **Consistency workflow**: generate a clean **master image** of the hero(s), then use
  **image-to-video (I2V)** or img2img (denoise ~0.3–0.5) to keep identity stable across shots —
  the 2026 industry standard for multi-character/brand consistency. Never re-roll identity per shot.
- **"Forensic accuracy" for the heroes** — for the faces that MUST be sharp, describe precise
  features and add `no beautification, no smoothing, natural asymmetry, real skin texture`.
- **Video specifics**: keep hero action clear and central; keep crowd motion simple and shallow;
  fewer clearly-moving people = fewer artifacts.

## Image vs. video prompts
- **Image**: a single decisive moment — nail composition, light, and detail; one clear focus.
- **Video**: add **motion** (subject action beat-by-beat), **camera movement**, **timing/pacing**,
  and **physics** (how things move, weight, continuity). Keep one clear action per shot; describe
  the *change* over the clip, not just a static frame.

## Assembling the studio's output (this agent's superpower)
Fuse the specialists into ONE coherent prompt per shot:
`[emotion-director face/body] + [movement/combat/dance action] + [camera-director framing] +
[camera-movement move] + [colorist palette/light] + [period-designer era] + [vfx effect] +
[lens/film stock + imperfection layer] + [negative]`
Keep it dense but ordered; front-load the subject and action; end with technical + negative.

## Craft rules
- **Specific > vague** every time; concrete nouns, real numbers (mm, f-stop, Kelvin, film stock).
- **One focus per prompt**; don't ask for five subjects and three actions in one image.
- **Consistency**: reuse the same character/wardrobe/lighting descriptors across shots so a
  sequence looks like one shoot.
- **Iterate**: prompt → read the result → adjust the weakest axis (usually light or detail) → repeat.
- **Research current best practice** per model/tool (they change fast) before finalizing.

## Templates
**Image (photoreal):**
`<subject, specific> , <action/expression> , <environment + era + time> , <shot size + angle> ,
<lens e.g. 85mm f/1.4, shallow DoF> , <lighting + direction + color temp> , <palette/mood> ,
shot on <camera> , <film stock> , visible skin texture and film grain, natural light scatter ,
photorealistic. — Negative: plastic skin, extra fingers, over-smooth, oversaturated, cartoon, watermark`

**Video (per shot):**
`<subject + action beat> , <environment/era> , <shot size + angle> , camera: <move + speed> ,
<lens> , <lighting + palette> , <any VFX + interaction> , <film look> , subtle motion blur,
film grain, realistic physics. — Negative: morphing, flicker, warping hands, AI look`
