import { useState, useEffect } from "react";
import "../../css/loginModal.css";
import axiosApi from "../../api/axiosAPI";
import { useAuthValidation } from "./useAuthValidation";
import { toast } from "react-toastify";

export default function SignupModal({ open, onClose }) {
  const { isTelChecked, setIsTelChecked, handleCheckTel } = useAuthValidation();

  const [formData, setFormData] = useState({
    memberEmail: "",
    memberPw: "",
    memberPwConfirm: "",
    memberTel: "",
  });

  const [authCode, setAuthCode] = useState("");
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      setAuthCode("");
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? `0${s}` : s}`;
  };

  useEffect(() => {
    if (!open) {
      setFormData({
        memberEmail: "",
        memberPw: "",
        memberPwConfirm: "",
        memberTel: "",
      });
      setAuthCode("");
      setIsEmailChecked(false);
      setIsEmailSent(false);
      setIsEmailVerified(false);
      setIsTelChecked(false);
      setIsTimerActive(false);
      setTimeLeft(300);
    }
  }, [open, setIsTelChecked]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "memberTel") {
      const cleaned = value.replace(/[^0-9]/g, "");
      let formatted = cleaned;

      if (cleaned.length > 3 && cleaned.length <= 7) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
      } else if (cleaned.length > 7) {
        formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
      }

      setFormData({ ...formData, [name]: formatted });
      setIsTelChecked(false);
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === "memberEmail") {
      setIsEmailChecked(false);
      setIsEmailSent(false);
      setIsEmailVerified(false);
      setIsTimerActive(false);
    }
  };

  const handleCheckEmail = async () => {
    if (!formData.memberEmail) {
      toast.error("이메일을 입력해주세요.", { toastId: "signup-email-empty" });
      return;
    }
    if (!emailRegex.test(formData.memberEmail)) {
      toast.error("올바른 이메일 형식이 아닙니다.", { toastId: "signup-email-invalid" });
      return;
    }

    try {
      setLoading(true);
      const res = await axiosApi.post("/auth/check-email", { email: formData.memberEmail });

      if (res.data === true) {
        toast.error("사용 중인 이메일입니다.", { toastId: "signup-email-duplicate" });
        setIsEmailChecked(false);
      } else {
        toast.success("사용 가능한 이메일입니다.", { toastId: "signup-email-available" });
        setIsEmailChecked(true);
      }
    } catch (err) {
      toast.error("이메일 중복 확인 실패", { toastId: "signup-email-check-fail" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    if (!formData.memberEmail) {
      toast.error("이메일을 입력해주세요.", { toastId: "signup-email-empty" });
      return;
    }
    if (!isEmailChecked) {
      toast.error("이메일 중복 확인을 먼저 해주세요.", { toastId: "signup-email-not-checked" });
      return;
    }

    try {
      setLoading(true);
      await axiosApi.post("/auth/email-send", { email: formData.memberEmail });

      toast.success("인증번호가 발송되었습니다.", { toastId: "signup-email-code-sent" });

      setIsEmailSent(true);
      setTimeLeft(300);
      setIsTimerActive(true);
    } catch (err) {
      toast.error("인증번호 발송 실패", { toastId: "signup-email-send-fail" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (timeLeft === 0) {
      toast.error("시간이 만료되었습니다.", { toastId: "signup-email-timeout" });
      return;
    }
    if (!authCode || authCode.trim().length === 0) {
      toast.error("인증번호를 입력해주세요.", { toastId: "signup-email-code-empty" });
      return;
    }

    try {
      const res = await axiosApi.post("/auth/email-verify", {
        email: formData.memberEmail,
        code: authCode,
      });

      if (res.data === true) {
        toast.success("인증에 성공했습니다.", { toastId: "signup-email-verified" });
        setIsEmailVerified(true);
        setIsTimerActive(false);
      } else {
        toast.error("인증번호가 일치하지 않습니다.", { toastId: "signup-email-code-mismatch" });
      }
    } catch (err) {
      toast.error("인증 확인 오류", { toastId: "signup-email-verify-fail" });
    }
  };

  // 최종 회원가입 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*\-_])[A-Za-z\d!@#$%^&*\-_]{8,16}$/;

    if (!pwRegex.test(formData.memberPw)) {
      toast.error(<div>"비밀번호는 영문, 숫자, 특수문자(!@#$%^&*-_) 포함하여<br /> 8~16자여야 합니다."</div>, {
        toastId: "signup-pw-invalid",
      });
      return;
    }

    if (!isEmailVerified) {
      toast.error("이메일 인증을 완료해주세요.", { toastId: "signup-email-not-verified" });
      return;
    }

    if (!isTelChecked) {
      toast.error("연락처 중복 확인을 완료해주세요.", { toastId: "signup-tel-not-checked" });
      return;
    }

    if (formData.memberPw !== formData.memberPwConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.", { toastId: "signup-pw-mismatch" });
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = formData.memberTel.replace(/[^0-9]/g, "");

      await axiosApi.post("/auth/signup", {
        memberEmail: formData.memberEmail,
        memberPw: formData.memberPw,
        memberTel: cleanPhone,
      });

      toast.success("회원가입이 완료되었습니다!", { toastId: "signup-success" });
      onClose?.();
    } catch (err) {
      toast.error("회원가입 실패: " + (err.response?.data || "다시 확인해주세요."), {
        toastId: "signup-fail",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="lm-overlay">
      <div className="lm-modal">
        <div className="lm-header">
          <h2 className="lm-title">회원가입</h2>
          <button className="lm-close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="lm-body" onSubmit={handleSubmit}>
          <label className="lm-label">
            이메일 주소
            <div className="lm-input-group">
              <input
                className="lm-input"
                style={{ flex: 1 }}
                name="memberEmail"
                type="email"
                placeholder="example@gmail.com"
                value={formData.memberEmail}
                onChange={handleChange}
                disabled={isEmailVerified}
                required
              />
              <button
                type="button"
                onClick={handleCheckEmail}
                className="lm-link"
                disabled={isEmailChecked || isEmailVerified || loading}
                style={{ color: isEmailChecked ? "green" : "" }}
              >
                {isEmailChecked ? "확인됨" : "중복확인"}
              </button>
            </div>
          </label>

          {isEmailChecked && !isEmailVerified && (
            <div className="lm-auth-section" style={{ animation: "fadeIn 0.3s" }}>
              <label className="lm-label">
                인증번호
                <div className="lm-input-group">
                  <input
                    className="lm-input"
                    style={{ flex: 1 }}
                    type="text"
                    placeholder={isEmailSent ? "6자리 숫자 입력" : "인증요청을 눌러주세요"}
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    disabled={!isEmailSent || timeLeft === 0}
                  />
                  <button type="button" onClick={handleSendCode} className="lm-link" disabled={loading}>
                    {isEmailSent ? "재발송" : "인증요청"}
                  </button>
                  {isEmailSent && (
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      className="lm-link"
                      style={{ color: "#007bff", fontWeight: "bold" }}
                    >
                      확인
                    </button>
                  )}
                </div>
              </label>

              {isEmailSent && (
                <p
                  style={{
                    color: timeLeft > 0 ? "red" : "gray",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  {timeLeft > 0 ? `남은 시간: ${formatTime(timeLeft)}` : "인증 시간이 만료되었습니다."}
                </p>
              )}
            </div>
          )}

          {isEmailVerified && (
            <p style={{ color: "blue", fontSize: "12px", marginBottom: "10px" }}>
              ✓ 이메일 인증 완료
            </p>
          )}

          <label className="lm-label">
            비밀번호
            <input
              className="lm-input"
              name="memberPw"
              type="password"
              placeholder="영문, 숫자, 특수문자(!@#$%^&*-_) 포함 8~16자"
              value={formData.memberPw}
              onChange={handleChange}
              required
            />
          </label>

          <label className="lm-label">
            비밀번호 확인
            <input
              className="lm-input"
              name="memberPwConfirm"
              type="password"
              value={formData.memberPwConfirm}
              onChange={handleChange}
              required
            />
            {formData.memberPwConfirm && (
              <p
                style={{
                  color: formData.memberPw === formData.memberPwConfirm ? "blue" : "red",
                  fontSize: "12px",
                }}
              >
                {formData.memberPw === formData.memberPwConfirm
                  ? "비밀번호가 일치합니다."
                  : "비밀번호가 일치하지 않습니다."}
              </p>
            )}
          </label>

          <label className="lm-label">
            연락처
            <div className="lm-input-group">
              <input
                className="lm-input"
                style={{ flex: 1 }}
                name="memberTel"
                type="tel"
                placeholder="010-0000-0000"
                value={formData.memberTel}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => handleCheckTel(formData.memberTel)}
                className="lm-link"
                disabled={isTelChecked || loading}
                style={{ color: isTelChecked ? "green" : "" }}
              >
                {isTelChecked ? "확인됨" : "중복확인"}
              </button>
            </div>
          </label>

          <button className="lm-submit" type="submit" disabled={loading || !isEmailVerified || !isTelChecked}>
            {loading ? "처리 중..." : "가입하기"}
          </button>
        </form>
      </div>
    </div>
  );
}