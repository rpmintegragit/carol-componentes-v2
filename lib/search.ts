import { products, normalize, type Product } from './catalog';

/**
 * Busca do catálogo com camadas de tolerância, SEM degradar a busca atual:
 * 1º resultados exatos (substring, comportamento antigo) — pontuação máxima;
 * 2º todos os termos presentes (qualquer ordem) e plural/singular;
 * 3º sinônimos do vocabulário industrial;
 * 4º erro de digitação (distância de edição 1–2, só em palavras longas).
 * As camadas inferiores apenas ACRESCENTAM resultados ao fim da lista.
 */

// Grupos de termos equivalentes (já normalizados: sem acento, minúsculas).
const SYNONYMS: string[][] = [
  ['rolamento', 'bearing'],
  ['anel de retencao', 'anel elastico', 'seeger', 'anel trava'],
  ['amortecedor', 'antivibratorio', 'anti vibratorio', 'vibra stop', 'vibrastop', 'isolador de vibracao'],
  ['pe nivelador', 'nivelador', 'sapata niveladora', 'sapata', 'pe de maquina'],
  ['manipulo', 'manopla', 'knob', 'punho'],
  ['macaneta', 'puxador de porta'],
  ['grampo', 'clamp', 'toggle', 'grampo de fixacao'],
  ['morsa', 'torno de bancada'],
  ['mancal', 'pillow block'],
  ['volante', 'handwheel'],
  ['chumbador', 'parabolt'],
  ['visor de oleo', 'nivel de oleo'],
  ['alavanca', 'alavanca de fixacao'],
];

type Entry = { p: Product; hay: string; words: string[] };
let INDEX: Entry[] | null = null;

function buildIndex(): Entry[] {
  if (INDEX) return INDEX;
  INDEX = products.map((p) => {
    const hay = normalize(
      [
        p.name,
        p.sku,
        p.brand,
        p.supplier || '',
        p.summary || '',
        p.categories.map((c) => c.name).join(' '),
        p.variations.map((v) => `${v.label} ${v.sku}`).join(' '),
      ].join(' '),
    );
    const words = [...new Set(hay.split(/[^a-z0-9]+/).filter((w) => w.length > 1))];
    return { p, hay, words };
  });
  return INDEX;
}

// Distância de edição com teto (corta cedo; suficiente para typo de 1–2 letras).
function editDistanceAtMost(a: string, b: string, cap: number): boolean {
  if (Math.abs(a.length - b.length) > cap) return false;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > cap) return false;
    prev = cur;
  }
  return prev[b.length] <= cap;
}

const singular = (t: string) => (t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t);

// Gera variantes da consulta trocando termos por sinônimos (uma troca por grupo).
function queryVariants(q: string): string[] {
  const out = [q];
  for (const group of SYNONYMS) {
    for (const phrase of group) {
      if (phrase !== group[0] && (q.includes(phrase) || q.includes(singular(phrase)))) {
        out.push(q.replace(phrase, group[0]).replace(singular(phrase), group[0]));
        break;
      }
    }
    // caminho inverso: consulta usa o termo canônico, catálogo usa outro do grupo
    if (q.includes(group[0])) for (const alt of group.slice(1)) out.push(q.replace(group[0], alt));
  }
  return [...new Set(out)].slice(0, 8);
}

function tokenHits(token: string, e: Entry, allowFuzzy: boolean): number {
  const t = singular(token);
  if (e.hay.includes(token) || e.hay.includes(t)) return 2; // exato/plural
  if (t.length >= 3 && e.words.some((w) => w.startsWith(t))) return 2; // prefixo
  if (allowFuzzy && t.length >= 5) {
    const cap = t.length >= 8 ? 2 : 1;
    if (e.words.some((w) => w.length >= 4 && editDistanceAtMost(t, w, cap))) return 1; // typo
  }
  return 0;
}

/** Pontuação de um produto para a consulta (0 = não entra). */
function score(e: Entry, q: string, variants: string[]): number {
  if (e.hay.includes(q)) return 100; // comportamento antigo preservado no topo
  for (const v of variants) if (v !== q && e.hay.includes(v)) return 88; // sinônimo exato
  const tokens = q.split(/[^a-z0-9]+/).filter(Boolean);
  if (!tokens.length) return 0;
  const judge = (qs: string, fuzzy: boolean) => {
    const ts = qs.split(/[^a-z0-9]+/).filter(Boolean);
    let fuzzyUsed = false;
    for (const tk of ts) {
      const h = tokenHits(tk, e, fuzzy);
      if (!h) return 0;
      if (h === 1) fuzzyUsed = true;
    }
    return fuzzyUsed ? 55 : 78;
  };
  let best = 0;
  for (const v of variants) best = Math.max(best, judge(v, false));
  if (!best) for (const v of variants) best = Math.max(best, judge(v, true));
  return best;
}

/** Mapa id → pontuação. Retorna null para consulta vazia (= sem filtro). */
export function searchScores(query: string): Map<number, number> | null {
  const q = normalize(query).trim();
  if (!q) return null;
  const variants = queryVariants(q);
  const m = new Map<number, number>();
  for (const e of buildIndex()) {
    const s = score(e, q, variants);
    if (s > 0) m.set(e.p.id, s);
  }
  return m;
}

/** Lista ranqueada (melhores primeiro); consulta vazia devolve o catálogo. */
export function searchProducts(query: string): Product[] {
  const scores = searchScores(query);
  if (!scores) return products;
  return products
    .filter((p) => scores.has(p.id))
    .sort((a, b) => scores.get(b.id)! - scores.get(a.id)! || a.name.localeCompare(b.name, 'pt-BR'));
}
