# The Reading Nook

A personal book tracking app with a built-in AI reading companion. Think Letterboxd, but for books — and with a cosy fireplace vibe.

Built for one person: you log every book you read, rate and categorise them, mark favourites, and hold private conversations with an AI that knows exactly where you are in the book so it never spoils what's ahead.

---

## What it does

- **Search for books** using the Open Library database — millions of titles, free, no API key needed
- **Track reading status** — Want to Read, Reading Now, or Finished
- **Rate books** from 1 to 5 stars
- **Write personal notes** on any book — thoughts, quotes, reactions
- **Mark favourites** — the books that really stayed with you
- **Track reading progress** — set your current page and see a live progress bar on each book card
- **Filter by genre** — browse your shelf by genre with one click
- **Chat with an AI book companion** — ask about themes, characters, writing style, historical context, anything. Tell it what page you're on and it will never spoil what's ahead

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) version 20 or higher
- An [Anthropic API key](https://console.anthropic.com/) for the AI chat feature

### 1. Clone the repository

```bash
git clone https://github.com/aswar0716/book_club.git
cd book_club
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your environment

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

Get an Anthropic API key from [console.anthropic.com](https://console.anthropic.com/).

### 4. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
```

This creates a local SQLite database file (`dev.db`) with all the tables the app needs. It only needs to be run once (or again if the schema changes).

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How to use it

### Adding books

Click **Find Books** in the sidebar. Search by title, author, or both. Each result shows the cover, author, year, page count, and genres from Open Library. Pick a reading status from the dropdown and click **Add to Shelf**.

### Your shelf

The home page shows all your books grouped by status — Currently Reading, Want to Read, Finished. A stats bar at the top shows your total counts at a glance. Books in progress show a reading progress bar on their card.

### Book detail page

Click any book to open it. From here you can:

- Change its reading status
- Update your current page (drives the progress bar on the card)
- Give it a star rating
- Add or remove it from favourites
- Write personal notes — thoughts, quotes, anything
- Open the Book Club Chat on the right

### Book Club Chat

The chat panel is on the right side of every book detail page. Set your current page first — the AI uses this to stay spoiler-free. Then ask anything: character motivations, themes, the author's style, historical context, how it compares to other books, or just share what you're feeling.

Every conversation is saved per book, so you can come back to it any time.

### Filtering by genre

On the Finished, Want to Read, and Favourites pages, genre pills appear above the grid. Click one to filter to only books in that genre.

---

## Project structure

```
book_club/
├── src/
│   ├── app/                    # Pages and API routes
│   │   ├── page.tsx            # Main shelf (home)
│   │   ├── search/             # Book search page
│   │   ├── reading/            # Currently reading
│   │   ├── want-to-read/       # Want to read
│   │   ├── finished/           # Finished books
│   │   ├── favourites/         # Favourites
│   │   ├── books/[id]/         # Individual book detail
│   │   └── api/                # Backend API routes
│   │       ├── search/         # Open Library search proxy
│   │       └── books/          # CRUD and chat endpoints
│   ├── components/             # Reusable UI components
│   │   ├── Sidebar.tsx         # Navigation
│   │   ├── BookCard.tsx        # Book card with progress bar
│   │   ├── BookActions.tsx     # Rating, notes, status, chat
│   │   └── GenreFilter.tsx     # Genre filter pills
│   └── lib/
│       ├── db.ts               # Database client
│       └── openLibrary.ts      # Open Library API helpers
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
├── .env.example                # Environment variable template
└── prisma.config.ts            # Prisma configuration
```

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | SQLite via Prisma ORM |
| AI | Anthropic Claude API (claude-opus-4-6) |
| Book data | Open Library API (free, no key required) |

---

## Planned features

- Reading stats — books per year, pages read, favourite genres
- Reading timeline and activity log
- Saved quotes per book
- Reading challenges and yearly goals
- Year in review

---

## License

Personal project.
