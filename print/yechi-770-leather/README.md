# יחי — 770 | Navy Leather Wall Piece — Production Files

Rebuilt from scratch as layered, production-ready artwork (not a screenshot).
**Trim (finished) size 304.8 × 609.6 mm (12 × 24 in)**, portrait.
Print files carry **3 mm bleed** on every side (document 310.8 × 615.6 mm, 3672 × 7272 px @ 300 dpi).

**Production method: EMBROIDERY directly on navy leather.** The 770 building is stitched in 18 colours of thread and all the text in gold metallic thread. It is not printed, not a patch and not glued.

---

## 🇮🇱 בעברית

### שיטת הייצור
- **הבניין (770):** רקמה מלאה בחוטים, ב-18 צבעים, **ישירות על העור**. בלי פאץ׳, בלי מדבקה ובלי הדבקה. כל הצבעים תפורים.
- **כל הטקסט:** רקמה בחוט **זהב מטאלי**, בתפר סאטן.
- **רקע:** עור כחול נייבי. חלקי העור שלא רקומים נשארים חשופים.

### הקבצים
| קובץ | מה זה |
|---|---|
| `output/embroidery/EMBROIDERY_mockup_preview.jpg` | **הדמיה של התוצאה הרקומה** (לאישור) |
| `output/embroidery/EMBROIDERY_mockup_stitch-simulation_300dpi.jpg` | ההדמיה ברזולוציה מלאה, 1:1 |
| `output/embroidery/EMBROIDERY_vector_by-thread_1to1.svg` | **הקובץ למְתַכְנֵת הרקמה (Digitizer):** וקטור 1:1, שכבה לכל צבע חוט, עם קוד החוט |
| `output/embroidery/EMBROIDERY_thread-separation_1to1_300dpi.png` | אותו דבר כתמונה, בצבעי החוטים בלבד |
| `output/embroidery/EMBROIDERY_thread-chart.png` / `.csv` | **טבלת חוטים:** קוד Madeira לכל צבע, שטח וסוג תפר |
| `output/…_bleed-3mm_300dpi_LAYERED.psd` | פוטושופ בשכבות (עם 3 מ"מ גלישה וקווי עזר בקו החיתוך) |
| `output/…_bleed-3mm_PRINT.pdf` | PDF עם גלישה וסימני חיתוך: (1) צבע מלא, (2) בלי טקסט, (3) טקסט וקטורי |
| `output/…_bleed-3mm_GOLD-FOIL_vector.pdf` / `.svg` | הטקסט בלבד, וקטורי 1:1 (לרקמת הזהב או להטבעה) |
| `output/…_bleed-3mm_preview.jpg` | תצוגה של הגרסה המודפסת, חתוכה בקו הסופי |

**הטקסט:** יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד (בקשת) / לזכות / ר׳ לוי יצחק ושיר הכהן כהן / ומשפחתו.
שינויי נוסח נעשים ב-`TEXT_LINES` שבתוך `build.py`, ואז מריצים `build.py` ו-`embroidery.py`.

---

## 🇬🇧 English — production spec

### Method
- **770 building:** full multi-colour machine embroidery, **stitched directly into the navy leather**. **No patch, no applique, no glue, no printing.**
- **All text:** **gold metallic thread**, satin stitch.
- **Ground:** navy leather (genuine or PU, about RGB 8/26/64). Areas without stitching stay bare leather.

### Embroidery files (`output/embroidery/`)
- `EMBROIDERY_vector_by-thread_1to1.svg`: artwork for digitising. 1:1, artboard = trim 304.8 × 609.6 mm. One group per thread colour, named `Txx_Madeira-Rayon-<code>_<name>`, plus `GOLD_METALLIC_THREAD_text_satin`. Position on the leather = position on the artboard.
- `EMBROIDERY_thread-separation_1to1_300dpi.png`: the same as a raster (transparent = bare leather).
- `EMBROIDERY_thread-chart.png/.csv`: 18 × **Madeira Classic Rayon No.40** (codes listed) + **Madeira Metallic No.40 bright gold**. Equivalent Isacord/Polyneon is OK if matched to the chart.
- `EMBROIDERY_mockup_*.jpg`: stitch simulation of the finished piece. Use it as the visual target.

### Digitising / sewing notes
- Stitched area ≈ 720 cm² (building) + 50 cm² (text); expect roughly **150–200 K stitches**. Large frame or precisely registered split hooping.
- Narrow parts (window frames, trims, pipes, edges): **satin**. Larger areas: **tatami fill**, with the angle varied per colour as in the mockup. Brush strokes around the building: lighter-density directional fill, so they look painterly.
- **Leather:** reduce density about 15% vs fabric (row spacing about 0.45–0.5 mm). Use 75/11–80/12 sharp/leather needles, cut-away stabiliser on the back and pull compensation of 0.2–0.3 mm. Avoid more than 3 stacked layers, so the leather is not perforated.
- **Gold text:** metallic satin columns with edge-run + zig-zag underlay. The smallest letters (top arc line) need short satin and careful density.
- Minimum detail is about 1 mm; islands smaller than 2 mm² are already merged in the artwork.

### Print files (alternative / proof): 3 mm bleed
- Document 310.8 × 615.6 mm = trim + 3 mm per side, 300 dpi, RGB. The PDF has TrimBox/BleedBox and crop marks. The PSD has guides on the trim line.
- The building's brush strokes are mirrored into the side bleed, so a slightly off cut never shows a hard edge.
- `LEATHER GRAIN` (two Overlay layers) is simulated leather for flat materials or a mockup. Hide it when printing on real leather.
- PSD channels are ZIP-compressed (Photoshop CS+/CC, Photopea, Affinity, GIMP).

⚠️ **Hebrew reads right-to-left. Never retype the Hebrew text.** Use the supplied outlines only. Check the sample against the mockup before production.

---

## 🇨🇳 中文 — 生产说明（请工厂阅读）

- **工艺：皮革上直接刺绣。** 770 建筑用 **18 色绣线全彩机绣**，**直接绣在深蓝色皮革上**。**不要做贴布、不要胶粘、不要印刷。**
- **全部文字：** 用 **金色金属线（Madeira Metallic No.40 亮金）**，缎面绣（Satin）。
- **成品尺寸：** 304.8 × 609.6 毫米（竖版）。未刺绣的地方保留皮革原面。
- **打版文件：** `EMBROIDERY_vector_by-thread_1to1.svg`，1:1 比例，每种线色一个图层，图层名中有 Madeira 色号。绣线色卡见 `EMBROIDERY_thread-chart.png`，共 18 色 Madeira Classic Rayon No.40 + 金色金属线。
- **效果参考：** `EMBROIDERY_mockup_preview.jpg`（刺绣效果模拟图），请按此效果打样。
- **皮革刺绣注意：** 密度比布料降低约 15%（行距 0.45–0.5 mm），使用 75/11–80/12 皮革针，背面加可剪衬，拉力补偿 0.2–0.3 mm，避免叠绣过多导致皮革穿孔。细窄部分（窗框、线条）用缎面绣，大面积用榻榻米填充。
- 预计针数约 15–20 万针，需要大绣框或精确对位分框刺绣。
- **印刷文件（备用 / 打样）：** 已含每边 3 mm 出血，PDF 带裁切线和 TrimBox。
- ⚠️ **希伯来文从右向左书写。请绝对不要重新输入希伯来文字！** 只使用我们提供的转曲文件。量产前请先打样，并对照效果图确认。

---

### Rebuild / edit
```bash
pip install numpy scipy opencv-python-headless pillow psd-tools[composite] reportlab fonttools uharfbuzz pyclipper
python3 build.py         # print files + PSD (about 5 min)
python3 embroidery.py    # embroidery package (about 3 min)
#   add --preview to either for a quick low-res check
```
- `source/building_upscaled_4x_v2.png`: building from `source/reference_v2.png`, upscaled 4× with Real-ESRGAN (x4plus).
- `source/threads/`: thread colour palette (Ink/Stitch, GPL-3). On-screen RGB values are approximate; match the physical colour card.
- `fonts/ShofarDemi-Bold.ttf`: Culmus project, GPL-2 with font exception.
