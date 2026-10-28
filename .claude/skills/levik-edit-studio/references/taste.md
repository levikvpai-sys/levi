# What "the best" means to Levik

Learned from his reactions to v3 → v6 and to the aura edit. When unsure, compare against the aura edit (`WOW_aura_edit_v2`), the one he called perfect.

## He loves
- **The aura edit look:** motion everywhere, rich colour, the MODE switch, the punchy word cards. "המושן הכל מושלם באמת."
- **Big type that is not "the usual":** "מלל גדול נוכח, קצת מוזר, לא הרגיל של כולם, שיראה נמרח, אומנותי, מלא צבעים, שיראה מטורף."
- **Interesting cuts:** flashes, transitions, black-and-white moments. "קאטים, פלאשים, מעברים יותר מעניינים, אפשר גם שחור לבן."
- **A hook that is truly impressive or funny.** The cow licking a face (Perfect for Me 137.3) beat everything else.
- **Action and spectacle in the middle and at the end:** the motorcycle, explosions, the car flipping. "שיראה הרבה יותר מדהים." The seaplane and the motorcycle are "סבבה".
- **His own films, many styles, only the best seconds of each.** "כמה שניות של הכי טובים והכי מטורפים מכל הסגנונות."

## He rejects
- Material that isn't his, immodest frames, and still images (hard rules).
- **"OK, not wow" shots:** icebergs, quiet landscapes, generic studio moments. If a shot wouldn't make someone stop scrolling, replace it.
- **Repetition of himself:** him at the computer or presenting to camera more than once per film. v6 keeps one computer shot (levik 32.7, editing the panther film, under "ועד המסך.") and one presenter shot (slot 8, under "עוצמה.").
- **Unintelligible speech:** narration lifted from a film's dialogue stem is "לא מובן בכלל". Speech must be clear words that make sense. Otherwise use no voice and let on-screen text tell it.
- **Text over his face:** "עוצמה." once covered his face and had to move to y 1620. Check every word against the face position.

## The text system (gfx.html), keep it
- `auraWord` styles:
  - **white:** huge white Rubik 900 with a smear of 10 blurred brand-colour copies and an RGB split.
  - **glow:** brand-gradient fill, white stroke, pink glow.
  - **grad:** gradient fill.
  - **ink:** black on white cards.
  - Words punch in with scale and rotation, and exit on the cut.
- **Cards before the drop:** "בלי מצלמה." (white card), "בלי צוות." (black), "בלי לוקיישן." (white). The toggle clicks are in the audio.
- **LEVIK MODE switch** (gradient, LV knob) turns on at the drop. A ray burst sits behind the logo, and the zoom goes through the V.
- **Category bars:** a pill tag ("פרסומות", "סרטי תדמית", "כל מקום בעולם", "סרטים היסטוריים", "סרטים לקהילות", "אנימציה", "קליפים ואקשן") plus one big word ("דמיון.", "עוצמה.", "עולמות.", "תקופות.", "רגש.", "קסם.", "אנרגיה.").
- **Knockout montage:** the half-beat montage plays only inside the letters of "בלי גבולות." on a white card.
- **Break:** "יש לך עסק? / יש לך סיפור. / בוא נעשה / ממנו סרט.", with the name card "לויק כהן / במאי · LEVIK PRODUCTION".
- **End card:** white, LV logo, "סרטי AI לעסקים ולארגונים", and the CTA "שלחו 'סרט' בהודעה".

## Cuts and hits (composite.py), keep them
- **Hard cuts land with an impact:** a zoom-blur on the first 2 frames and an RGB split of 12/7/3 px (bigger while shaking).
- **`splitcut`:** the left 42% keeps a pink duotone of the outgoing shot for 4 frames.
- **`pinkflash`:** a brand-pink frame flash. Also `invertcut` and white `flashcut`.
- **Inside a bar:** 2 beats + 1 + 1, with a flash or pink flash, then a split-cut, an invert or a plain cut.
- **Between sections:** blade, bars, iris, and the LV wipe.
- **Grades:**
  - brand duotones `duo_pink`, `duo_cyan` and `duo_violet`;
  - hard `bw`;
  - `warm`, `punch` and `film`;
  - `sharp` for 480p/720p sources and for wide crops.

## v6 structure (1080×1920, 30 fps, 37.35 s, Trailer Detonation at 132 BPM; drop TD = 7.95 s; bar L = 1.8172 s)
| t (s) | Section | Shots |
|---|---|---|
| 0–4.85 | hook, 3 shots: "זה לא צולם." / "גם זה לא." / "וגם לא זה." | seaplane over Machu Picchu, the cow, seaplane over Manhattan |
| 4.85–7.95 | three word cards | (cards are opaque) |
| 7.95–9.77 | logo + rays + LEVIK MODE | titan particle burst |
| 9.77–22.49 | seven category bars | ads (aligner, balloon, confetti), jet / presenter / globe, canyon / waterfall / jungle plane, Temple triptych, shofar / boy / son, Pixar army and Levites, warthog / boy pilot / pilot |
| 22.49–24.30 | knockout montage "בלי גבולות." | panther, zebra, retriever, manta, panther, kid pilot, panther, mascot |
| 24.30–26.12 | "מהרעיון / ועד המסך." | typing (titan), Levik editing (the one computer shot) |
| 26.12–33.39 | break, over LEVIK ACTION | on the bike in the rain, jump, SUV explodes, Levik by the film camera + name, car flips, wheelie over the wreck |
| 33.39–37.35 | white end card | |

## Directions for the next level (offer these, don't impose them)
- **Sound with a visible cause:** each hit, whoosh and explosion should line up with a cut. The action ending deserves real explosion SFX on 35/37.
- **A 15 s cut-down** for Trial Reels and ads: the hook, three category hits, the action ending and the end card.
- **For the aura edit:** a clear voice-over (with his OK for the cost), or text-only storytelling with no voice.
- **More from LEVIK ACTION and his other films** before inventing anything. Ask for the AGADA film (Ferrari / football) and the CapCut projects. They are only on his computer, and he has to upload them.
