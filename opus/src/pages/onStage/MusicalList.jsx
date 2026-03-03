import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllMusicals, dateRange } from "../../api/kopisAPI";
import '../../css/pages/onStage/OnStage.css'
import Loading from "../../components/common/Loading.jsx";
import axiosApi from "../../api/axiosAPI";
import { useAuthStore } from "../../components/auth/useAuthStore";
import { useContentStore } from "../../store/useContentStore.js";

const SERVICE_KEY = "f8d2111671454d7bb5b0102d85c7cf1c";

export default function MusicalList({ status, search }) {
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  const bottomRef = useRef(null);
  const likedScrollRef = useRef(null);
  const savedScrollRef = useRef(null);

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);

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
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // 챗봇에게 데이터 전달용 (박유진 추가)
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
  }, [allItems]);

  // -------------------------------------------

  useEffect(() => {
    if (status !== "all" || !loginMemberNo || !allItems.length) return;

    const fetchPrefer = async () => {
      try {
        const savedResp = await axiosApi.get("/myPage/savedList", {
          params: { memberNo: loginMemberNo },
        });

        const likedResp = await axiosApi.get("/myPage/likeList", {
          params: { memberNo: loginMemberNo },
        });

        const savedIds = savedResp.data || [];
        const likedIds = likedResp.data || [];

        setSavedItems(allItems.filter((item) => savedIds.includes(item.mt20id)));
        setLikedItems(allItems.filter((item) => likedIds.includes(item.mt20id)));
      } catch (err) {
        console.error(err);
      }
    };

    fetchPrefer();
  }, [status, loginMemberNo, allItems]);

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

  if (isLoading) return <div style={{ padding: 80 }}>뮤지컬 불러오는 중...</div>;
  if (isError) return <div style={{ padding: 80 }}>오류: {String(error)}</div>;

  return (
    <>
      {status === "all" && loginMemberNo && (
        <section className="show-row">
          <h2>내가 좋아요 누른 공연</h2>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => scrollLeft(likedScrollRef)} style={{ position: "absolute", left: 0, top: "40%", transform: "translateY(-50%)", zIndex: 10, border: "none", background: "#111", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}
            >
              ‹
            </button>

            <div ref={likedScrollRef} className="show-grid show-grid--row">
              {likedItems.map((item) => (
                <article key={item.mt20id} className="show-card">
                  <Link to={`/onStage/musical/${item.mt20id}`}>
                    <div className="show-card__thumb">
                      <img src={item.poster?.replace("http://", "https://")} alt={item.prfnm} />
                      <span className="show-badge show-badge--dark">
                        {item.prfstate || "상태없음"}
                      </span>
                    </div>
                    <h3 className="show-card__title">{item.prfnm}</h3>
                    <p className="show-card__meta">
                      {item.prfpdfrom} ~ {item.prfpdto}
                    </p>
                    <p className="show-card__meta">{item.fcltynm}</p>
                  </Link>
                </article>
              ))}
            </div>

              <button
                onClick={() => scrollRight(likedScrollRef)}
                style={{ position: "absolute", right: 0, top: "40%", transform: "translateY(-50%)", zIndex: 10, border: "none", background: "#111", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}
              >
                ›
              </button>
            </div >
        </section >
      )
}

      {status === "all" && loginMemberNo && (
        <section className="show-row">
          <h2>내가 저장한 공연</h2>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => scrollLeft(likedScrollRef)} style={{ position: "absolute", left: 0, top: "40%", transform: "translateY(-50%)", zIndex: 10, border: "none", background: "#111", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}
            >
              ‹
            </button>

            <div ref={savedScrollRef} className="show-grid show-grid--row">
              {savedItems.map((item) => (
                <article key={item.mt20id} className="show-card">
                  <Link to={`/onStage/musical/${item.mt20id}`}>
                    <div className="show-card__thumb">
                      <img src={item.poster?.replace("http://", "https://")} alt={item.prfnm} />
                      <span className="show-badge show-badge--dark">
                        {item.prfstate || "상태없음"}
                      </span>
                    </div>
                    <h3 className="show-card__title">{item.prfnm}</h3>
                    <p className="show-card__meta">
                      {item.prfpdfrom} ~ {item.prfpdto}
                    </p>
                    <p className="show-card__meta">{item.fcltynm}</p>
                  </Link>
                </article>
              ))}
            </div>

            <button
                onClick={() => scrollRight(likedScrollRef)}
                style={{ position: "absolute", right: 0, top: "40%", transform: "translateY(-50%)", zIndex: 10, border: "none", background: "#111", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}
              >
                ›
            </button>
          </div>
        </section>
      )}

      <section className="show-row">
        <h2>전체 공연</h2>
        <div className="show-grid">
          {filteredItems.map((item) => (
            <article key={item.mt20id} className="show-card">
              <Link to={`/onStage/musical/${item.mt20id}`}>
                <div className="show-card__thumb">
                  <img src={item.poster?.replace("http://", "https://")} alt={item.prfnm} />
                  <span className="show-badge show-badge--dark">
                    {item.prfstate || "상태없음"}
                  </span>
                </div>
                <h3 className="show-card__title">{item.prfnm}</h3>
                <p className="show-card__meta">
                  {item.prfpdfrom} ~ {item.prfpdto}
                </p>
                <p className="show-card__meta">{item.fcltynm}</p>
              </Link>
            </article>
          ))}
        </div>

        <div ref={bottomRef} style={{ height: 1 }} />

        {isFetchingNextPage && (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <Loading />
          </div>
        )}
      </section>
    </>
  );
}