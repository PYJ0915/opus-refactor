import { useEffect, useRef, useState } from "react";
import { useLocation, Link, NavLink, useNavigate } from "react-router-dom";
import "../../css/common/Header.css";
import { useNotificationStore } from "../../store/useNotificationStore";
import axiosApi from "../../api/axiosAPI";
import { resolveImage } from "../../utils/unveilingImage";

function Header({ onClickUser, onLogout, isLoggedIn, variant, role }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navigate = useNavigate();

  // === 알림 기능용 상태 및 훅 추가 ===
  const panelRef = useRef(null);

  const {
    notifications, unreadCount, isOpen, isLoading,
    togglePanel, closePanel,
    fetchNotifications, fetchUnreadCount,
    markAsRead, markAllAsRead,
    deleteNotification, clearNotifications,
  } = useNotificationStore();

  // ==================================

  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onHero = isHome && !scrolled;

  // === 알림기능 훅 및 함수 ===

  // 로그인 상태일 때 읽지 않은 수 30초 Polling
  useEffect(() => {
    if (!isLoggedIn) return;
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(timer);
  }, [isLoggedIn, fetchUnreadCount]);

  // 패널 열릴 때 목록 조회
  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        closePanel();
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 검색창 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setPreview(null);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 라우트 변경 시 모바일 메뉴 자동 닫기
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // ESC 키로 모바일 메뉴 닫기 (접근성)
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // 모바일 메뉴 열렸을 때 배경 스크롤 막기
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // 검색창 열릴 때 input focus
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // debounce 미리보기
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms 후에 검색

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setPreview(null); return; }
    axiosApi.get(`/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(res => setPreview(res.data))
      .catch(() => setPreview(null));
  }, [debouncedQuery]);

  // 알림 클릭 → 읽음 처리 + 링크 이동
  const handleNotiClick = async (noti) => {
    // 먼저 링크로 이동
    closePanel();
    if (noti.notiLink) navigate(noti.notiLink);

    // 그 다음 읽음 처리 (백그라운드)
    if (noti.isRead === "N") {
      markAsRead(noti.notiNo);
    }
  };

  // 개별 삭제 — 이벤트 버블링 방지 (클릭이 noti-item까지 전파되지 않도록)
  const handleDelete = async (e, notiNo) => {
    e.stopPropagation();
    await deleteNotification(notiNo);
  };

  // 알림 타입별 아이콘
  const typeIcon = (type) => {
    switch (type) {
      case "ORDER": return "fa-solid fa-box";
      case "AUCTION": return "fa-solid fa-gavel";
      default: return "fa-solid fa-bell";
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setPreview(null);
    setSearchQuery("");
  };

  const hasPreview = preview && (
    preview.goods?.length > 0 ||
    preview.auctions?.length > 0 ||
    preview.boards?.length > 0 ||
    preview.exhibitions?.length > 0 ||
    preview.musicals?.length > 0
  );

  // ==================================


  return (
    <header
      id="header"
      /* 아래 className 부분에 ${variant}를 추가했습니다. 이래야 색깔이 바뀝니다! */
      className={`header ${variant} ${scrolled ? "is-scrolled" : ""} ${onHero ? "is-on-hero" : ""}`}
    >
      <div className="wrap header__inner">
        <div className="header__left">
          <Link to="/" className="brand">
            OPUS
          </Link>

          {/* 모바일 GNB 오버레이 배경 (메뉴 열렸을 때 본문 클릭 막고 어둡게) */}
          {mobileMenuOpen && (
            <div
              className="gnb-backdrop"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          <nav
            ref={mobileMenuRef}
            className={`gnb ${mobileMenuOpen ? "is-open" : ""}`}
          >
            <NavLink
              to="/onStage"
              className={({ isActive }) =>
                `gnb__link ${isActive ? "is-active" : ""}`
              }
            >
              On-Stage
            </NavLink>

            <NavLink
              to="/proposals"
              className={({ isActive }) =>
                `gnb__link ${isActive ? "is-active" : ""}`
              }
            >
              Proposals
            </NavLink>

            <NavLink
              to="/unveiling"
              className={({ isActive }) =>
                `gnb__link ${isActive ? "is-active" : ""}`
              }
            >
              Unveiling
            </NavLink>

            <NavLink
              to="/selections"
              className={({ isActive }) =>
                `gnb__link ${isActive ? "is-active" : ""}`
              }
            >
              Selections
            </NavLink>

            {/* 관리자 */}
            {role === "ADMIN" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `gnb__link admin-link ${isActive ? "is-active" : ""}`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>

          {/* 모바일/태블릿 전용 햄버거 토글 버튼 */}
          <button
            type="button"
            className={`menu-toggle ${mobileMenuOpen ? "is-active" : ""}`}
            aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
          >
            <span className="menu-toggle__bar" />
            <span className="menu-toggle__bar" />
            <span className="menu-toggle__bar" />
          </button>
        </div>

        <div className={`header__right ${searchOpen ? "is-search-active" : ""}`}>

          <div className="header-search" ref={searchRef}>
            <div className={`header-search__bar ${searchOpen ? "is-open" : ""}`}>
              <form onSubmit={handleSearch} className="header-search__form">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색어를 입력하세요"
                  className="header-search__input"
                />
              </form>

              {/* 검색 실행 버튼 — 풀스크린 검색바 내부용 (모바일) */}
              <button
                type="button"
                className="header-search__submit"
                aria-label="검색 실행"
                onClick={() => {
                  if (searchQuery.trim()) {
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchOpen(false);
                    setPreview(null);
                    setSearchQuery("");
                  }
                }}
              >
                <i className="fa-solid fa-search" />
              </button>

              <button
                type="button"
                className="header-search__close"
                aria-label="검색창 닫기"
                onClick={() => {
                  setSearchOpen(false);
                  setPreview(null);
                  setSearchQuery("");
                }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            {/* 검색 토글 버튼 — 검색이 열려있는 동안(모바일)에는 숨겨서 닫기버튼과 겹치지 않게 함 */}
            <button
              type="button"
              className={`icon-btn header-search__toggle ${searchOpen ? "is-search-open" : ""}`}
              aria-label="검색"
              onClick={() => {
                if (searchOpen && searchQuery.trim()) {
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                  setPreview(null);
                  setSearchQuery("");
                } else {
                  setSearchOpen(prev => !prev);
                }
              }}
            >
              <i className="fa-solid fa-search" />
            </button>

            {/* 드롭다운 미리보기 */}
            {searchOpen && (
              <div className={`search-preview ${hasPreview || searchLoading ? "is-visible" : ""}`}>
                {searchLoading && (
                  <p className="search-preview__loading">검색 중...</p>
                )}

                {!searchLoading && hasPreview && (
                  <>
                    {preview.goods?.length > 0 && (
                      <div className="search-preview__section">
                        <p className="search-preview__label">Selections</p>
                        {preview.goods.map(g => (
                          <div
                            key={g.goodsNo}
                            className="search-preview__item"
                            onClick={() => {
                              navigate(`/selections/${g.goodsNo}`);
                              setSearchOpen(false);
                              setPreview(null);
                              setSearchQuery("");
                            }}
                          >
                            <img
                              src={`${import.meta.env.VITE_API_URL}${g.goodsThumbnail}`}
                              alt={g.goodsName}
                              className="search-preview__thumb"
                            />
                            <div>
                              <p className="search-preview__name">{g.goodsName}</p>
                              <p className="search-preview__sub">{Number(g.goodsPrice).toLocaleString()}원</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {preview.auctions?.length > 0 && (
                      <div className="search-preview__section">
                        <p className="search-preview__label">Unveiling</p>
                        {preview.auctions.map(u => (
                          <div
                            key={u.unveilingNo}
                            className="search-preview__item"
                            onClick={() => {
                              navigate(`/unveiling/${u.unveilingNo}`);
                              setSearchOpen(false);
                              setPreview(null);
                              setSearchQuery("");
                            }}
                          >
                            <img
                              src={resolveImage(u.thumbUrl)}
                              alt={u.unveilingTitle}
                              className="search-preview__thumb"
                              onError={(e) => {
                                e.currentTarget.src = "/no-thumbnail.png";
                                e.currentTarget.onerror = null;
                              }}
                            />
                            <div>
                              <p className="search-preview__name">{u.unveilingTitle}</p>
                              <p className="search-preview__sub">{u.productionArtist}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {preview.boards?.length > 0 && (
                      <div className="search-preview__section">
                        <p className="search-preview__label">Proposals</p>
                        {preview.boards.map(b => (
                          <div
                            key={b.boardNo}
                            className="search-preview__item"
                            onClick={() => {
                              navigate(`/proposals/detail/${b.boardNo}`);
                              setSearchOpen(false);
                              setPreview(null);
                              setSearchQuery("");
                            }}
                          >
                            <div className="search-preview__icon-wrap">
                              <i className="fa-solid fa-file-lines" />
                            </div>
                            <div>
                              <p className="search-preview__name">{b.boardTitle}</p>
                              <p className="search-preview__sub">{b.boardWriteDate?.substring(0, 10)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {preview.exhibitions?.length > 0 && (
                      <div className="search-preview__section">
                        <p className="search-preview__label">On-Stage (전시)</p>
                        {preview.exhibitions.map(e => (
                          <div
                            key={e.stageNo}
                            className="search-preview__item"
                            onClick={() => {
                              navigate(`/onStage/exhibition/${e.stageNo}`);
                              setSearchOpen(false);
                              setPreview(null);
                              setSearchQuery("");
                            }}
                          >
                            <img
                              src={resolveImage(e.stageThumbnail)}
                              alt={e.stageTitle}
                              className="search-preview__thumb"
                              onError={(el) => { el.currentTarget.src = "/no-thumbnail.png"; el.currentTarget.onerror = null; }}
                            />
                            <div>
                              <p className="search-preview__name">{e.stageTitle}</p>
                              <p className="search-preview__sub">{e.stagePlace}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {preview.musicals?.length > 0 && (
                      <div className="search-preview__section">
                        <p className="search-preview__label">On-Stage (뮤지컬)</p>
                        {preview.musicals.map(e => (
                          <div
                            key={e.stageNo}
                            className="search-preview__item"
                            onClick={() => {
                              navigate(`/onStage/musical/${e.stageNo}`);
                              setSearchOpen(false);
                              setPreview(null);
                              setSearchQuery("");
                            }}
                          >
                            <img
                              src={resolveImage(e.stageThumbnail)}
                              alt={e.stageTitle}
                              className="search-preview__thumb"
                              onError={(el) => { el.currentTarget.src = "/no-thumbnail.png"; el.currentTarget.onerror = null; }}
                            />
                            <div>
                              <p className="search-preview__name">{e.stageTitle}</p>
                              <p className="search-preview__sub">{e.stagePlace}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className="search-preview__footer"
                      onClick={handleSearch}
                    >
                      <span>"{searchQuery}" 전체 결과 보기</span>
                      <i className="fa-solid fa-arrow-right" />
                    </div>
                  </>
                )}

                {!searchLoading && searchQuery.trim() && !hasPreview && (
                  <p className="search-preview__empty">검색 결과가 없습니다.</p>
                )}
              </div>
            )}
          </div>

          {isLoggedIn && (
            <div className="noti-wrap" ref={panelRef}>

              {/* 벨 버튼 */}
              <button
                className="icon-btn noti-btn"
                type="button"
                aria-label="알림"
                onClick={togglePanel}
              >
                <i className={notifications.length > 0
                  ? "fa-solid fa-bell"
                  : "fa-regular fa-bell"} />
                {unreadCount > 0 && <span className="noti-badge" />}
              </button>

              {/* 알림 패널 */}
              {isOpen && (
                <div className="noti-panel">

                  {/* 패널 헤더 */}
                  <div className="noti-panel__head">
                    <span className="noti-panel__title">알림</span>
                    <div className="noti-panel__actions">
                      {unreadCount > 0 && (
                        <button
                          className="noti-panel__read-all"
                          onClick={markAllAsRead}
                        >
                          모두 읽음
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          className="noti-panel__clear"
                          onClick={clearNotifications}
                        >
                          비우기
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 패널 바디 */}
                  <div className="noti-panel__body">
                    {isLoading ? (
                      <p className="noti-empty">불러오는 중...</p>
                    ) : notifications.length === 0 ? (
                      <p className="noti-empty">새로운 알림이 없습니다.</p>
                    ) : (
                      notifications.map((noti) => (
                        <div
                          key={noti.notiNo}
                          className={`noti-item ${noti.isRead === "N" ? "is-unread" : ""}`}
                          onClick={() => handleNotiClick(noti)}
                        >
                          <div className="noti-item__icon">
                            <i className={typeIcon(noti.notiType)} />
                          </div>
                          <div className="noti-item__content">
                            <p className="noti-item__title">{noti.notiTitle}</p>
                            {noti.notiContent && (
                              <p className="noti-item__desc">{noti.notiContent}</p>
                            )}
                            <p className="noti-item__time">{noti.createdAt}</p>
                          </div>
                          <div className="noti-item__right">
                            {noti.isRead === "N" && (
                              <span className="noti-item__dot" />
                            )}
                            {/* 개별 삭제 버튼 */}
                            <button
                              className="noti-item__delete"
                              onClick={(e) => handleDelete(e, noti.notiNo)}
                              aria-label="알림 삭제"
                            >
                              <i className="fa-solid fa-xmark" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}


          <button
            className="icon-btn"
            type="button"
            aria-label={isLoggedIn ? "마이페이지" : "로그인"}
            onClick={onClickUser}
          >
            <i className={`${isLoggedIn ? "fa-regular fa-user" : "fa-solid fa-arrow-right-to-bracket"}`} aria-hidden="true"></i>
          </button>


          {location.pathname.includes("selections") ?
            <NavLink to="/selections/cart">
              <button className="icon-btn" type="button" aria-label="장바구니">
                <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
              </button>
            </NavLink>
            : null}

          {isLoggedIn && (
            <button
              className="icon-btn"
              type="button"
              aria-label="로그아웃"
              onClick={onLogout}
            >
              <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;