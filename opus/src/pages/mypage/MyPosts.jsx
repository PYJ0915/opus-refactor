import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import { toast } from "react-toastify";
import { showConfirm } from "../../components/toast/ToastUtils";
import "../../css/myPosts.css";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function MyPosts() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL;
  const FALLBACK_IMG = "/proposals-no-image.webp";

  const categoryLabel = {
    musical: "뮤지컬",
    exhibition: "전시",
    auction: "경매",
    goods: "굿즈",
  };

  const toAbsUrl = (path) => {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        const res = await axiosApi.get("/api/board/my");
        setList(res.data || []);
      } catch (err) {
        toast.error(err?.response?.data?.message || "작성 게시글 조회 실패");
      } finally {
        setLoading(false);
      }
    };
    fetchMyPosts();
  }, []);

  const goDetail = (boardNo) => navigate(`/proposals/detail/${boardNo}`);
  const goEdit = (boardNo) => navigate(`/proposals/edit/${boardNo}`);

  const handleDelete = (e, boardNo) => {
    e.stopPropagation();

    showConfirm(
      "삭제하시겠습니까?",
      "삭제한 글은 복구가 불가능합니다.",
      async () => {
        try {
          await axiosApi.delete(`/api/board/delete/${boardNo}`);
          toast.success("삭제되었습니다.");
          setList((prev) => prev.filter((it) => it.boardNo !== boardNo));
        } catch (err) {
          toast.error(err?.response?.data || "삭제 실패");
        }
      },
      "삭제"
    );
  };

  const getThumb = (item) => {
    const t1 = item.thumbnailPath;
    if (t1) return toAbsUrl(t1);

    const first = item.imageList?.[0];
    if (first?.boardImgFullpath) return toAbsUrl(first.boardImgFullpath);
    if (first?.imgPath && first?.imgRename) return toAbsUrl(first.imgPath + first.imgRename);

    return FALLBACK_IMG;
  };

  return (
    <main className="proposals-page my-posts-page">
      <div className="my-posts-container">
      <header className="proposals-header">
        <h2>등록한 컨텐츠</h2>
        <p>내가 작성한 게시글을 확인/수정/삭제할 수 있습니다.</p>
      </header>

      {loading ? (
        <LoadingSpinner text="게시글을 불러오고 있습니다!" />
      ) : list.length === 0 ? (
        <div className="proposals-empty">작성한 글이 없습니다.</div>
      ) : (
        <div className="mycards-grid">
          {list.map((item) => (
            <article
              key={item.boardNo}
              className="mycard"
              onClick={() => goDetail(item.boardNo)}
              role="button"
            >
              <div className="mycard__thumb">
                <img
                  src={getThumb(item)}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMG;
                  }}
                />
              </div>

              <div className="mycard__body">
                <div className="mycard__meta">
                  <span className="pill">
                    {categoryLabel[item.boardCategory] ?? item.boardCategory ?? "카테고리"}
                  </span>
                  <span className="date">{item.boardWriteDate?.substring(0, 10)}</span>
                </div>
                <h3 className="mycard__title">{item.boardTitle}</h3>
              </div>

              <div className="mycard__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    goEdit(item.boardNo);
                  }}
                >
                  수정
                </button>

                <button
                  type="button"
                  className="btn"
                  onClick={(e) => handleDelete(e, item.boardNo)}
                >
                  삭제
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      </div>
    </main>
  );
}