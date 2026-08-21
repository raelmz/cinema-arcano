// app/services/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function login(data: any) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Credenciais inválidas');
  }

  return response.json();
}

export async function getMe(token: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Não foi possível carregar os dados do usuário.');
  }

  return response.json();
}

export async function registerUser(data: any) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao criar conta. Tente novamente.');
  }

  return response.json();
}