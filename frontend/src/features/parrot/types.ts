import { z } from "zod";

export const ParrotMessageRoleSchema = z.enum(["user", "assistant"]);
export type ParrotMessageRole = z.infer<typeof ParrotMessageRoleSchema>;

export const ChatHistoryMessageSchema = z.object({
  content: z.string().nullable(),
  role: ParrotMessageRoleSchema,
});
export type ChatHistoryMessage = z.infer<typeof ChatHistoryMessageSchema>;

export const ChatHistoryResponseSchema = z.object({
  guest_id: z.string(),
  messages: z.array(ChatHistoryMessageSchema),
});

export const PostChatRequestSchema = z.object({
  guest_id: z.string(),
  message: z.string().trim().min(1),
});

export const PostChatResponseSchema = z.object({
  reply: z.string(),
});

export type ChatHistoryResponse = z.infer<typeof ChatHistoryResponseSchema>;
export type PostChatRequest = z.infer<typeof PostChatRequestSchema>;
export type PostChatResponse = z.infer<typeof PostChatResponseSchema>;

const ToolCallCountsSchema = z.record(z.string(), z.number());

export const AdminMetricsResponseSchema = z.object({
  total_conversations: z.number(),
  max_conversations: z.number(),
  total_messages: z.number(),
  total_user_turns: z.number(),
  total_assistant_turns: z.number(),
  tool_calls_total: z.number(),
  tool_calls_by_name: ToolCallCountsSchema,
  tool_errors_total: z.number(),
  fallback_total: z.number(),
  censored_messages_total: z.number(),
  conversations_with_fallback: z.number(),
  conversations_with_tool_error: z.number(),
  conversations_with_censored: z.number(),
});
export type AdminMetricsResponse = z.infer<typeof AdminMetricsResponseSchema>;

export const ConversationStatsSchema = z.object({
  turns: z.number(),
  censored_count: z.number(),
  total_messages: z.number(),
  assistant_turns: z.number(),
  tool_calls_by_name: ToolCallCountsSchema,
  tool_calls_total: z.number(),
  tool_errors: z.number(),
  fallback_count: z.number(),
  has_censored: z.boolean(),
  has_fallback: z.boolean(),
  has_tool_error: z.boolean(),
});
export type ConversationStats = z.infer<typeof ConversationStatsSchema>;

export const ConversationSummarySchema = ConversationStatsSchema.extend({
  guest_id: z.string(),
  last_accessed: z.number(),
});
export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;

export const ConversationsListResponseSchema = z.object({
  count: z.number(),
  conversations: z.array(ConversationSummarySchema),
});
export type ConversationsListResponse = z.infer<
  typeof ConversationsListResponseSchema
>;

export const TranscriptToolCallSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  arguments: z.string().nullable(),
});
export type TranscriptToolCall = z.infer<typeof TranscriptToolCallSchema>;

export const TranscriptEntrySchema = z.object({
  role: z.enum(["user", "assistant", "tool"]),
  content: z.string().nullable(),
  tool_calls: z.array(TranscriptToolCallSchema).optional(),
  name: z.string().nullable().optional(),
  tool_call_id: z.string().optional(),
});
export type TranscriptEntry = z.infer<typeof TranscriptEntrySchema>;

export const ConversationTranscriptResponseSchema = z.object({
  guest_id: z.string(),
  last_accessed: z.number(),
  summary: ConversationStatsSchema,
  transcript: z.array(TranscriptEntrySchema),
});
export type ConversationTranscriptResponse = z.infer<
  typeof ConversationTranscriptResponseSchema
>;
