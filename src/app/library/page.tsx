import { db } from "@/lib/db";
import { BookModel } from "@/generated/prisma/models/Book";
import LibrarySearch from "@/components/LibrarySearch";

export default async function LibraryPage() {
  const books = await db.book.findMany({ orderBy: { addedAt: "desc" } });
  return <LibrarySearch books={books as BookModel[]} />;
}
