// ============================================================================
// PageLoader — Global loading indicator
// Used by React.lazy/Suspense to show a premium spinner while downloading chunks
// ============================================================================

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20 border-t-primary animate-spin mb-4" />
      <p className="text-sm font-semibold tracking-widest text-primary uppercase animate-pulse">
        Loading
      </p>
    </div>
  );
}
