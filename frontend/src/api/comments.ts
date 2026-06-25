import { api } from '@/lib/api'

export interface Comment {
  id: number
  body: string
  created_at: string
  user: { id: number; name: string; avatar_url: string | null }
}

export async function fetchComments(slug: string): Promise<Comment[]> {
  const { data } = await api.get<{ data: Comment[] }>(`/api/games/${slug}/comments`)
  return data.data
}

export async function postComment(slug: string, body: string): Promise<Comment> {
  const { data } = await api.post<{ data: Comment }>(`/api/games/${slug}/comments`, { body })
  return data.data
}
