import { useGoogleLogin } from "@react-oauth/google";
import axiosApi from "../../api/axiosAPI";
import { toast } from "react-toastify";

const GoogleLoginButton = ({ onLoginSuccess }) => {
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const toastId = toast.loading("구글 계정 정보 확인 중...", {
        toastId: "google-login",
      });

      try {
        const response = await axiosApi.post("/auth/google", {
          accessToken: tokenResponse.access_token,
        });
        toast.dismiss(toastId);

        toast.success("구글 로그인 성공", {
          toastId: "google-login-success",
          autoClose: 1500,
        });

        onLoginSuccess?.(response.data);
      } catch (error) {
        console.error("구글 로그인 서버 에러:", error);

        toast.dismiss(toastId);

        toast.error(
          error.response?.data?.message || "서버 통신에 실패했습니다.",
          {
            toastId: "google-login-error",
            autoClose: 2000,
          }
        );
      }
    },

    onError: (error) => {
      console.error("구글 인증 에러:", error);
      toast.error("구글 인증 창을 여는 데 실패했습니다.", {
        toastId: "google-popup-error",
        autoClose: 2000,
      });
    },
  });

  const handleClick = () => {
    // 팝업 허용 여부 사전 테스트
    const test = window.open("", "_blank", "width=1,height=1");
    if (!test || test.closed || typeof test.closed === "undefined") {
      toast.warn(
        "팝업이 차단되어 있습니다. 브라우저 또는 광고 차단 확장프로그램에서 팝업을 허용한 후 다시 시도해주세요.",
        { toastId: "google-popup-blocked", autoClose: 4000 }
      );
      return;
    }
    test.close(); // 테스트용 팝업 즉시 닫기
    handleGoogleLogin();
  };

  return (
    <button
      type="button"
      className="lm-submit lm-google"
      onClick={handleClick}
    >
      <img
        src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
        alt=""
        style={{ width: "20px", height: "20px" }}
      />
      <span>구글로 로그인하기</span>
    </button>
  );
};

export default GoogleLoginButton;