import { useSearchParams } from 'react-router-dom';
import '../../css/pages/onStage/OnStage.css'
import ExhibitionList from './ExhibitionList';
import MusicalList from './MusicalList';
import { useState } from 'react';

export default function OnStage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const genre = searchParams.get("genre") ?? "exhibition";
  const status = searchParams.get("status") ?? "all";
  const [search, setSearch] = useState("");
  const [isCacheMode, setIsCacheMode] = useState(false);

  const setGenre = (value) => {
    setIsCacheMode(false); // 장르 바꾸면 캐시 모드 초기화
    setSearchParams(prev => {
      prev.set("genre", value);
      prev.set("status", "all");
      return prev;
    });
  };

  const setStatus = (value) => {
    setSearchParams(prev => {
      prev.set("status", value);
      return prev;
    });
  };

  return (
    <main id="main-content" className="main">
      <div className="wrap">
        {/* 검색 */}
        <section id="search-section" className="search-sec">
          <div className="search-row">
            <div className="search-box">
              <input className="search-input" type="text" placeholder="공연명, 전시명 검색"
                value={search} onChange={(e) => setSearch(e.target.value)} />
              <i className="fa-solid fa-search search-icon" aria-hidden="true"></i>
            </div>
            <button className="search-btn search-btn--dark" type="button">검색</button>
          </div>

          {/* 필터 */}
          <div id="filter-section" className="filter-row">
            <div className="filter-group">
              <span className="filter-label">장르</span>
              <button type="button"
                className={`chip genre-btn ${genre === "exhibition" ? "is-active" : ""}`}
                onClick={() => setGenre("exhibition")}>
                전시
              </button>
              <button type="button"
                className={`chip genre-btn ${genre === "musical" ? "is-active" : ""}`}
                onClick={() => setGenre("musical")}>
                뮤지컬
              </button>
            </div>

            <span className="divider" aria-hidden="true"></span>

            {/* 캐시 모드일 때 진행현황 칩 숨김 */}
            {!isCacheMode && (
              <div className="filter-group">
                <span className="filter-label">진행 현황</span>
                <button type="button"
                  className={`chip status-btn ${status === "all" ? "is-active" : ""}`}
                  onClick={() => setStatus("all")}>
                  전체
                </button>
                <button type="button"
                  className={`chip status-btn ${status === "02" ? "is-active" : ""}`}
                  onClick={() => setStatus("02")}>
                  진행작
                </button>
                <button type="button"
                  className={`chip status-btn ${status === "01" ? "is-active" : ""}`}
                  onClick={() => setStatus("01")}>
                  예정작
                </button>
                <button type="button"
                  className={`chip status-btn ${status === "03" ? "is-active" : ""}`}
                  onClick={() => setStatus("03")}>
                  종료작
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 목록 */}
        <div id="exhibition-content" className="content">
          {genre === "exhibition" && (
            <ExhibitionList
              status={status}
              search={search}
              onCacheMode={setIsCacheMode}
            />
          )}
          {genre === "musical" && (
            <MusicalList
              status={status}
              search={search}
              onCacheMode={setIsCacheMode}
            />
          )}
        </div>
      </div>
    </main>
  );
}