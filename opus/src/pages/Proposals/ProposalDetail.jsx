import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import { useAuthStore } from "../../components/auth/useAuthStore";
import "../../css/proposals-detail.css";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ProposalDetail = () => {
  const { boardNo } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn, member } = useAuthStore();

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 이미지 전부 깨졌을 때 fallback 1장만 띄우기 위한 카운트
  const [brokenCount, setBrokenCount] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL;
  const FALLBACK_IMG = "/proposals-no-image.webp";

  const categoryLabel = {
    musical: "뮤지컬",
    exhibition: "전시",
    auction: "경매",
    goods: "굿즈",
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);

        const response = await axiosApi.get(`/api/board/detail/${boardNo}`);
        const detail = response.data;

        if (!detail || detail.boardDelFl === "Y") {
          alert("존재하지 않거나 삭제된 게시글입니다.");
          navigate("/proposals");
          return;
        }

        setData(detail);
      } catch (error) {
        console.error("상세 정보 로드 실패:", error);
        alert("게시글을 불러올 수 없습니다.");
        navigate("/proposals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [boardNo, navigate]);

  // "/images/board/xxx.jpg" 같은 상대경로를 API 서버로 붙여서 절대경로로 변환
  const toAbsUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  // 이미지 리스트 (0~5장)
  const images = useMemo(() => {
    const list = data?.imageList ?? [];

    return list
      .map((img) => {
        if (img.boardImgFullpath) return toAbsUrl(img.boardImgFullpath);
        if (img.boardImgPath && img.boardImgRe) return toAbsUrl(img.boardImgPath + img.boardImgRe);
        if (img.imgPath && img.imgRename) return toAbsUrl(img.imgPath + img.imgRename);
        return "";
      })
      .filter(Boolean);
  }, [data, API_BASE]);

  // 게시글(또는 이미지 목록) 바뀌면 깨짐 카운트 초기화
  useEffect(() => {
    setBrokenCount(0);
  }, [boardNo, images.length]);

  const handleDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    try {
      await axiosApi.delete(`/api/board/delete/${boardNo}`);
      alert("삭제되었습니다.");
      navigate("/proposals", { state: location.state });
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const formatDate = (iso) => (iso ? iso.split(" ")[0].replaceAll("-", ".") : "");

  const handleGoList = () => {
    if (!data) return;

    const targetTab = data.boardTypeCode === 2 ? "promotion" : "notice";
    navigate("/proposals", {
      state: {
        activeTab: targetTab,
        currentPage: location.state?.currentPage ?? 1,
      },
    });
  };

  if (isLoading) return <LoadingSpinner text="게시글을 불러오고 있습니다!" />;
  if (!data) return null;

  const role = member?.role;
  const isOwner = Number(data.memberNo) === Number(member?.memberNo);
  const canEditDelete =
    isLoggedIn && (role === "ADMIN" || (role === "COMPANY" && data.boardTypeCode === 2 && isOwner));

  // 이미지가 있는데 전부 깨졌으면 fallback 1장만
  const allBroken = images.length > 0 && brokenCount >= images.length;

  return (
    <main className="proposal-detail-page">
      <div className="container detail-container">
        <header className="detail-header">
          <div className="detail-meta">
            <h1 className="detail-title">
              {data.boardCategory && categoryLabel[data.boardCategory]
                ? `[${categoryLabel[data.boardCategory]}] `
                : ""}
              {data.boardTitle}
            </h1>

            <div className="detail-info">
              <span>{data.writerCompany}</span>
              <span>{formatDate(data.boardWriteDate)}</span>
              <span>조회수 {data.boardViewCount}</span>
            </div>
          </div>
        </header>

        {images.length > 0 && (
          allBroken ? (
            <section className="detail-gallery">
              <div className="gallery-grid">
                <div className="gallery-item">
                  <img
                    src={FALLBACK_IMG}
                    alt="no-image"
                    onError={(e) => {
                      // fallback마저 없으면 깨끗하게 숨김
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            </section>
          ) : (
            <section className="detail-gallery">
              <div className="gallery-grid">
                {images.map((src, idx) => (
                  <div className="gallery-item" key={`${src}-${idx}`}>
                    <img
                      src={src}
                      alt={`image-${idx + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        const el = e.currentTarget;

                        if (el.dataset.broken === "1") return;
                        el.dataset.broken = "1";

                        el.style.display = "none";
                        el.onerror = null; // 재호출 방지

                        setBrokenCount((c) => c + 1); // 필요할 때만
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )
        )}

        <section className="detail-content">
          <div className="detail-content-text">{data.boardContent}</div>
        </section>

        <footer className="detail-footer">
          <button className="btn-list" onClick={handleGoList}>
            목록으로
          </button>

          {canEditDelete && (
            <div className="btn-group">
              <button
                className="btn-edit"
                onClick={() => navigate(`/proposals/edit/${boardNo}`, { state: location.state })}
              >
                수정
              </button>
              <button className="btn-delete" onClick={handleDelete}>
                삭제
              </button>
            </div>
          )}
        </footer>
      </div>
    </main>
  );
};

export default ProposalDetail;