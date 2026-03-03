import axios from "axios";
import { useAuthStore } from "../components/auth/useAuthStore";

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
      
      // 로그인/구글로그인 중 401은 여기서 가로채지 않음 (로그인 실패는 컴포넌트에서 처리)
      if (!url.includes("/auth/login") && !url.includes("/auth/google")) {
        // 1) 클라이언트 인증 정보 초기화
        useAuthStore.getState().logout();

        // 2) 메시지 추출 (문자열/객체 모두 대응) + trim + 빈값 fallback
        const raw = error.response?.data;
        const extracted =
          typeof raw === "string" ? raw.trim() : String(raw?.message ?? "").trim();

        // '/admin', '/admin/...', 'http://.../admin/...' 전부 커버
        const isAdminReq = /\/admin(\/|$)/.test(url);

        const fallbackMsg = isAdminReq
          ? "관리자 로그인이 필요합니다. 관리자 계정으로 로그인 후 이용해주세요."
          : "세션이 만료되었습니다. 다시 로그인해주세요.";

        const serverMsg = extracted || fallbackMsg;

        alert(serverMsg);
        window.location.href = "/";

        // 이후 컴포넌트 로직이 실행되지 않도록 중단
        return new Promise(() => {});
      }
    }

    return Promise.reject(error);
  }
);

export { axiosApi };
export default axiosApi;