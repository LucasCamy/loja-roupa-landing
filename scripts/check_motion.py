"""Decode the finished MP4 and measure its loop boundary against normal frame changes."""
from pathlib import Path
import json
import shutil
import subprocess
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
result = subprocess.run([shutil.which('ffmpeg'), '-v', 'error', '-i',
    str(ROOT / 'media' / 'hero-ambient.mp4'), '-vf', 'scale=320:180',
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True)
frames = np.frombuffer(result.stdout, dtype=np.uint8).reshape(-1, 180, 320, 3).astype(np.float32)
changes = np.abs(frames[1:] - frames[:-1]).mean(axis=(1, 2, 3))
boundary = float(np.abs(frames[-1] - frames[0]).mean())
median = float(np.median(changes))
report = {'decodedFrames': len(frames), 'normalFrameChangeMedian': median,
    'normalFrameChangeMax': float(changes.max()), 'lastToFirstChange': boundary,
    'boundaryToMedianRatio': boundary / max(median, .000001),
    'metric': 'Mean absolute RGB difference on 320x180 decoded frames, range 0-255.',
    'continuous': bool(boundary <= float(changes.max()) * 1.25 + .01)}
(ROOT / 'work' / 'motion-validation.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
assert report['continuous'], 'Loop boundary exceeds ordinary frame-to-frame changes'
