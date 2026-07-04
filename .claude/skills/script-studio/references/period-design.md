# Period & Production Design — any era, any place, any year

Give this specialist a **place + year** and it describes exactly how it looked and gives a
precise prompt to recreate it. Covers wardrobe, hair, architecture, props, tech, vehicles,
signage, and the era's own visual/film look. Descriptions are **prompt-ready**.

## The axes of period accuracy (check every one)
1. **Wardrobe / costume** — silhouettes, fabrics, colors, tailoring, formality, class markers,
   accessories, footwear. The fastest era signal on a body.
2. **Hair & grooming** — cuts, styling, facial hair, makeup norms.
3. **Architecture & interiors** — building styles, furniture, materials, lighting sources
   (candle/gas/incandescent/fluorescent/LED), wallpaper, appliances.
4. **Props & technology** — phones, cars, gadgets, media, money, packaging — anachronism here
   breaks the spell instantly.
5. **Vehicles** — models and body styles true to the year (ties to `vehicles.md`).
6. **Signage & typography** — fonts, ads, logos, street signs — hugely period-specific.
7. **Color & film look** — the era's *photographic* signature (see below), so it reads as *of*
   that time, not a modern shoot in old clothes.
8. **Social behavior & etiquette** — how people stood, greeted, smoked, addressed each other.

## Era quick-reference (visual signatures)
- **Ancient / medieval** — natural fibers, hand-forged metal, torch/candle light, earth tones,
  stone/wood, no modern lines.
- **1920s** — flapper drop-waist, cloche hats, Art Deco, jazz, sepia-warm, grain.
- **1930s–40s** — tailored suits, victory rolls, film-noir shadow, B&W or muted Technicolor.
- **1950s** — full skirts, greasers, chrome diners, pastel + saturated Kodachrome, optimism.
- **1960s** — mod, mini-skirts, bold graphics, muscle cars, saturated pop color.
- **1970s** — earth tones, flares, wood paneling, warm grainy film, orange/brown palette.
- **1980s** — neon, big hair, shoulder pads, VHS haze, chrome + magenta/cyan, synth.
- **1990s** — grunge/minimal, film-photo naturalism, early digital, muted greens.
- **2000s** — digital-camera flash look, low-rise, flip phones, Y2K metallics.
- **2010s–now** — smartphones, HD/clean digital, LED light, contemporary minimal.
- **Future / sci-fi** — invent a consistent design language (materials, silhouettes, tech, palette).

## The "place + year" method
When the user names a location + time, deliver:
1. **The look** — a paragraph placing us there (light, colors, textures, the feel of the year).
2. **The period checklist** — wardrobe, architecture, props, vehicles, signage specific to that
   exact time and place (a 1985 Tokyo street ≠ 1985 rural Texas — get regional too).
3. **The film look** — what stock/camera/grade makes it read as shot *in* that era (feeds the
   colorist and prompt-engineer).
4. **A prompt** — a paste-ready generation prompt encoding all of it.

## Accuracy vs. drama
Research first (period photos, films, records), then decide where to bend accuracy for story or
production — but bend it *knowingly*. Anachronisms in props/tech/signage are the most jarring;
guard those hardest.

## Prompt-ready notation
`ERA: <year + place> | WARDROBE: … | ENVIRONMENT: <architecture·interiors·light source> | PROPS/TECH: … | VEHICLES: … | FILM LOOK: <stock/grade of the era> | PALETTE: …`
e.g. `ERA: 1974, New York City | WARDROBE: wide-lapel earth-tone suits, flares, turtlenecks | ENVIRONMENT: wood-paneled bar, tungsten practicals, neon signage | PROPS/TECH: rotary phones, checker cabs | FILM LOOK: warm grainy Kodak, halation, slight fade | PALETTE: orange/brown/mustard.`
