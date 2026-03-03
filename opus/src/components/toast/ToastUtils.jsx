import { toast } from "react-toastify";

// 1. 토스트 내부 UI
const ConfirmContent = ({ closeToast, title, message, onConfirm, confirmText }) => {
  // 특정 문구 강조
const formatMessage = (msg) => {
    if (typeof msg !== "string") return msg;

    const targetText = "구글 로그인은 추가로 연동해제 해주세요.";
    
    if (msg.includes(targetText)) {
      const parts = msg.split(targetText);
      return (
        <>
          {parts[0]}
          <span style={{ color: "red", fontWeight: "bold" }}>{targetText}</span>
          {parts[1]}
        </>
      );
    }
    return msg;
  };

  return (
    <div style={{ padding: "4px" }}>
      <p style={{ fontWeight: "500", fontSize: "16px",marginBottom: "16px",
                  color: "#111", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
        {title}
      </p>

      {message && (
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "16px",
                    whiteSpace: "pre-wrap" }}>
          {formatMessage(message)}
        </p>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={closeToast}
          style={{ flex: 1, padding: "10px", cursor: "pointer", background: "#eee",
                  border: "none", borderRadius: "6px", fontWeight: "600" }}
        >
          취소
        </button>

        <button
          onClick={() => { onConfirm(); closeToast(); }}
          style={{ flex: 1, padding: "10px", cursor: "pointer", background: "#000",
                    color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600" }}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

// 2. 외부 호출 함수
export const showConfirm = (title, message, onConfirm, confirmText = "확인") => {
  toast(
    ({ closeToast }) => (
      <ConfirmContent
        title={title}
        message={message}
        onConfirm={onConfirm}
        confirmText={confirmText}
        closeToast={closeToast}
      />
    ),
    {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      style: { width: "400px", pointerEvents: "auto" }, // 개별 토스트는 클릭 허용
      toastId: "confirm-toast",
    }
  );
};