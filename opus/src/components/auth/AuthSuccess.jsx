import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "./useAuthStore";
import axiosApi from "../../api/axiosAPI";
import { toast } from "react-toastify";

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("로그인에 실패했습니다.", { toastId: "auth-success-fail" });
      navigate("/");
      return;
    }

    axiosApi
      .get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        login({ token, member: res.data });

        const userName = res.data?.memberEmail?.split("@")[0] || "사용자";
        toast.success(`${userName}님, 환영합니다!`, { toastId: "oauth-welcome" });

        navigate("/");
      })
      .catch(() => {
        toast.error("로그인에 실패했습니다.", { toastId: "auth-success-fail" });
        navigate("/");
      });
  }, [searchParams, navigate, login]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>로그인 중입니다...</h2>
    </div>
  );
};

export default AuthSuccess;