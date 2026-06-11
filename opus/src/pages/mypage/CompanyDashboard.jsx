import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import "../../css/CompanyDashboard.css";

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    axiosApi
      .get("/api/board/dashboard")
      .then((res) => setData(res.data))
      .catch(() => navigate("/"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner text="대시보드를 불러오는 중..." />;
  if (!data) return null;

  const statCards = [
    { label: "총 게시글", value: data.totalPosts, icon: "fa-file-lines", color: "#3b82f6" },
    { label: "총 조회수", value: data.totalViews.toLocaleString(), icon: "fa-eye", color: "#10b981" },
    { label: "최다 조회수", value: data.maxViews.toLocaleString(), icon: "fa-fire", color: "#f59e0b" },
  ];

  return (
    <main className="company-dashboard">
      <h1 className="company-dashboard__title">콘텐츠 대시보드</h1>
      <p className="company-dashboard__subtitle">
        등록한 콘텐츠의 성과를 확인하세요.
      </p>

      {/* 통계 카드 */}
      <div className="dashboard-stats">
        {statCards.map((card) => (
          <div key={card.label} className="dashboard-stat-card">
            <div
              className="dashboard-stat-card__icon"
              style={{ background: `${card.color}20` }}
            >
              <i
                className={`fa-solid ${card.icon}`}
                style={{ color: card.color }}
              />
            </div>

            <div>
              <p className="dashboard-stat-card__label">{card.label}</p>
              <p className="dashboard-stat-card__value">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 카테고리별 분포 */}
      <div className="dashboard-section">
        <h2 className="dashboard-section__title">
          카테고리별 게시글
        </h2>

        {Object.entries(data.byCategory).map(([cat, count]) => {
          const categoryLabel = {
            musical: "뮤지컬",
            exhibition: "전시",
            auction: "경매",
            goods: "굿즈",
          };

          const percent =
            data.totalPosts > 0
              ? Math.round((count / data.totalPosts) * 100)
              : 0;

          return (
            <div key={cat} className="dashboard-category">
              <div className="dashboard-category__header">
                <span className="dashboard-category__name">
                  {categoryLabel[cat] || cat}
                </span>

                <span className="dashboard-category__count">
                  {count}개 ({percent}%)
                </span>
              </div>

              <div className="dashboard-category__bar">
                <div
                  className="dashboard-category__fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 최근 게시글 */}
      <div className="dashboard-section">
        <div className="dashboard-section__header">
          <h2 className="dashboard-section__title">
            최근 게시글
          </h2>

          <button
            className="dashboard-more-btn"
            onClick={() => navigate("/mypage/myPosts")}
          >
            전체 보기
          </button>
        </div>

        {data.recentPosts.map((post) => (
          <div
            key={post.boardNo}
            className="dashboard-post"
            onClick={() =>
              navigate(`/proposals/detail/${post.boardNo}`)
            }
          >
            <div>
              <p className="dashboard-post__title">
                {post.boardTitle}
              </p>

              <p className="dashboard-post__date">
                {post.boardWriteDate?.substring(0, 10)}
              </p>
            </div>

            <div className="dashboard-post__meta">
              <p className="dashboard-post__views">
                <i className="fa-regular fa-eye" />
                {post.boardViewCount.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}