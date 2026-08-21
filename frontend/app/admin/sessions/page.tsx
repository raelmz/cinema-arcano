// frontend/app/admin/sessions/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AcessoRestrito } from '../../components/ui/AcessoRestrito';
import { Aviso } from '../../components/ui/Aviso';
import { Botao } from '../../components/ui/Botao';
import { Cartao } from '../../components/ui/Cartao';
import { Container } from '../../components/ui/Container';
import { useAuth } from '../../context/AuthContext';
import {
  cancelSession,
  getAdminSessions,
  type SessaoAdministrativa,
} from '../../services/api';

const labelsStatus = {
  SCHEDULED: 'Agendada',
  CANCELLED: 'Cancelada',
  FINISHED: 'Finalizada',
};

function formatarData(data: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(data));
}

function formatarMoeda(valor: string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(valor));
}

export default function AdminSessionsPage() {
  const { user, token, isLoading } = useAuth();
  const [sessoes, setSessoes] = useState<SessaoAdministrativa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [cancelandoId, setCancelandoId] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function carregarSessoes() {
    if (!token) return;

    setCarregando(true);
    setErro('');

    try {
      const resultado = await getAdminSessions(token);
      setSessoes(resultado);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao carregar sessões.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    async function carregarSessoesIniciais() {
      await carregarSessoes();
    }

    if (!token || user?.role !== 'ADMIN') {
      return;
    }

    carregarSessoesIniciais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  async function cancelar(sessao: SessaoAdministrativa) {
    if (!token) {
      setErro('Sessão expirada. Faça login novamente.');
      return;
    }

    const confirmou = window.confirm(
      `Cancelar a sessão de ${sessao.movie.title} em ${formatarData(sessao.startTime)}?`,
    );

    if (!confirmou) return;

    setCancelandoId(sessao.id);
    setErro('');
    setSucesso('');

    try {
      await cancelSession(token, sessao.id);
      setSucesso('Sessão cancelada com sucesso.');
      await carregarSessoes();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao cancelar sessão.');
    } finally {
      setCancelandoId('');
    }
  }

  const resumo = useMemo(
    () => ({
      total: sessoes.length,
      agendadas: sessoes.filter((sessao) => sessao.status === 'SCHEDULED').length,
      canceladas: sessoes.filter((sessao) => sessao.status === 'CANCELLED').length,
      finalizadas: sessoes.filter((sessao) => sessao.status === 'FINISHED').length,
    }),
    [sessoes],
  );

  if (isLoading || user?.role !== 'ADMIN') {
    return isLoading ? (
      <Container className="py-10">
        <p className="text-white/50">Verificando acesso...</p>
      </Container>
    ) : (
      <AcessoRestrito
        titulo="Painel do organizador"
        mensagem="Entre com uma conta de organizador para listar e cancelar sessões."
      />
    );
  }

  return (
    <Container className="py-8">
      <section className="mb-8 flex flex-col gap-4 border-b-2 border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-sm uppercase tracking-wide text-arcano-main">
            Organizador
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-wide text-white md:text-5xl">
            Minhas sessões
          </h1>
        </div>

        <Link
          href="/admin/sessions/new"
          className="border-2 border-arcano-main bg-arcano-main px-4 py-3 text-center text-sm font-bold uppercase tracking-wide text-arcano-bg hover:bg-arcano-ter"
        >
          Nova sessão
        </Link>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          ['Total', resumo.total],
          ['Agendadas', resumo.agendadas],
          ['Canceladas', resumo.canceladas],
          ['Finalizadas', resumo.finalizadas],
        ].map(([label, valor]) => (
          <Cartao key={label} className="p-4">
            <p className="font-mono text-xs uppercase tracking-wide text-white/45">
              {label}
            </p>
            <p className="mt-2 text-3xl font-black text-arcano-main">{valor}</p>
          </Cartao>
        ))}
      </div>

      {erro && (
        <div className="mb-5">
          <Aviso tipo="erro">{erro}</Aviso>
        </div>
      )}

      {sucesso && (
        <div className="mb-5">
          <Aviso tipo="sucesso">{sucesso}</Aviso>
        </div>
      )}

      {carregando && <p className="text-white/50">Carregando sessões...</p>}

      {!carregando && sessoes.length === 0 && (
        <Cartao className="p-6">
          <p className="text-white/60">Nenhuma sessão criada ainda.</p>
        </Cartao>
      )}

      <div className="space-y-4">
        {sessoes.map((sessao) => (
          <Cartao key={sessao.id} className="p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="border-2 border-white/15 px-2 py-1 font-mono text-xs uppercase text-white/55">
                    {labelsStatus[sessao.status]}
                  </span>
                  <span className="border-2 border-arcano-main px-2 py-1 font-mono text-xs uppercase text-arcano-main">
                    {formatarMoeda(sessao.price)}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">
                  {sessao.movie.title}
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  {formatarData(sessao.startTime)} · {sessao.room.name}
                </p>
              </div>

              <dl className="grid min-w-72 grid-cols-3 gap-3 text-center">
                <div className="border-2 border-white/10 p-3">
                  <dt className="font-mono text-[10px] uppercase text-white/40">
                    Reservas
                  </dt>
                  <dd className="mt-1 text-xl font-black text-white">
                    {sessao.reservationsCount}
                  </dd>
                </div>
                <div className="border-2 border-white/10 p-3">
                  <dt className="font-mono text-[10px] uppercase text-white/40">
                    Ocupados
                  </dt>
                  <dd className="mt-1 text-xl font-black text-white">
                    {sessao.reservedSeatsCount}
                  </dd>
                </div>
                <div className="border-2 border-white/10 p-3">
                  <dt className="font-mono text-[10px] uppercase text-white/40">
                    Vendidos
                  </dt>
                  <dd className="mt-1 text-xl font-black text-white">
                    {sessao.soldSeatsCount}
                  </dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/sessions/${sessao.id}`}
                  className="border-2 border-white/20 px-4 py-3 text-sm font-bold uppercase tracking-wide text-white/70 hover:border-arcano-main hover:text-arcano-main"
                >
                  Ver mapa
                </Link>
                <Botao
                  variante="secundario"
                  disabled={sessao.status !== 'SCHEDULED' || cancelandoId === sessao.id}
                  onClick={() => cancelar(sessao)}
                >
                  {cancelandoId === sessao.id ? 'Cancelando...' : 'Cancelar'}
                </Botao>
              </div>
            </div>
          </Cartao>
        ))}
      </div>
    </Container>
  );
}
