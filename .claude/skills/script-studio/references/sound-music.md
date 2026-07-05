# Sound & Music Director — score, sound design & Suno

Sound is half the film. It has two layers, handled DIFFERENTLY for AI video:
1. **SFX / sound design** — diegetic, in-world sound (footsteps, wind, fire, crowd, cloth,
   the strike of a cymbal). This is an **integral PART OF EACH SHOT'S PROMPT** — write the
   specific in-world sound INTO the video prompt so it's generated together with the footage
   (e.g. append a "Sound:" line to the I2V prompt).
2. **Music / score** — the ONLY layer kept out of the render. Composed **separately** (e.g. via
   **Suno**) and laid over in the edit. Never bake a musical score into the AI video prompt —
   the shot prompt says "diegetic sound effects only, no music."

---

## Spotting (where music lives)
"Spotting" = deciding where music enters, exits, and what it does per beat. Rules:
- **Music has a job** every time it plays — lift, dread, wonder, momentum, tears. If it isn't
  doing a job, cut it (silence is a cue too).
- **Enter on a turn**, exit on a turn — music sneaks in under a line, swells at the payoff.
- **Don't score everything** — a wall-to-wall score goes numb. Reserve the swell for the peak.
- **Silence is the loudest cue** — kill the music before the biggest moment and let SFX/void hit.
- **Hit points** — align a musical accent (a "stinger", a downbeat, a choir entrance) to a cut,
  a reveal, an impact.

## Emotion → musical language (the composer's map)
| Emotion | Tempo | Key/mode | Instrumentation | Dynamics |
|---|---|---|---|---|
| Awe / sacred | slow, 50–70 BPM | modal, open 5ths, Lydian | strings, choir, low drone, solo voice | swell to bloom |
| Grief / longing | 55–75 | minor, Aeolian | solo cello / ney / piano, sparse | restrained, one swell |
| Hope / redemption | 70–90 rising | major lift out of minor | strings + choir + light bells | build to radiant |
| Tension / dread | slow or pulsing | dissonance, cluster, ostinato | low strings, ticking pulse, breath | creep, no release |
| Action / chase | 120–160 | driving minor | war drums, brass, ostinato strings | relentless |
| Wonder / discovery | 80–100 | major, bright | celesta, harp, shimmering strings | gentle rise |
| Nostalgia | 65–85 | warm major | acoustic guitar / piano, soft pads | intimate |
| Triumph / arrival | 90–120 | major, fanfare | full brass, choir, percussion | massive |

## Reference the greats (for temp/inspiration — never copy)
- **Epic / sacred / mythic**: Hans Zimmer, Jóhann Jóhannsson, Hildur Guðnadóttir, Thomas Newman.
- **Adventure / theme**: John Williams (leitmotif master), Howard Shore.
- **Emotion / delicate**: Alexandre Desplat, Dario Marianelli, Max Richter.
- **Sacred / choral / ancient**: Kancheli, Górecki, Ennio Morricone (choir + solo voice), liturgical.
- **Jewish / Middle-Eastern color** (for this kind of film): cantorial (chazzanut) melody, ney/duduk,
  oud, kanun, frame drum, a solo tenor or boy soprano, a niggun-like wordless melody, Phrygian/Ahava
  Rabba (freygish) mode. This is the palette for a Beit HaMikdash / Jerusalem film.

## Leitmotif
Give the film (or a character/idea — e.g. "the Place", "Moshiach", "the boy") a short **theme** —
3–6 notes — and recur it transformed: hesitant at the open, full at the payoff, solo at the end.
It's what makes a score feel authored, not stock.

---

## Suno prompt craft (make the music)
Suno turns a text prompt into music. The reliable **formula** (5–8 tags, order matters):
`[genre/subgenre], [mood + narrative arc], [lead instruments], [tempo BPM], [production/era], instrumental`
- **5–8 tags.** Under 4 = generic; over 10 = later tags ignored.
- Describe the **emotion & arc**, not just instruments: *"builds to a massive climax", "creeping
  dread", "tender and bittersweet", "sparse then radiant".*
- **Instrumental**: put the word **instrumental / no vocals at the END** of the tag list (v5+),
  or use `[Instrumental]` and leave lyrics empty. For choir "oohs/aahs" say "wordless choir".
- **Tempo**: slow emotional 60–85 BPM; action 120–160. BPM tags are respected in v5.5+.
- **Structure tags** in the lyrics field shape arrangement: `[Intro] [Build] [Climax] [Outro]`.
- **Era tags** bias production hard ("1970s analog", "modern hybrid orchestral").
- Generate **2–4 variations** per cue and pick; extend/continue for length.

**Cinematic Suno templates:**
- Sacred awe: `cinematic orchestral, sacred and reverent, slow build to a radiant climax, wordless
  choir, solo cello, low drone, soft bells, 60 BPM, epic film score, instrumental`
- Grief/longing: `emotional film score, mournful and yearning, solo cello and ney flute, sparse
  piano, minor key, 68 BPM, intimate, instrumental`
- Middle-Eastern sacred: `Middle-Eastern cinematic, ancient and holy, ney and oud and frame drum,
  cantorial solo voice, Phrygian mode, slow, 66 BPM, film soundtrack, instrumental`
- Triumphant arrival: `epic orchestral, triumphant and hopeful, full brass and choir and war drums,
  soaring strings, 100 BPM, cinematic climax, instrumental`

## Sound design / SFX (the diegetic layer)
Build the world in sound, layer by layer:
- **Ambience beds** — room tone, wind, distant crowd, night, birds; the "where".
- **Foley** — footsteps, cloth, hands, objects; the "who/what" up close.
- **Hard SFX** — a door, fire whoosh, a cymbal, a page turn, an impact; the "hits".
- **Signature sound** — one ownable sound (a sub-bass "pulse", a shofar tone, a bell) recurring.
- **Detail sells realism** — sweeten with specifics (the crackle of parchment, the ring of a
  struck cymbal decaying, sandals on stone, the hush of a huge empty space).
- For AI video: write the shot's specific SFX **into the prompt** as a "Sound:" line ending with
  **"diegetic sound effects only, no music"** — so the in-world sound is generated with the
  footage while the musical score stays yours to lay in separately.

## The mix (music + SFX + silence)
- **Duck** one under the other — pull SFX/ambience down when the score swells, and vice-versa.
- **Contrast** — full mix → sudden silence lands the biggest beat.
- **Score the rhythm** — cut pace, music pulse, and silence are one system.

## Deliverable format
```
MUSIC SPOTTING: per beat — [in/out] | job (dread/awe/hope…) | theme used
SUNO PROMPTS: per cue — the paste-ready tag line + structure tags + 2 alt moods
LEITMOTIF: the film's theme + how it transforms across the beats
SFX / SOUND DESIGN: per beat — a paste-ready "Sound:" line to append INTO that shot's video
  prompt (ambience + foley + hard SFX + the signature sound), ending "diegetic sound effects only, no music"
MIX NOTES: ducking, silences, hit points
SOURCES: reference scores + Suno technique
```
Research reference scores and current Suno technique per project before finalizing.
