import { 
  useQuery, 
  useInfiniteQuery, 
  useMutation, 
  useQueryClient 
} from "@tanstack/react-query";
import type { 
  PostDto, 
  CommentDto, 
  UserDto, 
  ApiEnvelope, 
  CreateCommentInput 
} from "@appifylab/shared";
import { apiRequest } from "../../lib/api.ts";

export const feedKeys = {
  feed: ["posts-feed"] as const,
  sidebar: ["sidebar-data"] as const,
  likes: (postId: string) => ["post-likes", postId] as const,
  comments: (postId: string) => ["post-comments", postId] as const,
  commentLikes: (commentId: string) => ["comment-likes", commentId] as const,
  notifications: ["notifications-list"] as const,
};

// Sidebar query
export function useSidebarData() {
  return useQuery<{
    suggestions: UserDto[];
    friends: UserDto[];
    stories: { id: string; text: string | null; author: UserDto; createdAt: string }[];
    events: { id: string; title: string; description: string | null; startsAt: string }[];
    notifications: { id: string; type: string; text: string; readAt: string | null; createdAt: string }[];
  }, Error>({
    queryKey: feedKeys.sidebar,
    queryFn: () => apiRequest<any>("/api/sidebar"),
    refetchInterval: 30000, // Refetch every 30 seconds to keep synced
  });
}

// Feed infinite scroll query
export function useFeedInfinite() {
  return useInfiniteQuery<ApiEnvelope<PostDto[]>, Error>({
    queryKey: feedKeys.feed,
    queryFn: ({ pageParam }) => {
      const cursor = pageParam ? `&cursor=${pageParam}` : "";
      return apiRequest<ApiEnvelope<PostDto[]>>(`/api/feed?limit=10${cursor}`);
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.pageInfo?.nextCursor || null,
  });
}

// Create Post mutation
export function useCreatePostMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => 
      apiRequest<ApiEnvelope<PostDto>>("/api/posts", {
        method: "POST",
        body: formData, // Multer expects FormData for multipart/form-data
      }),
    onSuccess: () => {
      // Invalidate feed and stories to refresh content
      queryClient.invalidateQueries({ queryKey: feedKeys.feed });
      queryClient.invalidateQueries({ queryKey: feedKeys.sidebar });
    },
  });
}

// Like/Unlike post mutation with optimistic updates
export function useLikePostMutation(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ liked }: { liked: boolean }) => {
      const method = liked ? "PUT" : "DELETE";
      return apiRequest<{ liked: boolean }>(`/api/posts/${postId}/like`, { method });
    },
    onMutate: async ({ liked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: feedKeys.feed });

      // Snapshot the previous state
      const previousFeed = queryClient.getQueryData(feedKeys.feed);

      // Optimistically update the feed
      queryClient.setQueryData(feedKeys.feed, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: page.data.map((post: PostDto) => {
              if (post.id === postId) {
                const diff = liked ? 1 : -1;
                return {
                  ...post,
                  likedByMe: liked,
                  likeCount: Math.max(0, post.likeCount + diff),
                };
              }
              return post;
            }),
          })),
        };
      });

      return { previousFeed };
    },
    onError: (_err, _newVal, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(feedKeys.feed, context.previousFeed);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.feed });
      queryClient.invalidateQueries({ queryKey: feedKeys.likes(postId) });
    },
  });
}

// Post Liked Users Query
export function usePostLikes(postId: string, enabled: boolean) {
  return useQuery<UserDto[], Error>({
    queryKey: feedKeys.likes(postId),
    queryFn: async () => {
      const res = await apiRequest<ApiEnvelope<UserDto[]>>(`/api/posts/${postId}/likes`);
      return res.data;
    },
    enabled,
  });
}

// Post Comments Query
export function usePostComments(postId: string, enabled: boolean) {
  return useQuery<CommentDto[], Error>({
    queryKey: feedKeys.comments(postId),
    queryFn: async () => {
      const res = await apiRequest<ApiEnvelope<CommentDto[]>>(`/api/posts/${postId}/comments`);
      return res.data;
    },
    enabled,
  });
}

// Create Comment mutation with optimistic update
export function useCreateCommentMutation(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      apiRequest<CommentDto>(`/api/posts/${postId}/comments`, {
        method: "POST",
        json: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.feed });
      queryClient.invalidateQueries({ queryKey: feedKeys.sidebar });
      queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) });
    },
  });
}

// Create Reply mutation with optimistic update
export function useCreateReplyMutation(commentId: string, postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) =>
      apiRequest<CommentDto>(`/api/comments/${commentId}/replies`, {
        method: "POST",
        json: input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.feed });
      queryClient.invalidateQueries({ queryKey: feedKeys.sidebar });
      queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) });
    },
  });
}

// Like/Unlike comment mutation with optimistic updates
export function useLikeCommentMutation(commentId: string, postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ liked }: { liked: boolean }) => {
      const method = liked ? "PUT" : "DELETE";
      return apiRequest<{ liked: boolean }>(`/api/comments/${commentId}/like`, { method });
    },
    onMutate: async ({ liked }) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.comments(postId) });
      const previousComments = queryClient.getQueryData(feedKeys.comments(postId));

      // Helper to update comment tree recursively
      const updateComments = (comments: CommentDto[]): CommentDto[] => {
        return comments.map((comment) => {
          if (comment.id === commentId) {
            const diff = liked ? 1 : -1;
            return {
              ...comment,
              likedByMe: liked,
              likeCount: Math.max(0, comment.likeCount + diff),
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateComments(comment.replies),
            };
          }
          return comment;
        });
      };

      if (previousComments) {
        queryClient.setQueryData(feedKeys.comments(postId), (old: CommentDto[] | undefined) => {
          if (!old) return old;
          return updateComments(old);
        });
      }

      return { previousComments };
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(feedKeys.comments(postId), context.previousComments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) });
      queryClient.invalidateQueries({ queryKey: feedKeys.commentLikes(commentId) });
    },
  });
}

// Comment Liked Users Query
export function useCommentLikes(commentId: string, enabled: boolean) {
  return useQuery<UserDto[], Error>({
    queryKey: feedKeys.commentLikes(commentId),
    queryFn: async () => {
      const res = await apiRequest<ApiEnvelope<UserDto[]>>(`/api/comments/${commentId}/likes`);
      return res.data;
    },
    enabled,
  });
}

// Follow/Unfollow User mutation
export function useFollowUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, follow }: { userId: string; follow: boolean }) => {
      const method = follow ? "POST" : "DELETE";
      return apiRequest<{ following: boolean }>(`/api/users/${userId}/follow`, { method });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.sidebar });
      queryClient.invalidateQueries({ queryKey: feedKeys.feed });
    },
  });
}

// Ignore suggested user mutation
export function useIgnoreUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiRequest<{ ignored: boolean }>(`/api/users/${userId}/ignore`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.sidebar });
    },
  });
}

// Mark notifications read mutation
export function useMarkNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiRequest<{ read: boolean }>("/api/notifications/read", { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.sidebar });
    },
  });
}

// Search users query
export function useSearchUsers(query: string) {
  return useQuery<UserDto[], Error>({
    queryKey: ["search-users", query],
    queryFn: async () => {
      const res = await apiRequest<ApiEnvelope<UserDto[]>>(`/api/search?q=${encodeURIComponent(query)}`);
      return res.data;
    },
    enabled: query.trim().length >= 1,
  });
}
