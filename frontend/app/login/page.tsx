// app/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { login } from '../services/api';
import { useState } from 'react';

// Validação do Zod
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const result = await login(data);
      // Salva o token no localStorage por enquanto
      localStorage.setItem('arcano_token', result.accessToken);
      // Redirecionar futuramente...
      console.log('Logado com sucesso!', result);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-arcano-surface p-8 border-2 border-arcano-main rounded-none shadow-[8px_8px_0px_0px_rgba(255,213,79,1)]">
        
        <h1 className="text-3xl font-bold mb-6 text-arcano-main uppercase tracking-widest border-b-2 border-arcano-sec pb-2">
          Acesso Arcano
        </h1>

        {error && (
          <div className="bg-red-900/50 border-2 border-red-500 text-red-200 p-3 mb-6 font-mono text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-arcano-ter mb-2 uppercase tracking-wide">
              E-mail
            </label>
            <input
              {...register('email')}
              id="email"
              type="email"
              className="w-full bg-arcano-bg border-2 border-gray-700 text-white p-3 rounded-none focus:outline-none focus:border-arcano-main transition-colors"
            />
            {errors.email && <span className="text-red-400 text-xs mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold text-arcano-ter mb-2 uppercase tracking-wide">
              Senha
            </label>
            <input
              {...register('password')}
              id="password"
              type="password"
              className="w-full bg-arcano-bg border-2 border-gray-700 text-white p-3 rounded-none focus:outline-none focus:border-arcano-main transition-colors"
            />
            {errors.password && <span className="text-red-400 text-xs mt-1 block">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-arcano-sec hover:bg-arcano-main text-white hover:text-arcano-bg font-bold py-4 px-4 rounded-none border-2 border-transparent hover:border-black transition-all uppercase tracking-widest disabled:opacity-50"
          >
            {isSubmitting ? 'Verificando...' : 'Entrar'}
          </button>
          <div className="flex flex-col space-y-4 mt-6 text-center text-sm font-mono">
            <a href="/register" className="text-arcano-main hover:text-arcano-ter hover:underline uppercase transition-colors">
              [ Criar uma nova conta ]
            </a>
          </div>
        </form>

      </div>
    </div>
  );
}