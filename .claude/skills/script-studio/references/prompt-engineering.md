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
