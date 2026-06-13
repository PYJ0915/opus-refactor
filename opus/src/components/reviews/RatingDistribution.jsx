import { useEffect, useState } from 'react';
import axiosApi from '../../api/axiosAPI';

export default function RatingDistribution({ stageNo, totalCount }) {
  const [distribution, setDistribution] = useState([]);

  useEffect(() => {
    if (!stageNo) return;
    axiosApi.get("/reviews/ratingDistribution", { params: { stageNo } })
      .then(resp => {
        if (resp.status === 200) {
          const map = {};
          resp.data.forEach(item => {
            const star = Number(item.rating);
            const cnt = Number(item.cnt);
            if (star >= 1 && star <= 5) {
              map[star] = cnt;
            }
          });
          const filled = [5, 4, 3, 2, 1].map(star => ({
            star,
            count: map[star] ?? 0,
          }));
          setDistribution(filled);
        }
      })
      .catch(console.error);
  }, [stageNo]);

  // 🔧 totalCount 조건 제거 — 부모(Reviews.jsx)에서 이미 reviewsCount > 0 보장
  if (!distribution.length) return null;

  return (
    <div className="rating-dist">
      {distribution.map(({ star, count }) => {
        const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
        return (
          <div key={star} className="rating-dist__row">
            <span className="rating-dist__label">{star}점</span>
            <div className="rating-dist__bar-wrap">
              <div
                className="rating-dist__bar"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="rating-dist__pct">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}