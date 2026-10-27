"""Single source of timing for the LEVIK PRODUCTION ad (v4: aura-style edit).

Picture (gfx.html), the footage compositor (composite.py) and the audio mix
(audio.py) all read timeline.json, which this script writes.
"""
import json

FPS = 30
TD = 7.95            # music drop (Trailer Detonation 52.651 s lands here)
L = 1.8172           # one bar at 132 BPM
BB = L / 4           # one beat
DUR = 37.35


def tb(k):
    return round(TD + k * L, 4)


def f(t):
    return int(round(t * FPS))


# Shot slots: (t0, t1). Footage sources are assigned in shots.json.
SLOTS = [
    (0.18, 1.70), (1.70, 3.234), (3.234, 4.85),          # 0-2 hook
    (TD, tb(1)),                                          # 3 behind the logo
]
for k in range(1, 8):                                     # 4-22 seven category bars: 2 beats + 1 + 1
    if k == 4:                                            # 13 the history bar is one stacked triptych
        SLOTS += [(tb(k), tb(k + 1))]
    else:
        SLOTS += [(tb(k), tb(k) + 2 * BB), (tb(k) + 2 * BB, tb(k) + 3 * BB), (tb(k) + 3 * BB, tb(k + 1))]
SLOTS += [(tb(8) + i * BB / 2, tb(8) + (i + 1) * BB / 2) for i in range(8)]   # 23-30 half-beat montage
SLOTS += [(tb(9), tb(9) + 2 * BB), (tb(9) + 2 * BB, tb(10))]                 # 31-32 idea
SLOTS += [(tb(10), tb(11)),                                                   # 33 studio wide
          (tb(11), tb(11) + 2 * BB), (tb(11) + 2 * BB, tb(12)),               # 34-35 story
          (tb(12), tb(13)),                                                   # 36 close-up + name
          (tb(13), tb(13) + 2 * BB), (tb(13) + 2 * BB, tb(14))]               # 37-38 let's make it
SLOTS += [(tb(14), DUR)]                                                      # 39 end card

# Transition into shot i (key = i). D = frames, centred on the cut.
TRANS = {
    1: ('blade', 10, {'dir': 1}), 2: ('bars', 10, {'n': 5, 'dir': -1}),
    4: ('lv', 14, {}), 7: ('blade', 8, {'dir': -1}), 10: ('iris', 10, {'cx': 540, 'cy': 960}),
    13: ('bars', 10, {'n': 5, 'dir': 1}), 14: ('blade', 8, {'dir': 1}), 17: ('iris', 10, {'cx': 540, 'cy': 300}),
    20: ('flashcut', 0, {'shake': 1}),
    31: ('bars', 8, {'n': 4, 'dir': -1}), 32: ('cut', 0, {}),
    33: ('iris', 16, {'cx': 540, 'cy': 960}), 34: ('blade', 12, {'dir': -1}), 35: ('flashcut', 0, {}),
    36: ('bars', 12, {'n': 6, 'dir': 1}), 37: ('flashcut', 0, {}), 38: ('cut', 0, {}),
    39: ('whiteramp', 0, {}),
}
for first in (4, 7, 10, 14, 17, 20):                      # inside a bar: flash, then cut / invert
    TRANS[first + 1] = ('flashcut', 0, {})
    TRANS[first + 2] = ('invertcut', 0, {}) if first in (7, 17, 20) else ('cut', 0, {})
for j, ty in enumerate(['invertcut', 'flashcut', 'cut', 'flashcut', 'invertcut', 'cut', 'flashcut', 'cut']):
    TRANS[23 + j] = (ty, 0, {})

# Copy. Hebrew strings are stored in logical order and shaped by the browser.
TEXT = {
    'hook': [(0.18, 1.70, 'זה לא צולם.', 1450, 0), (1.70, 3.234, 'גם זה לא.', 1450, -0.09), (3.234, 4.85, 'וגם לא זה.', 430, 0.06)],
    'cards': [(4.85, 'בלי מצלמה.', 'white'), (5.88, 'בלי צוות.', 'black'), (6.91, 'בלי לוקיישן.', 'white')],
    'studio': 'סטודיו לסרטי AI',
    'mode': 'LEVIK MODE',
    'bars': [  # (tag, big word, word y)
        ('פרסומות', 'דמיון.', 430),
        ('סרטי תדמית', 'עוצמה.', 430),
        ('כל מקום בעולם', 'עולמות.', 430),
        ('סרטים היסטוריים', 'תקופות.', 960),
        ('סרטים לקהילות', 'רגש.', 430),
        ('אנימציה', 'קסם.', 430),
        ('קליפים ואקשן', 'אנרגיה.', 430),
    ],
    'montage': 'בלי גבולות.',
    'idea': [('מהרעיון', 1500), ('ועד המסך.', 1500)],
    'break': [('יש לך עסק?', 1560), ('יש לך סיפור.', 1500), ('בוא נעשה', 330), ('ממנו סרט.', 1500)],
    'end_line': 'סרטי AI לעסקים ולארגונים',
    'cta': "שלחו 'סרט' בהודעה",
    'face_name': 'לויק כהן',
    'face_role': 'במאי · LEVIK PRODUCTION',
}

tl = {
    'fps': FPS, 'TD': TD, 'L': L, 'BB': BB, 'dur': DUR, 'nf': f(DUR),
    'tb': [tb(k) for k in range(15)],
    'shots': [{'i': i, 't0': round(a, 4), 't1': round(b, 4), 'f0': f(a), 'f1': f(b), 'track': i % 2} for i, (a, b) in enumerate(SLOTS)],
    'trans': {str(k): {'type': v[0], 'D': v[1], **v[2]} for k, v in TRANS.items()},
    'text': TEXT,
    'opaque': [(0.0, 0.18), (4.85, TD), (tb(14) + 0.1, DUR)],
    'face': [tb(12), tb(13)],
    'mode': [tb(1) + 0.12, tb(1) + 0.42, tb(14)],      # LEVIK MODE toggle: appears, switches on, leaves
    'shake': [(TD, 0.5, 18), (tb(7), 0.6, 16), (tb(14), 0.4, 12)],
}
with open('timeline.json', 'w', encoding='utf-8') as fp:
    json.dump(tl, fp, ensure_ascii=False, indent=1)
with open('timeline.js', 'w', encoding='utf-8') as fp:
    fp.write('window.TL=' + json.dumps(tl, ensure_ascii=False) + ';\n')
print(tl['nf'], 'frames;', len(SLOTS), 'shots')
