"""Build requested media from original generated artwork. All paths stay in this project."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import argparse
import hashlib
import json
import math
import shutil
import subprocess
import zipfile
from PIL import Image, ImageOps, ImageDraw
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / 'sources'
MEDIA = ROOT / 'media'
WORK = ROOT / 'work'
FFMPEG = shutil.which('ffmpeg')
FFPROBE = shutil.which('ffprobe')
SIZE = (1024, 576)
STATIC = {
    'hero-main': ((1920, 1200), 'Modelo com vestido midi de linho terracota em ateliê iluminado pelo sol, com cortina de linho e arara de madeira clara.', (.54, .48)),
    'lookbook-full': ((1200, 1500), 'Look completo com blazer de linho areia, top cropped de tricô off-white e calça pantalona de alfaiataria.', (.5, .5)),
    'atelier-process': ((1400, 1050), 'Mesa de modelagem com rolos de linho, fita métrica, tesoura dourada, amostras de tecidos e botões naturais.', (.5, .5)),
    'founder-portrait': ((1200, 1500), 'Retrato editorial de diretora criativa fictícia ajustando uma peça em manequim de costura no ateliê.', (.48, .38)),
    'sketch-before': (SIZE, 'Croqui de vestido midi sobre papel creme, com linhas de construção e cotas de caimento alinhadas à imagem final.', (.54, .48)),
}
PRODUCTS = [
    ('Vestido Midi Brisa em Linho Puro', 'Terracota / Areia', 'vestido midi de linho terracota com alças largas e botões naturais'),
    ('Blazer Oversized Atelier 100% Linho', 'Areia / Off-White', 'blazer oversized de linho areia com lapelas e bolsos'),
    ('Calça Pantalona Pregas Alfaiataria', 'Areia / Cacau', 'calça pantalona areia com cintura alta e pregas de alfaiataria'),
    ('Top Tricô Ponto Trama Artesanal', 'Manteiga / Cru', 'top cropped de tricô artesanal amarelo manteiga com ponto texturizado'),
    ('Conjunto Co-ord Camisa + Short Linho', 'Verde Sálvia', 'conjunto de camisa e short de linho verde sálvia'),
    ('Saia Midi Evasê Botões Madrepérola', 'Off-White / Areia', 'saia midi evasê off-white com botões de madrepérola'),
    ('Vestido Longo Resort Frente Única', 'Amarelo Manteiga / Terracota', 'vestido longo frente única amarelo manteiga'),
    ('Cardigan Tricô Botões Tartaruga', 'Cacau / Caramelo', 'cardigan de tricô cacau com botões tartaruga'),
]
for index, (_, _, description) in enumerate(PRODUCTS, 1):
    for side in ('a', 'b'):
        STATIC[f'prod-{index:02d}-{side}'] = ((1000, 1250),
            ('Vista frontal de ' if side == 'a' else 'Detalhe de textura e acabamento de ') + description + '.',
            (.5, .5))


def run(args):
    result = subprocess.run([str(x) for x in args], cwd=ROOT, capture_output=True, text=True, encoding='utf-8', errors='replace', check=False)
    if result.returncode:
        raise RuntimeError('Command failed: ' + str(args[0]) + '\n' + result.stderr[-5000:])
    return result.stdout


def fit(path, size):
    with Image.open(path) as source:
        return ImageOps.fit(source.convert('RGB'), size, method=Image.Resampling.LANCZOS)


def avif(source):
    # Separate invocation for EVERY image: never use image2 output for AVIF.
    target = source.with_suffix('.avif')
    run([FFMPEG, '-v', 'error', '-y', '-i', source,
         '-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-c:v', 'libaom-av1',
         '-still-picture', '1', '-crf', '30', '-b:v', '0', '-cpu-used', '6',
         '-threads', '2', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709',
         '-color_trc', 'iec61966-2-1', '-colorspace', 'bt709', '-color_range', 'tv',
         '-frames:v', '1', target])
    return target


def statics():
    MEDIA.mkdir(exist_ok=True)
    def convert(item):
        name, (size, _, _) = item
        image = fit(SOURCES / (name + '.png'), size)
        path = MEDIA / (name + '.webp')
        image.save(path, 'WEBP', quality=84, method=6)
        avif(path)
        return name
    with ThreadPoolExecutor(max_workers=4) as pool:
        for name in pool.map(convert, STATIC.items()):
            print('Encoded', name, flush=True)


def smoothstep(value):
    value = np.clip(value, 0, 1)
    return value * value * (3 - 2 * value)


def move_fabric(image, phase, ambient=False):
    """Small local deformations, locked face and environment, no camera zoom."""
    width, height = image.size
    mesh = []
    def point(x, y):
        nx, ny = x / width, y / height
        if ambient:
            curtain = math.exp(-((nx - .21) / .25) ** 4) * min(1, ny * 5)
            rail = math.exp(-((nx - .75) / .24) ** 4) * max(0, (ny - .3) / .7)
            dx = 2.1 * curtain * math.sin(phase + ny * 5) + .9 * rail * math.sin(phase + ny * 3 + 1)
            dy = .6 * curtain * math.cos(phase + nx * 4)
        else:
            skirt = math.exp(-((nx - .54) / .14) ** 4) * math.exp(-((ny - .71) / .24) ** 4)
            curtain = math.exp(-((nx - .15) / .12) ** 4)
            dx = 1.35 * skirt * math.sin(phase + ny * 4) + .6 * curtain * math.sin(phase + ny * 3)
            dy = .35 * skirt * math.cos(phase + nx * 3)
        return x + dx, y + dy
    step = 32
    for y in range(0, height, step):
        for x in range(0, width, step):
            right, bottom = min(x + step, width), min(y + step, height)
            quad = (*point(x, y), *point(x, bottom), *point(right, bottom), *point(right, y))
            mesh.append(((x, y, right, bottom), quad))
    return image.transform(image.size, Image.Transform.MESH, mesh, Image.Resampling.BICUBIC)


def frames():
    folder = MEDIA / 'frames'
    folder.mkdir(exist_ok=True)
    photograph = fit(SOURCES / 'hero-main.png', SIZE)
    sketch = np.asarray(fit(SOURCES / 'sketch-before.png', SIZE), dtype=np.float32)
    height, width = SIZE[1], SIZE[0]
    yy, xx = np.mgrid[0:height, 0:width].astype(np.float32)
    diagonal = (.68 * xx / width + .32 * yy / height)[..., None]
    # Retain the generated paper's texture; only dark construction lines draw on.
    paper = np.maximum(sketch, np.array([247, 242, 232], dtype=np.float32))
    for index in range(1, 121):
        phase = (index - 1) / 119 * 2 * math.pi
        photo = np.asarray(move_fabric(photograph, phase), dtype=np.float32)
        light = 1 + .006 * math.sin(phase)
        photo = np.clip(photo * light, 0, 255)
        if index <= 35:
            progress = (index - 1) / 34
            ink = .13 + .87 * smoothstep((progress * 1.15 - diagonal) / .15)
            result = paper * (1 - ink) + sketch * ink
        elif index <= 85:
            progress = (index - 36) / 49
            reveal = smoothstep((progress * 1.12 - diagonal) / .12)
            result = sketch * (1 - reveal) + photo * reveal
        else:
            result = photo
        output = folder / f'frame_{index:04d}.webp'
        Image.fromarray(np.uint8(np.clip(result, 0, 255))).save(output, 'WEBP', quality=80, method=5)
        if index % 20 == 0:
            print('Rendered frame', index, flush=True)
    with ThreadPoolExecutor(max_workers=4) as pool:
        for index, _ in enumerate(pool.map(avif, sorted(folder.glob('frame_*.webp'))), 1):
            if index % 20 == 0:
                print('Encoded AVIF frame', index, flush=True)


def video():
    folder = WORK / 'ambient'
    folder.mkdir(parents=True, exist_ok=True)
    original = fit(SOURCES / 'ambient-source.png', (1280, 720))
    for index in range(120):
        # A five-second source is crossfaded over 0.5 s, then trimmed to 4.5 s.
        phase = index / 108 * 2 * math.pi
        frame = np.asarray(move_fabric(original, phase, ambient=True), dtype=np.float32)
        frame *= 1 + .005 * math.sin(phase)
        Image.fromarray(np.uint8(np.clip(frame, 0, 255))).save(folder / f'{index:04d}.png')
    filter_graph = ('[0:v]format=yuv420p,split=2[body][head];'
        '[head]trim=duration=0.5,setpts=PTS-STARTPTS[opening];'
        '[body][opening]xfade=transition=fade:duration=0.5:offset=4.5,'
        'trim=start=0.5:end=5,setpts=PTS-STARTPTS,format=yuv420p[out]')
    run([FFMPEG, '-v', 'error', '-y', '-framerate', '24', '-i', folder / '%04d.png',
        '-filter_complex', filter_graph, '-map', '[out]', '-c:v', 'libx264',
        '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', '24',
        '-frames:v', '108', '-movflags', '+faststart', '-an', MEDIA / 'hero-ambient.mp4'])
    print('Encoded hero-ambient.mp4', flush=True)


def describe(path, alt, focal, size):
    return {'path': path.relative_to(ROOT).as_posix(), 'format': path.suffix[1:],
        'width': size[0], 'height': size[1], 'bytes': path.stat().st_size,
        'alt': alt, 'focalPoint': {'x': focal[0], 'y': focal[1]},
        'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}


def probe(path):
    return json.loads(run([FFPROBE, '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path]))


def validate_and_manifest():
    records = []
    errors = []
    for name, (size, alt, focal) in STATIC.items():
        for extension in ('avif', 'webp'):
            path = MEDIA / f'{name}.{extension}'
            with Image.open(path) as image:
                image.load()
                if image.size != size:
                    errors.append(str(path) + ': dimensions')
            if extension == 'avif':
                # Check that the actual AV1 configuration box is populated.
                data = path.read_bytes()
                pos = data.find(b'av1C')
                box_size = int.from_bytes(data[pos-4:pos], 'big') if pos >= 4 else 0
                if box_size <= 8 or data[pos+4] & 0x80 == 0:
                    errors.append(str(path) + ': invalid av1C')
            records.append(describe(path, alt, focal, size))
    frame_records = []
    for index in range(1, 121):
        act = 1 if index <= 35 else 2 if index <= 85 else 3
        text = {1: 'Croqui de vestido de linho com linhas de corte e cotas surgindo sobre papel creme.',
                2: 'Varredura diagonal revela a textura do linho e o vestido terracota no ateliê.',
                3: 'Vestido midi finalizado no ateliê, com movimento sutil do tecido e da luz.'}[act]
        item = {'index': index, 'timeSeconds': round((index - 1) / 24, 6), 'act': act, 'files': []}
        for extension in ('avif', 'webp'):
            path = MEDIA / 'frames' / f'frame_{index:04d}.{extension}'
            with Image.open(path) as image:
                image.load()
                if image.size != SIZE:
                    errors.append(str(path) + ': dimensions')
            if extension == 'avif':
                data = path.read_bytes()
                pos = data.find(b'av1C')
                if pos < 4 or int.from_bytes(data[pos-4:pos], 'big') <= 8 or data[pos+4] & 0x80 == 0:
                    errors.append(str(path) + ': invalid av1C')
            item['files'].append(describe(path, text, (.54, .48), SIZE))
        frame_records.append(item)
    path = MEDIA / 'hero-ambient.mp4'
    metadata = probe(path)
    stream = metadata['streams'][0]
    assert len(metadata['streams']) == 1 and stream['codec_type'] == 'video'
    assert stream['codec_name'] == 'h264' and stream['width'] == 1280 and stream['height'] == 720
    assert stream['r_frame_rate'] == '24/1' and int(stream['nb_frames']) == 108
    assert abs(float(metadata['format']['duration']) - 4.5) < .01
    data = path.read_bytes()
    assert data.find(b'moov') < data.find(b'mdat'), 'MP4 faststart missing'
    video_item = describe(path, 'Brisa suave movimenta cortina e peças de linho em arara de madeira sob luz dourada do ateliê.', (.62, .5), (1280, 720))
    video_item.update({'codec': 'h264', 'fps': 24, 'durationSeconds': 4.5, 'frameCount': 108,
        'crf': 24, 'audio': False, 'faststart': True, 'loop': True,
        'crossfade': {'transition': 'fade', 'durationSeconds': .5, 'sourceOffsetSeconds': 4.5,
                      'postCrossfadeTrimStartSeconds': .5, 'sourceDurationSeconds': 5}})
    if errors:
        raise RuntimeError('\n'.join(errors))
    manifest = {'status': 'ready', 'brand': 'Aura Linho & Atelier', 'language': 'pt-BR',
        'createdDate': '2026-10-28', 'focalPointConvention': 'Normalized coordinates from top-left, x/y in [0,1].',
        'provenance': {'stills': 'AI-generated original editorial artwork using built-in image_gen.',
            'people': 'Fictional models and fictional creative director; not photographs of actual staff.',
            'motion': 'Digital fabric deformation and light animation derived from generated stills; not live-action footage.',
            'avif': 'Each file separately encoded with libaom-av1, still-picture=1, frames:v=1, crf=30, yuv420p.'},
        'images': records, 'products': [], 'video': video_item,
        'sequence': {'id': 'atelier-transformation', 'width': 1024, 'height': 576, 'fps': 24,
            'frameCount': 120, 'durationSeconds': 5, 'formats': ['avif', 'webp'],
            'patterns': {'avif': 'media/frames/frame_%04d.avif', 'webp': 'media/frames/frame_%04d.webp'},
            'alt': 'Do croqui à peça pronta: criação de um vestido de linho em três atos.',
            'focalPoint': {'x': .54, 'y': .48},
            'acts': [{'from': 1, 'to': 35, 'name': 'Croqui e modelagem'},
                     {'from': 36, 'to': 85, 'name': 'Revelação diagonal do linho'},
                     {'from': 86, 'to': 120, 'name': 'Peça finalizada e movimento'}],
            'frames': frame_records},
        'totals': {'staticImages': 21, 'staticFiles': 42, 'sequenceFiles': 240,
                   'videoFiles': 1, 'mediaFiles': 283,
                   'bytes': sum(p.stat().st_size for p in MEDIA.rglob('*') if p.is_file())}}
    for index, (title, colors, _) in enumerate(PRODUCTS, 1):
        manifest['products'].append({'id': f'prod-{index:02d}', 'name': title,
            'collectionColorOptions': colors,
            'note': 'As opções de cor descrevem a coleção; as fotos mostram uma cor por produto.',
            'front': [r for r in records if f'prod-{index:02d}-a.' in r['path']],
            'hover': [r for r in records if f'prod-{index:02d}-b.' in r['path']]})
    (ROOT / 'MEDIA_MANIFEST.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Validated 283 media files; manifest ready.', flush=True)


def contact_sheet():
    paths = [MEDIA / f'{name}.webp' for name in STATIC]
    width, height = 220, 300
    sheet = Image.new('RGB', (width * 7, height * 3), '#FAF6F0')
    draw = ImageDraw.Draw(sheet)
    for index, path in enumerate(paths):
        x, y = (index % 7) * width, (index // 7) * height
        image = fit(path, (208, 264))
        sheet.paste(image, (x + 6, y + 4))
        draw.text((x + 8, y + 274), path.stem, fill='#4A352B')
    sheet.save(ROOT / 'preview' / 'contact-sheet.jpg', quality=90)
    storyboard = Image.new('RGB', (512 * 3, 312 * 2), '#FAF6F0')
    draw = ImageDraw.Draw(storyboard)
    for index, number in enumerate([1, 35, 50, 70, 85, 120]):
        x, y = index % 3 * 512, index // 3 * 312
        image = fit(MEDIA / 'frames' / f'frame_{number:04d}.webp', (512, 288))
        storyboard.paste(image, (x, y))
        draw.text((x + 8, y + 293), f'frame {number:04d}', fill='#4A352B')
    storyboard.save(ROOT / 'preview' / 'storyboard.jpg', quality=90)


def package():
    destination = ROOT / 'landing-page-moda-package.zip'
    with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=1) as archive:
        for folder in ('media', 'preview', 'scripts'):
            for path in sorted((ROOT / folder).rglob('*')):
                if path.is_file() and '__pycache__' not in path.parts:
                    archive.write(path, path.relative_to(ROOT).as_posix())
        for name in ('MEDIA_MANIFEST.json', 'README.md', 'PROMPTS.md', 'VALIDATION.json'):
            archive.write(ROOT / name, name)
    with zipfile.ZipFile(destination) as archive:
        assert archive.testzip() is None
    print('ZIP ready:', destination.stat().st_size, 'bytes', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('stage', choices=['statics', 'frames', 'video', 'manifest', 'contact-sheet', 'package'])
    stage = parser.parse_args().stage
    assert FFMPEG and FFPROBE, 'ffmpeg and ffprobe are required'
    for folder in (SOURCES, MEDIA, WORK, ROOT / 'preview'):
        folder.mkdir(exist_ok=True)
    {'statics': statics, 'frames': frames, 'video': video, 'manifest': validate_and_manifest,
     'contact-sheet': contact_sheet, 'package': package}[stage]()
