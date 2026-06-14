import axios from "axios";
import { useAuthStore } from "../components/auth/useAuthStore";

let isHandlingExpired = false;

const axiosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

/* 요청 인터셉터: 서버로 요청을 보내기 전 실행 */
axiosApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* 응답 인터셉터: 서버 응답을 받은 후 처리 */
axiosApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401(Unauthorized) 에러 발생 시
    if (error?.response?.status === 401) {
      const url = error.config?.url || "";
      const isAuthEndpoint = url.includes("/auth/login")
        || url.includes("/auth/google")
        || url.includes("/auth/me")
        || url.includes("/auth/verify-password");

      if (!isAuthEndpoint) {
        // 이미 처리 중이면 조용히 무시 (토스트/리다이렉트 중복 방지)
        if (isHandlingExpired) return new Promise(() => { });

        isHandlingExpired = true;

        useAuthStore.getState().logout();

        const raw = error.response?.data;
        const extracted = typeof raw === "string"
          ? raw.trim()
          : String(raw?.message ?? "").trim();

        const isAdminReq = /\/admin(\/|$)/.test(url);
        const fallbackMsg = isAdminReq
          ? "관리자 로그인이 필요합니다."
          : "세션이 만료되었습니다. 다시 로그인해주세요.";

        const serverMsg = extracted || fallbackMsg;

        window.dispatchEvent(
          new CustomEvent("auth:expired", { detail: { message: serverMsg } })
        );

        // 3초 후 플래그 초기화 (다음 실제 만료 시 다시 처리 가능하도록)
        setTimeout(() => { isHandlingExpired = false; }, 3000);

        return new Promise(() => { });
      }
    }

    return Promise.reject(error);
  }
);

export { axiosApi };
export default axiosApi;