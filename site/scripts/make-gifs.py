from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'previews'
for name in ['hero', 'marquee', 'ranking', 'hits', 'palco', 'conquistas', 'agenda', 'affairs', 'galeria']:
    files = sorted((root / 'cp6-frames').glob(f'{name}-*.png'))
    if len(files) != 8:
        raise RuntimeError(f'{name}: esperado 8 frames, encontrados {len(files)}')
    frames = []
    for file in files:
        with Image.open(file) as source:
            frames.append(source.convert('RGB').resize((768, 512)).quantize(colors=128))
    target = root / f'cp6-{name}.gif'
    frames[0].save(target, save_all=True, append_images=frames[1:], duration=180, loop=0, disposal=2)
    print(f'{target.name}: {target.stat().st_size} bytes')
