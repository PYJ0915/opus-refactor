import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getAllExhibitions } from "../../api/kcisaAPI";
import Loading from "../../components/common/Loading.jsx"
import { Link } from "react-router-dom";
import { useContentStore } from "../../store/useContentStore.js";
import axiosApi from '../../api/axiosAPI';
import { useAuthStore } from "../../components/auth/useAuthStore";
import ShowCardSkeleton from "../../components/common/ShowCardSkeleton";
import StarRating from "../../components/reviews/StarRating.jsx";

const SERVICE_KEY = import.meta.env.VITE_KCISA_KEY;
const INVALID_THUMB_PATTERNS = ["noimage", "no_image", "default", "null"];

function parsePeriod(period) {
  if (!period || !period.includes("~")) return null;

  const [start, end] = period.split('~').map(date => date.trim());

  const toDate = (str) => {
    const y = Number(str.slice(0, 4));
    const m = Number(str.slice(5, 7));
    const d = Number(str.slice(8, 10));
    return new Date(y, m - 1, d);
  }

  return {
    startDate: toDate(start),
    endDate: toDate(end)
  }
}

function getStatus(period) {
  const parsedPeriod = parsePeriod(period);
  if (!parsedPeriod) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { startDate, endDate } = parsedPeriod;

  if (today < startDate) return "01";
  if (today > endDate) return "03";
  return "02";
}

// 공통 카드 이미지 렌더러 — 로드 실패 시 플레이스홀더로 대체
function ThumbImg({ src, alt }) {
  return (
    <img
      src={src?.replace("http://", "https://")}
      alt={alt}
      onError={(e) => {
        e.currentTarget.src = "/no-thumbnail.png";
        e.currentTarget.onerror = null;
      }}
    />
  );
}

