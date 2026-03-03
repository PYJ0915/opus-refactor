import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../common/Header";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useAuthStore } from "./useAuthStore";
import { toast } from "react-toastify";
import { showConfirm } from "../toast/ToastUtils";
import { useNotificationStore } from "../../store/useNotificationStore";

export default function HeaderModal({ variant }) {
  const [modalType, setModalType] = useState(null);
  const navigate = useNavigate();

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);

  const role = useAuthStore(state => state.member?.role)

  const resetNotifications = useNotificationStore((s) => s.reset);

  const handleIconClick = useCallback(() => {
    if (isLoggedIn) {
      navigate("/mypage");
      setModalType(null);
    } else {
      setModalType("login");
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = useCallback(() => {
    showConfirm(
      "로그아웃 하시겠습니까?",
      null,
      () => {
        sessionStorage.setItem("isLoggingOut", "true");
        toast.dismiss();
        logout();
        resetNotifications();
        navigate("/", { replace: true });
        toast.success("로그아웃 되었습니다.", { toastId: "logout-success" });
      },
      "확인"
    );
  }, [logout, navigate]);

  const authState = useAuthStore(state => state);

  return (
    <>
      <Header
        variant={variant}
        isLoggedIn={isLoggedIn}
        onClickUser={handleIconClick}
        onLogout={handleLogout}

        // 관리자
        role={role}
      />

      {modalType === "login" && (
        <LoginModal
          open={true}
          onClose={() => setModalType(null)}
          onSwitchSignup={() => setModalType("signup")}
        />
      )}

      {modalType === "signup" && (
        <SignupModal
          open={true}
          onClose={() => setModalType(null)}
        />
      )}
    </>
  );
}