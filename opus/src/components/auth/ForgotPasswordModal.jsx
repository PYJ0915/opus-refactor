import { useState } from "react";
import axiosApi from "../../api/axiosAPI";
import { toast } from "react-toastify";

export default function ForgotPasswordModal({ open, onClose }) {
  const [step, setStep] = useState(1); // 1: 이메일 입력, 2: 인증코드+새 비밀번호
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwConfirm, setNewPwConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) return toast.error("이메일을 입력해주세요.");
    setLoading(true);
    try {
      await axiosApi.post("/auth/password-reset/send", { email });
      toast.success("인증번호가 발송되었습니다.");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data || "발송에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!code.trim()) return toast.error("인증번호를 입력해주세요.");
    if (newPw !== newPwConfirm) return toast.error("비밀번호가 일치하지 않습니다.");
    setLoading(true);
    try {
      await axiosApi.post("/auth/password-reset/confirm", { email, code, newPw });
      toast.success("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
      onClose();
    } catch (err) {
      toast.error(err.response?.data || "변경에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="lm-overlay" role="dialog">
      <div className="lm-modal">
        <div className="lm-header">
          <h2 className="lm-title">비밀번호 찾기</h2>
          <button className="lm-close" onClick={onClose}>✕</button>
        </div>

        <div className="lm-body">
          {step === 1 && (
            <>
              <label className="lm-label">가입한 이메일
                <input className="lm-input" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com" />
              </label>
              <button className="lm-submit" onClick={handleSendCode} disabled={loading}>
                {loading ? "발송 중..." : "인증번호 받기"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <label className="lm-label">인증번호
                <input className="lm-input" type="text" value={code}
                  onChange={(e) => setCode(e.target.value)} placeholder="6자리 숫자" />
              </label>
              <label className="lm-label">새 비밀번호
                <input className="lm-input" type="password" value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="영문, 숫자, 특수문자 포함 8~16자" />
              </label>
              <label className="lm-label">새 비밀번호 확인
                <input className="lm-input" type="password" value={newPwConfirm}
                  onChange={(e) => setNewPwConfirm(e.target.value)} />
              </label>
              <button className="lm-submit" onClick={handleReset} disabled={loading}>
                {loading ? "변경 중..." : "비밀번호 변경"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}