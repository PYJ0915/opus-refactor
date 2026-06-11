import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth/useAuthStore";
import { useMemo } from "react";

export default function MyPageSidebar() {
  const { member } = useAuthStore();
  const role = member?.role;
  const isSocialUser = member?.loginType?.toLowerCase() === "google";
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isMyPage = pathname === "/mypage";

  const SIDEBAR_GROUPS = useMemo(() => [
    {
      title: "내 정보",
      items: [
        { id: "profile-edit", icon: "fa-regular fa-user", label: "연락처 변경" },
        ...(!isSocialUser
          ? [{ id: "password-change", icon: "fa-solid fa-lock", label: "비밀번호 변경" }]
          : []),
        ...(role !== "ADMIN" && isMyPage
          ? [{ id: "withdrawal", icon: "fa-solid fa-user-slash", label: "회원 탈퇴" }]
          : []),
      ],
    },
    {
      title: "활동 내역",
      items: [
        ...(role === "COMPANY"
          ? [
            { id: "dashboard", icon: "fa-solid fa-chart-bar", label: "대시보드" },
            { id: "myPosts", icon: "fa-regular fa-pen-to-square", label: "등록 컨텐츠" }
          ]
          : []),
        { id: "wishlist", icon: "fa-regular fa-heart", label: "찜한 리스트" },
        { id: "reviews", icon: "fa-regular fa-comment", label: "작성 후기" },
        { id: "orders", icon: "fa-solid fa-receipt", label: "주문 내역" },
        { id: "auction-history", icon: "fa-solid fa-gavel", label: "경매 내역" },
      ],
    },
  ], [isSocialUser, role, isMyPage]);

  // 현재 경로 기준으로 활성 메뉴 판단
  const getActiveId = () => {
    if (pathname === "/mypage") {
      // /mypage에서는 해시로 어떤 섹션인지 판단 불가하므로 기본값
      return "profile-edit";
    }
    // /mypage/orders → "orders"
    return pathname.split("/mypage/")[1] ?? "profile-edit";
  };

  const activeId = getActiveId();

  const handleNavClick = (e, id, isActivityGroup) => {
    if (isActivityGroup) return; // 활동 내역은 NavLink 기본 동작으로 라우팅

    e.preventDefault();

    if (id === "withdrawal") {
      // withdrawal 클릭은 MyPage에서 처리해야 하므로 이벤트 발행
      window.dispatchEvent(new CustomEvent("mypage:withdrawal"));
      return;
    }

    if (id === "dashboard") {
      navigate("/mypage/dashboard");
      return;
    }

    // 내 정보 탭: /mypage로 이동 후 해당 섹션으로 스크롤
    if (pathname !== "/mypage") {
      navigate("/mypage");
      // 페이지 이동 후 스크롤 (약간의 딜레이 필요)
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__inner">
        <nav className="sidebar__nav">
          {SIDEBAR_GROUPS.map((group) => {
            const isActivityGroup = group.title === "활동 내역";
            return (
              <div className="nav-group" key={group.title}>
                <p className="nav-group__title">{group.title}</p>
                <ul className="nav-list">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <NavLink
                        to={isActivityGroup ? `/mypage/${item.id}` : "#"}
                        className={`nav-link ${activeId === item.id ? "is-active" : ""}`}
                        onClick={(e) => handleNavClick(e, item.id, isActivityGroup)}
                      >
                        <i className={item.icon} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}