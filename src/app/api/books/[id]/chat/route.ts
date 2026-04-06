import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { message, currentPage }: { message: string; currentPage?: number } = await req.json();

  const book = await db.book.findUnique({
    where: { id },
    include: { chatMessages: { orderBy: { createdAt: "asc" }, take: 20 } },
  });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Rich context about the reader's relationship with this book
  const readerContext = [
    book.rating    ? `The reader has rated this book ${book.rating}/5 stars.` : null,
    book.notes?.trim() ? `The reader's personal notes on this book: "${book.notes.trim()}"` : null,
    currentPage && currentPage > 0
      ? `The reader is currently on page ${currentPage}${book.pageCount ? ` of ${book.pageCount}` : ""}. Only discuss content up to this point — never spoil anything beyond page ${currentPage}.`
      : "The reader has not specified their current page. Be thoughtful about potential spoilers and check with them if needed.",
  ].filter(Boolean).join("\n");

  const systemPrompt = `You are a warm, thoughtful book club companion — like a well-read friend sitting by the fireplace with a cup of tea. You are discussing "${book.title}" by ${book.author}${book.publishYear ? ` (${book.publishYear})` : ""}.

${readerContext}

Your personality: conversational, genuinely curious, cosy. You love books and love talking about them. You share insights about themes, characters, writing style, and historical or literary context. You ask follow-up questions to keep the conversation alive. You never lecture — you discuss.

When the reader shares a personal reaction or feeling, engage with that first before offering analysis. Keep responses focused and readable — avoid walls of text. Use natural paragraph breaks.`;

  // Save user message first
  await db.chatMessage.create({
    data: { bookId: id, role: "user", content: message, pageContext: currentPage ?? null },
  });

  // Build conversation history for Claude
  const history = book.chatMessages.map((m: { role: string; content: string }) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  history.push({ role: "user", content: message });

  // Stream response using Web Streams API (as per Next.js Route Handler docs)
  const encoder = new TextEncoder();
  let fullReply = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: "claude-opus-4-6",
          max_tokens: 1024,
          system: systemPrompt,
          messages: history,
        });

        for await (const chunk of anthropicStream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            fullReply += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        // Persist the complete reply once streaming is done
        await db.chatMessage.create({
          data: {
            bookId: id,
            role: "assistant",
            content: fullReply,
            pageContext: currentPage ?? null,
          },
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.chatMessage.deleteMany({ where: { bookId: id } });
  return NextResponse.json({ ok: true });
}
