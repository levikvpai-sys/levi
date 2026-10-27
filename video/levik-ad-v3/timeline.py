"""Single source of timing for the LEVIK PRODUCTION ad v3.

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
for k in range(1, 8):                                     # 4-17 seven category bars
    SLOTS += [(tb(k), tb(k) + 2 * BB), (tb(k) + 2 * BB, tb(k + 1))]
SLOTS += [(tb(8) + i * BB, tb(8) + (i + 1) * BB) for i in range(4)]   # 18-21 beat cuts
SLOTS += [(tb(9), tb(9) + 2 * BB), (tb(9) + 2 * BB, tb(10))]         # 22-23
SLOTS += [(tb(k), tb(k + 1)) for k in range(10, 14)]                  # 24-27 break
SLOTS += [(tb(14), DUR)]                                              # 28 end card

# Transition into shot i (key = i). D = frames, centred on the cut.
TRANS = {
    1: ('blade', 10, {'dir': 1}), 2: ('bars', 10, {'n': 5, 'dir': -1}),
    4: ('lv', 14, {}), 5: ('flashcut', 0, {}),
    6: ('blade', 8, {'dir': -1}), 7: ('cut', 0, {}),
    8: ('iris', 10, {'cx': 540, 'cy': 960}), 9: ('cut', 0, {}),
    10: ('bars', 10, {'n': 5, 'dir': 1}), 11: ('cut', 0, {}),
    12: ('blade', 8, {'dir': 1}), 13: ('cut', 0, {}),
    14: ('iris', 10, {'cx': 540, 'cy': 300}), 15: ('cut', 0, {}),
    16: ('flashcut', 0, {'shake': 1}), 17: ('cut', 0, {}),
    18: ('invertcut', 0, {}), 19: ('flashcut', 0, {}), 20: ('invertcut', 0, {}), 21: ('flashcut', 0, {}),
    22: ('bars', 8, {'n': 4, 'dir': -1}), 23: ('cut', 0, {}),
    24: ('iris', 16, {'cx': 540, 'cy': 960}), 25: ('blade', 12, {'dir': -1}),
    26: ('bars', 12, {'n': 6, 'dir': 1}), 27: ('flashcut', 0, {}),
    28: ('whiteramp', 0, {}),
}

# Copy. Hebrew strings are stored in logical order and shaped by the browser.
TEXT = {
    'hook': [(0.18, 1.70, 'זה לא צולם.', 1450), (1.70, 3.234, 'גם זה לא.', 1450), (3.234, 4.85, 'וגם לא זה.', 430)],
    'silence': [(4.95, 'בלי מצלמה.'), (5.85, 'בלי צוות.'), (6.75, 'בלי לוקיישן.')],
    'studio': 'סטודיו לסרטי AI',
    'bars': [  # (tag, big word, word y)
        ('פרסומות', 'דמיון.', 430),
        ('סרטי תדמית', 'עוצמה.', 430),
        ('כל מקום בעולם', 'עולמות.', 430),
        ('סרטים היסטוריים', 'תקופות.', 430),
        ('סרטים לקהילות', 'רגש.', 430),
        ('טבע ובעלי חיים', 'חיים.', 430),
        ('קליפים ואקשן', 'אנרגיה.', 430),
    ],
    'idea': [('מהרעיון', 1500), ('ועד המסך.', 1500)],
    'break': [('יש לך עסק?', 430), ('יש לך סיפור.', 1500), ('בוא נעשה', 1300), ('ממנו סרט.', 1480)],
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
    'opaque': [(0.0, 0.18), (4.85, TD)],
    'face': [tb(12), tb(13)],
    'card': [190, 460, 700, 800],      # portrait card on shot 26 (x, y, w, h in the 1080x1920 frame)
    'shake': [(TD, 0.5, 18), (tb(7), 0.6, 16), (tb(14), 0.4, 12)],
}
with open('timeline.json', 'w', encoding='utf-8') as fp:
    json.dump(tl, fp, ensure_ascii=False, indent=1)
with open('timeline.js', 'w', encoding='utf-8') as fp:
    fp.write('window.TL=' + json.dumps(tl, ensure_ascii=False) + ';\n')
print(tl['nf'], 'frames;', len(SLOTS), 'shots')
