"""Reproducible original vector identity and multi-size browser icons."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'assets'
ASSETS.mkdir(exist_ok=True)
INK, PAPER, MOSS, RED = '#263b36', '#f2efdf', '#77917c', '#bc6045'
mountain = [(10, 43), (23, 26), (32, 38), (43, 22), (56, 43), (56, 52), (10, 52)]
sword = [(30, 16), (34, 16), (34, 43), (32, 49), (30, 43)]
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<title>江湖一生：青山、劍鋒與朱日</title>
<rect width="64" height="64" rx="14" fill="{INK}"/>
<circle cx="45" cy="17" r="7" fill="{RED}"/>
<path d="M10 43 23 26 32 38 43 22 56 43V52H10Z" fill="{MOSS}"/>
<path d="M30 16H34V43L32 49 30 43Z" fill="{PAPER}"/>
<path d="M24 27H40M32 10V17" stroke="{PAPER}" stroke-width="3" stroke-linecap="round"/>
</svg>'''
(ASSETS / 'favicon.svg').write_text(svg, encoding='utf-8')

def icon(size):
    scale = 16
    canvas = Image.new('RGBA', (64*scale, 64*scale), (0,0,0,0))
    d = ImageDraw.Draw(canvas)
    def box(coords): return tuple(v*scale for v in coords)
    def points(coords): return [(x*scale,y*scale) for x,y in coords]
    d.rounded_rectangle(box((0,0,64,64)), radius=14*scale, fill=INK)
    d.ellipse(box((38,10,52,24)), fill=RED)
    d.polygon(points(mountain), fill=MOSS)
    d.polygon(points(sword), fill=PAPER)
    d.line(box((24,27,40,27)),fill=PAPER,width=3*scale)
    d.line(box((32,10,32,17)),fill=PAPER,width=3*scale)
    return canvas.resize((size,size),Image.Resampling.LANCZOS)

for size in [16,32,48,180,192,512]:
    icon(size).save(ASSETS/f'icon-{size}.png')
icon(256).save(ROOT/'favicon.ico', sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])

# A self-authored, deterministic share card, matching the in-game landscape.
card = Image.new('RGB',(1200,630),'#eeeee3')
d = ImageDraw.Draw(card)
d.ellipse((850,50,1040,240),fill='#e1d9c4')
d.polygon([(0,560),(180,350),(310,430),(470,210),(650,480),(780,350),(970,150),(1200,430),(1200,630),(0,630)],fill='#c5cdbf')
d.polygon([(0,630),(130,530),(300,580),(450,410),(600,540),(830,390),(1040,520),(1200,450),(1200,630)],fill='#a0b19f')
d.rectangle((50,42,1150,588),outline='#bbc5b2',width=2)
font_dir=Path('C:/Windows/Fonts')
serif=font_dir/'mingliu.ttc'
sans=font_dir/'msjh.ttc'
titlefont=ImageFont.truetype(str(serif),88)
bodyfont=ImageFont.truetype(str(sans),25)
smallfont=ImageFont.truetype(str(sans),19)
card.paste(icon(76),(88,78),icon(76))
d.text((184,99),'江湖一生  /  山河故人',font=bodyfont,fill=INK)
d.text((86,218),'一念入江湖',font=titlefont,fill=INK)
d.text((86,318),'一生有回響',font=titlefont,fill='#49664f')
d.text((91,474),'從十五歲拜師，到六十五歲山河回望。',font=bodyfont,fill='#425c48')
d.text((92,534),'三大門派  ·  十五章人生  ·  八種結局',font=smallfont,fill='#516c52')
card.save(ASSETS/'social-card.png',optimize=True)

# Contact sheet shows both actual favicon sizes and the large identity.
sheet=Image.new('RGB',(680,280),'#f5f3ea')
sheet.paste(icon(192),(30,40),icon(192))
sd=ImageDraw.Draw(sheet)
for i,size in enumerate([16,32,48]):
    x=285+i*115
    sheet.paste(icon(size),(x,100),icon(size))
    sd.text((x,165),f'{size}px',font=ImageFont.truetype(str(sans),16),fill=INK)
sheet.save(ASSETS/'brand-preview.png')
print('Brand assets generated: SVG, ICO, 6 PNG sizes, social card and preview.')
