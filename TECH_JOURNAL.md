# Tech Journal — The Reading Nook

This document explains how the app is built from the ground up. It's written for someone who is new to web development and wants to understand not just *what* each technology is, but *why* it's used and *how* it connects to everything else.

Read it top to bottom, or jump to whatever section you want to understand.

---

## Table of Contents

1. [The big picture](#1-the-big-picture)
2. [Next.js — the framework holding everything together](#2-nextjs--the-framework-holding-everything-together)
3. [TypeScript — JavaScript with guardrails](#3-typescript--javascript-with-guardrails)
4. [The file system is the router](#4-the-file-system-is-the-router)
5. [Server components vs client components](#5-server-components-vs-client-components)
6. [Tailwind CSS — styling without writing CSS files](#6-tailwind-css--styling-without-writing-css-files)
7. [Prisma — talking to the database in plain TypeScript](#7-prisma--talking-to-the-database-in-plain-typescript)
8. [SQLite — the database that lives in a file](#8-sqlite--the-database-that-lives-in-a-file)
9. [The database schema explained](#9-the-database-schema-explained)
10. [API routes — the backend inside the frontend](#10-api-routes--the-backend-inside-the-frontend)
11. [Open Library API — free book data](#11-open-library-api--free-book-data)
12. [Anthropic Claude API — the AI chat](#12-anthropic-claude-api--the-ai-chat)
13. [How a full request flows through the app](#13-how-a-full-request-flows-through-the-app)
14. [Environment variables — secrets and config](#14-environment-variables--secrets-and-config)
15. [The component tree — how the UI is assembled](#15-the-component-tree--how-the-ui-is-assembled)

---

## 1. The big picture

Before diving into individual technologies, here's the whole system in one diagram:

```
Browser (you)
    │
    │  visits localhost:3000
    ▼
Next.js App (running on your machine)
    │
    ├── Pages (React components)       → what you see on screen
    ├── API Routes (server functions)  → handle data operations
    │       │
    │       ├── Prisma ORM  →  SQLite database (dev.db file)
    │       ├── Open Library API  →  book search & metadata
    │       └── Anthropic API  →  AI book club chat
    │
    └── Tailwind CSS  →  styles applied at build time
```

The key insight: **Next.js is both the frontend and the backend**. You don't need a separate server. The same project handles the web pages you see and the data operations behind them.

---

## 2. Next.js — the framework holding everything together

**What is it?**
Next.js is a framework built on top of React. React lets you build UI with components; Next.js adds everything else you need for a real app — routing, server-side code, API endpoints, image optimisation, and more.

**Why use a framework at all?**
Without a framework, you'd need to manually wire together a React app, a web server (like Express), a router, a build tool, and more. Next.js bundles all of that with sensible defaults so you can focus on building the app.

**Version matters here:**
This app uses Next.js 16 with the **App Router** — a newer approach where the folder structure inside `src/app/` defines both your pages and your API. This is different from the older "Pages Router" you might see in tutorials — the concepts are similar but the file conventions differ.

**How does it run?**
When you run `npm run dev`, Next.js starts a local development server. It watches your files and hot-reloads the browser when you save a change. For production you'd run `npm run build` then `npm start`.

---

## 3. TypeScript — JavaScript with guardrails

**What is it?**
TypeScript is JavaScript with types added. A type tells the code what shape data is expected to be.

Example — plain JavaScript:
```js
function greet(name) {
  return "Hello " + name;
}
```

The same in TypeScript:
```ts
function greet(name: string): string {
  return "Hello " + name;
}
```

Now if you accidentally call `greet(42)`, TypeScript will flag it as an error before the code even runs.

**Why use it?**
In a project like this — where data flows between the browser, the server, the database, and external APIs — types prevent a huge class of bugs. When you define that a `Book` has a `title` (string) and a `rating` (number or null), TypeScript will warn you anywhere you try to use them incorrectly.

**It compiles away:**
TypeScript is never shipped to the browser. It compiles down to plain JavaScript. You only deal with TypeScript while writing code.

---

## 4. The file system is the router

This is one of the most important things to understand about Next.js with the App Router.

**Every folder inside `src/app/` is a URL path.**

```
src/app/
├── page.tsx            →  localhost:3000/
├── search/
│   └── page.tsx        →  localhost:3000/search
├── reading/
│   └── page.tsx        →  localhost:3000/reading
├── books/
│   └── [id]/
│       └── page.tsx    →  localhost:3000/books/abc123
└── api/
    └── books/
        └── route.ts    →  localhost:3000/api/books  (API, not a page)
```

The `[id]` folder is a **dynamic segment** — the `id` part in the URL (like `abc123`) gets passed into the page as a parameter. This is how the book detail page works: one file handles any book, using the ID from the URL to look up the right one.

`route.ts` files are API endpoints. `page.tsx` files are pages. That's the only distinction.

---

## 5. Server components vs client components

This is the trickiest concept in modern Next.js, but it's important.

**Server components (default)**
By default, every component in the App Router runs on the server. This means:
- They can directly query the database
- They never send the database code to the browser
- They have no access to browser APIs (no `window`, no `document`)
- They cannot use React state (`useState`) or effects (`useEffect`)

Most of the shelf pages are server components. For example, `src/app/page.tsx`:
```ts
// This runs on the server — it can call db.book.findMany() directly
export default async function ShelfPage() {
  const books = await db.book.findMany(...);
  return <div>...</div>;
}
```

**Client components**
When a component needs interactivity — button clicks, typed input, state changes — you add `"use client"` at the top of the file. This tells Next.js to include that component in the browser's JavaScript bundle.

Example — `src/components/GenreFilter.tsx`:
```ts
"use client";  // ← this line makes it a client component

import { useState } from "react";

export default function GenreFilter({ books, allGenres }) {
  const [active, setActive] = useState(null);  // ← state lives in the browser
  ...
}
```

**The rule of thumb:**
Use server components for anything that needs data. Use client components for anything that needs interactivity. A common pattern is a server component that fetches data and passes it as props to a client component that renders it interactively.

---

## 6. Tailwind CSS — styling without writing CSS files

**What is it?**
Tailwind is a utility-first CSS framework. Instead of writing a `.css` file with class names and rules, you apply small utility classes directly in your HTML/JSX.

Traditional CSS:
```css
.card {
  padding: 16px;
  border-radius: 12px;
  background-color: #1e1208;
}
```
```html
<div class="card">...</div>
```

With Tailwind:
```html
<div class="p-4 rounded-xl bg-[#1e1208]">...</div>
```

**Why is this useful?**
- No context switching between files
- No naming things (naming CSS classes is surprisingly hard)
- No unused styles — Tailwind only ships the classes you actually use

**How does this app use it?**
The app uses Tailwind for layout and spacing, but uses CSS custom properties (variables defined in `globals.css`) for the colour palette. This is intentional — the cosy amber/brown/cream colours are defined once and reused everywhere:

```css
/* defined once in globals.css */
:root {
  --amber: #c8813a;
  --cream: #f2dfc0;
  --bg-card: #1e1208;
}
```

```tsx
/* used anywhere via inline style */
<div style={{ background: "var(--bg-card)", color: "var(--cream)" }}>
```

This gives us the full cosy theme in one place, making it easy to adjust the whole look at once.

---

## 7. Prisma — talking to the database in plain TypeScript

**What is an ORM?**
ORM stands for Object-Relational Mapper. A database stores data in tables with rows and columns. An ORM lets you work with that data as regular JavaScript/TypeScript objects instead of writing raw SQL queries.

Without an ORM (raw SQL):
```sql
SELECT * FROM books WHERE status = 'reading' ORDER BY added_at DESC;
```

With Prisma:
```ts
const books = await db.book.findMany({
  where: { status: "reading" },
  orderBy: { addedAt: "desc" },
});
```

Both do exactly the same thing. The Prisma version is type-safe — if you typo `statuss` or use a field that doesn't exist, TypeScript catches it immediately.

**How Prisma works in this app:**

1. You define your data model in `prisma/schema.prisma` (more on that below)
2. You run `npx prisma generate` — this generates TypeScript types and a database client into `src/generated/prisma/`
3. You import and use the client: `import { db } from "@/lib/db"`
4. When you change the schema, you run `npx prisma migrate dev` to update the database and regenerate the client

**The singleton pattern in `src/lib/db.ts`:**
```ts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

This looks complex but it solves a simple problem: in development, Next.js hot-reloads your code frequently. Without this pattern, every reload would create a new database connection — you'd quickly exhaust the connection limit. This stores the client on the global object so it's reused across hot reloads.

---

## 8. SQLite — the database that lives in a file

**What is it?**
SQLite is a relational database (like PostgreSQL or MySQL) that stores everything in a single file on your disk — in this case `dev.db`. There's no separate database server to install, configure, or run.

**Why SQLite for this app?**
This is a personal, single-user app. SQLite is perfect for that:
- Zero setup — it just works
- The whole database is one file you can copy, backup, or delete
- Fast enough for personal use
- You can open `dev.db` in any SQLite viewer to inspect your data directly

For a multi-user production app you'd switch to PostgreSQL — and because Prisma abstracts the database, you'd only need to change one line in `prisma.config.ts`.

---

## 9. The database schema explained

The schema lives in `prisma/schema.prisma`. It defines the shape of the data.

**The Book model:**
```prisma
model Book {
  id            String    @id @default(cuid())   // unique ID, auto-generated
  openLibraryId String    @unique                // ID from Open Library API
  title         String
  author        String
  coverUrl      String?                          // ? means optional/nullable
  description   String?
  publishYear   Int?
  pageCount     Int?
  genres        String    @default("[]")         // JSON array stored as text
  status        String    @default("want_to_read")
  rating        Int?                             // 1-5, or null if unrated
  isFavorite    Boolean   @default(false)
  notes         String?
  currentPage   Int?
  startedAt     DateTime?
  finishedAt    DateTime?
  addedAt       DateTime  @default(now())
  updatedAt     DateTime  @updatedAt             // auto-updated on every save
  chatMessages  ChatMessage[]                    // relation to chat messages
}
```

**The ChatMessage model:**
```prisma
model ChatMessage {
  id          String   @id @default(cuid())
  bookId      String
  book        Book     @relation(...)            // links back to the Book
  role        String                             // "user" or "assistant"
  content     String
  pageContext Int?                               // what page was set when sent
  createdAt   DateTime @default(now())
}
```

**One notable design choice — genres as JSON string:**
Relational databases aren't naturally good at storing arrays. The clean solution would be a separate `Genre` table with a many-to-many relationship to books. But for a personal app that's overkill. Instead, genres are stored as a JSON string (`"[\"Fiction\", \"Fantasy\"]"`) and parsed with `JSON.parse()` when read. It's simpler and works fine at this scale.

---

## 10. API routes — the backend inside the frontend

API routes in Next.js are server-side functions that respond to HTTP requests. They live in files named `route.ts` inside the `api/` folder.

**The books API (`src/app/api/books/route.ts`):**
```ts
export async function GET() {
  // responds to GET /api/books — returns all books
  const books = await db.book.findMany(...);
  return NextResponse.json(books);
}

export async function POST(req) {
  // responds to POST /api/books — adds a new book
  const { book, status } = await req.json();
  const created = await db.book.create({ data: { ... } });
  return NextResponse.json(created, { status: 201 });
}
```

**Dynamic routes (`src/app/api/books/[id]/route.ts`):**
The `[id]` folder makes this route match any book ID. The ID is extracted from `params`:
```ts
export async function PATCH(req, { params }) {
  const { id } = await params;  // e.g. "clxyz123"
  const body = await req.json();
  const updated = await db.book.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}
```

This handles `PATCH /api/books/clxyz123` — update a specific book.

**HTTP methods map to operations:**
| Method | Meaning | Used for |
|--------|---------|---------|
| GET | Read | Fetching books |
| POST | Create | Adding a new book |
| PATCH | Partial update | Changing status, rating, notes |
| DELETE | Delete | Removing a book from the shelf |

---

## 11. Open Library API — free book data

[Open Library](https://openlibrary.org/) is a project by the Internet Archive that catalogues millions of books. Their API is free and requires no authentication.

**How search works:**
When you type in the search box, the browser calls our own API route (`/api/search`), which calls Open Library:

```
Browser → GET /api/search?q=dune
             ↓
         Next.js route (src/app/api/search/route.ts)
             ↓
         fetch("https://openlibrary.org/search.json?q=dune&limit=12")
             ↓
         Parse results, return to browser as JSON
```

Why proxy through our own API instead of calling Open Library directly from the browser? Two reasons:
1. We can cache results on the server (`{ next: { revalidate: 3600 } }` — cache for 1 hour)
2. We control the shape of data returned — the `mapOLResult()` function in `src/lib/openLibrary.ts` transforms the raw Open Library response into the simpler `OLBook` shape the rest of the app expects

**How descriptions are fetched:**
The search endpoint doesn't include full descriptions. When you add a book, the `POST /api/books` route makes a second request to the Open Library works API:
```
GET https://openlibrary.org/works/OL45804W.json
```
This returns the full work record including the description, which gets saved to the database. That's why descriptions appear on book detail pages even though search results don't include them.

---

## 12. Anthropic Claude API — the AI chat

The chat feature uses Anthropic's Claude API. Every time you send a message, the API route (`src/app/api/books/[id]/chat/route.ts`) does the following:

**Step 1 — Build context**
It loads the book details and the last 20 messages of conversation history from the database. The conversation history is what makes Claude feel like it "remembers" previous messages — it's replayed on every request.

**Step 2 — Build the system prompt**
The system prompt is a set of instructions given to Claude before the conversation. It defines the persona and, crucially, the spoiler boundary:

```ts
const systemPrompt = `You are a warm, thoughtful book club companion...
You are discussing "${book.title}" by ${book.author}.

The reader is currently on page ${currentPage} of ${book.pageCount}.
Only discuss content up to this point — do not spoil anything beyond page ${currentPage}.`
```

This is how spoiler protection works — it's not a feature of the API, it's just instruction text. Claude follows the instruction because it's trained to follow system prompts.

**Step 3 — Call the API**
```ts
const response = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  system: systemPrompt,
  messages: history,  // full conversation so far + new message
});
```

The `messages` array includes every previous message in the conversation. This is called a **stateless API** — Claude doesn't "remember" anything between calls. We manually reconstruct the conversation state each time.

**Step 4 — Save and return**
Both the user message and Claude's reply are saved to the `ChatMessage` table in the database before the response is sent back to the browser. This is what persists the conversation across page loads.

---

## 13. How a full request flows through the app

Let's trace exactly what happens when you search for a book and add it to your shelf.

### Searching

```
1. You type "The Road" and press Search
   (src/app/search/page.tsx — client component)

2. Browser calls: GET /api/search?q=The+Road
   (src/app/api/search/route.ts)

3. The route calls Open Library:
   fetch("https://openlibrary.org/search.json?q=The+Road")

4. Open Library returns JSON with book data

5. Our route maps it to OLBook[] and returns it

6. Browser receives the list and React re-renders
   the search results on screen
```

### Adding a book

```
1. You select "Reading Now" and click "Add to Shelf"
   (src/app/search/page.tsx — handleAdd function)

2. Browser calls: POST /api/books
   with body: { book: { id, title, author, ... }, status: "reading" }
   (src/app/api/books/route.ts)

3. Route checks if the book already exists in the DB

4. Route calls Open Library works API for the description:
   fetch("https://openlibrary.org/works/OL12345W.json")

5. Route creates the book in SQLite via Prisma:
   db.book.create({ data: { ... } })

6. Returns the created book record as JSON

7. Browser marks the book as "Added ✓" in the UI
```

### Changing a rating

```
1. You click the 4th star on the book detail page
   (src/components/BookActions.tsx — handleSave function)

2. Browser calls: PATCH /api/books/clxyz123
   with body: { rating: 4, status: "reading", ... }
   (src/app/api/books/[id]/route.ts)

3. Route updates the record in SQLite:
   db.book.update({ where: { id }, data: { rating: 4 } })

4. Returns the updated book

5. Next.js router.refresh() is called — the server
   re-fetches and re-renders the page with fresh data
```

---

## 14. Environment variables — secrets and config

Environment variables are values set outside of your code — in a file called `.env` — that your code reads at runtime. They're used for secrets (like API keys) that should never be committed to git.

```
# .env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-xxxx"
```

**In code, you read them with:**
```ts
process.env.ANTHROPIC_API_KEY
process.env.DATABASE_URL
```

**Why not just hardcode these in the source?**
Two reasons:
1. Security — if you push `sk-ant-xxxx` to a public GitHub repo, anyone can use your API key and you'll get charged
2. Flexibility — the database path or API key might differ between your laptop and a production server. Environment variables let each environment have its own config without changing code

The `.env` file is listed in `.gitignore` so it's never committed. The `.env.example` file *is* committed — it shows what variables are needed without containing the actual secret values.

---

## 15. The component tree — how the UI is assembled

React apps are made of components — reusable pieces of UI that can be composed together like nesting boxes. Here's how this app's component tree looks for the book detail page:

```
layout.tsx  (wraps every page)
├── Sidebar.tsx  (navigation — client component)
└── books/[id]/page.tsx  (server component — fetches book from DB)
    ├── Image  (book cover)
    ├── genre pill spans
    └── BookActions.tsx  (client component — all the interactive bits)
        ├── status select dropdown
        ├── page number input
        ├── star rating buttons
        ├── favourite toggle button
        ├── notes textarea
        └── chat panel
            ├── message list
            └── input + send button
```

**Props flow down:**
The server component (`page.tsx`) fetches the book data from the database and passes it to `BookActions` as props:
```tsx
// page.tsx (server)
const book = await db.book.findUnique({ where: { id } });
return <BookActions book={book} chatMessages={book.chatMessages} />;
```

```tsx
// BookActions.tsx (client)
export default function BookActions({ book, chatMessages }) {
  const [rating, setRating] = useState(book.rating ?? 0);
  // ...
}
```

The server component does the data work; the client component does the interactive work. They communicate through props.

**Events flow up through API calls:**
When you click Save in `BookActions`, it doesn't directly update the database — it calls `PATCH /api/books/{id}`, which runs on the server and updates the database. Then `router.refresh()` triggers the server component to re-render with fresh data. This keeps the database logic on the server, where it belongs.

---

## Summary

| Technology | Role | Why it was chosen |
|-----------|------|-------------------|
| Next.js | Full-stack framework | Frontend + backend in one project |
| TypeScript | Language | Catches type errors before runtime |
| Tailwind CSS | Styling | Fast, composable, no unused CSS |
| Prisma | Database ORM | Type-safe queries, easy schema changes |
| SQLite | Database | Zero setup, single file, perfect for personal apps |
| Open Library | Book data | Free, no API key, millions of books |
| Anthropic Claude | AI chat | Best-in-class conversational AI |

The stack is intentionally simple — no Redux, no complex state management, no microservices. Next.js handles routing and the server layer. Prisma handles the database. The AI is one API call with a well-crafted prompt. Each piece does one thing and connects cleanly to the next.
