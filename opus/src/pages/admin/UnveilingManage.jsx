import { useEffect, useRef, useState } from "react";
import axiosApi from "../../api/axiosAPI";
import axiosUpload from "../../api/axiosUpload"; // multipart 전송용
import "../../css/GoodsRegist.css";
import "../../css/UnveilingManage.css";
import { toast } from "react-toastify";
import { showConfirm } from "../../components/toast/ToastUtils";

const STATUS_LABEL = {
  LIVE: "진행중", UPCOMING: "예정", ENDED: "종료",
};

const STATUS_BADGE_CLASS = {
  LIVE:     "um-badge um-badge--live",
  UPCOMING: "um-badge um-badge--upcoming",
  ENDED:    "um-badge um-badge--ended",
};

const EMPTY_FORM = {
  unveilingTitle: "", productionArtist: "", productionYear: "",
  productionMaterial: "", productionSize: "", startPrice: "",
  startDate: "", finishDate: "",
  productionDetail: "", artistDetail: "",
  unveilingStatus: "UPCOMING",
};

const UnveilingManage = () => {
  const [view, setView]                   = useState("list");
  const [items, setItems]                 = useState([]);
  const [loading, setLoading]             = useState(false);
  const [form, setForm]                   = useState({ ...EMPTY_FORM });
  const [thumbFile, setThumbFile]         = useState(null);
  const [thumbPreview, setThumbPreview]   = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const fileInputRef                      = useRef(null);

  // ── 목록 조회 ──
  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await axiosApi.get("/admin/unveilings");
      setItems(res.data);
    } catch {
      toast.error("경매 목록 조회에 실패했습니다.");
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

  // ── 이미지 파일 선택 ──
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("이미지 파일은 10MB 이하만 가능합니다.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  // ── 이미지 제거 ──
  const handleRemoveImage = () => {
    setThumbFile(null);
    setThumbPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── 등록 제출 ──
  const handleSubmit = async () => {
    if (!form.unveilingTitle || !form.productionArtist ||
        !form.startPrice || !form.startDate || !form.finishDate) {
      toast.warning("작품명, 작가명, 시작가, 시작일시, 마감일시는 필수입니다.");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.finishDate)) {
      toast.warning("시작일시는 마감일시보다 빨라야 합니다.");
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    formData.set("startPrice", String(Number(form.startPrice)));
    if (thumbFile) {
      formData.append("thumbFile", thumbFile);
    }

    setSubmitLoading(true);
    try {
      await axiosUpload.post("/admin/unveilings", formData);
      toast.success("경매가 등록되었습니다.");
      setForm({ ...EMPTY_FORM });
      setThumbFile(null);
      setThumbPreview(null);
      setView("list");
    } catch {
      toast.error("경매 등록에 실패했습니다.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── 강제 상태 전환 ──
  const handleForceStatus = (unveilingNo, currentStatus) => {
    const nextStatus = currentStatus === "UPCOMING" ? "LIVE"
                     : currentStatus === "LIVE"     ? "ENDED"
                     : null;
    if (!nextStatus) { toast.error("이미 종료된 경매입니다."); return; }

    const label = nextStatus === "LIVE" ? "LIVE(진행중)" : "ENDED(종료)";

    showConfirm(
      `경매를 [${label}] 상태로 변경하시겠습니까?`,
      "이 작업은 되돌릴 수 없습니다.",
      async () => {
        try {
          await axiosApi.patch(
            `/admin/unveilings/${unveilingNo}/status`,
            { status: nextStatus }
          );
          toast.success(`[${label}] 상태로 변경되었습니다.`);
          fetchList();
        } catch {
          toast.error("상태 변경에 실패했습니다.");
        }
      },
      "변경"
    );
  };

  // ── JSX ──
  return (
    <div>
      {/* 헤더 */}
      <div className="um-header">
        <h2 className="um-header__title">경매 관리</h2>
        <div className="um-header__actions">
          <button
            className={`filter-btn ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            목록
          </button>
          <button
            className={`filter-btn ${view === "regist" ? "active" : ""}`}
            onClick={() => setView("regist")}
          >
            + 경매 등록
          </button>
        </div>
      </div>

      {/* ===== 목록 탭 ===== */}
      {view === "list" && (
        <div>
          {loading ? (
            <div className="orders-empty"><p>불러오는 중...</p></div>
          ) : items.length === 0 ? (
            <div className="orders-empty">
              <i className="fa-solid fa-gavel" />
              <p>등록된 경매가 없습니다.</p>
            </div>
          ) : (
            <div className="um-table-wrap">
              <table className="um-table">
                <thead>
                  <tr>
                    {["번호","작품명","작가","상태","시작가","현재가","응찰수","시작일시","마감일시","액션"]
                      .map(h => <th key={h}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.unveilingNo}>
                      <td className="um-td--no">{item.unveilingNo}</td>
                      <td className="um-td--title">{item.unveilingTitle}</td>
                      <td>{item.productionArtist}</td>

                      {/* 상태 뱃지 */}
                      <td>
                        <span className={STATUS_BADGE_CLASS[item.unveilingStatus] ?? "um-badge um-badge--ended"}>
                          {STATUS_LABEL[item.unveilingStatus] ?? item.unveilingStatus}
                        </span>
                      </td>

                      <td>₩{Number(item.startPrice).toLocaleString("ko-KR")}</td>
                      <td className="um-td--price">₩{Number(item.currentPrice).toLocaleString("ko-KR")}</td>
                      <td>{item.biddingCount}회</td>

                      {/* 시작일시 */}
                      <td className="um-td--nowrap">
                        {item.startDate
                          ? String(item.startDate).replace("T", " ").slice(0, 16)
                          : "-"}
                      </td>
                      {/* 마감일시 */}
                      <td className="um-td--nowrap">
                        {item.finishDate
                          ? String(item.finishDate).replace("T", " ").slice(0, 16)
                          : "-"}
                      </td>

                      {/* 강제 전환 버튼 */}
                      <td className="um-td--action">
                        {item.unveilingStatus === "UPCOMING" && (
                          <button
                            className="um-btn-start"
                            onClick={() => handleForceStatus(item.unveilingNo, item.unveilingStatus)}
                          >
                            ▶ 즉시 시작
                          </button>
                        )}
                        {item.unveilingStatus === "LIVE" && (
                          <button
                            className="um-btn-stop"
                            onClick={() => handleForceStatus(item.unveilingNo, item.unveilingStatus)}
                          >
                            ■ 강제 종료
                          </button>
                        )}
                        {item.unveilingStatus === "ENDED" && (
                          <span className="um-ended-label">종료됨</span>
                        )}
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
                  value={form.unveilingTitle} onChange={handleChange}
                  placeholder="작품명 입력" />
              </div>

              <div className="regist-field">
                <label className="regist-label">작가명 *</label>
                <input className="regist-input" name="productionArtist"
                  value={form.productionArtist} onChange={handleChange}
                  placeholder="작가명 입력" />
              </div>

              <div className="regist-field">
                <label className="regist-label">제작연도</label>
                <input className="regist-input" name="productionYear"
                  value={form.productionYear} onChange={handleChange}
                  placeholder="예: 2023" />
              </div>

              <div className="regist-field">
                <label className="regist-label">재료</label>
                <input className="regist-input" name="productionMaterial"
                  value={form.productionMaterial} onChange={handleChange}
                  placeholder="예: 캔버스에 아크릴" />
              </div>

              <div className="regist-field">
                <label className="regist-label">크기</label>
                <input className="regist-input" name="productionSize"
                  value={form.productionSize} onChange={handleChange}
                  placeholder="예: 100×80cm" />
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

          {/* 작품 이미지 — 파일 업로드 방식 */}
          <section className="regist-section">
            <h3 className="regist-section__title">작품 이미지</h3>
            <p className="regist-desc">JPG, PNG, WEBP 형식 / 최대 10MB</p>

            {thumbPreview ? (
              <div className="um-preview-wrap">
                <img src={thumbPreview} alt="미리보기" className="um-preview-img" />
                <button className="um-preview-remove" onClick={handleRemoveImage}>✕</button>
                <p className="um-preview-filename">{thumbFile?.name}</p>
              </div>
            ) : (
              <label className="regist-upload-btn">
                <i className="fa-solid fa-image" />
                이미지 선택
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </label>
            )}
          </section>

          {/* 경매 설정 */}
          <section className="regist-section">
            <h3 className="regist-section__title">경매 설정</h3>
            <div className="regist-grid">

              <div className="regist-field">
                <label className="regist-label">시작가 (원) *</label>
                <input className="regist-input" name="startPrice" type="number"
                  value={form.startPrice} onChange={handleChange}
                  placeholder="0" min="0" />
              </div>

              <div className="regist-field">
                <label className="regist-label">등록 상태</label>
                <select className="regist-select" name="unveilingStatus"
                  value={form.unveilingStatus} onChange={handleChange}>
                  <option value="UPCOMING">예정 (UPCOMING)</option>
                  <option value="LIVE">즉시 진행 (LIVE)</option>
                </select>
              </div>

              <div className="regist-field">
                <label className="regist-label">경매 시작일시 *</label>
                <input className="regist-input" name="startDate" type="datetime-local"
                  value={form.startDate} onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)} />
              </div>

              <div className="regist-field">
                <label className="regist-label">경매 마감일시 *</label>
                <input className="regist-input" name="finishDate" type="datetime-local"
                  value={form.finishDate} onChange={handleChange}
                  min={form.startDate || new Date().toISOString().slice(0, 16)} />
              </div>

            </div>
          </section>

          {/* 제출 버튼 */}
          <div className="regist-actions">
            <button className="regist-submit-btn" onClick={handleSubmit}
              disabled={submitLoading}>
              {submitLoading ? "등록 중..." : "경매 등록하기"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default UnveilingManage;
