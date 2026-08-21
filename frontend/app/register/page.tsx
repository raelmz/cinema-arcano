// app/register/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { registerUser } from '../services/api';
import { useState } from 'react';
import Link from 'next/link';
import { Aviso } from '../components/ui/Aviso';
import { Botao } from '../components/ui/Botao';
import { CampoTexto } from '../components/ui/CampoTexto';
import { Cartao } from '../components/ui/Cartao';

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    setSuccess(false);
    try {
      await registerUser(data);
      setSuccess(true);
      // Cadastro não loga automaticamente — usuário segue para /login,
      // mantendo o AuthContext como fonte única da sessão pós-login.
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Cartao destaque className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-arcano-main uppercase tracking-widest border-b-2 border-arcano-sec pb-2">
          Novo Iniciado
        </h1>

        {error && (
          <div className="mb-6">
            <Aviso tipo="erro">{error}</Aviso>
          </div>
        )}

        {success && (
          <div className="mb-6">
            <Aviso tipo="sucesso">
              Conta criada com sucesso! Você já pode fazer login.
            </Aviso>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <CampoTexto
            {...register('name')}
            id="name"
            type="text"
            label="Nome Completo"
            erro={errors.name?.message}
          />

          <CampoTexto
            {...register('email')}
            id="email"
            type="email"
            label="E-mail"
            erro={errors.email?.message}
          />

          <CampoTexto
            {...register('password')}
            id="password"
            type="password"
            label="Senha"
            erro={errors.password?.message}
          />

          <Botao
            type="submit"
            disabled={isSubmitting}
            variante="secundario"
            className="w-full py-4"
          >
            {isSubmitting ? 'Forjando...' : 'Criar Conta'}
          </Botao>
        </form>

        <div className="flex flex-col space-y-4 mt-6 text-center text-sm font-mono">
          <Link href="/login" className="text-arcano-main hover:text-arcano-ter hover:underline uppercase transition-colors">
            [ Já possuo a marca (Login) ]
          </Link>
        </div>
      </Cartao>
    </div>
  );
}
