import json
from PIL import Image, ImageOps, ImageDraw
from pathlib import Path
root=Path(__file__).resolve().parents[1]
photos=json.loads((root/'src/city-photos.json').read_text(encoding='utf-8'))
sheet=Image.new('RGB',(1200,1000),'#0a0a0a');draw=ImageDraw.Draw(sheet)
for i,(city,p) in enumerate(photos.items()):
    x,y=(i%4)*300,(i//4)*200
    im=Image.open(root/'public'/p['src'].lstrip('/')).convert('RGB')
    sheet.paste(ImageOps.fit(im,(290,165)),(x,y))
    draw.text((x+5,y+172),p['label'],fill='#f2efe9')
sheet.save(root/'previews/refinamento-02/cidades-contato.jpg')
