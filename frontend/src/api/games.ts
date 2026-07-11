import { api } from '@/lib/api'

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface Game {
  id: number
  slug: string
  title: string
  image_url: string | null
  yes_votes_count: number
  no_votes_count: number
  net_score: number
  is_announced: boolean
  tags: Tag[]
}

export interface GameDetail extends Game {
  description: string
  followers_count: number
  followed_by_me: boolean
  social_links: { platform: string; url: string }[]
  user: { id: number; name: string; email: string; avatar_url: string | null; is_admin: boolean }
  status?: 'pending' | 'approved' | 'rejected'
  moderation_reason?: string | null
}

export interface GamesPage {
  data: Game[]
  meta: {
    next_cursor: string | null
  }
}

export type GameSort = 'top' | 'trending' | 'recent'

export async function fetchGames(params: {
  cursor?: string
  search?: string
  tags?: string[]
  sort?: GameSort
  announced?: boolean
}): Promise<GamesPage> {
  const { data } = await api.get<GamesPage>('/api/games', {
    params: {
      cursor: params.cursor,
      search: params.search || undefined,
      tags: params.tags?.length ? params.tags : undefined,
      sort: params.sort && params.sort !== 'top' ? params.sort : undefined,
      announced: params.announced ? 1 : undefined,
    },
  })
  return data
}

export async function fetchGame(slug: string): Promise<GameDetail> {
  const { data } = await api.get<{ data: GameDetail }>(`/api/games/${slug}`)
  return data.data
}

export interface SocialLinkInput {
  platform: string
  url: string
}

export async function submitGame(payload: {
  title: string
  description: string
  image: File
  tags?: string[]
  social_links?: SocialLinkInput[]
  confirm_duplicate?: boolean
}): Promise<{ data: GameDetail } | { similar_games: { data: Game[] } }> {
  const form = new FormData()
  form.append('title', payload.title)
  form.append('description', payload.description)
  form.append('image', payload.image)
  payload.tags?.forEach((tag) => form.append('tags[]', tag))
  payload.social_links?.forEach((link, i) => {
    form.append(`social_links[${i}][platform]`, link.platform)
    form.append(`social_links[${i}][url]`, link.url)
  })
  if (payload.confirm_duplicate) {
    form.append('confirm_duplicate', '1')
  }

  const { data } = await api.post('/api/games', form)
  return data
}

export async function castVote(
  slug: string,
  value: 1 | -1,
): Promise<{ yes_votes_count: number; no_votes_count: number; net_score: number }> {
  const { data } = await api.post(`/api/games/${slug}/vote`, { value })
  return data
}

export async function removeVote(
  slug: string,
): Promise<{ yes_votes_count: number; no_votes_count: number; net_score: number }> {
  const { data } = await api.delete(`/api/games/${slug}/vote`)
  return data
}

export async function fetchTags(search?: string): Promise<Tag[]> {
  const { data } = await api.get<{ data: Tag[] }>('/api/tags', { params: { search } })
  return data.data
}

export async function fetchMyGames(): Promise<GameDetail[]> {
  const { data } = await api.get<{ data: GameDetail[] }>('/api/me/games')
  return data.data
}

export async function toggleFollow(
  slug: string,
): Promise<{ following: boolean; followers_count: number }> {
  const { data } = await api.post<{ following: boolean; followers_count: number }>(
    `/api/games/${slug}/follow`,
  )
  return data
}

export async function fetchFollowing(cursor?: string): Promise<GamesPage> {
  const { data } = await api.get<GamesPage>('/api/me/following', {
    params: cursor ? { cursor } : undefined,
  })
  return data
}

export interface UserProfile {
  id: number
  name: string
  avatar_url: string | null
  created_at: string
  stats: { games_count: number; votes_count: number }
  badges: string[]
  games: Game[]
}

export async function fetchUserProfile(id: number): Promise<UserProfile> {
  const { data } = await api.get<{ data: UserProfile }>(`/api/users/${id}`)
  return data.data
}