export default function ExhibitionList({ search, status }) {
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);
  const bottomRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [likedOverflow, setLikedOverflow] = useState(false);
  const [savedOverflow, setSavedOverflow] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortType, setSortType] = useState("default");
  const likedScrollRef = useRef(null);
  const savedScrollRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = useInfiniteQuery({
    queryKey: ["exhibitions", status, search],
    queryFn: ({ pageParam }) => getAllExhibitions({ serviceKey: SERVICE_KEY, pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    }
  })

  useEffect(() => {
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { threshold: 0 })
    observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 400);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const allItems = useMemo(() => {
    if (!data) return [];

    const flatItems = data.pages.flat();
    const map = new Map();

    flatItems.forEach(item => {
      const key = item.exhibitionId;
      if (!key) return;

      const thumb = item.image;
      if (!thumb || thumb.trim() === "") return;
      if (INVALID_THUMB_PATTERNS.some(p => thumb.toLowerCase().includes(p))) return;

      if (!map.has(key)) {
        map.set(key, item);
      }
    })

    return Array.from(map.values());
  }, [data])

  const setExhibitions = useContentStore((s) => s.setExhibitions);

  useEffect(() => {
    if (allItems.length > 0) {
      setExhibitions(allItems.slice(0, 20).map(e => ({
        title: e.title,
        period: e.period,
        place: e.place,
        status: getStatus(e.period) === "01" ? "전시예정"
          : getStatus(e.period) === "02" ? "전시중" : "전시완료"
      })));


    }
  }, [allItems, setExhibitions]);

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0);

    const cleaned = dateStr.trim().replaceAll(".", "-");

    return new Date(cleaned);
  };

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchStatus = status === "all" || getStatus(item.period) === status;

      const keyword = search.trim().toLowerCase();
      const matchSearch = !keyword || item.title?.toLowerCase().includes(keyword) || item.place?.toLowerCase().includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [allItems, status, search]);

  const sortedItems = useMemo(() => {
    const arr = [...filteredItems];
    switch (sortType) {
      case "name":
        return arr.sort((a, b) => a.title.localeCompare(b.title, "ko"));
      case "deadline": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeItems = arr.filter(item => {
          const endDate = parseDate(item.period.split("~")[1]);
          endDate.setHours(0, 0, 0, 0);

          return endDate >= today;
        });

        const endedItems = arr.filter(item => {
          const endDate = parseDate(item.period.split("~")[1]);
          endDate.setHours(0, 0, 0, 0);

          return endDate < today;
        });

        return [
          ...activeItems.sort(
            (a, b) =>
              parseDate(a.period.split("~")[1]) -
              parseDate(b.period.split("~")[1])
          ),
          ...endedItems.sort(
            (a, b) =>
              parseDate(b.period.split("~")[1]) -
              parseDate(a.period.split("~")[1])
          ),
        ];
      }
      case "newest":
        // 시작일이 최신인 순
        return arr.sort((a, b) => {
          const pa = parsePeriod(a.period);
          const pb = parsePeriod(b.period);
          if (!pa || !pb) return 0;
          return pb.startDate.getTime() - pa.startDate.getTime();
        });
      default:
        return arr;
    }
  }, [filteredItems, sortType]);

  const stageNos = useMemo(
    () => sortedItems.map(item => String(item.exhibitionId)),
    [sortedItems]
  );

  const { data: avgRatings } = useQuery({
    queryKey: ["avgRatings", "exhibition", stageNos.slice(0, 20).join(",")],
    queryFn: async () => {
      if (!stageNos.length) return {};
      const res = await axiosApi.get("/reviews/averageRatings", {
        params: { stageNos: stageNos.slice(0, 20) }  // 현재 보이는 것만
      });
      return res.data; // { stageNo: avgScore, ... }
    },
    enabled: stageNos.length > 0,
  });

  useEffect(() => {
    if (status !== "all" || !allItems.length || !loginMemberNo) return;

    const fetchPrefer = async () => {
      try {
        const savedResp = await axiosApi.get("/myPage/savedList");
        const likedResp = await axiosApi.get("/myPage/likeList");

        const savedIds = savedResp.data || [];
        const likedIds = likedResp.data || [];

        const savedIdStr = savedIds.map(String);
        const likedIdStr = likedIds.map(String);

        setSavedItems(allItems.filter(item => savedIdStr.includes(item.exhibitionId)));
        setLikedItems(allItems.filter(item => likedIdStr.includes(item.exhibitionId)));
      } catch (error) {
        console.error(error);
      }
    };

    fetchPrefer();
  }, [status, allItems, loginMemberNo]); //

  useEffect(() => {
    const checkOverflow = () => {
      if (likedScrollRef.current) {
        setLikedOverflow(
          likedScrollRef.current.scrollWidth > likedScrollRef.current.clientWidth
        );
      }
      if (savedScrollRef.current) {
        setSavedOverflow(
          savedScrollRef.current.scrollWidth > savedScrollRef.current.clientWidth
        );
      }
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [likedItems, savedItems]);

  if (isLoading) {
    return (
      <section className="show-row">
        <div className="show-grid">
          {Array.from({ length: 10 }).map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return <div style={{ padding: 80 }}>오류: {String(error)}</div>;
  }

  if (!allItems.length) {
    return <div style={{ padding: 80 }}>표시할 전시 정보가 없습니다.</div>;
  }

  return (
    <>
      {status === "all" && loginMemberNo && (
        <section className="show-row">
          <h2 className="exhibition-title">내가 좋아요 누른 전시</h2>

          {likedItems.length === 0 ? (
            <p className="empty-text">좋아요를 누른 전시가 없습니다.</p>
          ) : (
            <div className="scroll-rail">
              {likedOverflow && (
                <button className="scroll-arrow scroll-arrow--left" onClick={() => scrollLeft(likedScrollRef)}>‹</button>
              )}
              <div ref={likedScrollRef} className="show-grid show-grid--row">
                {likedItems.map(item => (
                  <article key={item.exhibitionId} className="show-card">
                    <Link to={`/onStage/exhibition/${item.exhibitionId}`} state={{ item }}>
                      <div className="show-card__thumb">
                        <ThumbImg src={item.image} alt={item.title} />
                      </div>
                      <h3 className="show-card__title">{item.title}</h3>
                      <p className="show-card__meta">{item.period}</p>
                      <p className="show-card__meta">{item.place}</p>
                    </Link>
                  </article>
                ))}
              </div>
              {likedOverflow && (
                <button className="scroll-arrow scroll-arrow--right" onClick={() => scrollRight(likedScrollRef)}>›</button>
              )}
            </div>
          )}
        </section>
      )}

      {status === "all" && loginMemberNo && (
        <section className="show-row">
          <h2 className="exhibition-title">내가 저장한 전시</h2>

          {savedItems.length === 0 ? (
            <p className="empty-text">저장된 전시가 없습니다.</p>
          ) : (
            <div className="scroll-rail">
              {savedOverflow && (
                <button className="scroll-arrow scroll-arrow--left" onClick={() => scrollLeft(savedScrollRef)}>‹</button>
              )}
              <div ref={savedScrollRef} className="show-grid show-grid--row">
                {savedItems.map(item => (
                  <article key={item.exhibitionId} className="show-card">
                    <Link to={`/onStage/exhibition/${item.exhibitionId}`} state={{ item }}>
                      <div className="show-card__thumb">
                        <ThumbImg src={item.image} alt={item.title} />
                      </div>
                      <h3 className="show-card__title">{item.title}</h3>
                      <p className="show-card__meta">{item.period}</p>
                      <p className="show-card__meta">{item.place}</p>
                    </Link>
                  </article>
                ))}
              </div>
              {savedOverflow && (
                <button className="scroll-arrow scroll-arrow--right" onClick={() => scrollRight(savedScrollRef)}>›</button>
              )}
            </div>
          )}
        </section>
      )}

      <section className="show-row">

        <div className="onstage-section-head">

          <h2>전체 전시</h2>

          <div className="onstage-controls">


            <div className="view-toggle">
              <button
                className={`view-toggle__btn ${viewMode === "grid" ? "is-active" : ""
                  }`}
                onClick={() => setViewMode("grid")}
                title="그리드 뷰"
              >
                <i className="fa-solid fa-grip" />
              </button>

              <button
                className={`view-toggle__btn ${viewMode === "list" ? "is-active" : ""
                  }`}
                onClick={() => setViewMode("list")}
                title="리스트 뷰"
              >
                <i className="fa-solid fa-list" />
              </button>
            </div>

            <div className="onstage-sort-bar">
              {[
                { value: "default", label: "기본순" },
                { value: "name", label: "가나다순" },
                { value: "deadline", label: "종료 예정순" },
                { value: "newest", label: "최신 등록순" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  className={`sort-btn ${sortType === opt.value ? "is-active" : ""
                    }`}
                  onClick={() => setSortType(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className={viewMode === "grid" ? "show-grid" : "show-list"}>

          {sortedItems.map((item) =>
            viewMode === "grid" ? (

              <article
                key={item.exhibitionId}
                className="show-card"
              >
                <Link
                  to={`/onStage/exhibition/${item.exhibitionId}`}
                  state={{ item }}
                >
                  <div className="show-card__thumb">
                    <ThumbImg
                      src={item.image}
                      alt={item.title}
                    />

                    <span className="show-badge show-badge--dark">
                      {getStatus(item.period) === "01"
                        ? "전시예정"
                        : getStatus(item.period) === "02"
                          ? "전시중"
                          : "전시완료"}
                    </span>

                    <div className="show-card__overlay">
                      <p className="show-card__overlay-title">
                        {item.title}
                      </p>

                      <p className="show-card__overlay-meta">
                        {item.period}
                      </p>

                      <p className="show-card__overlay-meta">
                        {item.place}
                      </p>

                      <span className="show-card__overlay-btn">
                        자세히 보기 →
                      </span>
                    </div>
                  </div>

                  <h3 className="show-card__title">
                    {item.title}
                  </h3>

                  {/* 별점 표시 — 0점이면 숨김 */}
                  {avgRatings?.[String(item.exhibitionId)] > 0 && (
                    <div className="show-card__rating">
                      <StarRating
                        rating={avgRatings[String(item.exhibitionId)]}
                        readonly
                        size={12}
                      />
                    </div>
                  )}

                  <p className="show-card__meta">
                    {item.period}
                  </p>

                  <p className="show-card__meta">
                    {item.place}
                  </p>

                </Link>
              </article>

            ) : (

              <article
                key={item.exhibitionId}
                className="show-list-item"
              >
                <Link
                  to={`/onStage/exhibition/${item.exhibitionId}`}
                  state={{ item }}
                >
                  <div className="show-list-item__thumb">
                    <ThumbImg
                      src={item.image}
                      alt={item.title}
                    />
                  </div>

                  <div className="show-list-item__info">

                    <h3 className="show-list-item__title">
                      {item.title}
                    </h3>

                    {avgRatings?.[String(item.exhibitionId)] > 0 && (
                      <div className="show-card__rating">
                        <StarRating
                          rating={(avgRatings[String(item.exhibitionId)])}
                          readonly
                          size={12}
                        />
                      </div>
                    )}

                    <p className="show-list-item__meta">
                      {item.period}
                    </p>

                    <p className="show-list-item__meta">
                      {item.place}
                    </p>

                  </div>

                  <span className="show-badge show-badge--dark">
                    {getStatus(item.period) === "01"
                      ? "전시예정"
                      : getStatus(item.period) === "02"
                        ? "전시중"
                        : "전시완료"}
                  </span>

                </Link>
              </article>

            )
          )}

        </div>

        <div ref={bottomRef} style={{ height: 1 }} />

        {isFetchingNextPage && (
          <div className="show-grid" style={{ marginTop: 20 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <ShowCardSkeleton key={`next-${i}`} />
            ))}
          </div>
        )}

      </section>
    </>
  );
}
