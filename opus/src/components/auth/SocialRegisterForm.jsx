export default function SocialRegisterForm({
  email,
  phoneNumber,
  setPhoneNumber,
  isTelChecked,
  telMsg,
  onCheckTel,
  handlePhoneChange,
}) {
  return (
    <>
      <p style={{ fontSize: "15px", marginBottom: "15px", color: "#666", lineHeight: "1.5" }}>
        <strong>{email}</strong>
        <br />
        해당 사이트 이용을 위해 연락처가 추가해주세요.
      </p>

      <label className="lm-label">연락처</label>

      <div style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
        <input
          className="lm-input"
          type="tel"
          placeholder="010-1234-5678"
          maxLength="13"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value, setPhoneNumber)}
          style={{ flex: 1, marginBottom: 0 }}
        />

        <button
          type="button"
          onClick={onCheckTel}
          style={{
            width: "80px",
            padding: "0 10px",
            fontSize: "12px",
            backgroundColor: "#333",
            color: "#fff",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          중복확인
        </button>
      </div>

      {telMsg && (
        <p style={{ 
          fontSize: "12px", 
          color: isTelChecked ? "blue" : "red", 
          marginBottom: "15px",
          marginTop: "2px" 
        }}>
          {telMsg}
        </p>
      )}
    </>
  );
}