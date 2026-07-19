export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl animate-pulse flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="bg-bg-muted h-4 w-28 rounded" />
        <div className="bg-bg-muted h-6 w-40 rounded" />
      </div>
      <div className="bg-bg-muted h-16 rounded-lg" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-bg-muted h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
