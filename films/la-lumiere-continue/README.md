# La lumière continue: Beth Loubavitch République (50s, 16:9)

A 50-second fundraising film for Beth Loubavitch, 11e République, built from the storyboard
"From Fire to Light" (32 shots). This folder holds only code and the timeline. The photos, videos
and logo are not in git (they are personal material). To rebuild, put them in `input/`
(or point `FILM_INPUT` at another folder).

**Spec:** 1920×1080, 30fps, 1500 frames, H.264 yuv420p BT.709, AAC 48k, −15 LUFS, true peak ≤ −1 dBTP.

## Structure
| Time | Content | Source |
|---|---|---|
| 0–15.0 | The riots on the square, through to the car fire (shots 1–14) | AI reconstructions from the storyboard, labelled on screen "Images reconstituées" |
| 15.0–20.0 | The real damage, the rabbi beside the car, the space that was filmed (15–18) | Real photos and video |
| 20.0–23.5 | Fire, extinguished wick, hand lighting the wick (19–21) | Storyboard frames (artistic transition) |
| 23.5–42.0 | The real activity: room, meeting, tefillin, sukkah, prayer, meal, Torah, song (22–29) | Real photos and the song video with its original sound |
| 42.0–45.0 | Candle + "Ensemble, ajoutons de la lumière." The light floods the frame | Storyboard frame, text removed and reset |
| 45.0–50.0 | The light condenses into the lantern flame in the logo, the logo builds, "Aidez-nous à continuer." + QR | The original logo |

The narration is set as on-screen French text (per the storyboard script). No voice recording was made.

## Files in `input/`
| File | What it is | Shot |
|---|---|---|
| `storyboard.pdf` | Beth_Loubavitch_Republique_50s_Storyboard_16x9.pdf | 1–14, 19–21, 27, 30 |
| `15_car_front.jpg` | Burnt car, front | 15 |
| `16_car_rear.jpg` | Burnt car, rear seats | 16 |
| `17_rabbi_car.jpg` | The rabbi beside the car, Rue Léon Jouhaux | 17 |
| `18_damage.mp4` | Vertical video of the damaged space (2.5–3.9s are used) | 18 |
| `22_room.jpg` `23_selfie.jpg` `24_tefillin.jpg` `25_sukkah.jpg` `26_prayer.jpg` `28_torah.jpg` | Real activity | 22–28 |
| `29_song.mp4` | Song and dancing (3.0–5.0s, picture and sound) | 29 |
| `logo.jpg` | Beth Loubavitch 11ème République logo on white | 31–32 |

Shot 27 (the meal) uses the frame from the storyboard because the original photo (1053831.jpg) has not been supplied. Drop it into `input/` and add it to `photos` in `prep.py`.

## Build
```bash
pip install numpy scipy pillow opencv-python-headless playwright
mkdir -p fonts && (cd fonts && npm pack @fontsource/cinzel@5.2.6 && tar xzf fontsource-cinzel-*.tgz)
python3 prep.py      # crops, logo cut-out, video frames, grain
python3 bake.py      # each shot's colour grade baked into the pixels
python3 build.py     # film.html = template + timeline + embedded fonts
python3 score.py     # temp sound design -> audio/score.wav (-15 LUFS)
python3 render.py film.html out.mp4 --audio audio/score.wav --workers 3
python3 render.py film.html stills --frames 15.6,23.4,45.4   # stills for checking
```
All timing (cuts, captions, logo build, sound cues) lives in `timeline.json`, which both picture and sound read.
`render.py` points at the Chromium preinstalled in the cloud environment (`/opt/pw-browsers/...`). On another machine, change `CHROME`.

## Still open
- Donation link / QR: placeholder on the end card ("lien de don à valider").
- Narration: the French text is on screen. A recorded or generated voice-over has to be added to `score.py` and duck the music.
- Shot 29 sound: the original recording is mixed in at −4 dB. Listen to it before publishing.
- The AI frames are at storyboard resolution (512×288 upscaled). For a final version, use the full-resolution originals or generated clips.
