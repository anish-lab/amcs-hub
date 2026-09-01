export default function Loading() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted/60 rounded-md" />
          <div className="h-4 w-64 bg-muted/40 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-muted/60 rounded-md" />
          <div className="h-9 w-24 bg-muted/60 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-32 bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <div className="h-4 w-28 bg-muted/60 rounded-md" />
          <div className="h-8 w-20 bg-muted/80 rounded-md" />
          <div className="h-2 w-full bg-muted/40 rounded-full" />
        </div>
        <div className="h-32 bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <div className="h-4 w-28 bg-muted/60 rounded-md" />
          <div className="h-8 w-20 bg-muted/80 rounded-md" />
          <div className="h-2 w-full bg-muted/40 rounded-full" />
        </div>
        <div className="h-32 bg-card border border-border/50 rounded-xl p-4 space-y-3">
          <div className="h-4 w-28 bg-muted/60 rounded-md" />
          <div className="h-8 w-20 bg-muted/80 rounded-md" />
          <div className="h-2 w-full bg-muted/40 rounded-full" />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <div className="h-5 w-44 bg-muted/60 rounded-md" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 bg-card border border-border/50 rounded-xl p-5 space-y-4">
              <div className="flex justify-between">
                <div className="space-y-1.5">
                  <div className="h-3 w-16 bg-muted/60 rounded-md" />
                  <div className="h-5 w-48 bg-muted/80 rounded-md" />
                </div>
                <div className="h-5 w-14 bg-muted/60 rounded-full" />
              </div>
              <div className="h-8 w-24 bg-muted/70 rounded-md" />
              <div className="h-2 w-full bg-muted/40 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
