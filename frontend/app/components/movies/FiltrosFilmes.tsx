// frontend/app/components/movies/FiltrosFilmes.tsx
'use client';

import { Movie } from '../../services/api';

export type Ordenacao = 'padrao' | 'nota' | 'recentes' | 'az';

export type FiltrosState = {
  ordenacao: Ordenacao;
  ano: string;
  notaMinima: number;
};

export const filtrosPadrao: FiltrosState = {
  ordenacao: 'padrao',
  ano: '',
  notaMinima: 0,
};

const classeSelect =
  'border-2 border-white/15 bg-arcano-bg px-3 py-2 font-mono text-xs uppercase tracking-wide text-white focus:border-arcano-main focus:outline-none';

export function aplicarFiltros(filmes: Movie[], filtros: FiltrosState): Movie[] {
  let lista = filmes.filter((filme) => {
    const ano = filme.releaseDate?.slice(0, 4);
    if (filtros.ano && ano !== filtros.ano) return false;
    if (filtros.notaMinima > 0 && filme.voteAverage < filtros.notaMinima) return false;
    return true;
  });

  switch (filtros.ordenacao) {
    case 'nota':
      lista = [...lista].sort((a, b) => b.voteAverage - a.voteAverage);
      break;
    case 'recentes':
      lista = [...lista].sort((a, b) =>
        (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''),
      );
      break;
    case 'az':
      lista = [...lista].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
      break;
    default:
      // 'padrao': mantém a ordem que veio da API (populares/relevância da busca)
      break;
  }

  return lista;
}

export function anosDisponiveis(filmes: Movie[]): string[] {
  const anos = new Set(
    filmes.map((filme) => filme.releaseDate?.slice(0, 4)).filter(Boolean) as string[],
  );
  return [...anos].sort((a, b) => Number(b) - Number(a));
}

type Props = {
  filmes: Movie[];
  filtros: FiltrosState;
  onChange: (filtros: FiltrosState) => void;
};

export function FiltrosFilmes({ filmes, filtros, onChange }: Props) {
  const anos = anosDisponiveis(filmes);
  const filtrosAtivos =
    filtros.ordenacao !== 'padrao' || filtros.ano !== '' || filtros.notaMinima > 0;

  return (
    <div className="mx-auto mb-8 flex w-full max-w-4xl flex-wrap items-center gap-3 border-2 border-white/10 bg-arcano-surface px-4 py-3">
      <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-white/40">
        Filtrar evocação
      </span>

      <select
        value={filtros.ordenacao}
        onChange={(event) =>
          onChange({ ...filtros, ordenacao: event.target.value as Ordenacao })
        }
        className={classeSelect}
        aria-label="Ordenar por"
      >
        <option value="padrao">Relevância</option>
        <option value="nota">Melhor avaliados</option>
        <option value="recentes">Mais recentes</option>
        <option value="az">A – Z</option>
      </select>

      <select
        value={filtros.ano}
        onChange={(event) => onChange({ ...filtros, ano: event.target.value })}
        className={classeSelect}
        aria-label="Filtrar por ano"
      >
        <option value="">Qualquer ano</option>
        {anos.map((ano) => (
          <option key={ano} value={ano}>
            {ano}
          </option>
        ))}
      </select>

      <select
        value={filtros.notaMinima}
        onChange={(event) =>
          onChange({ ...filtros, notaMinima: Number(event.target.value) })
        }
        className={classeSelect}
        aria-label="Nota mínima"
      >
        <option value={0}>Qualquer nota</option>
        <option value={6}>Nota 6+</option>
        <option value={7}>Nota 7+</option>
        <option value={8}>Nota 8+</option>
      </select>

      {filtrosAtivos && (
        <button
          type="button"
          onClick={() => onChange(filtrosPadrao)}
          className="ml-auto font-mono text-[10px] uppercase tracking-widest text-arcano-sec hover:text-white"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}