import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth'

const ME_QUERY_KEY = ['me']

export function useAuth() {
  const queryClient = useQueryClient()

  const meQuery = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: authApi.fetchMe,
  })

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  })

  const registerMutation = useMutation({
    mutationFn: ({
      name,
      email,
      password,
      password_confirmation,
      locale,
    }: {
      name: string
      email: string
      password: string
      password_confirmation: string
      locale: string
    }) => authApi.register(name, email, password, password_confirmation, locale),
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => queryClient.setQueryData(ME_QUERY_KEY, null),
  })

  const updateProfileMutation = useMutation({
    mutationFn: (payload: { name: string; locale: string; username?: string; wants_digest?: boolean }) =>
      authApi.updateProfile(payload),
    onSuccess: (user) => queryClient.setQueryData(ME_QUERY_KEY, user),
  })

  return {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    logout: logoutMutation.mutateAsync,
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfileError: updateProfileMutation.error,
    isUpdatingProfile: updateProfileMutation.isPending,
  }
}
