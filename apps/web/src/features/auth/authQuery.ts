import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserDto, RegisterInput, LoginInput, ApiEnvelope } from "@appifylab/shared";
import { apiRequest } from "../../lib/api.ts";

export const authKeys = {
  user: ["auth-user"] as const,
};

export function useAuthUser() {
  return useQuery<ApiEnvelope<UserDto>, Error>({
    queryKey: authKeys.user,
    queryFn: () => apiRequest<ApiEnvelope<UserDto>>("/api/auth/me"),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginInput) => 
      apiRequest<ApiEnvelope<UserDto>>("/api/auth/login", {
        method: "POST",
        json: data,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.user, response);
    },
  });
}

export function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterInput) => 
      apiRequest<ApiEnvelope<UserDto>>("/api/auth/register", {
        method: "POST",
        json: data,
      }),
    onSuccess: (response) => {
      queryClient.setQueryData(authKeys.user, response);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
    onSuccess: () => {
      queryClient.setQueryData(authKeys.user, null);
      queryClient.clear();
    },
  });
}
