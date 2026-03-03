import { useEffect, useRef } from "react";
import { useAuthStore } from "../auth/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useNotificationStore } from "../../store/useNotificationStore";

const AuthInitializer = () => {
  const { isLoggedIn } = useAuthStore();
  const { setLoggedIn, mergeWithServer, resetCart } = useCartStore();

  // 알림 스토어에서 필요한 함수 가져오기
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const resetNotifications = useNotificationStore((s) => s.reset);

  const prevLoggedIn = useRef(isLoggedIn);


  useEffect(() => {
    if (isLoggedIn === null) return;

    const wasLoggedIn = prevLoggedIn.current;
    prevLoggedIn.current = isLoggedIn;

    if (isLoggedIn === true) {
      // 로그인 상태: 장바구니 병합 + 알림 카운트 조회
      setLoggedIn(true);
      mergeWithServer();
      fetchNotifications();
      fetchUnreadCount();
    } else if (wasLoggedIn === true && isLoggedIn === false) {
      // 로그인 → 로그아웃 전환 감지 시 장바구니 + 알림 완전 초기화
      // (초기 렌더링 wasLoggedIn=null, isLoggedIn=false 케이스는 위 null 체크로 제외됨)
      console.log("로그아웃 감지 → 장바구니/알림 초기화");
      resetCart();
      resetNotifications();

    } else {
      // 비로그인 초기 상태 (null → false 전환 이후)
      setLoggedIn(false);
    }
  }, [isLoggedIn]);

  return null;
};

export default AuthInitializer;