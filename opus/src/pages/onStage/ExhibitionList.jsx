import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getAllExhibitions } from "../../api/kcisaAPI";
import Loading from "../../components/common/Loading.jsx"
import { Link } from "react-router-dom";
import { useContentStore } from "../../store/useContentStore.js";
import axiosApi from '../../api/axiosAPI';
import { useAuthStore } from "../../components/auth/useAuthStore";

const SERVICE_KEY = "bcec5111-252e-47c3-9dca-4b943cf5a0ed";

// 날짜 파싱하기 (<PERIOD>2026-01-30~2026-05-03</PERIOD>)
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

// 상태(진행중, 진행예정, 진행완료) 가져오기
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

export default function ExhibitionList({ search, status }) {
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);
  const bottomRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [likedItems, setLikedItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
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

      if (!map.has(key)) {
        map.set(key, item);
      }
    })

    return Array.from(map.values());
  }, [data])

  // 챗봇에게 데이터 전달용 (박유진 추가)
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
  }, [allItems]);

  // -------------------------------------------

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchStatus = status === "all" || getStatus(item.period) === status;

      const keyword = search.trim().toLowerCase();
      const matchSearch = !keyword || item.title?.toLowerCase().includes(keyword) || item.place?.toLowerCase().includes(keyword);

      return matchStatus && matchSearch;
    });
  }, [allItems, status, search]);

  useEffect(() => {
    if (status !== "all" || !loginMemberNo || !allItems.length) return;

      const fetchPrefer = async () => {
        try {
          const savedResp = await axiosApi.get("/myPage/savedList", {
            params: { memberNo: loginMemberNo }
          });
        
          const likedResp = await axiosApi.get("/myPage/likeList", {
            params: { memberNo: loginMemberNo }
          });
        
          const savedIds = savedResp.data || [];
          const likedIds = likedResp.data || [];
        
          const savedIdStr = savedIds.map(String);
          const likedIdStr = likedIds.map(String);
        
          setSavedItems(
            allItems.filter(item => savedIdStr.includes(item.exhibitionId))
          );
        
          setLikedItems(
            allItems.filter(item => likedIdStr.includes(item.exhibitionId))
          );
        
        } catch (error) {
          console.error(error);
        }
      };
    
      fetchPrefer();
    }, [status, loginMemberNo, allItems]);
    
  if (isLoading) {
    return <div style={{ padding: 80 }}>전시 불러오는 중...</div>;
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
            <div style={{ position: "relative" }}>
              <button
                onClick={() => scrollLeft(likedScrollRef)}
                style={{ position: "absolute", left: 0, top: "40%", transform: "translateY(-50%)", zIndex: 10, border: "none", background: "#111", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}
              >
                ‹
              </button>

              <div ref={likedScrollRef} className="show-grid show-grid--row">
                {likedItems.map(item => (
                  <article key={item.exhibitionId} className="show-card">
                    <Link to={`/onStage/exhibition/${item.exhibitionId}`} state={{ item }}>
                      <div className="show-card__thumb">
                        {item.image ? (
                          <img src={item.image?.replace("http://", "https://")} alt={item.title} />
                        ) : (
                          <div style={{ height: 220 }} />
                        )}
                      </div>
                      <h3 className="show-card__title">{item.title}</h3>
                      <p className="show-card__meta">{item.period}</p>
                      <p className="show-card__meta">{item.place}</p>
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
          )}
        </section>
      )}

      {status === "all" && loginMemberNo && (
        <section className="show-row">
          <h2 className="exhibition-title">내가 저장한 전시</h2>

          {savedItems.length === 0 ? (
            <p className="empty-text">저장된 전시가 없습니다.</p>
          ) : (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => scrollLeft(savedScrollRef)}
                style={{ position: "absolute", left: 0, top: "40%", transform: "translateY(-50%)", zIndex: 10, border: "none", background: "#111", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}
              >
                ‹
              </button>

              <div ref={savedScrollRef} className="show-grid show-grid--row">
                {savedItems.map(item => (
                  <article key={item.exhibitionId} className="show-card">
                    <Link to={`/onStage/exhibition/${item.exhibitionId}`} state={{ item }}>
                      <div className="show-card__thumb">
                        {item.image ? (
                          <img src={item.image?.replace("http://", "https://")} alt={item.title} />
                        ) : (
                          <div style={{ height: 220 }} />
                        )}
                      </div>
                      <h3 className="show-card__title">{item.title}</h3>
                      <p className="show-card__meta">{item.period}</p>
                      <p className="show-card__meta">{item.place}</p>
                    </Link>
                  </article>
                ))}
              </div>

              <button
                onClick={() => scrollRight(savedScrollRef)}
                style={{ position: "absolute", right: 0, top: "40%", transform: "translateY(-50%)", zIndex: 10, border: "none", background: "#111", color: "#fff", width: 36, height: 36, borderRadius: "50%", cursor: "pointer" }}
              >
                ›
              </button>
            </div>
          )}
        </section>
      )}

      <section className="show-row">
        <h2>전체 전시</h2>
        <div className="show-grid">
          {filteredItems.map((item) => (
            <article key={item.exhibitionId} className="show-card">
              <Link to={`/onStage/exhibition/${item.exhibitionId}`} state={{ item }}>
                <div className="show-card__thumb">
                  {item.image ? (
                    <img src={item.image?.replace("http://", "https://")} alt={item.title} />
                  ) : (
                    <div style={{ height: 220 }} />
                  )}
                  <span className="show-badge show-badge--dark">
                    {getStatus(item.period) === "01"
                      ? "전시예정"
                      : getStatus(item.period) === "02"
                        ? "전시중"
                        : "전시완료"}
                  </span>
                </div>
                <h3 className="show-card__title">{item.title}</h3>
                <p className="show-card__meta">{item.period}</p>
                <p className="show-card__meta">{item.place}</p>
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