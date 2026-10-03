# "מכלום": פרסומת לבית בג'ונגל (עריכה ב-Remotion)

פרסומת של 60 שניות. **אתה מייצר רק את קטעי הווידאו ב-AI. כל השאר כבר בנוי:** העריכה, הקאטים, תנועת המצלמה, הכיתובים בעברית, הגריד, המעבר לסקיצה, הדף על השולחן, העיפרון, הלוגו, המוזיקה ואפקטי הסאונד.

כל עוד חסר קליפ, העריכה מציגה במקומו אנימציה מוכנה (עם תווית "ממלא מקום" בפינה). ברגע שמכניסים קובץ, הוא מחליף אותה אוטומטית.

## איך משתמשים

```bash
cd remotion
npm install
npm run dev               # תצוגה מקדימה בדפדפן (Remotion Studio)
npm run render            # ייצוא 16:9 → out/jungle-ad-16x9.mp4
npm run render:vertical   # ייצוא 9:16 לריל → out/jungle-ad-9x16.mp4
```

## מה אתה מייצר: 10 קליפים

- שומרים כל קליפ בתיקייה `public/footage/` **בשם המדויק** שמופיע בטבלה (mp4, mov או webm).
- **בלי סאונד:** העריכה משתיקה את הקליפים, כי הסאונד שלי.
- **בלי טקסט על המסך:** את הכיתוב אני מוסיף.
- **מינימום 5 שניות לכל קליפ**, 1080p, ‏16:9. לגרסה האנכית אותו קליפ נחתך אוטומטית, לכן כדאי לשמור את הנושא במרכז הפריים.
- **קליפ 10 חייב להיות 15 שניות**, כי הוא ממשיך לרוץ גם אחרי שהוא הופך לסקיצה.

### דמויות קבועות (להדביק בכל פרומפט שיש בו אנשים)
> **Woman** ~35, olive skin, long dark wavy hair, cream linen dress, barefoot. **Man** ~38, short dark beard, white linen shirt, beige linen trousers. **Girl** ~7, curly brown hair, yellow sundress.

### הבית (להדביק בכל פרומפט שיש בו את הבית)
> Two-story modern jungle villa: bamboo poles, teak beams, floor-to-ceiling glass walls, a curved leaf-shaped wooden roof covered in grass, a wooden deck and a turquoise infinity pool in front, deep in a tropical rainforest clearing.

