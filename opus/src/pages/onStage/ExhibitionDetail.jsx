import '../../css/pages/onStage/detail.css'
import { useEffect, useRef, useState } from 'react';
import axiosApi from '../../api/axiosAPI';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../components/auth/useAuthStore';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllExhibitions } from '../../api/kcisaAPI';
import { toast } from 'react-toastify';
import StarRating from '../../components/reviews/StarRating';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { saveStageCache, loadStageCache } from "../../api/stageCache";
import MetaTags from "../../components/common/MetaTags";
import ShareModal from '../../components/common/ShareModal';

export default function ExhibitionDetail() {
  const { exhibitionId } = useParams();
  const navigate = useNavigate();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const modalBackground = useRef();
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [save, setSave] = useState(false);
  const [cachedItem, setCachedItem] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["exhibitionDetail", exhibitionId],
    queryFn: async () => {
      const exhibitions = await getAllExhibitions({
        serviceKey: import.meta.env.VITE_KCISA_KEY,
        pageParam: 1
      });
      return exhibitions.find(e => String(e.exhibitionId) === exhibitionId) ?? null;
    },
    enabled: !!exhibitionId
  });

  useEffect(() => {
    if (!item) return;
    saveStageCache({
      stageNo: String(item.exhibitionId),
      stageType: "exhibition",
      stageTitle: item.title,
      stageThumbnail: item.image,
      stagePeriod: item.period,
      stagePlace: item.place,
    });
  }, [item]);

  useEffect(() => {
    if (isLoading || item) return;

    setCacheLoading(true);

    loadStageCache(exhibitionId).then(cached => {
      if (cached) {
        setCachedItem({
          exhibitionId: exhibitionId,
          title: cached.stageTitle,
          image: cached.stageThumbnail,
          period: cached.stagePeriod,
          place: cached.stagePlace,
          eventPeriod: null,
          age: null,
          desc: null,
          author: null,
          url: null,
        });
        setIsFromCache(true);
      }
      setCacheLoading(false);
    });
  }, [isLoading, item, exhibitionId]);

  useEffect(() => {
    if (!loginMemberNo) return;
    const fetchStatus = async () => {
      try {
        const [likedRes, savedRes] = await Promise.all([
          axiosApi.get("/myPage/likeList"),
          axiosApi.get("/myPage/savedList"),
        ]);
        setLike(likedRes.data?.includes(exhibitionId) ?? false);
        setSave(savedRes.data?.includes(exhibitionId) ?? false);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStatus();
  }, [loginMemberNo, exhibitionId]);

  const { data: avgRating } = useQuery({
    queryKey: ["avgRating", exhibitionId],
    queryFn: async () => {
      const res = await axiosApi.get(`/reviews/averageRating?stageNo=${exhibitionId}`);
      return res.data;
    },
    enabled: !!exhibitionId,
  });

  const { data: bestReview } = useQuery({
    queryKey: ["bestReview", exhibitionId],
    queryFn: async () => {
      const res = await axiosApi.get(`/stage/bestReview?stageNo=${exhibitionId}`);
      return res.data;
    },
    enabled: !!exhibitionId
  });

  const { data: bestReviewLikeCount } = useQuery({
    queryKey: ["bestReviewLikeCount", bestReview?.reviewNo],
    queryFn: async () => {
      const res = await axiosApi.get("/reviews/likeCount", {
        params: { reviewNo: bestReview.reviewNo }
      });
      return res.data;
    },
    enabled: !!bestReview?.reviewNo
  });

  const currentURL = window.location.href;

  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(currentURL);
      toast.success('URL이 복사되었습니다');
    } catch (err) {
      toast.error('복사에 실패했습니다');
    }
  };

  const toggleLike = async () => {
    if (!loginMemberNo) {
      toast.error("로그인 후 이용해주세요.");
      return;
    }
    try {
      const res = await axiosApi.post("/stage/like", {
        memberNo: loginMemberNo,
        stageNo: displayItem.exhibitionId,
        preferType: "LIKE"
      });
      if (res.data === 1) {
        setLike(true);
        setDislike(false);
        toast.success("좋아요에 추가되었습니다.");
      } else if (res.data === -1) {
        setLike(false);
        toast.success("좋아요가 취소되었습니다.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleDislike = async () => {
    if (!loginMemberNo) {
      toast.error("로그인 후 이용해주세요.");
      return;
    }
    try {
      const res = await axiosApi.post("/stage/dislike", {
        memberNo: loginMemberNo,
        stageNo: displayItem.exhibitionId,
        preferType: "DISLIKE"
      });
      if (res.data === 1) {
        setDislike(true);
        setLike(false);
        toast.success("싫어요에 추가되었습니다.");
      } else if (res.data === -1) {
        setDislike(false);
        toast.success("싫어요가 취소되었습니다.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const savePerform = async () => {
    if (!loginMemberNo) {
      toast.error("로그인 후 이용해주세요.");
      return;
    }
    try {
      const res = await axiosApi.post("/stage/save", {
        memberNo: loginMemberNo,
        stageNo: displayItem.exhibitionId
      });
      toast.success(res.data);
      setSave(prev => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading || cacheLoading) return (
    <main className="detail-page">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <LoadingSpinner text="전시 정보를 불러오고 있습니다" />
      </div>
    </main>
  );

  const displayItem = item || cachedItem;
  if (!displayItem) return <div>잘못된 접근입니다.</div>;

  return (
    <>
      <MetaTags
        title={`${displayItem.title} - OPUS`}
        description={
          displayItem.desc
            ? displayItem.desc.replace(/<[^>]+>/g, "").slice(0, 120)
            : displayItem.title
        }
        image={displayItem.image}
        url={window.location.href}
      />
      <main className="detail-page">
        <div className="container" id="main-content">
          <div className='detail-grid'>
            <section className="left-col">
              <div className="poster-sticky" id="poster-section">
                <div className="poster-box">
                  <img
                    className="poster-img"
                    src={displayItem.image || "/no-thumbnail.png"}
                    alt={`${displayItem.title} 포스터`}
                    onError={(e) => {
                      e.currentTarget.src = "/no-thumbnail.png";
                      e.currentTarget.onerror = null;
                    }}
                  />
                </div>

                <div className="poster-actions">
                  {!isFromCache && (
                    <button className='btn btn-primary' id='book-btn' type='button'
                      onClick={() => {
                        if (!displayItem.url) {
                          toast.error("상세 보기 기능이 없는 전시입니다.");
                          return;
                        }
                        window.open(displayItem.url, "_blank", "noopener,noreferrer");
                      }}>
                      상세 보기
                    </button>
                  )}

                  <div className="actions-row">
                    <button className="btn btn-outline" type="button" onClick={toggleLike}>
                      <i className={`fa-solid fa-heart ${like ? "active" : ""}`}></i>
                      <span>Like</span>
                    </button>
                    <button className="btn btn-outline" type="button" onClick={toggleDislike}>
                      <i className={`fa-solid fa-heart-crack ${dislike ? "active" : ""}`}></i>
                      <span>Dislike</span>
                    </button>
                    <button className="btn btn-outline" type="button" onClick={savePerform}>
                      <i className={`fa-solid fa-list ${save ? "active" : ""}`}></i>
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="right-col">
              <div className="info" id="info-section">
                <div className='info-badge-row'>
                  <span className='info-badge' id='badge-name'>전시</span>
                  <button className='info-badge' id='share-row' onClick={() => setShareModalOpen(true)}>
                    <i className="fa-solid fa-share-nodes" aria-hidden="true"></i>
                    <span>공유</span>
                  </button>
                </div>

                <ShareModal
                  isOpen={shareModalOpen}
                  onClose={() => setShareModalOpen(false)}
                  url={window.location.href}
                  title={displayItem.title}
                  description={displayItem.desc ? displayItem.desc.replace(/<[^>]+>/g, "").slice(0, 120) : displayItem.title}
                  imageUrl={displayItem.image}
                />

                {isFromCache && (
                  <div className="cache-notice">
                    <i className="fa-solid fa-circle-info" />
                    <span>
                      현재 전시가 종료되어 저장된 정보를 표시하고 있습니다.
                      작성하신 <strong>리뷰와 별점</strong>은 아래에서 정상적으로 확인하실 수 있어요.
                    </span>
                  </div>
                )}

                <h1 className="title">{displayItem.title || "(제목 없음)"}</h1>

                <div className="meta-box">
                  {/* 일정·장소는 캐시에도 있으므로 항상 표시 */}
                  <div className="meta-row">
                    <div className="meta-label">일정</div>
                    <div className='meta-value'>
                      {displayItem.period
                        ? <span dangerouslySetInnerHTML={{ __html: displayItem.period }} />
                        : "(알 수 없음)"}
                    </div>
                  </div>
                  <div className="meta-row">
                    <div className="meta-label">장소</div>
                    <div className='meta-value'>
                      {displayItem.place
                        ? <span dangerouslySetInnerHTML={{ __html: displayItem.place }} />
                        : "(알 수 없음)"}
                    </div>
                  </div>

                  {/* 캐시 모드일 때는 관람시간·관람등급 행 자체를 숨김 */}
                  {!isFromCache && (
                    <>
                      <div className="meta-row">
                        <div className="meta-label">관람시간</div>
                        <div className='meta-value'>
                          {displayItem.eventPeriod
                            ? <span dangerouslySetInnerHTML={{ __html: displayItem.eventPeriod }} />
                            : "(알 수 없음)"}
                        </div>
                      </div>
                      <div className="meta-row">
                        <div className="meta-label">관람등급</div>
                        <div className="meta-value">
                          {displayItem.age
                            ? <span dangerouslySetInnerHTML={{ __html: displayItem.age }} />
                            : "(알 수 없음)"}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* 캐시 모드일 때는 상세 정보·작가 섹션 숨김 */}
                {!isFromCache && (
                  <>
                    <div className="section">
                      <h2 className="section-title">상세 정보</h2>
                      <div className='desc' id='descText'>
                        {displayItem.desc
                          ? <span dangerouslySetInnerHTML={{ __html: displayItem.desc }} />
                          : "(알 수 없음)"}
                      </div>
                    </div>

                    <div className="section section-divider" id="cast-section">
                      <h2 className="section-title">작가</h2>
                      <div className="desc" id='cast-desc-div'>
                        {displayItem.author
                          ? <span dangerouslySetInnerHTML={{ __html: displayItem.author }} />
                          : "(알 수 없음)"}
                      </div>
                    </div>
                  </>
                )}

                <div className="section" id="reviews-section">
                  <div className="reviews-head">
                    <h2 className="section-title">관람 후기</h2>
                    <button className="btn btn-sm btn-outline" id='more-review-btn' type="button"
                      onClick={() => {
                        if (!loginMemberNo) {
                          toast.error("로그인 후 이용해주세요.");
                          return;
                        }
                        navigate(`/onStage/reviews/${displayItem.exhibitionId}`);
                      }}>후기 더보기</button>
                  </div>

                  {avgRating > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                      <StarRating rating={avgRating} readonly size={16} />
                    </div>
                  )}

                  <div className="reviews">
                    {bestReview ? (
                      <article className="review">
                        <div className="review__top">
                          <div className="review__user">
                            <div>
                              <div className="review__name">{bestReview.memberEmail?.replace(/(.{3}).+(@.+)/, "$1***$2")}</div>
                              <div className="review__date">{bestReview.reviewWriteDate?.substring(0, 10)}</div>
                            </div>
                          </div>
                          <div className="review__like">
                            <i className="fa-solid fa-thumbs-up" id='review-like-btn'></i>
                            <span className="like-count">{bestReviewLikeCount ?? 0}</span>
                          </div>
                        </div>
                        <p className="review__text">{bestReview.reviewContent}</p>
                      </article>
                    ) : (
                      <div className="review__text">
                        등록된 후기가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
