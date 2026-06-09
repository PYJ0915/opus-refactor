export default function OrderCardSkeleton() {
  return (
    <div className="order-card order-card--skeleton">
      <div className="order-card__header">
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-btn" />
      </div>
      <div className="order-card__body">
        <div className="order-product">
          <div className="skeleton-image" />
          <div className="product-info">
            <div className="skeleton-line skeleton-line--long" />
            <div className="skeleton-line skeleton-line--medium" />
          </div>
        </div>
      </div>
    </div>
  );
}