| # | קובץ | שנ' | מה רואים |
|---|---|---|---|
| 1 | `01_canopy.mp4` | 0–5 | רחפן יורד דרך חופת הג'ונגל בגשם |
| 2 | `02_clearing.mp4` | 5–10 | גלישה מעל שרכים אל קרחת יער ריקה |
| 3 | `03_seed.mp4` | 10–15 | זרע זוהר נופל לבוץ |
| 4 | `04_roots.mp4` | 15–20 | שורשים פורצים, במבוק צומח |
| 5 | `05_frame.mp4` | 20–25 | קורות נשזרות לשלד, זכוכית נכנסת |
| 6 | `06_complete.mp4` | 25–30 | גג ירוק נפתח, הווילה שלמה |
| 7 | `07_doors.mp4` | 30–35 | האישה פותחת את דלתות הזכוכית |
| 8 | `08_girl.mp4` | 35–40 | הילדה רצה על הדק לבריכה |
| 9 | `09_family.mp4` | 40–45 | המשפחה על שפת הבריכה |
| 10 | `10_aerial.mp4` | 45–60 | רחפן מתרחק מעל החופה (**15 שנ'**) |

### הפרומפטים (Seedance 2.0 / Kling)

**01_canopy**
```
Aerial drone shot slowly descending through a dense tropical rainforest canopy at dawn in light rain. Giant ficus trees, hanging vines, mist between the trees, raindrops falling past the lens. Soft blue pre-dawn light, deep emerald and teal palette. Smooth continuous descent, photorealistic, 35mm film look, anamorphic, no people, no text.
```

**02_clearing**
```
Low drone glide over wet ferns toward an empty circular clearing of dark mud in a tropical rainforest. Morning mist, a single beam of golden sunlight breaks through the canopy and lands on the bare ground in the center. Slow push in. Photorealistic, volumetric god rays, emerald and gold palette, no people, no text.
```

**03_seed**
```
Extreme close-up macro, slow motion: a single small golden glowing seed falls from above and lands in dark wet mud in a rainforest clearing, a tiny splash of mud droplets, the glow pulses softly. Shallow depth of field, golden god ray in the background, photorealistic, no text.
```

**04_roots**
```
Magical-realism timelapse, low angle: roots burst out of the mud of a rainforest clearing and twist upward, sprouting thick green-gold bamboo poles that rise toward the sky with real weight. Slow orbit around the growth, dust and droplets in golden morning light. Photorealistic, smooth, no morphing glitches, no text.
```

**05_frame**
```
Magical-realism construction timelapse in a rainforest clearing: teak beams weave themselves between tall bamboo poles into the frame of a two-story house, then large floor-to-ceiling glass panels slide into place and catch the sunlight. Slow crane up. Golden morning light, dust particles, photorealistic, smooth, no text.
```

**06_complete**
```
[HOUSE] A curved leaf-shaped wooden roof unfolds on top and grass sprouts across it, a stone path paves itself, the turquoise pool fills with water. Ends on a wide hero shot of the finished villa, birds landing on the roof. Golden light, photorealistic, no text.
```

**07_doors**
```
[HOUSE] [Woman] Medium shot from outside through the floor-to-ceiling glass: the woman slides open the glass doors and steps onto the wooden deck, a warm breeze moves her dress and the curtains, jungle reflected in the glass. Soft late-morning sun, warm interior light, photorealistic, natural skin texture, no text.
```

**08_girl**
```
[HOUSE] [Girl] Tracking shot following the girl running barefoot across the wooden deck toward the turquoise infinity pool, laughing; toucans fly past in the background. Warm late-morning light, shallow depth of field, photorealistic, no text.
```

**09_family**
```
[HOUSE] [Woman] [Man] [Girl] The family sits together at the edge of the infinity pool, feet in the water, the man holds a coffee cup, the girl splashes. Slow pull back revealing the endless rainforest around them. Warm light, turquoise, cream and emerald palette, photorealistic, no text.
```

**10_aerial**: 15 שניות
```
[HOUSE] Continuous 15-second aerial drone shot: starts on the villa and pool from above, then slowly rises and pulls back over the rainforest canopy until the house is a small detail in a vast green jungle with a distant waterfall. Calm, steady, no cuts, photorealistic, clear sharp outlines, no text.
```

> קליפ 10 עובר בעריכה לשחור-לבן ואחר כך לסקיצת עיפרון באמצעות זיהוי קווים. ככל שהקווים בצילום חדים וברורים יותר (גג, בריכה, עצים), הסקיצה תצא יפה יותר.

## הסאונד

- **מוזיקה ואפקטים:** `npm run music` מסנתז את כל הפסקול בקוד, מסונכרן לפריימים של העריכה: גשם, ציפורים, תו הפסנתר כשהזרע נוחת, מכות בנייה, דלתות זכוכית, מים, גיטרה, טוקנים, שקט, שריטת עיפרון ובום סיום.
- **קריינות:** העריכה טוענת אוטומטית את הקבצים `public/audio/vo_01.mp3` עד `vo_10.mp3` בתזמון הנכון, ומנמיכה את המוזיקה מתחת לקול.

| קובץ | טקסט | פריים |
|---|---|---|
| vo_01 | כל דבר גדול... | 50 |
| vo_02 | מתחיל מכלום. | 325 |
| vo_03 | קודם רעיון. | 475 |
| vo_04 | אחר כך שורש. | 615 |
| vo_05 | אחר כך קיר. | 755 |
| vo_06 | ואז, יום אחד, | 930 |
| vo_07 | אתה מתעורר בתוכו. | 1070 |
| vo_08 | הבית הזה לא קיים. | 1390 |
| vo_09 | גם הסרט הזה לא צולם. | 1505 |
| vo_10 | אנחנו בונים חלומות מכלום. | 1705 |

## מבנה הקוד

- `src/timeline.json`: הלב של העריכה: שוטים, כיתובים, קריינות ואירועי סאונד. משנים כאן תזמונים.
- `src/JungleAd.tsx`: הקומפוזיציה הראשית.
- `src/world/`: עולם הג'ונגל המונפש שמשמש כממלא מקום וכגיבוי.
- `src/overlays/`: הקליפים, הכיתובים, הגריד, אפקט הסקיצה, השולחן, העיפרון והלוגו.
- `scripts/make-music.mjs`: הפסקול.
