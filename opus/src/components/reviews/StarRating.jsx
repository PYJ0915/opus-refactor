import { useState } from "react";
import "../../css/starRating.css";

export default function StarRating({
  rating = 0,
  onChange,
  readonly = false,
  size = "md",  // "sm" | "md" | "lg" | "xl"
}) {
  const [hoverRating, setHoverRating] = useState(0);

  // 표시에 사용할 실제 점수 (hover 중이면 hover값, 아니면 rating)
  const displayRating = readonly ? rating : (hoverRating || rating);

  return (
    <div className={`star-rating star-rating--${size} ${readonly ? "star-rating--readonly" : ""}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        // 완전히 채워진 별: star <= 4.5 → 1,2,3,4번 별 채워짐
        const filled = star <= Math.floor(displayRating);
        // 반만 채워진 별: 4 < 4.5 < 5 → 5번 별은 반별
        const half = !filled && (displayRating > star - 1) && (displayRating < star);

        return (
          <button
            key={star}
            type="button"
            className={`star-rating__star ${filled || half ? "is-hover" : ""}`}
            onClick={() => !readonly && onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            aria-label={`${star}점`}
            style={readonly ? { pointerEvents: "none" } : {}}
          >
            {half ? (
              // 반별: 왼쪽 절반만 amber로 clip
              <span className="star-rating__icon" style={{ position: "relative", display: "inline-block" }}>
                {/* 배경: 빈 별 */}
                <span style={{ color: "#d1d5db" }}>★</span>
                {/* 전경: 왼쪽 50%만 amber */}
                <span style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "50%",
                  overflow: "hidden",
                  color: "#f59e0b",
                  display: "inline-block",
                }}>★</span>
              </span>
            ) : (
              <span className={`star-rating__icon ${filled ? "star-rating__icon--filled" : ""}`}>
                ★
              </span>
            )}
          </button>
        );
      })}

      {readonly && rating > 0 && (
        <span className="star-rating__score">
          {/* 정수면 "4.0", 소수면 "4.5" 그대로 표시 */}
          {Number.isInteger(rating) ? `${rating}.0` : rating}
        </span>
      )}
    </div>
  );
}