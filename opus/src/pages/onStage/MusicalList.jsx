import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllMusicals, dateRange } from "../../api/kopisAPI";
import '../../css/pages/onStage/OnStage.css'
import Loading from "../../components/common/Loading.jsx";
import axiosApi from "../../api/axiosAPI";
import { useAuthStore } from "../../components/auth/useAuthStore";
import { useContentStore } from "../../store/useContentStore.js";
import ShowCardSkeleton from "../../components/common/ShowCardSkeleton.jsx";

export default function MusicalList({ status, search }) {
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  const SERVICE_KEY = import.meta.env.VITE_KOPIS_KEY;
  const INVALID_POSTER_PATTERNS = ["noimage", "no_image", "default", "null"];

  const bottomRef = useRef(null);
  const likedScrollRef = useRef(null);
  const savedScrollRef = useRef(null);

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [likedOverflow, setLikedOverflow] = useState(false);
  const [savedOverflow, setSavedOverflow] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortType, setSortType] = useState("default");

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ["kopis", status, search],
    enabled: Boolean(SERVICE_KEY),
    queryFn: ({ pageParam }) => {
      const range = dateRange[pageParam - 1];
      if (!range) return { items: [], hasNext: false };

      return getAllMusicals({
        serviceKey: SERVICE_KEY,
        startDate: range.start,
        endDate: range.end,
        pageParam: 1,
        search,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasNext ? allPages.length + 1 : undefined,
  });

  useEffect(() => {
    if (!bottomRef.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollLeft = (ref) => {
    ref.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = (ref) => {
    ref.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  const allItems = useMemo(() => {
    if (!data) return [];
    return data.pages
      .flatMap((page) => page.items)
      .filter(item => {
        const poster = item.poster;
        if (!poster || poster.trim() === "") return false;
        return !INVALID_POSTER_PATTERNS.some(p => poster.toLowerCase().includes(p));
      });
  }, [data]);

  const setMusicals = useContentStore((s) => s.setMusicals);

  useEffect(() => {
    if (allItems.length > 0) {
      setMusicals(allItems.slice(0, 20).map(m => ({
        title: m.prfnm,
        period: `${m.prfpdfrom} ~ ${m.prfpdto}`,
        place: m.fcltynm,
        status: m.prfstate
      })));
    }
  }, [allItems, setMusicals]);

  useEffect(() => {
    if (status !== "all" || !allItems.length || !loginMemberNo) return; // ← !loginMemberNo 추가

    const fetchPrefer = async () => {
      try {
        const savedResp = await axiosApi.get("/myPage/savedList");
        const likedResp = await axiosApi.get("/myPage/likeList");

        const savedIds = savedResp.data || [];
        const likedIds = likedResp.data || [];

        setSavedItems(allItems.filter((item) => savedIds.includes(item.mt20id)));
        setLikedItems(allItems.filter((item) => likedIds.includes(item.mt20id)));
      } catch (err) {
        console.error(err);
      }
    };

    fetchPrefer();
  }, [status, allItems, loginMemberNo]);

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

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchStatus =
        status === "all" ||
        (status === "02" && item.prfstate === "공연중") ||
        (status === "01" && item.prfstate === "공연예정") ||
        (status === "03" && item.prfstate === "공연완료");

      const matchSearch =
        !search.trim() || item.prfnm?.includes(search.trim());

      return matchStatus && matchSearch;
    });
  }, [allItems, status, search]);

  const sortedItems = useMemo(() => {
    const arr = [...filteredItems];

    switch (sortType) {

      case "name":
        return arr.sort((a, b) =>
          a.prfnm.localeCompare(b.prfnm, "ko")
        );

      case "deadline": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeItems = arr.filter(item => {
          const endDate = new Date(item.prfpdto);
          endDate.setHours(0, 0, 0, 0);
          return endDate >= today;
        });

        const endedItems = arr.filter(item => {
          const endDate = new Date(item.prfpdto);
          endDate.setHours(0, 0, 0, 0);
          return endDate < today;
        });

        return [
          ...activeItems.sort(
            (a, b) => new Date(a.prfpdto) - new Date(b.prfpdto)
          ),
          ...endedItems.sort(
            (a, b) => new Date(b.prfpdto) - new Date(a.prfpdto)
          ),
        ];
      }

      case "newest":
        return arr.sort((a, b) =>
          new Date(b.prfpdfrom) - new Date(a.prfpdfrom)
        );

      default:
        return arr;
    }
  }, [filteredItems, sortType]);

  // 공통 카드 이미지 렌더러 — 로드 실패 시 플레이스홀더로 대체
  const PosterImg = ({ src, alt }) => (
    <img
      src={src?.replace("http://", "https://")}
      alt={alt}
      onError={(e) => {
        e.currentTarget.src = "/no-thumbnail.png";
        e.currentTarget.onerror = null;
      }}
    />
  );

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
  if (isError) return <div style={{ padding: 80 }}>오류: {String(error)}</div>;

  return (
    <>
      {status === "all" && loginMemberNo && (
        <section className="show-row">
          <h2 className="exhibition-title">내가 좋아요 누른 공연</h2>
          {likedItems.length === 0 ? (
            <p className="empty-text">좋아요를 누른 공연이 없습니다.</p>
          ) : (
            <div className="scroll-rail">
              {likedOverflow && (
                <button className="scroll-arrow scroll-arrow--left" onClick={() => scrollLeft(likedScrollRef)}>‹</button>
              )}
              <div ref={likedScrollRef} className="show-grid show-grid--row">
                {likedItems.map((item) => (
                  <article key={item.mt20id} className="show-card">
                    <Link to={`/onStage/musical/${item.mt20id}`}>
                      <div className="show-card__thumb">
                        <PosterImg src={item.poster} alt={item.prfnm} />
                        <span className="show-badge show-badge--dark">{item.prfstate || "상태없음"}</span>
                      </div>
                      <h3 className="show-card__title">{item.prfnm}</h3>
                      <p className="show-card__meta">{item.prfpdfrom} ~ {item.prfpdto}</p>
                      <p className="show-card__meta">{item.fcltynm}</p>
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
          <h2 className="exhibition-title">내가 저장한 공연</h2>
          {savedItems.length === 0 ? (
            <p className="empty-text">저장한 공연이 없습니다.</p>
          ) : (
            <div className="scroll-rail">
              {savedOverflow && (
                <button className="scroll-arrow scroll-arrow--left" onClick={() => scrollLeft(savedScrollRef)}>‹</button>
              )}
              <div ref={savedScrollRef} className="show-grid show-grid--row">
                {savedItems.map((item) => (
                  <article key={item.mt20id} className="show-card">
                    <Link to={`/onStage/musical/${item.mt20id}`}>
                      <div className="show-card__thumb">
                        <PosterImg src={item.poster} alt={item.prfnm} />
                        <span className="show-badge show-badge--dark">{item.prfstate || "상태없음"}</span>
                      </div>
                      <h3 className="show-card__title">{item.prfnm}</h3>
                      <p className="show-card__meta">{item.prfpdfrom} ~ {item.prfpdto}</p>
                      <p className="show-card__meta">{item.fcltynm}</p>
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

          <h2>전체 공연</h2>

          <div className="onstage-controls">

            <div className="view-toggle">

              <button
                className={`view-toggle__btn ${viewMode === "grid" ? "is-active" : ""
                  }`}
                onClick={() => setViewMode("grid")}
              >
                <i className="fa-solid fa-grip" />
              </button>

              <button
                className={`view-toggle__btn ${viewMode === "list" ? "is-active" : ""
                  }`}
                onClick={() => setViewMode("list")}
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
                key={item.mt20id}
                className="show-card"
              >
                <Link to={`/onStage/musical/${item.mt20id}`}>

                  <div className="show-card__thumb">

                    <PosterImg
                      src={item.poster}
                      alt={item.prfnm}
                    />

                    <span className="show-badge show-badge--dark">
                      {item.prfstate || "상태없음"}
                    </span>

                    <div className="show-card__overlay">

                      <p className="show-card__overlay-title">
                        {item.prfnm}
                      </p>

                      <p className="show-card__overlay-meta">
                        {item.prfpdfrom} ~ {item.prfpdto}
                      </p>

                      <p className="show-card__overlay-meta">
                        {item.fcltynm}
                      </p>

                      <span className="show-card__overlay-btn">
                        자세히 보기 →
                      </span>

                    </div>

                  </div>

                  <h3 className="show-card__title">
                    {item.prfnm}
                  </h3>

                  <p className="show-card__meta">
                    {item.prfpdfrom} ~ {item.prfpdto}
                  </p>

                  <p className="show-card__meta">
                    {item.fcltynm}
                  </p>

                </Link>
              </article>

            ) : (

              <article
                key={item.mt20id}
                className="show-list-item"
              >
                <Link to={`/onStage/musical/${item.mt20id}`}>

                  <div className="show-list-item__thumb">
                    <PosterImg
                      src={item.poster}
                      alt={item.prfnm}
                    />
                  </div>

                  <div className="show-list-item__info">

                    <h3 className="show-list-item__title">
                      {item.prfnm}
                    </h3>

                    <p className="show-list-item__meta">
                      {item.prfpdfrom} ~ {item.prfpdto}
                    </p>

                    <p className="show-list-item__meta">
                      {item.fcltynm}
                    </p>

                  </div>

                  <span className="show-badge show-badge--dark">
                    {item.prfstate || "상태없음"}
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
