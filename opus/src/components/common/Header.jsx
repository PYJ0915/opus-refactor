import { useEffect, useRef, useState } from "react";
import { useLocation, Link, NavLink, useNavigate } from "react-router-dom";
import "../../css/common/Header.css";
import { useNotificationStore } from "../../store/useNotificationStore";

function Header({ onClickUser, onLogout, isLoggedIn, variant, role }) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // === 알림 기능용 상태 및 훅 추가 ===
  const navigate = useNavigate();
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
  }, [isLoggedIn]);

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

          <nav className="gnb">
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
        </div>


        <div className="header__right">

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