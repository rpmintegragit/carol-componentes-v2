'use client';
import type { ImgHTMLAttributes } from 'react';
import { cardImage, largeImage, isDocScan } from '@/lib/catalog';

type PicProps = { src: string; large?: boolean; alt: string } & Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  'src' | 'alt'
>;

/**
 * Imagem de produto otimizada: serve a variante WebP (.thumb/.large) gerada
 * por scripts/generate-webp.py e volta ao arquivo original se a variante
 * nao existir. Scans de pagina de catalogo (pagina-N) recebem data-doc para
 * tratamento visual proprio na vitrine.
 */
export function Pic({ src, large, alt, ...rest }: PicProps) {
  const optimized = large ? largeImage(src) : cardImage(src);
  return (
    <img
      {...rest}
      src={optimized}
      alt={alt}
      data-doc={isDocScan(src) ? '' : undefined}
      onError={(e) => {
        const t = e.currentTarget;
        if (optimized !== src && !t.dataset.fb) {
          t.dataset.fb = '1';
          t.src = src;
        }
        rest.onError?.(e);
      }}
    />
  );
}
