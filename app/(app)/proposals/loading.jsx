export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <div className="flex items-center gap-2" aria-label="Loading">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-2 w-2 animate-[loading-bounce_0.8s_infinite] rounded-full bg-blue-600"
            style={{ animationDelay: `${dot * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}

