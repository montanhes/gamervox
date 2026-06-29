import { api } from '@/lib/api'

export interface Comment {
  id: number
  body: string
  created_at: string
  parent_id: number | null
  replies_count: number
  user: { id: number; name: string; avatar_url: string | null }
}

export interface CommentsPage {
  data: Comment[]
  meta: { next_cursor: string | null }
}

export async function fetchComments(slug: string, cursor?: string): Promise<CommentsPage> {
  const { data } = await api.get<CommentsPage>(`/api/games/${slug}/comments`, {
    params: cursor ? { cursor } : undefined,
  })
  return data
}

export async function fetchReplies(slug: string, commentId: number, cursor?: string): Promise<CommentsPage> {
  const { data } = await api.get<CommentsPage>(`/api/games/${slug}/comments/${commentId}/replies`, {
    params: cursor ? { cursor } : undefined,
  })
  return data
}

export async function postComment(slug: string, body: string, parentId?: number | null): Promise<Comment> {
  const { data } = await api.post<{ data: Comment }>(`/api/games/${slug}/comments`, {
    body,
    parent_id: parentId ?? null,
  })
  return data.data
}
