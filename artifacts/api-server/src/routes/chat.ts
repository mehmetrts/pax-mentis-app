/**
 * Pax Mentis — Cloud AI Fallback
 *
 * llama.rn native modülü olmayan build'lerde (eski dev build, web preview)
 * Anthropic Claude Haiku ile gerçek Türkçe Sokratik yanıt üretir.
 *
 * POST /api/chat
 * Body: { messages: Array<{role: "system"|"user"|"assistant", content: string}>, phase?: string }
 * Response: { content: string }
 */

import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const anthropic = new Anthropic({
  baseURL: process.env["AI_INTEGRATIONS_ANTHROPIC_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_ANTHROPIC_API_KEY"] ?? "placeholder",
});

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body as {
      messages: Array<{ role: string; content: string }>;
      phase?: string;
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    // Anthropic: system ayrı, user/assistant mesajlar ayrı
    const systemMsg = messages.find(m => m.role === "system");
    const chatMessages = messages
      .filter(m => m.role !== "system")
      .map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system: systemMsg?.content ?? "Sen Türkçe konuşan bir mentörsün.",
      messages: chatMessages,
    });

    const content =
      response.content[0]?.type === "text"
        ? response.content[0].text
        : "";

    res.json({ content });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

export default router;
