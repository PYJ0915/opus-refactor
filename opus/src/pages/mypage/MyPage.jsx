import { useMemo, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../css/myPage.css";
import { useAuthStore } from "../../components/auth/useAuthStore";
import { useAuthValidation } from "../../components/auth/useAuthValidation";
import { toast } from "react-toastify";
import { showConfirm } from "../../components/toast/ToastUtils";
import axiosApi from "../../api/axiosAPI";

export default function MyPage() {
  const navigate = useNavigate();
  const { member, token, login, logout } = useAuthStore();
  const { isTelChecked, setIsTelChecked, handleCheckTel } = useAuthValidation();

  const role = member?.role;
  const isSocialUser = member?.loginType?.toLowerCase() === "google";

  const accountLabel = useMemo(() => {
    if (member?.loginType?.toLowerCase() === "google")
      return "(Google 계정으로 사용 중 입니다.)";
    if (role === "ADMIN") return "(관리자 계정입니다.)";
    if (role === "COMPANY") return "(기업 회원 계정입니다.)";
    return null;
  }, [member, role]);

  const [activeId, setActiveId] = useState("profile-edit");
  const [newPhone, setNewPhone] = useState("");
  const [pwData, setPwData] = useState({
    currentPw: "",
    newPw: "",
    newPwConfirm: "",
  });

  // 사이드바 그룹 구성 (isSocialUser일 때 비밀번호 변경 메뉴 제외)
  const SIDEBAR_GROUPS = [
    {
      title: "내 정보",
      items: [
        { id: "profile-edit", icon: "fa-regular fa-user", label: "연락처 변경" },
        ...(!isSocialUser
          ? [
              {
                id: "password-change",
                icon: "fa-solid fa-lock",
                label: "비밀번호 변경",
              },
            ]
          : []),
        ...(role !== "ADMIN"
          ? [{ id: "withdrawal", icon: "fa-solid fa-user-slash", label: "회원 탈퇴" }]
          : []),
      ],
    },
    {
      title: "활동 내역",
      items: [
        ...(role === "COMPANY"
          ? [{ id: "myPosts", icon: "fa-regular fa-pen-to-square", label: "등록 컨텐츠" }]
          : []),
        { id: "wishlist", icon: "fa-regular fa-heart", label: "찜한 리스트" },
        { id: "reviews", icon: "fa-regular fa-comment", label: "작성 후기" },
        { id: "orders", icon: "fa-solid fa-receipt", label: "주문 내역" },
        { id: "auction-history", icon: "fa-solid fa-gavel", label: "경매 내역" },
      ],
    },
  ];

  const formatPhoneNumber = (value) => {
    if (!value) return "";
    const num = value.replace(/[^0-9]/g, "");
    if (num.length <= 3) return num;
    if (num.length <= 7) return `${num.slice(0, 3)}-${num.slice(3)}`;
    return `${num.slice(0, 3)}-${num.slice(3, 7)}-${num.slice(7, 11)}`;
  };

  useEffect(() => {
    setIsTelChecked(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마이페이지 진입 시(마운트 시) 단 한 번 초기화

  const handleNewPhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNewPhone(formatted);
    setIsTelChecked(false);
  };

  const handleUpdatePhone = async (e) => {
    if (e) e.preventDefault();
    const rawPhone = newPhone.replace(/[^0-9]/g, "");

    if (!rawPhone)
      return toast.error("연락처를 입력해주세요.", { toastId: "mypage-tel-empty" });

    if (!isTelChecked)
      return toast.error("연락처 중복 확인을 해주세요.", {
        toastId: "mypage-tel-not-checked",
      });

    if (rawPhone === member?.memberTel)
      return toast.error("기존 연락처와 동일한 번호입니다.", {
        toastId: "mypage-tel-same",
      });

    try {
      const res = await axiosApi.post("/auth/updateTel", {
        memberNo: member.memberNo,
        memberTel: rawPhone,
      });

      if (res.status === 200) {
        toast.success("연락처가 변경되었습니다.", { toastId: "mypage-tel-updated" });
        login({ token, member: { ...member, memberTel: rawPhone } });
        setNewPhone("");
        setIsTelChecked(false);
      }
    } catch (err) {
      toast.error(err?.response?.data || "연락처 변경에 실패했습니다.", {
        toastId: "mypage-tel-update-fail",
      });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!pwData.currentPw)
      return toast.error("현재 비밀번호를 입력해주세요.", {
        toastId: "mypage-pw-current-empty",
      });

    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*\-_])[A-Za-z\d!@#$%^&*\-_]{8,16}$/;
    if (!pwRegex.test(pwData.newPw))
      return toast.error(
        <>
          비밀번호 형식(8~16자 영문/숫자/특수문자)을
          <br />
          확인해주세요.
        </>,
        { toastId: "mypage-pw-format-invalid" }
      );

    try {
      const res = await axiosApi.post("/auth/changePw", {
        memberNo: member.memberNo,
        currentPw: pwData.currentPw,
        newPw: pwData.newPw,
      });

      if (res.status === 200) {
        toast.success(
          <>
            비밀번호가 변경되었습니다.
            <br />
            다시 로그인 해주세요.
          </>,
          { toastId: "mypage-pw-changed" }
        );

        setTimeout(() => {
          logout();
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      toast.error(err.response?.data || "비밀번호 변경에 실패했습니다.", {
        toastId: "mypage-pw-change-fail",
      });
    }
  };

  const processWithdrawal = async () => {
    try {
      const res = await axiosApi.post("/auth/withdraw");
      if (res.status === 200) {
        toast.success("탈퇴 처리가 완료되었습니다.", {
          toastId: "mypage-withdraw-success",
        });
        setTimeout(() => {
          logout();
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "탈퇴 처리 중 오류가 발생했습니다.", {
        toastId: "mypage-withdraw-fail",
      });
    }
  };

  const handleWithdrawalClick = async () => {
    try {
      showConfirm(
        "정말 탈퇴하시겠습니까?",
        "탈퇴 시 모든 데이터는 복구가 불가능하며\n즉시 로그아웃됩니다.\n구글 로그인은 추가로 연동해제 해주세요.",
        processWithdrawal,
        "확인"
      );
    } catch (err) {
      toast.error("탈퇴 가능 여부 확인 중 오류가 발생했습니다.", {
        toastId: "mypage-withdraw-check-fail",
      });
    }
  };

  const handleSideNavClick = (e, id) => {
    if (id === "withdrawal") {
      e.preventDefault();
      handleWithdrawalClick();
      return;
    }

    setActiveId(id);

    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /* 찜 리스트 */
  const [wishItems, setWishItems] = useState([]);
  const [wishTab, setWishTab] = useState("all");

  const wishCounts = useMemo(
    () => ({
      all: 0,
      musical: 0,
      exhibit: 0,
    }),
    []
  );

  const filteredWish = useMemo(() => [], []);
  const toggleWish = (id) => {};

  return (
    <div className="mypage">
      <aside className="sidebar">
        <div className="sidebar__inner">
          <nav className="sidebar__nav">
            {SIDEBAR_GROUPS.map((group) => (
              <div className="nav-group" key={group.title}>
                <p className="nav-group__title">{group.title}</p>
                <ul className="nav-list">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <NavLink
                        to={group.title === "활동 내역" ? `/mypage/${item.id}` : "#"}
                        className={`nav-link ${activeId === item.id ? "is-active" : ""}`}
                        onClick={(e) => handleSideNavClick(e, item.id)}
                      >
                        <i className={item.icon} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      <main className="main">
        <div className="main__inner">
          <section id="profile-edit" className="card">
            <header className="card__head">
              <h2 className="card__title">연락처 변경</h2>
            </header>

            <div className="card__body">
              <div className="form">
                <div className="field">
                  <label className="label">
                    이메일
                    {accountLabel && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#4285F4",
                          marginLeft: "8px",
                        }}
                      >
                        {accountLabel}
                      </span>
                    )}
                  </label>
                  <input
                    className="input input--disabled"
                    value={member?.memberEmail || "정보 없음"}
                    disabled
                    readOnly
                  />
                </div>

                <div className="field">
                  <label className="label">기존 연락처</label>
                  <input
                    className="input input--disabled"
                    value={formatPhoneNumber(member?.memberTel) || "등록된 번호 없음"}
                    disabled
                    readOnly
                  />
                </div>

                <div className="field">
                  <label className="label">새 연락처</label>
                  <div className="tel-group">
                    <input
                      className="input tel-input"
                      type="text"
                      inputMode="numeric"
                      value={newPhone}
                      onChange={handleNewPhoneChange}
                      maxLength={13}
                    />

                    <div className="tel-buttons">
                      <button
                        type="button"
                        className={`btn btn--check ${isTelChecked ? "is-checked" : ""}`}
                        onClick={() => handleCheckTel(newPhone.replace(/[^0-9]/g, ""))}
                        disabled={isTelChecked}
                      >
                        {isTelChecked ? "확인됨" : "중복 확인"}
                      </button>

                      <button
                        type="button"
                        className="btn btn--primary btn--save"
                        onClick={handleUpdatePhone}
                      >
                        연락처 변경
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {!isSocialUser && (
            <section id="password-change" className="card">
              <header className="card__head">
                <h2 className="card__title">비밀번호 변경</h2>
              </header>

              <div className="card__body">
                <form className="form form--narrow" onSubmit={handlePasswordChange}>
                  <div className="field">
                    <label className="label">현재 비밀번호</label>
                    <input
                      className="input"
                      type="password"
                      value={pwData.currentPw}
                      onChange={(e) => setPwData({ ...pwData, currentPw: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field">
                    <label className="label">새 비밀번호</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="영문, 숫자, 특수문자(!@#$%^&*-_) 포함 8~16자"
                      value={pwData.newPw}
                      onChange={(e) => setPwData({ ...pwData, newPw: e.target.value })}
                      required
                    />
                  </div>

                  <div className="field">
                    <label className="label">새 비밀번호 확인</label>
                    <input
                      className="input"
                      type="password"
                      value={pwData.newPwConfirm}
                      onChange={(e) =>
                        setPwData({ ...pwData, newPwConfirm: e.target.value })
                      }
                      required
                    />

                    {pwData.newPwConfirm.length > 0 && (
                      <p
                        className={`pw-msg ${
                          pwData.newPw === pwData.newPwConfirm ? "is-match" : "is-error"
                        }`}
                      >
                        {pwData.newPw === pwData.newPwConfirm
                          ? "새 비밀번호가 일치합니다."
                          : "새 비밀번호가 일치하지 않습니다."}
                      </p>
                    )}
                  </div>

                  <div className="form__actions">
                    <button
                      className="btn btn--primary"
                      type="submit"
                      disabled={!pwData.newPw || pwData.newPw !== pwData.newPwConfirm}
                    >
                      비밀번호 변경
                    </button>
                  </div>
                </form>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}