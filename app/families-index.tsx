'use client';
import { familyGroups } from '@/lib/family-groups';

const groups = familyGroups();

/** Indice completo das familias no fim da pagina: acesso rapido com filtro aplicado. */
export function FamiliesIndex({ onFamily }: { onFamily: (name: string) => void }) {
  return (
    <section id="familias" className="families-index section" aria-labelledby="families-title">
      <div className="container">
        <div className="families-heading">
          <h2 id="families-title">Todas as famílias do catálogo.</h2>
          <p>
            Escolha uma família para ver medidas, tabelas técnicas e fotos de
            cada componente.
          </p>
        </div>
        <div className="families-grid">
          {groups.map((g) => (
            <div className="families-group" key={g.group}>
              <h3>{g.group}</h3>
              <ul>
                {g.items.map((f) => (
                  <li key={f.name}>
                    <button onClick={() => onFamily(f.name)}>
                      {f.name}
                      <span>{f.count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
