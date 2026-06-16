import { useEffect, useState } from "react";
import { useSearchParams, NavLink } from "react-router-dom";
import axiosApi from "../api/axiosAPI";
import Loading from "../components/common/Loading";
import "../css/Search.css";
import { resolveImage } from "../utils/unveilingImage";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      return (
        <main className="search-page">
          <div className="search-page__header">
            <p className="search-page__title">검색</p>
            <h1 className="search-page__keyword">검색어를 입력해주세요.</h1>
          </div>
        </main>
      );
    }

    setIsLoading(true);

    axiosApi
      .get(`/search?q=${encodeURIComponent(query)}`)
      .then((res) => setResults(res.data))
      .finally(() => setIsLoading(false));
  }, [query]);

  return (
    <main className="search-page">
      <div className="search-page__header">
        <p className="search-page__title">검색 결과</p>
        <h1 className="search-page__keyword">"{query}"</h1>
      </div>

      {isLoading && <Loading />}

      {results && (
        <>
          {/* 굿즈 */}
          {results.goods?.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">Selections</h2>

              <div className="search-goods-grid">
                {results.goods.map((g) => (
                  <NavLink
                    key={g.goodsNo}
                    to={`/selections/${g.goodsNo}`}
                    className="search-goods-card"
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL}${g.goodsThumbnail}`}
                      alt={g.goodsName}
                      className="search-goods-card__image"
                    />

                    <p className="search-goods-card__name">
                      {g.goodsName}
                    </p>

                    <p className="search-goods-card__price">
                      {Number(g.goodsPrice).toLocaleString()}원
                    </p>
                  </NavLink>
                ))}
              </div>
            </section>
          )}

          {/* 경매 */}
          {results.auctions?.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">Unveiling</h2>

              {results.auctions.map((u) => (
                <NavLink
                  key={u.unveilingNo}
                  to={`/unveiling/${u.unveilingNo}`}
                  className="search-list-item"
                >

                  <img
                    src={resolveImage(u.thumbUrl)}
                    alt={u.unveilingTitle}
                    className="search-list-item__thumb"
                    onError={(e) => {
                      e.currentTarget.src = "/no-thumbnail.png";
                      e.currentTarget.onerror = null;
                    }}
                  />

                  <div>
                    <p className="search-list-item__title">
                      {u.unveilingTitle}
                    </p>

                    <p className="search-list-item__sub">
                      {u.productionArtist}
                    </p>
                  </div>
                </NavLink>
              ))}
            </section>
          )}

          {results.exhibitions?.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">On-Stage (전시)</h2>
              {results.exhibitions.map((e) => (
                <NavLink
                  key={e.stageNo}
                  to={`/onStage/exhibition/${e.stageNo}`}
                  className="search-list-item"
                >
                  <img
                    src={e.stageThumbnail?.replace("http://", "https://")}
                    alt={e.stageTitle}
                    className="search-list-item__thumb"
                    onError={(el) => {
                      el.currentTarget.src = "/no-thumbnail.png";
                      el.currentTarget.onerror = null;
                    }}
                  />
                  <div>
                    <p className="search-list-item__title">{e.stageTitle}</p>
                    <p className="search-list-item__sub">{e.stagePlace} · {e.stagePeriod}</p>
                  </div>
                </NavLink>
              ))}
            </section>
          )}

          {results.musicals?.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">On-Stage (뮤지컬)</h2>
              {results.musicals.map((m) => (
                <NavLink
                  key={m.stageNo}
                  to={`/onStage/musical/${m.stageNo}`}
                  className="search-list-item"
                >
                  <img
                    src={m.stageThumbnail?.replace("http://", "https://")}
                    alt={m.stageTitle}
                    className="search-list-item__thumb"
                    onError={(el) => {
                      el.currentTarget.src = "/no-thumbnail.png";
                      el.currentTarget.onerror = null;
                    }}
                  />
                  <div>
                    <p className="search-list-item__title">{m.stageTitle}</p>
                    <p className="search-list-item__sub">{m.stagePlace} · {m.stagePeriod}</p>
                  </div>
                </NavLink>
              ))}
            </section>
          )}

          {/* 게시글 */}
          {results.boards?.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">Proposals</h2>

              {results.boards.map((b) => (
                <NavLink
                  key={b.boardNo}
                  to={`/proposals/detail/${b.boardNo}`}
                  className="search-board-item"
                >
                  <p className="search-board-item__title">
                    {b.boardTitle}
                  </p>

                  <p className="search-board-item__date">
                    {b.boardWriteDate?.substring(0, 10)}
                  </p>
                </NavLink>
              ))}
            </section>
          )}

          {!results.goods?.length &&
            !results.auctions?.length &&
            !results.boards?.length &&
            !results.exhibitions?.length &&
            !results.musicals?.length && (
              <p className="search-empty">검색 결과가 없습니다.</p>
            )}
        </>
      )}
    </main>
  );
}