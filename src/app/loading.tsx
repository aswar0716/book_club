export default function Loading() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="skeleton h-10 w-48 mb-3" />
      <div className="skeleton h-4 w-32 mb-10" />
      <div className="skeleton h-5 w-36 mb-5" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="skeleton w-full aspect-[2/3] rounded-xl" />
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
