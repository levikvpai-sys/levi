# Pipeline: how a LEVIK edit is built, checked and shipped

## Two machines
| | Local session container | Editing box (Composio remote bash / workbench) |
|---|---|---|
| CPU / RAM | 4 CPU | 1 CPU, ~1 GB RAM, ~20 GB disk |
| Network | GitHub and npm only (Kolbo, Drive and CDNs are blocked) | full internet |
| Has | Playwright + Chromium, ffmpeg, the repo | Python 3 + numpy + PIL. **It gets reset** (everything under /home/user is gone) |
| Does | gfx/mask layers (`build_layers.py`), code, commits | downloads, proxies, compositing, encoding, uploads |

- **Local → box:** commit and push, then `curl -sSfL https://raw.githubusercontent.com/levikvpai-sys/levi/<sha>/<path>` on the box. Pin the commit sha so you don't pick up a stale cache.
- **Box → you:** upload a small preview to Magnific and view its frames (§QA).
- **Box → Levik:** a Kolbo upload ticket (§Deliver).

## Box setup after a reset
```bash
mkdir -p /home/user/bin /home/user/v3/src /home/user/v3/aud && cd /tmp
curl -sSL -o ff.tar.xz https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && tar xf ff.tar.xz \
  && cp ffmpeg-*-static/ffmpeg ffmpeg-*-static/ffprobe /home/user/bin/ && rm -rf ff.tar.xz ffmpeg-*-static
cd /home/user/v3 && R=https://raw.githubusercontent.com/levikvpai-sys/levi/<sha>/video/levik-ad-v3
for f in composite.py timeline.json shots.json sources.json fetch_sources.py out/gfx.mp4 out/mask.mp4; do curl -sSfL -o $(basename $f) $R/$f; done
python3 fetch_sources.py            # Magnific sources need MAG='{"<id>": "<fresh url>"}' (creations_get gives signed URLs)
```
The static ffmpeg build has **no drawtext**. Label contact sheets with PIL, or read the times from `video_view_frames`.

## Box pitfalls (each one cost time once)
- **The tool call times out at 60 s.** Start long jobs detached and poll:
  - start: `(setsid python3 composite.py ... > log 2>&1 < /dev/null &)`;
  - poll: `sleep 45; tail log` in a separate call.
- **`pkill -f composite.py` kills the shell that runs it**, because the pattern matches its own command line. Use `pkill -f "[c]omposite.py"` or kill by PID.
- **Remote bash sometimes returns 403** (a firewall on the command text). Split the command into smaller calls. Long one-liners with `-sSIL`, `nohup` or `&` tripped it.
- **A single long x264 run gets OOM-killed** on the 1 GB box. `composite.py` encodes in 4 s segments and renders in chunks of 150 frames with retries.

## The 9:16 ad (`video/levik-ad-v3/`)
- `timeline.py` → `timeline.json` / `.js`: the single source of timing (slots, transitions, text, opaque spans, shake) on the music grid.
- `gfx.html` + `render.mjs` + `build_layers.py` (local): every frame is a pure function of t. Output:
  - `out/gfx.mp4`: 1080×3840, premultiplied RGB on top, alpha as grey below;
  - `out/mask.mp4`: A/B matte, white = track B (odd shots).
  - Re-run only when text or transitions change. Commit the layers; the box downloads them.
- `composite.py` (box):
  - `proxies`: a graded 9:16 proxy per shot, with 15% headroom for push-ins and shake.
  - `render`: explode, chunked composite to `fr/`, segment encode, mux with `aud/mix.wav`.
  - `patch BASE N0`: keep frames < N0 and the mix of an earlier render; re-composite from N0. Start N0 at least half a transition before the first changed cut; for an iris of 16 frames, that's 8 frames earlier.
- `shots.json`: per slot `src`, `in` (s), `cx` (crop centre 0–1), `z0`/`z1` (push), `grade`, `sharp`, `note`; or `stack` for the triptych.
- `audio.py`: the Trailer Detonation edit plus SFX at −14 LUFS. The drop at 52.651 s lands on TD.
- `sources.json` + `fetch_sources.py`: the catalogue and the downloader. Add every new source to the catalogue with owner, use and notes.

