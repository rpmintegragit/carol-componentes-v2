import { products, categories } from './catalog';

export type FamilyItem = { name: string; count: number };
export type FamilyGroup = { group: string; items: FamilyItem[] };

// Agrupamento editorial das 42 familias do catalogo. Nova familia sem grupo
// definido cai em "Mais famílias" (nunca some da navegacao).
const GROUPS: [string, string[]][] = [
  ['Rolamentos e mancais', ['Rolamentos de esferas', 'Mancais industriais', 'Buchas para rolamento']],
  ['Fixação e retenção', ['Anéis de retenção', 'Porcas e arruelas DIN', 'Pinos e punções DIN', 'Molas prato', 'Olhais de suspensão DIN']],
  ['Grampos e fixação rápida', ['Grampos verticais', 'Grampos horizontais', 'Grampos pneumáticos', 'Grampos tensores', 'Grampos torpedo', 'Grampos C e sargentos', 'Alicates de fixação', 'Morsas de aperto rápido', 'Posicionadores e indexadores', 'Ponteiras e mordentes', 'Mesas de solda e fusos']],
  ['Antivibração e apoio', ['Amortecedores de borracha', 'Amortecedores de mola', 'Bases antivibratórias', 'Batentes industriais', 'Coxins amortecedores', 'Calços, ventosas e arruelas', 'Pendurais e amortecedores HVAC']],
  ['Elementos de máquinas', ['Volantes', 'Manípulos', 'Manípulos, puxadores e fechos', 'Alavancas', 'Maçanetas', 'Knobs', 'Manivelas', 'Puxadores', 'Cabos', 'Botões', 'Chaves de Fecho', 'Dobradiças', 'Engrenagens', 'Esferas de Baquelite', 'Pés Niveladores', 'Visores de Óleo']],
];

const countBy = () => {
  const m = new Map<string, number>();
  for (const p of products)
    for (const c of p.categories) m.set(c.name, (m.get(c.name) || 0) + 1);
  return m;
};

export function familyGroups(): FamilyGroup[] {
  const counts = countBy();
  const assigned = new Set<string>();
  const out: FamilyGroup[] = [];
  for (const [group, names] of GROUPS) {
    const items = names
      .filter((n) => counts.has(n))
      .map((n) => ({ name: n, count: counts.get(n)! }));
    names.forEach((n) => assigned.add(n));
    if (items.length) out.push({ group, items });
  }
  const rest = categories
    .map((c) => c.name)
    .filter((n) => !assigned.has(n) && counts.has(n))
    .map((n) => ({ name: n, count: counts.get(n)! }));
  if (rest.length) out.push({ group: 'Mais famílias', items: rest });
  return out;
}
