export interface OLSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
  subject?: string[];
}

export interface OLBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  publishYear: number | null;
  pageCount: number | null;
  genres: string[];
}

export function coverUrl(coverId: number | undefined, size: "S" | "M" | "L" = "M") {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export function mapOLResult(doc: OLSearchResult): OLBook {
  return {
    id: doc.key.replace("/works/", ""),
    title: doc.title,
    author: doc.author_name?.[0] ?? "Unknown Author",
    coverUrl: coverUrl(doc.cover_i, "M"),
    description: null,
    publishYear: doc.first_publish_year ?? null,
    pageCount: doc.number_of_pages_median ?? null,
    genres: doc.subject?.slice(0, 5) ?? [],
  };
}

export async function searchBooks(query: string, limit = 12): Promise<OLBook[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Open Library search failed");
  const data = await res.json();
  return (data.docs as OLSearchResult[]).map(mapOLResult);
}
