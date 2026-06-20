import { api } from "@/lib/api-client";
import {
  AdminMetricsResponseSchema,
  ChatHistoryResponseSchema,
  ConversationsListResponseSchema,
  ConversationTranscriptResponseSchema,
  PostChatResponseSchema,
  type AdminMetricsResponse,
  type ChatHistoryResponse,
  type ConversationsListResponse,
  type ConversationTranscriptResponse,
  type PostChatRequest,
  type PostChatResponse,
} from "@/features/parrot/types";

export function getChatHistory(guestId: string): Promise<ChatHistoryResponse> {
  return api.parrot.get(ChatHistoryResponseSchema, `/history/${guestId}`);
}

export function postChat(body: PostChatRequest): Promise<PostChatResponse> {
  return api.parrot.post(PostChatResponseSchema, "/chat", body);
}

export function getAdminMetrics(): Promise<AdminMetricsResponse> {
  return api.parrot.get(AdminMetricsResponseSchema, "/admin/metrics");
}

export function getConversations(): Promise<ConversationsListResponse> {
  return api.parrot.get(ConversationsListResponseSchema, "/admin/conversations");
}

export function getConversationTranscript(
  guestId: string
): Promise<ConversationTranscriptResponse> {
  return api.parrot.get(
    ConversationTranscriptResponseSchema,
    `/admin/conversations/${guestId}`
  );
}
