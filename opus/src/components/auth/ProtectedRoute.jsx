import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuthStore } from "./useAuthStore";

export default function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();
  const [isHydrated, setIsHydrated] = useState(false);

  // 같은 마운트 사이클에서 중복 처리 방지(StrictMode 포함)
  const handledRef = useRef(false);

  // 로컬스토리지 데이터 복구 확인
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setIsHydrated(true));
    if (useAuthStore.persist.hasHydrated()) setIsHydrated(true);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    // 토큰 있으면 정상 통과 + 다음을 위해 가드 초기화
    if (token) {
      handledRef.current = false;
      return;
    }

    // 이미 처리(토스트/리다이렉트) 했으면 더 안함
    if (handledRef.current) return;
    handledRef.current = true;

    const isLoggingOut = sessionStorage.getItem("isLoggingOut");

    if (!isLoggingOut) {
      // toastId만으로 중복 방지
      toast.error("로그인이 필요한 서비스입니다.", {
        toastId: "auth-fail",
      });
    } else {
      sessionStorage.removeItem("isLoggingOut");
    }

    navigate("/", { replace: true });
  }, [token, navigate, isHydrated]);

  // 데이터 로딩 중이거나 비인증 시 렌더링 차단
  if (!isHydrated || !token) return null;

  return children;
}