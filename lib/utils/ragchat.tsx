// utils/rag-chat.ts
import { RAGChat, upstash } from "@upstash/rag-chat";

export const ragChat = new RAGChat({
  model: upstash("mistralai/Mistral-7B-Instruct-v0.2"),
});

// Add context to RAGChat
ragChat.context.add({
  type: "text",
  data: "This is a MapGPT application that helps users with map-related queries.",
});

