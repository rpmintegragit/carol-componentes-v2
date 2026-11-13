#!/usr/bin/env python3
"""Gera versoes WebP otimizadas das imagens de produto.

Para cada .png/.jpg em public/images/products cria, na mesma pasta:
  <nome>.thumb.webp  — lado maior 480px, para cards/grades
  <nome>.large.webp  — lado maior 1400px, para a galeria do produto
Originais sao preservados (fallback e regra do projeto). Idempotente:
pula o que ja existe e esta mais novo que o original.
"""
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / "public" / "images" / "products"
SIZES = {"thumb": (480, 76), "large": (1400, 82)}

def convert(src: Path) -> list[str]:
    out = []
    try:
        with Image.open(src) as im:
            if im.mode in ("P", "LA"):
                im = im.convert("RGBA")
            for tag, (maxside, quality) in SIZES.items():
                dst = src.with_name(src.stem + f".{tag}.webp")
                if dst.exists() and dst.stat().st_mtime >= src.stat().st_mtime:
                    continue
                w, h = im.size
                scale = min(1.0, maxside / max(w, h))
                frame = im
                if scale < 1.0:
                    frame = im.resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
                frame.save(dst, "WEBP", quality=quality, method=4)
                out.append(dst.name)
    except Exception as exc:  # imagem corrompida nao derruba o lote
        print(f"ERRO {src}: {exc}", flush=True)
    return out

def main() -> None:
    files = [p for p in ROOT.rglob("*") if p.suffix.lower() in (".png", ".jpg", ".jpeg")
             and ".thumb." not in p.name and ".large." not in p.name]
    print(f"{len(files)} imagens", flush=True)
    done = 0
    for i, f in enumerate(files, 1):
        convert(f)
        done += 1
        if i % 100 == 0:
            print(f"{i}/{len(files)}", flush=True)
    print(f"concluido: {done} processadas", flush=True)

if __name__ == "__main__":
    sys.exit(main())
