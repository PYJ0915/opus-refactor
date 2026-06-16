export default function MdPickCardSkeleton() {
  return (
    <div className="mdpick-cardwrap">
      <div className="mdpick-card--skeleton">
        <div className="skeleton-mdpick-thumb" />
        <div className="skeleton-line skeleton-line--long" style={{ marginTop: 12 }} />
        <div className="skeleton-line skeleton-line--medium" />
      </div>
    </div>
  );
}