import { useEffect, useMemo, useRef, useState } from "react";
import AuctionGrid from "../components/Unveiling/AuctionGrid";
import AuctionInfo from "../components/Unveiling/AuctionInfo";
import "../css/Unveiling.css";
import axiosApi from "../api/axiosAPI";

const TABS = [
  { key: "ALL", label: "전체" },
  { key: "LIVE", label: "진행중" },
  { key: "UPCOMING", label: "예정" },
  { key: "ENDED", label: "종료" },
];

const PAGE_SIZE = 9;

const toISODateTime = (v) => {
  if (!v) return null;
  const s = String(v).trim();
  // "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) return s.replace(" ", "T");
  // "YYYY-MM-DD" -> "YYYY-MM-DDT00:00:00"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${s}T00:00:00`;
  return s;
};

const formatKRW = (n) => `₩${Number(n || 0).toLocaleString("ko-KR")}`;

function normalizeListItem(u) {
  const id = u?.unveilingNo ?? u?.UNVEILING_NO ?? u?.id;
  const status = u?.unveilingStatus ?? u?.UNVEILING_STATUS ?? "LIVE";

  const startPrice = u?.startPrice ?? u?.START_PRICE ?? 0;
  const currentPriceRaw = u?.currentPrice ?? u?.CURRENT_PRICE ?? 0;
  const currentPrice = currentPriceRaw > 0 ? currentPriceRaw : startPrice;

  const finishISO = toISODateTime(u?.finishDate ?? u?.FINISH_DATE);

  const thumbUrl = typeof u?.thumbUrl === "string" ? u.thumbUrl.trim() : "";

  return {
    id,
    status,
    title: u?.unveilingTitle ?? u?.UNVEILING_TITLE ?? "",
    artist: u?.productionArtist ?? u?.PRODUCTION_ARTIST ?? "",
    image: thumbUrl || "", // AuctionCard에서 onError 처리(아래 참고)
    pricing: { display: formatKRW(currentPrice) },
    stats: { count: u?.biddingCount ?? u?.BIDDING_COUNT ?? 0 },
    endAt: finishISO,
    // AuctionCard가 endAtLabel을 쓰고 있다면 여기도 생성 가능(없어도 괜찮게 구성 권장)
    endAtLabel: finishISO ? `${finishISO.replace("T", " ")} 마감` : "",
  };
}

export default function Unveiling() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axiosApi.get("/api/unveilings");
        if (!alive) return;

        const list = Array.isArray(data) ? data.map(normalizeListItem) : [];
        setItems(list);
      } catch (e) {
        // 실패 시에도 화면이 "아예 깨져 보이지 않게" 빈 상태 유지
        setItems([]);
        setError("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        if (alive) setLoaded(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesTab = activeTab === "ALL" ? true : item.status === activeTab;
      const matchesQuery = q
        ? `${item.title} ${item.artist}`.toLowerCase().includes(q)
        : true;
      return matchesTab && matchesQuery;
    });
  }, [activeTab, query, items]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, query]);

  const visibleItems = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
        }
      },
      { root: null, rootMargin: "300px", threshold: 0 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, filtered.length]);

  return (
    <div className="page">
      <main className="main">
        <section id="auction-filters" className="filters">
          <div className="filters__row">
            <div className="filters__left">
              <div className="filters__tabs" role="tablist" aria-label="경매 상태 필터">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    className={`tab ${activeTab === t.key ? "is-active" : ""}`}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="filters__meta">
                <span className="count">
                  총 <strong>{filtered.length}</strong>점
                </span>
              </div>
            </div>

            <div className="filters__right">
              <div className="searchbox">
                <input
                  className="searchbox__input"
                  type="text"
                  placeholder="작품명, 작가명 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="searchbox__btn" type="button" aria-label="검색">
                  <i className="fa-solid fa-search" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="auction-grid" className="grid-wrap">
          <div className="grid">
            {/* AuctionCard 내부 img onError 처리가 없다면, 아래 1줄을 반드시 적용해야 합니다.
               - (필요 시) AuctionCard.jsx에서 <img ... onError={...} /> 추가 권장 */}
            {!loaded && <div className="empty"><p className="empty__title">불러오는 중...</p></div>}
            {error && <div className="empty"><p className="empty__title">{error}</p></div>}
            <AuctionGrid items={visibleItems} />
          </div>

          {loaded && filtered.length === 0 && (
            <div className="empty">
              <p className="empty__title">검색 결과가 없습니다.</p>
              <p className="empty__desc">다른 키워드로 다시 입력해주세요.</p>
            </div>
          )}

          <div ref={sentinelRef} className="infinite-sentinel" />

          {loaded && filtered.length > 0 && (
            <div className="infinite-meta">
              {hasMore ? "불러오는 중..." : "모든 경매를 확인하셨습니다."}
            </div>
          )}
        </section>

        <AuctionInfo />
      </main>
    </div>
  );
}