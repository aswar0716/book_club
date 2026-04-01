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

  const pageContext = currentPage && currentPage > 0
    ? `The reader is currently on page ${currentPage}${book.pageCount ? ` of ${book.pageCount}` : ""}. Only discuss content up to this point — do not spoil anything beyond page ${currentPage}.`
    : `The reader has not specified their current page. Be thoughtful about spoilers and ask if needed.`;

  const systemPrompt = `You are a warm, thoughtful book club companion — like a well-read friend sitting across from them by the fireplace with a cup of tea. You are discussing "${book.title}" by ${book.author}.

${pageContext}

Keep your tone conversational, curious, and cosy. Share insights about themes, characters, writing style, and historical context. Ask follow-up questions to keep the conversation alive. Never be dry or academic — be the kind of reader who genuinely loves books and loves talking about them.

If the reader shares personal reactions, engage with those first before offering your own analysis.`;

  // Save user message
  await db.chatMessage.create({
    data: { bookId: id, role: "user", content: message, pageContext: currentPage ?? null },
  });

  // Build message history for Claude
  const history = book.chatMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
  history.push({ role: "user", content: message });

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: history,
  });

  const reply = (response.content[0] as { type: string; text: string }).text;

  // Save assistant reply
  await db.chatMessage.create({
    data: { bookId: id, role: "assistant", content: reply, pageContext: currentPage ?? null },
  });

  return NextResponse.json({ reply });
}
