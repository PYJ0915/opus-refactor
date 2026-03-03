import '../../css/pages/onStage/OnStage.css'
import ExhibitionList from './ExhibitionList';
import MusicalList from './MusicalList';
import { useState } from 'react';

export default function OnStage() {
  const [genre, setGenre] = useState("exhibition");
  const [status, setStatus] = useState("all"); // All, 진행예정(01), 진행중(02), 진행완료(03)
  const [search, setSearch] = useState("");

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
                data-genre="exhibition"
                onClick={() => setGenre("exhibition")}>
                  전시
              </button>
              <button type="button"
                className={`chip genre-btn ${genre === "musical" ? "is-active" : ""}`}
                data-genre="musical"
                onClick={() => setGenre("musical")}>
                  뮤지컬
              </button>
            </div>

            <span className="divider" aria-hidden="true"></span>

            <div className="filter-group">
              <span className="filter-label">진행 현황</span>
              <button type = "button"
                className={`chip status-btn ${status === "all" ? "is-active" : ""}`}
                data-status="all"
                onClick={() => setStatus("all")}>
                  전체
              </button>
              <button type = "button"
                className={`chip status-btn ${status === "02" ? "is-active" : ""}`}
                data-status="ongoing"
                onClick={() => setStatus("02")}>
                  진행작
              </button>
              <button type = "button"
                className={`chip status-btn ${status === "01" ? "is-active" : ""}`}
                data-status="upcoming"
                onClick={() => setStatus("01")}>
                  예정작
              </button>
              <button type = "button"
                className={`chip status-btn ${status === "03" ? "is-active" : ""}`}
                data-status="ended"
                onClick={() => setStatus("03")}>
                  종료작
              </button>
            </div>
          </div>
        </section>

        {/* 목록 */}
        <div id="exhibition-content" className="content">
          {genre === "exhibition" && (
            <ExhibitionList status={status} search={search}/>
          )}

          {genre === "musical" && (
            <MusicalList status={status} search={search} />
          )}
        </div>
      </div>
    </main>
  );
}