## The 16:9 aura edit (`video/levik-aura/`)
- 1280×720, 24 fps, 744 frames.
- `render.py out.mp4 range A B` renders frames in ranges.
- `audio.py`:
  - narration from the dialogue stem;
  - Cowbell Menace with ducking;
  - the shofar from the M&E stem;
  - SFX;
  - −14 LUFS.
- It works in `/home/user/wow` on the box. Its source fetch is not catalogued yet: read the README and rebuild the fetch before you need it.

## QA (before showing him anything)
- **Look at the changed seconds:**
  - Make a 360 px preview, e.g. `ffmpeg -framerate 30 -start_number N -i fr/%05d.jpg -frames:v K -vf scale=360:-2 …`.
  - Upload it: `magnific creations_request_upload` → `curl -X PUT` → `creations_finalize_upload visible=false`.
  - View it: `video_view_frames` with exact timestamps (≤16 per call; one read at a time per account).
- **Checklist:**
  - every face readable, not cut by the crop and not covered by text;
  - nothing immodest anywhere in the frame;
  - only his sources;
  - no dark or murky openings (v6 slot 33 opened on a jacket and was moved to 10.0 s);
  - text inside the safe zones;
  - one computer shot and one presenter shot at most;
  - cuts on the beat.
- **Measure:**
  - `ffprobe`: 1080×1920, 30 fps, 1120 frames for the ad, AAC 48 kHz;
  - `ebur128`: −14 LUFS integrated, true peak below −1 dBFS;
  - a full decode with `-f null -` passes.
- **Tell him** what was not checked, e.g. the audio was not listened to.

## Deliver
- **Upload:** `kolbo create_upload_ticket`, then on the box `curl -X POST <upload_url> -H "Authorization: Bearer <token>" -F "file=@out.mp4;type=video/mp4"`. The link is `media.url`.
- **Check the link:** `curl -r 0-1023 -D -` must give `206` with `content-type: video/mp4`.
- **Instagram copy:** the compositor's `out.mp4` is about 25 Mbps, too high for a Reel. Make a separate IG copy:
  `ffmpeg -i out.mp4 -c:v libx264 -preset fast -crf 18 -maxrate 14M -bufsize 28M -threads 1 -x264-params rc-lookahead=10:ref=2:keyint=60 -pix_fmt yuv420p -c:a copy -movflags +faststart LEVIK_PRODUCTION_ad_vN.mp4`
  It takes about 3 min on the box.

## Instagram (only with an approved caption)
- **Connection:** Composio toolkit `instagram`, account `instagram_logy-arsine`, user `levikproduction.ai` (id `38835510089430075`).
- **Steps:**
  1. `INSTAGRAM_POST_IG_USER_MEDIA` with `media_type REELS`, `video_url` = the Kolbo link, `caption`, `thumb_offset` (ms) and `share_to_feed true`.
  2. `INSTAGRAM_POST_IG_USER_MEDIA_PUBLISH` with `max_wait_seconds 240`.
  3. `INSTAGRAM_GET_IG_MEDIA` to confirm the caption and get the permalink.
- **Caption:** no `#` (the tool hints at URL-encoding hashtags and could truncate the caption), and no `&`. Hashtags barely matter anyway.
- **Never publish twice:** a 409 means it is already published.
- **v6 caption** (approved, client CTA):
  ```
  סרט פרסומת שנעשה כולו ב-AI. אף שוט פה לא צולם.

  בלי מצלמה. בלי צוות. בלי לוקיישן.
  מטוס מעל מאצ'ו פיצ'ו, בית המקדש, אנימציה, ואופנוע בתוך פיצוץ.
  כל שוט נבנה אצלי בסטודיו.

  יש לכם עסק ורעיון לסרט? שלחו לי ״סרט״ בהודעה, ואשלח לכם 3 סרטים לדוגמה.

  לויק כהן | LEVIK PRODUCTION
  ```
