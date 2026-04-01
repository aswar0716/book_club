import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import BookActions from "@/components/BookActions";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await db.book.findUnique({
    where: { id },
    include: { chatMessages: { orderBy: { createdAt: "asc" } } },
  });
  if (!book) notFound();

  const genres: string[] = JSON.parse(book.genres);

  return (
    <div className="p-8 max-w-5xl mx-auto fade-in">
      <div className="flex gap-8 mb-10">
        {/* Cover */}
        <div
          className="shrink-0 w-40 h-60 rounded-xl overflow-hidden shadow-2xl"
          style={{ background: "var(--bg-elevated)" }}
        >
          {book.coverUrl ? (
            <Image src={book.coverUrl} alt={book.title} width={160} height={240} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4 text-center text-sm"
              style={{ fontFamily: "var(--font-serif)", color: "var(--cream-muted)" }}>
              {book.title}
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex-1">
          <h1
            className="text-3xl mb-1 leading-tight"
            style={{ fontFamily: "var(--font-serif)", color: "var(--cream)" }}
          >
            {book.title}
          </h1>
          <p className="text-lg mb-3" style={{ color: "var(--text-secondary)" }}>{book.author}</p>

          <div className="flex gap-4 text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            {book.publishYear && <span>{book.publishYear}</span>}
            {book.pageCount   && <span>{book.pageCount} pages</span>}
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: "var(--bg-elevated)", color: "var(--cream-muted)", border: "1px solid var(--border-light)" }}
                >
                  {g}
                </span>
              ))}
            </div>
          )}

          {book.description && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {book.description}
            </p>
          )}
        </div>
      </div>

      {/* Interactive section */}
      <BookActions book={book} genres={genres} chatMessages={book.chatMessages} />
    </div>
  );
}
