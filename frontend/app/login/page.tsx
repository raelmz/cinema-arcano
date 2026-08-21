// app/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { login as loginRequest, getMe } from '../services/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Aviso } from '../components/ui/Aviso';
import { Botao } from '../components/ui/Botao';
import { CampoTexto } from '../components/ui/CampoTexto';
import { Cartao } from '../components/ui/Cartao';

// Validação do Zod
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const result = await loginRequest(data);
      const user = await getMe(result.accessToken);

      login(result.accessToken, user);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login.');
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Cartao destaque className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-arcano-main uppercase tracking-widest border-b-2 border-arcano-sec pb-2">
          Acesso Arcano
        </h1>

        {error && (
          <div className="mb-6">
            <Aviso tipo="erro">{error}</Aviso>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            {isSubmitting ? 'Verificando...' : 'Entrar'}
          </Botao>
          <div className="flex flex-col space-y-4 mt-6 text-center text-sm font-mono">
            <Link href="/register" className="text-arcano-main hover:text-arcano-ter hover:underline uppercase transition-colors">
              [ Criar uma nova conta ]
            </Link>
          </div>
        </form>
      </Cartao>
    </div>
  );
}
