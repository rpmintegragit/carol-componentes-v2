#!/usr/bin/env python3
"""Gera as imagens da vitrine do hero com fundo transparente de verdade.

Remove o fundo branco por flood-fill a partir das bordas (preserva brancos
internos do produto) e salva WebP com alpha em public/images/hero/.
Idempotente; roda em ~segundos.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent / "public" / "images"
OUT = ROOT / "hero"
OUT.mkdir(exist_ok=True)

JOBS = {
    "tradicional-com-chapa.webp": ROOT / "products/vibra-stop/tradicional-com-chapa/foto-1.png",
    "flex-com-2-chapas.webp": ROOT / "products/vibra-stop/flex-com-2-chapas/foto-1.png",
    "pna-pe-nivelador.webp": ROOT / "products/merkbak/pna-pe-nivelador-articulado/1.png",
}
MARK = (255, 0, 254)
MAX = 1100

for name, src in JOBS.items():
    dst = OUT / name
    im = Image.open(src).convert("RGB")
    w, h = im.size
    scale = min(1.0, MAX / max(w, h))
    if scale < 1.0:
        im = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
    w, h = im.size
    # flood-fill do fundo a partir das 4 bordas (thresh cobre o quase-branco)
    for seed in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if im.getpixel(seed) != MARK:
            ImageDraw.floodfill(im, seed, MARK, thresh=16)
    rgba = im.convert("RGBA")
    px = rgba.load()
    for y in range(h):
        for x in range(w):
            if px[x, y][:3] == MARK:
                px[x, y] = (0, 0, 0, 0)
    rgba.save(dst, "WEBP", quality=88, method=5)
    print(name, rgba.size, f"{dst.stat().st_size//1024} KB")
