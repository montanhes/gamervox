import { api } from '@/lib/api'

export interface AppNotification {
  id: string
  data: {
    kind: 'game_moderated' | 'vote_milestone'
    slug: string
    title: string
    status?: 'approved' | 'rejected'
    milestone?: number
  }
  read_at: string | null
  created_at: string
}

export interface NotificationsResponse {
  data: AppNotification[]
  meta: { unread_count: number }
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const { data } = await api.get<NotificationsResponse>('/api/me/notifications')
  return data
}

export async function markNotificationsRead(): Promise<void> {
  await api.post('/api/me/notifications/read')
}
