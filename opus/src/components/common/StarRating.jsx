// 읽기 전용 or 입력용 겸용 별점 컴포넌트
export default function StarRating({ rating, onChange, readonly = false, size = 20 }) {
  return (
    <div style={{ display: "flex", gap: 4, cursor: readonly ? "default" : "pointer" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onChange?.(star)}
          style={{ fontSize: size, color: star <= rating ? "#f59e0b" : "#d1d5db" }}
        >
          ★
        </span>
      ))}
      {readonly && (
        <span style={{ fontSize: size * 0.7, color: "#6b7280", alignSelf: "center" }}>
          {rating > 0 ? `${rating}.0` : ""}
        </span>
      )}
    </div>
  );
}