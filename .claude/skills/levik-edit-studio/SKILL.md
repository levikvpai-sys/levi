---
name: levik-edit-studio
description: Edits, renders, checks and publishes LEVIK PRODUCTION promo films cut from Levik Cohen's own AI footage. Covers the 9:16 studio ad (v6 is live on Instagram), the 16:9 aura edit, and new Reels or promos. It holds his taste, his modesty and ownership rules, the proven pipeline (timeline.py → gfx.html → composite.py on the editing box), the source catalogue, QA and Instagram publishing. Use for any request to cut, re-cut, fix, extend, re-render, QA or post a LEVIK PRODUCTION ad, reel or promo, e.g. "תחליף את הסוף", "תעשה גרסה חדשה", "תכניס את הקטע עם…", "פחות שוטים שלי", "תעלה לאינסטגרם", "פרסומת לסטודיו", "ריל מהחומרים שלי". Pair it with levik-motion-studio for general motion craft and wow-content-studio for captions.
---

# LEVIK Edit Studio

Everything one long session learned while cutting Levik's studio ad from v3 to v6 and rebuilding the aura edit he loved. Start from here, not from zero: the pipeline, the sources and his taste are already solved. The job is to go further, not to rediscover.

## Hard rules (they override everything, every time)
1. **Brand:** LEVIK PRODUCTION, לויק כהן. Never "WOW Production". Use the real files `assets/brand/levik-production-logo.png` and `assets/brand/lv-icon.png`. Never redraw them. Palette: `#93D5E8 #5CA7E8 #A762DD #F388EE` (cyan → blue L, purple → pink V). Type: Rubik 900/700, RTL.
2. **Only his footage.** Anything owned by galedri@gmail.com (Gal Edri) is not his: Tiger, GET PICKS, Bonus, babar p, Josalle, Gingi. Never use it. LEVIK ACTION (the motorcycle and explosion film) is his. v4 dropped it on a wrong guess that it was GET PICKS, and that cost a round. When ownership is unsure, check the Drive owner field or ask. Never guess either way. `video/levik-ad-v3/sources.json` marks every known file.
3. **Modesty:** "מה שזה לא צנוע כלכך עדיף שיהיה פחות". No women in immodest dress; keep women to a minimum. Check every frame of every shot, including the background, people seen from behind, and skin-like textures (a chocolate splash was cut for this). Known bad sources are marked `avoid`/`never` in sources.json.
4. **Film only.** No still images ("אל תשים תמונות").
5. **No Higgsfield for editing.** Downloading his Higgsfield generations as sources is fine.
6. **No paid generation without his explicit yes** for that exact generation. He denied a Kolbo image-edit of himself (cowboy, running, anime, Pixar). Don't retry it; offer it in one line if relevant.
7. **Public actions** (Instagram post, comment, DM) only after he has seen the final text.
8. **Honesty:** never say watched, heard, verified or published without the operation. You cannot listen to audio. Say what was measured (LUFS, peaks), not "it sounds good".
9. **Talk to him in Hebrew**: short, with what changed, what didn't, what wasn't checked, and the link.

## Reading his messages
- He dictates by voice. Words get garbled ("יושנים על הפרה" = "יש שם על הפרה"), messages arrive cut off, and the same message can arrive twice after a worker restart. Read for intent.
- When two readings lead to different work, look at the material first. Often one plan satisfies both readings. Example: "רק פעם אחת רואים אותי מול המחשב" was satisfied by keeping exactly one computer shot and one presenter shot. State the reading you took in one line, and invite a correction.
- A message that looks truncated: ask once, with options (AskUserQuestion). Never answer "no response requested" to a real message.
- A pasted message followed by "אל תתייחס למה ששלחתי" means: ignore the paste, take the new words.

## Workflow
1. **Load context:** `references/taste.md` (what "the best" means to him), `references/pipeline.md` (how to build), `video/levik-ad-v3/shots.json` + `timeline.py` (the current cut), `sources.json` (what exists and where).
2. **Plan as slot edits:** which slots change, which source and in-point, and the text and transition per slot. Reuse the 132 BPM grid and the text system. Changing only footage leaves the gfx and mask layers valid. Changing text or transitions needs `build_layers.py` re-run locally and pushed.
3. **Look before choosing:** make a contact sheet or preview of the candidate source and view its frames (pipeline §QA). Pick crops by subject x-position. Wide 2.3:1 sources keep only 24.5% of the width in 9:16.
4. **Render on the box:** `fetch_sources.py`, then `composite.py patch BASE N0` when only part changes, or `composite.py render` for a full rebuild.
5. **QA every changed second** as frames, plus the checklist in pipeline §QA. Fix before showing him.
6. **Deliver:** upload to Kolbo and send the link with a Hebrew report. Keep the old version's link in the report.
7. **Publish** only when asked, with the approved caption (pipeline §Instagram).
8. **Commit** the source files (`shots.json`, `timeline.py`, scripts, layers) to the branch with a clear message. The box is ephemeral; the repo is the memory.

## Versions so far
| Version | What it was | His verdict |
|---|---|---|
| v3 | first 9:16 ad, 3D text, his face full-bleed | wanted more of his material, crazier text; GET PICKS/Tiger not his; 0.4–0.5 s immodest |
| aura edit v2 (16:9) | WOW edit with narration | "זה מעולה… המושן הכל מושלם באמת… אתה יכול להגיע לרמות פסיכיות" → rebranded LEVIK (`video/levik-aura/`) |
| v4 | aura-style type, colourful smeared words | more interesting cuts and flashes; better hook; icebergs "סבבה לא וואו" |
| v5 | cow hook, knockout montage, pink flashes, split-cuts, zoom-blur hits | "the details" version. Ending too studio-heavy |
| v6 (live) | ending = LEVIK ACTION motorcycle and explosions; one computer shot; name card on him by the film camera | published as a Reel: https://www.instagram.com/reel/DfCEk7Sj89P/ |

Open item: in the aura edit the narration (taken from a film's dialogue stem) is "לא מובן בכלל". He was offered three fixes: a clear new Hebrew voice-over (needs his OK for the cost), no narration plus on-screen text, or subtitles. His answer is pending.
