import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import axiosUpload from "../../api/axiosUpload";
import { useAuthStore } from "../../components/auth/useAuthStore";
import "../../css/proposalsWrite.css";

const MAX_IMAGES = 5;

const ProposalWrite = () => {

  const { boardNo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, member } = useAuthStore();

  const isEditMode = !!boardNo;
  const role = member?.role;

  const API_BASE = import.meta.env.VITE_API_URL;
  const FALLBACK_IMG = "/images/no-image.webp";

  const [formData, setFormData] = useState({
    writerCompany: "",
    boardTitle: "",
    boardCategory: "musical",
    boardTypeCode: 1,
    boardContent: "",
  });

  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [deleteImgNos, setDeleteImgNos] = useState(new Set());

  const newPreviews = useMemo(
    () => newImages.map((f) => ({ url: URL.createObjectURL(f) })),
    [newImages]
  );

  useEffect(() => {
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [newPreviews]);

  useEffect(() => {
    if (isLoggedIn === false) {
      alert("로그인이 필요합니다.");
      navigate("/proposals");
      return;
    }
    if (!isLoggedIn) return;

    if (role === "ADMIN" || role === "COMPANY") return;

    alert("권한이 없습니다.");
    navigate("/proposals");
  }, [isLoggedIn, role, navigate]);

  // 관리자 신규 작성 시, 목록에서 넘어온 탭(activeTab) 기준으로 boardTypeCode 자동 세팅
  useEffect(() => {
    if (isEditMode) return;
    if (role !== "ADMIN") return;

    const fromTab = location.state?.activeTab; // "notice" | "promotion"
    const nextType = fromTab === "promotion" ? 2 : 1;

    setFormData((prev) => ({ ...prev, boardTypeCode: nextType }));
  }, [isEditMode, role, location.state]);

  useEffect(() => {
    if (!isEditMode && role === "COMPANY") {
      setFormData((prev) => ({ ...prev, boardTypeCode: 2 }));
    }
  }, [isEditMode, role]);

  // 이벤트 게시판에서는 OPUS 카테고리 자동 제거
  useEffect(() => {
    if (Number(formData.boardTypeCode) === 2 && formData.boardCategory === "opus") {
      setFormData((prev) => ({ ...prev, boardCategory: "musical" }));
    }
  }, [formData.boardTypeCode, formData.boardCategory]);

  // 관리자 신규 작성 시 writerCompany 기본값 "관리자"로 세팅
  useEffect(() => {
    if (!isEditMode && role === "ADMIN") {
      setFormData((prev) => ({
        ...prev,
        writerCompany: prev.writerCompany?.trim() ? prev.writerCompany : "관리자",
      }));
    }
  }, [isEditMode, role]);

  useEffect(() => {
    if (!isEditMode) return;
    if (!isLoggedIn) return;

    const toAbsUrl = (path) => {
      if (!path) return "";
      if (/^https?:\/\//i.test(path)) return path;
      return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
    };

    const fetchDetail = async () => {
      try {
        const res = await axiosApi.get(`/api/board/detail/${boardNo}`);
        const data = res.data;

        const isOwner = Number(data.memberNo) === Number(member?.memberNo);

        if (role === "COMPANY") {
          if (Number(data.boardTypeCode) !== 2) {
            alert("기업회원은 이벤트/홍보글만 수정할 수 있습니다.");
            navigate("/proposals", { state: location.state });
            return;
          }
          if (!isOwner) {
            alert("본인 글만 수정할 수 있습니다.");
            navigate("/proposals", { state: location.state });
            return;
          }
        }

        setFormData({
          writerCompany: data.writerCompany ?? "",
          boardTitle: data.boardTitle ?? "",
          boardCategory: data.boardCategory ?? "musical",
          boardTypeCode: Number(data.boardTypeCode) || 1,
          boardContent: data.boardContent ?? "",
        });

        const list = data?.imageList ?? [];
        const mapped = list
          .map((img) => {
            const rel =
              img.boardImgFullpath ||
              (img.boardImgPath && img.boardImgRe ? img.boardImgPath + img.boardImgRe : "");
            return {
              boardImgNo: img.boardImgNo,
              url: toAbsUrl(rel),
              order: img.boardImgOrder ?? 0,
            };
          })
          .filter((x) => x.boardImgNo && x.url)
          .sort((a, b) => a.order - b.order);

        setExistingImages(mapped);
        setDeleteImgNos(new Set());
        setNewImages([]);
      } catch (e) {
        alert("데이터를 불러올 수 없습니다.");
        navigate("/proposals", { state: location.state });
      }
    };

    fetchDetail();
  }, [
    boardNo,
    isEditMode,
    isLoggedIn,
    role,
    member?.memberNo,
    navigate,
    location.state,
    API_BASE,
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "boardTypeCode" ? Number(value) : value,
    }));
  };

  const toggleDeleteExisting = (imgNo) => {
    setDeleteImgNos((prev) => {
      const next = new Set(prev);
      if (next.has(imgNo)) next.delete(imgNo);
      else next.add(imgNo);
      return next;
    });
  };

  // 새 이미지 추가 선택(추가 방식 + 최대 5장 제한)
  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainExistingCount = existingImages.filter((x) => !deleteImgNos.has(x.boardImgNo)).length;

    const remainSlots = MAX_IMAGES - remainExistingCount - newImages.length;
    if (remainSlots <= 0) {
      alert(`이미지는 최대 ${MAX_IMAGES}장, 10MB까지 가능합니다. (기존 이미지 포함)`);
      e.target.value = "";
      return;
    }

    const next = files.slice(0, remainSlots);

    if (files.length > remainSlots) {
      alert(`이미지는 최대 ${MAX_IMAGES}장, 10MB까지 가능합니다. (추가 가능: ${remainSlots}장)`);
    }

    setNewImages((prev) => [...prev, ...next]);
    e.target.value = "";
  };

  const removeNewImageAt = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === "COMPANY" && Number(formData.boardTypeCode) !== 2) {
      return alert("기업회원은 이벤트/홍보글만 작성/수정 가능합니다.");
    }

    if (role === "COMPANY" && !formData.writerCompany.trim()) {
      return alert("작성자(회사명)를 입력해주세요.");
    }
    if (!formData.boardTitle.trim()) return alert("제목을 입력해주세요.");
    if (!formData.boardContent.trim()) return alert("내용을 입력해주세요.");

    const remainExistingCount = existingImages.filter((x) => !deleteImgNos.has(x.boardImgNo)).length;
    if (remainExistingCount + newImages.length > MAX_IMAGES) {
      return alert(
        `이미지는 최대 ${MAX_IMAGES}장까지 가능합니다. (현재: ${
          remainExistingCount + newImages.length
        }장)`
      );
    }

    const boardPayload = {
    ...formData,
    writerCompany: formData.writerCompany,
    boardNo: isEditMode ? Number(boardNo) : undefined,
    memberNo: member?.memberNo,
    };

    try {
      if (isEditMode) {
        const hasDelete = deleteImgNos.size > 0;
        const hasNew = newImages.length > 0;

        // 텍스트만 수정
        if (!hasDelete && !hasNew) {
          await axiosApi.put(`/api/board/update/${boardNo}`, boardPayload);
          alert("수정되었습니다.");
        } else {
          // 부분 이미지 수정 + (텍스트도 함께)
          const fd = new FormData();

          fd.append(
            "board",
            new Blob([JSON.stringify(boardPayload)], {
              type: "application/json",
            })
          );

          fd.append("deleteImgNos", JSON.stringify(Array.from(deleteImgNos)));
          newImages.forEach((file) => fd.append("images", file));

          await axiosUpload.put(`/api/board/update-images/${boardNo}`, fd);
          alert("수정되었습니다.");
        }
      } else {
        const fd = new FormData();
        fd.append("board", new Blob([JSON.stringify(boardPayload)], { type: "application/json" }));
        newImages.forEach((file) => fd.append("images", file));

        await axiosUpload.post("/api/board/insert", fd);
        alert("등록되었습니다.");
      }

      const targetTab =
        location.state?.activeTab || (Number(formData.boardTypeCode) === 2 ? "promotion" : "notice");

      const targetPage = isEditMode ? location.state?.currentPage || 1 : 1;

      navigate("/proposals", {
        state: { activeTab: targetTab, currentPage: targetPage },
      });
    } catch (error) {
      console.error("저장 실패 상세:", error.response?.data);
      const errorMsg = error.response?.data?.message || "서버 오류가 발생했습니다.";
      alert(`저장 실패: ${errorMsg}`);
    }
  };

  const remainExistingCount = existingImages.filter((x) => !deleteImgNos.has(x.boardImgNo)).length;
  const totalCount = (isEditMode ? remainExistingCount : 0) + newImages.length;

  return (
    <main className="proposals-write-page">
      <div className="container write-container">
        <header className="write-header">
          <h1>{isEditMode ? "게시글 수정" : "새 게시글 작성"}</h1>

          <p className="write-sub">
            이미지는 최대 {MAX_IMAGES}장, 10MB까지 업로드 가능합니다. (포스터 비율 3:4 추천)
          </p>
        </header>

        <form onSubmit={handleSubmit} className="write-form">
          <div className="form-section">
            <div className="form-group">
              <label>구분</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="boardTypeCode"
                    value="1"
                    disabled={role === "COMPANY"}
                    checked={Number(formData.boardTypeCode) === 1}
                    onChange={handleChange}
                  />
                  공지사항
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="boardTypeCode"
                    value="2"
                    checked={Number(formData.boardTypeCode) === 2}
                    onChange={handleChange}
                  />
                  홍보
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>카테고리</label>
              <select
                name="boardCategory"
                value={formData.boardCategory}
                onChange={handleChange}
                className="pp-select"
              >
                {/* 공지(1)일 때만 OPUS 노출 */}
                {Number(formData.boardTypeCode) === 1 && <option value="opus">OPUS</option>}
                <option value="musical">뮤지컬</option>
                <option value="exhibition">전시</option>
                <option value="auction">경매</option>
                <option value="goods">굿즈</option>
              </select>
            </div>
          </div>

          {(role === "COMPANY" || (role === "ADMIN" && isEditMode)) && (
            <div className="form-group">
              <label>작성자(회사명)</label>
              <input
                type="text"
                name="writerCompany"
                value={formData.writerCompany}
                onChange={handleChange}
                placeholder="회사명을 입력하세요"
                className="pp-input"
              />
            </div>
          )}

          <div className="form-group">
            <label className="label-row">
              이미지 업로드 <span className="hint">({totalCount}/{MAX_IMAGES})</span>
            </label>

            <div className="upload-row">
              <label className="upload-btn">
                파일 선택
                <input type="file" accept="image/*" multiple onChange={handleNewImagesChange} />
              </label>

              <div className="upload-help">이미지가 없으면 목록에서 기본 포스터가 표시됩니다. (jpg, jpeg, png, gif, webp 가능)</div>
            </div>

            {isEditMode && existingImages.length > 0 && (
              <div className="preview-grid">
                {existingImages.map((img, idx) => {
                  const willDelete = deleteImgNos.has(img.boardImgNo);

                  return (
                    <div
                      className={`preview-item ${willDelete ? "is-deleting" : ""}`}
                      key={img.boardImgNo}
                      title={willDelete ? "삭제 예정" : "유지"}
                    >
                      
                      <img
                        src={img.url}
                        alt={`existing-${idx}`}
                        onError={(e) => {
                          const el = e.currentTarget;

                          if (el.dataset.broken === "1") return;
                          el.dataset.broken = "1";

                          el.style.display = "none";
                          el.onerror = null; // 재호출 방지

                          setBrokenCount((c) => c + 1); // 필요할 때만
                        }}
                      />

                      <button
                        type="button"
                        className="preview-remove"
                        onClick={() => toggleDeleteExisting(img.boardImgNo)}
                      >
                        {willDelete ? "↩" : "×"}
                      </button>

                      {idx === 0 && !willDelete && <div className="preview-badge">썸네일</div>}
                      {willDelete && <div className="preview-badge">삭제예정</div>}
                    </div>
                  );
                })}
              </div>
            )}

            {newImages.length > 0 && (
              <div className="preview-grid">
                {newPreviews.map((p, idx) => (
                  <div className="preview-item" key={p.url}>
                    <img src={p.url} alt={`new-${idx}`} />
                    <button
                      type="button"
                      className="preview-remove"
                      onClick={() => removeNewImageAt(idx)}
                    >
                      ×
                    </button>
                    {idx === 0 && <div className="preview-badge">새 이미지</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>제목</label>
            <input
              type="text"
              name="boardTitle"
              value={formData.boardTitle}
              onChange={handleChange}
              placeholder="제목을 입력하세요"
              className="pp-input"
            />
          </div>

          <div className="form-group">
            <label>내용</label>
            <textarea
              name="boardContent"
              value={formData.boardContent}
              onChange={handleChange}
              placeholder="내용을 입력하세요"
              className="pp-textarea"
            />
          </div>

          <div className="write-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/proposals", { state: location.state })}
            >
              취소
            </button>
            <button type="submit" className="btn-submit">
              {isEditMode ? "수정완료" : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ProposalWrite;