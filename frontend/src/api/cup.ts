import { api } from '@/lib/api'

export interface CupGame {
  id: number
  slug: string
  title: string
  image_url: string | null
  votes: number
}

export interface CupMatch {
  id: number
  round: number
  position: number
  winner_id: number | null
  my_vote: number | null
  game_a: CupGame | null
  game_b: CupGame | null
}

export interface CupData {
  id: number
  name: string
  status: 'active' | 'finished'
  current_round: number
  total_rounds: number
  round_ends_at: string | null
  matches: CupMatch[]
}

export async function fetchCup(): Promise<CupData | null> {
  const { data } = await api.get<{ data: CupData | null }>('/api/cup')
  return data.data
}

export async function voteCupMatch(
  matchId: number,
  gameId: number,
): Promise<{ my_vote: number; votes_a: number; votes_b: number }> {
  const { data } = await api.post(`/api/cup/matches/${matchId}/vote`, { game_id: gameId })
  return data
}
