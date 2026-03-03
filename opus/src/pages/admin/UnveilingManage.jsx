import { useEffect, useState } from "react";
import axiosApi from "../../api/axiosAPI";
import "../../css/GoodsRegist.css";

const STATUS_LABEL = {
  LIVE: "진행중",
  UPCOMING: "예정",
  ENDED: "종료",
};

const STATUS_COLOR = {
  LIVE:     { background: "#dcfce7", color: "#16a34a" },
  UPCOMING: { background: "#dbeafe", color: "#1d4ed8" },
  ENDED:    { background: "#f3f4f6", color: "#6b7280" },
};

const EMPTY_FORM = {
  unveilingTitle:     "",
  productionArtist:   "",
  productionYear:     "",
  productionMaterial: "",
  productionSize:     "",
  startPrice:         "",
  finishDate:         "",
  productionDetail:   "",
  artistDetail:       "",
  unveilingStatus:    "UPCOMING",
  thumbUrl:           "",
};

const UnveilingManage = () => {
  const [view, setView]                   = useState("list");
  const [items, setItems]                 = useState([]);
  const [loading, setLoading]             = useState(false);
  const [form, setForm]                   = useState({ ...EMPTY_FORM });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosApi.get("/admin/unveilings");
      setItems(res.data);
    } catch (e) {
      console.error(e);
      alert("경매 목록 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === "list") fetchList();
  }, [view]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.unveilingTitle || !form.productionArtist || !form.startPrice || !form.finishDate) {
      alert("작품명, 작가명, 시작가, 마감일시는 필수입니다.");
      return;
    }

    setSubmitLoading(true);
    try {
      await axiosApi.post("/admin/unveilings", {
        ...form,
        startPrice: Number(form.startPrice),
      });
      alert("경매가 등록되었습니다.");
      setForm({ ...EMPTY_FORM });
      setView("list");
    } catch (e) {
      console.error(e);
      alert("경매 등록에 실패했습니다.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#111827", margin: 0 }}>경매 관리</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button className={`filter-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>목록</button>
          <button className={`filter-btn ${view === "regist" ? "active" : ""}`} onClick={() => setView("regist")}>+ 경매 등록</button>
        </div>
      </div>

      {/* ===== 목록 탭 ===== */}
      {view === "list" && (
        <div>
          {loading ? (
            <div className="orders-empty"><p>불러오는 중...</p></div>
          ) : items.length === 0 ? (
            <div className="orders-empty">
              <i className="fa-solid fa-gavel"></i>
              <p>등록된 경매가 없습니다.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                    {["번호", "작품명", "작가", "상태", "시작가", "현재가", "응찰수", "마감일시"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.unveilingNo}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
                      <td style={{ padding: "12px 16px", color: "#6b7280" }}>{item.unveilingNo}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111827" }}>{item.unveilingTitle}</td>
                      <td style={{ padding: "12px 16px", color: "#374151" }}>{item.productionArtist}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700, ...(STATUS_COLOR[item.unveilingStatus] ?? STATUS_COLOR.ENDED) }}>
                          {STATUS_LABEL[item.unveilingStatus] ?? item.unveilingStatus}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#374151" }}>₩{Number(item.startPrice).toLocaleString("ko-KR")}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111827" }}>₩{Number(item.currentPrice).toLocaleString("ko-KR")}</td>
                      <td style={{ padding: "12px 16px", color: "#374151" }}>{item.biddingCount}회</td>
                      <td style={{ padding: "12px 16px", color: "#374151", whiteSpace: "nowrap" }}>
                        {item.finishDate ? String(item.finishDate).replace("T", " ").slice(0, 16) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== 등록 탭 ===== */}
      {view === "regist" && (
        <div className="goods-regist">

          {/* 작품 정보 */}
          <section className="regist-section">
            <h3 className="regist-section__title">작품 정보</h3>
            <div className="regist-grid">

              <div className="regist-field regist-field--wide">
                <label className="regist-label">작품명 *</label>
                <input className="regist-input" name="unveilingTitle"
                  value={form.unveilingTitle} onChange={handleChange} placeholder="작품명 입력" />
              </div>

              <div className="regist-field">
                <label className="regist-label">작가명 *</label>
                <input className="regist-input" name="productionArtist"
                  value={form.productionArtist} onChange={handleChange} placeholder="작가명 입력" />
              </div>

              <div className="regist-field">
                <label className="regist-label">제작연도</label>
                <input className="regist-input" name="productionYear"
                  value={form.productionYear} onChange={handleChange} placeholder="예: 2023" />
              </div>

              <div className="regist-field">
                <label className="regist-label">재료</label>
                <input className="regist-input" name="productionMaterial"
                  value={form.productionMaterial} onChange={handleChange} placeholder="예: 캔버스에 아크릴" />
              </div>

              <div className="regist-field">
                <label className="regist-label">크기</label>
                <input className="regist-input" name="productionSize"
                  value={form.productionSize} onChange={handleChange} placeholder="예: 100×80cm" />
              </div>

              <div className="regist-field regist-field--wide">
                <label className="regist-label">작품 설명</label>
                <textarea className="regist-textarea" name="productionDetail"
                  value={form.productionDetail} onChange={handleChange}
                  placeholder="작품에 대한 상세 설명을 입력하세요." rows={4} />
              </div>

              <div className="regist-field regist-field--wide">
                <label className="regist-label">작가 소개</label>
                <textarea className="regist-textarea" name="artistDetail"
                  value={form.artistDetail} onChange={handleChange}
                  placeholder="작가에 대한 소개를 입력하세요." rows={4} />
              </div>

            </div>
          </section>

          {/* 이미지 */}
          <section className="regist-section">
            <h3 className="regist-section__title">작품 이미지</h3>
            <p className="regist-desc">Google Cloud Storage에 업로드된 이미지 URL을 입력하세요.</p>
            <div className="regist-grid">
              <div className="regist-field regist-field--wide">
                <label className="regist-label">이미지 URL</label>
                <input className="regist-input" name="thumbUrl"
                  value={form.thumbUrl} onChange={handleChange}
                  placeholder="https://storage.googleapis.com/..." />
              </div>

              {form.thumbUrl && (
                <div className="regist-field regist-field--wide">
                  <label className="regist-label">미리보기</label>
                  <img
                    src={form.thumbUrl}
                    alt="미리보기"
                    style={{ width: "200px", height: "250px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              )}
            </div>
          </section>

          {/* 경매 설정 */}
          <section className="regist-section">
            <h3 className="regist-section__title">경매 설정</h3>
            <div className="regist-grid">

              <div className="regist-field">
                <label className="regist-label">시작가 (원) *</label>
                <input className="regist-input" name="startPrice" type="number"
                  value={form.startPrice} onChange={handleChange} placeholder="0" min="0" />
              </div>

              <div className="regist-field">
                <label className="regist-label">경매 상태</label>
                <select className="regist-select" name="unveilingStatus"
                  value={form.unveilingStatus} onChange={handleChange}>
                  <option value="UPCOMING">예정 (UPCOMING)</option>
                  <option value="LIVE">진행중 (LIVE)</option>
                </select>
              </div>

              <div className="regist-field regist-field--wide">
                <label className="regist-label">마감 일시 *</label>
                <input className="regist-input" name="finishDate" type="datetime-local"
                  value={form.finishDate} onChange={handleChange} />
              </div>

            </div>
          </section>

          {/* 제출 버튼 */}
          <div className="regist-actions">
            <button className="regist-submit-btn" onClick={handleSubmit} disabled={submitLoading}>
              {submitLoading ? "등록 중..." : "경매 등록하기"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default UnveilingManage;