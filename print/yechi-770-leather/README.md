# יחי — 770 | Navy Leather Wall Piece — Production Files

Rebuilt from scratch as a layered, print-ready design (not a screenshot).
Finished size **12 × 24 in (304.8 × 609.6 mm)**, portrait, **300 dpi** (3600 × 7200 px).

---

## 🇮🇱 בעברית — מה יש בתיקייה

| קובץ | מה זה | למי |
|---|---|---|
| `output/…_300dpi_LAYERED.psd` | קובץ פוטושופ בשכבות: רקע עור כחול, הבניין, כל שורת טקסט זהב בנפרד (עם צל), שכבת מרקם עור, ומסכת הטבעת זהב | למעצב / למפעל |
| `output/…_PRINT.pdf` | קובץ הדפסה, 3 עמודים: (1) הכול בצבע מלא, (2) שכבת הדפסה בלי טקסט, (3) טקסט וקטורי להטבעת זהב | למפעל |
| `output/…_GOLD-FOIL_vector.pdf` / `.svg` | הטקסט בלבד, וקטורי ומומר לקווי מתאר (Outlines), בקנה מידה 1:1, לייצור תבנית ההטבעה | למפעל |
| `output/…_FULL-COLOR_300dpi.jpg` | תמונה שטוחה ברזולוציה מלאה | גיבוי |
| `output/…_preview.jpg` | תצוגה מקדימה קטנה | לשליחה בוואטסאפ / אישור |
| `fonts/ShofarDemi-Bold.ttf` | הגופן שבו נבנה הטקסט (Culmus, חופשי) | לעריכה |
| `build.py` | הסקריפט שבונה הכול מחדש (לשינוי טקסט/מידה) | — |

**הטקסט** (בדיוק כמו בגרסה האחרונה, `source/reference_v2.png`):
- למעלה, שורה אחת בקשת: יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד
- למטה: לזכות / ר לוי יצחק ושיר הכהן כהן / ומשפחתו

**הערה:** במקור כתוב "ר" בלי גרש. אם רוצים "ר'", משנים ב-`TEXT_LINES` שבתוך `build.py` ומריצים מחדש.

**שיטת ייצור מומלצת לעור:** הדפסת UV של הבניין (עמוד 2 ב-PDF) + **הטבעה חמה בזהב (Hot Foil Stamping)** של הטקסט (עמוד 3 או קובץ GOLD-FOIL). כך הזהב יוצא אמיתי ומבריק, לא מודפס.
אם מדפיסים על עור אמיתי שכבר יש לו מרקם, צריך **להסתיר את שכבת `LEATHER GRAIN`** ב-PSD, כי העור עצמו נותן את המרקם.

---

## 🇬🇧 English — production spec

- **Finished size:** 304.8 × 609.6 mm (12 × 24 in), portrait. No bleed added; the background runs to the edge. If you need bleed, extend the canvas 3 mm per side and stretch only the `BACKGROUND` group.
- **Resolution / colour:** 300 dpi, 3600 × 7200 px, RGB 8-bit. Convert to CMYK with your own press/UV profile.
- **Material:** navy blue leather (genuine or PU). Leather dye reference is about RGB 8 / 26 / 64 (deep navy).
- **Gold text:** use **hot-foil stamping (bright gold)**, or deboss + gold foil. The die artwork is `…_GOLD-FOIL_vector.pdf` / `.svg`: 1:1 scale, all text already converted to outlines, spot colour **GOLD_FOIL**.
- **Building artwork:** full-colour UV print, page 2 of `…_PRINT.pdf` (the print layer without the text).
- **Full-colour alternative** (no foil): print page 1 of `…_PRINT.pdf`, or the PSD with all layers visible.
- **`LEATHER GRAIN` group** (two Overlay layers): this is a simulated leather texture for flat or smooth materials and for the mockup. **Hide it when you print on real textured leather.**
- PSD layer channels are ZIP-compressed (standard in Photoshop CS+/CC, Photopea, Affinity, GIMP), so the file fits under 100 MB.
- ⚠️ **Hebrew reads right-to-left. Never retype the Hebrew text.** Use the supplied outlines/PSD only. Check the proof against `output/…_preview.jpg` before production.

### PSD layer structure (top → bottom)
```
PRODUCTION (hidden)
  └ PRODUCTION - gold foil / emboss mask (black = foil)
LEATHER GRAIN - hide when printing on real leather
  ├ LEATHER GRAIN - light (Overlay)
  └ LEATHER GRAIN - shadow (Overlay)
GOLD TEXT
  ├ L4 UMishpachto - gold / shadow
  ├ L3 Names - gold / shadow
  ├ L2 LeZechut - gold / shadow
  └ L1 Yechi ... LeOlam VaEd (arc) - gold / shadow
ART - 770 building
BACKGROUND
  ├ BG - navy leather dye colour
  └ BG - flat navy (alternative, hidden)
```

---

## 🇨🇳 中文 — 生产说明（请工厂阅读）

- **成品尺寸：** 304.8 × 609.6 毫米（12 × 24 英寸），竖版。未加出血位，背景已铺满到边缘。如需出血，请每边加 3 毫米，只拉伸 `BACKGROUND` 背景组。
- **分辨率 / 色彩：** 300 dpi，3600 × 7200 像素，RGB 8 位。请按贵厂的 UV 打印机色彩配置转换为 CMYK。
- **材质：** 深海军蓝皮革（真皮或 PU 皮）。参考颜色约 RGB 8 / 26 / 64。
- **金色文字：** 建议 **烫金工艺（亮金）**，或压凹 + 烫金。烫金版文件：`…_GOLD-FOIL_vector.pdf` / `.svg`，1:1 比例，文字已全部转曲（轮廓），专色名 **GOLD_FOIL**。
- **建筑图案：** UV 彩色打印，使用 `…_PRINT.pdf` 第 2 页（不含文字的打印层）。
- **全彩打印方案（不烫金）：** 使用 `…_PRINT.pdf` 第 1 页，或 PSD 全部图层。
- **`LEATHER GRAIN` 图层组**（两个叠加模式图层）是模拟皮纹，用于平面材料和效果图。**如果直接打印在有纹理的真皮上，请隐藏此图层。**
- ⚠️ **希伯来文是从右向左书写的。请绝对不要重新输入希伯来文字！** 只能使用我们提供的转曲文件 / PSD。生产前请对照 `output/…_preview.jpg` 打样确认。

---

### Rebuild / edit
```bash
pip install numpy scipy opencv-python-headless pillow psd-tools[composite] reportlab fonttools uharfbuzz pyclipper
python3 build.py            # full resolution, about 5 min
python3 build.py --preview  # quick low-res check
```
Text, positions and size live at the top of `build.py` (`TEXT_LINES`, `W_IN`, `H_IN`, `DPI`).
`source/building_upscaled_4x_v2.png` is the building from `source/reference_v2.png`, upscaled 4× with Real-ESRGAN (x4plus).
