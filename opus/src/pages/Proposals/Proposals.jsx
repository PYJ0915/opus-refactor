import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import "../../css/proposals.css";
import Pagination from "./Pagination";
import { useAuthStore } from "../../components/auth/useAuthStore";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Proposals = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, member } = useAuthStore();
  const role = member?.role;

  const API_BASE = import.meta.env.VITE_API_URL;
  const FALLBACK_THUMB = "/proposals-default.webp";

  /* detail -> list로 돌아올 때 탭/페이지 복원 */
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "notice");
  const [currentPage, setCurrentPage] = useState(location.state?.currentPage || 1);

  /* 글쓰기 버튼 노출 조건 */
  const canWrite =
    isLoggedIn &&
    (role === "ADMIN" || (role === "COMPANY" && activeTab === "promotion"));

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location.state?.currentPage) setCurrentPage(location.state.currentPage);
    if (location.state?.activeTab) setActiveTab(location.state.activeTab);
  }, [location.state]);

  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [keyword, setKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const itemsPerPage = 8;

  const categoryLabel = {
    opus: "OPUS",
    musical: "뮤지컬",
    exhibition: "전시",
    auction: "경매",
    goods: "굿즈",
  };

  const isPromotion = activeTab === "promotion";

  // 홍보탭에서는 OPUS 옵션 제거
  const categoryOptions = useMemo(() => {
    return Object.entries(categoryLabel).filter(([key]) => {
      if (isPromotion) return key !== "opus";
      return true;
    });
  }, [isPromotion]);

  // 홍보탭인데 category가 opus면 all로 자동 보정
  useEffect(() => {
    if (isPromotion && category === "opus") setCategory("all");
  }, [isPromotion, category]);

  /* 상대경로(/images/board/...) -> API 서버 절대경로로 변환 */
  const toAbsUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path; // 이미 절대URL이면 그대로
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  const getThumbSrc = (item) => {
    const path =
      item.boardThumbnail ||
      item.boardImgFullpath ||
      (item.boardImgPath && item.boardImgRe ? item.boardImgPath + item.boardImgRe : "") ||
      "";

    return path ? toAbsUrl(path) : FALLBACK_THUMB;
  };

  /* 탭/정렬 변경 시 백엔드에서 목록 다시 불러오기 */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const typeCode = activeTab === "notice" ? 1 : 2;
        const apiSort = sort === "views" ? "view" : "latest";

        const response = await axiosApi.get(`/api/board/list/${typeCode}`, {
          params: { sort: apiSort },
        });

        setItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, sort]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    navigate(location.pathname, { replace: true, state: {} });
  };

  const handleFilterChange = (type, value) => {
    if (type === "category") setCategory(value);
    if (type === "sort") setSort(value);
    setCurrentPage(1);
  };

  const { paginatedItems, totalPages } = useMemo(() => {
    let result = [...items];

    if (category !== "all") {
      result = result.filter((it) => it.boardCategory === category);
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (it) =>
          it.boardTitle?.toLowerCase().includes(q) ||
          it.boardContent?.toLowerCase().includes(q)
      );
    }

    const total = Math.max(1, Math.ceil(result.length / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const sliced = result.slice(start, start + itemsPerPage);

    return { paginatedItems: sliced, totalPages: total };
  }, [items, category, searchQuery, currentPage]);

  const handleSearch = () => {
    setSearchQuery(keyword);
    setCurrentPage(1);
  };

  const formatDate = (iso) => (iso ? iso.split(" ")[0].replaceAll("-", ".") : "");
  const formatNumber = (n) => Number(n ?? 0).toLocaleString("ko-KR");

  const goDetail = (boardNo) => {
    navigate(`/proposals/detail/${boardNo}`, {
      state: { activeTab, currentPage },
    });
  };

  return (
    <main className="proposals-page">
      <div className="container board-container">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "notice" ? "is-active" : ""}`}
            onClick={() => handleTabChange("notice")}
          >
            공지사항
          </button>
          <button
            className={`tab-btn ${activeTab === "promotion" ? "is-active" : ""}`}
            onClick={() => handleTabChange("promotion")}
          >
            이벤트/홍보
          </button>
        </div>

        <section className="pp-filters">
          <div className="pp-filters__left">
            <select
              className="pp-select"
              value={category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="all">전체</option>
              {categoryOptions.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <select
              className="pp-select"
              value={sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="views">조회수순</option>
            </select>
          </div>

          <div className="pp-filters__right">
            <div className="pp-search-wrap">
              <input
                className="pp-search__input"
                type="text"
                placeholder="제목/내용 검색"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button className="pp-search__btn" onClick={handleSearch}>
                검색
              </button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <LoadingSpinner text="게시글을 불러오고 있습니다!" />
        ) : paginatedItems.length === 0 ? (
          <div className="empty-state">게시글이 없습니다.</div>
        ) : isPromotion ? (
          <div className="event-grid">
            {paginatedItems.map((item) => {
              const thumbSrc = getThumbSrc(item);

              return (
                <article
                  key={item.boardNo}
                  className="event-card"
                  onClick={() => goDetail(item.boardNo)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && goDetail(item.boardNo)}
                >
                  <div className="event-card__thumb">
                    <img
                      src={thumbSrc}
                      alt={item.boardTitle}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_THUMB;
                      }}
                    />
                  </div>

                  <div className="event-card__body">
                    <div className="event-card__title">
                      {item.boardCategory &&
                      categoryLabel[item.boardCategory] &&
                      !(activeTab === "promotion" && item.boardCategory === "opus")
                        ? `[${categoryLabel[item.boardCategory]}] `
                        : ""}
                      {item.boardTitle}
                    </div>

                    <div className="event-card__meta">
                      <span className="meta__company">{item.writerCompany}</span>
                      <span className="meta__date">{formatDate(item.boardWriteDate)}</span>
                      <span className="meta__views">
                        <i className="fa-regular fa-eye"></i> {formatNumber(item.boardViewCount)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="board-list">
            {paginatedItems.map((item) => (
              <div
                key={item.boardNo}
                className="board-item"
                onClick={() => goDetail(item.boardNo)}
              >
                <div className="item__left">
                  <div className="item__content">
                    <h3 className="item__title">
                      {item.boardCategory && categoryLabel[item.boardCategory]
                        ? `[${categoryLabel[item.boardCategory]}] `
                        : ""}
                      {item.boardTitle}
                    </h3>
                    <p className="item__excerpt">{item.boardContent}</p>
                  </div>
                </div>

                <div className="item__right">
                  <span>{item.writerCompany}</span>
                  <span>{formatDate(item.boardWriteDate)}</span>
                  <span>
                    <i className="fa-regular fa-eye"></i> {formatNumber(item.boardViewCount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {canWrite && (
          <div className="pp-actions">
            <button
              className="pp-write-btn"
              onClick={() =>
                navigate("/proposals/write", {
                  state: { activeTab, currentPage },
                })
              }
            >
              글쓰기
            </button>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </main>
  );
};

export default Proposals;