export default function ShowCardSkeleton() {
  return (
    <div className="show-card show-card--skeleton">
      <div className="skeleton-thumb" />
      <div className="skeleton-line skeleton-line--long" style={{ marginTop: 10 }} />
      <div className="skeleton-line skeleton-line--medium" />
    </div>
  );
}