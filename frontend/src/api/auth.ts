import { api } from '@/lib/api'

export interface User {
  id: number
  name: string
  username: string
  email: string
  avatar_url: string | null
  is_admin: boolean
  locale: string
}

export async function fetchMe(): Promise<User | null> {
  try {
    const { data } = await api.get<{ data: User }>('/api/me')
    return data.data
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post<{ data: User }>('/api/login', { email, password })
  return data.data
}

export async function register(
  name: string,
  email: string,
  password: string,
  password_confirmation: string,
  locale: string,
): Promise<User> {
  const { data } = await api.post<{ data: User }>('/api/register', {
    name,
    email,
    password,
    password_confirmation,
    locale,
  })
  return data.data
}

export async function logout(): Promise<void> {
  await api.post('/api/logout')
}

export async function updateProfile(payload: {
  name: string
  locale: string
  username?: string
}): Promise<User> {
  const { data } = await api.patch<{ data: User }>('/api/me', payload)
  return data.data
}

export function socialLoginUrl(provider: 'google' | 'discord' | 'steam'): string {
  return `${import.meta.env.VITE_API_URL}/auth/${provider}/redirect`
}
