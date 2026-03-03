import axios, { AxiosHeaders } from "axios";
import { useAuthStore } from "../components/auth/useAuthStore";

const axiosUpload = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosUpload.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    // 1) 헤더를 AxiosHeaders로 정규화 (delete/set이 확실히 먹게)
    config.headers = AxiosHeaders.from(config.headers);

    // 2) 토큰
    if (token) config.headers.set("Authorization", `Bearer ${token}`);

    // 3) FormData면 Content-Type 완전 제거 (json으로 박히는 거 차단)
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      config.headers.delete("Content-Type");
      config.headers.delete("content-type");
      // 일부 환경/머지에서 남는 값까지 한번 더
      config.headers.set("Content-Type", undefined);
      config.headers.set("content-type", undefined);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosUpload.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const url = error.config?.url || "";

      if (!url.includes("/auth/login") && !url.includes("/auth/google")) {
        useAuthStore.getState().logout();

        const serverMsg =
          typeof error.response.data === "string"
            ? error.response.data
            : error.response.data?.message ||
              "세션이 만료되었습니다. 다시 로그인해주세요.";

        alert(serverMsg);
        window.location.href = "/";
        return new Promise(() => {});
      }
    }
    return Promise.reject(error);
  }
);

export default axiosUpload;