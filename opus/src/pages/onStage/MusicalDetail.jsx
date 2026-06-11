import '../../css/pages/onStage/detail.css'
import { getMusicalDetail } from '../../api/kopisAPI';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosApi from '../../api/axiosAPI';
import { useAuthStore } from '../../components/auth/useAuthStore';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StarRating from '../../components/common/StarRating';
import { saveStageCache, loadStageCache } from "../../api/stageCache";
import MetaTags from '../../components/common/MetaTags';
import ShareModal from '../../components/common/ShareModal';

export default function MusicalDetail() {
  const { mt20id } = useParams();
  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [save, setSave] = useState(false);
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [cachedData, setCachedData] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);
  const modalBackground = useRef();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  const SERVICE_KEY = import.meta.env.VITE_KOPIS_KEY;

  const { isPending, error, data } = useQuery({
    queryKey: ["kopis", "detail", mt20id],
    queryFn: async () => getMusicalDetail(SERVICE_KEY, mt20id),
  });

  useEffect(() => {
    if (!data) return;
    saveStageCache({
      stageNo: mt20id,
      stageType: "musical",
      stageTitle: data.prfnm,
      stageThumbnail: data.poster,
      stagePeriod: `${data.prfpdfrom} ~ ${data.prfpdto}`,
      stagePlace: data.fcltynm,
    });
  }, [data]);

  useEffect(() => {
    if (isPending || data) return;

    setCacheLoading(true);

    loadStageCache(mt20id).then(cached => {
      if (cached) {
        setCachedData({
          prfnm: cached.stageTitle,
          poster: cached.stageThumbnail,
          prfpdfrom: cached.stagePeriod?.split("~")[0]?.trim() ?? "",
          prfpdto: cached.stagePeriod?.split("~")[1]?.trim() ?? "",
          fcltynm: cached.stagePlace,
          prfruntime: null,
          prfage: null,
          prfcast: null,
          styurls: [],
          relates: [],
          mt20id: mt20id,
        });
        setIsFromCache(true);
      }
      setCacheLoading(false);
    });
  }, [isPending, data, mt20id]);

  const { data: bestReview } = useQuery({
    queryKey: ["bestReview", mt20id],
    queryFn: async () => {
      const res = await axiosApi.get(`/stage/bestReview?stageNo=${mt20id}`);
      return res.data;
    }
  });

  const { data: avgRating } = useQuery({
    queryKey: ["avgRating", mt20id],
    queryFn: async () => {
      const res = await axiosApi.get(`/reviews/averageRating?stageNo=${mt20id}`);
      return res.data;
    },
    enabled: !!mt20id,
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
        stageNo: mt20id,
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
        stageNo: mt20id,
        preferType: "DISLIKE"
      });
      if (res.data === 1) {
        setDislike(true);
        setLike(false);
        toast.success("싫어요에 추가되었습니다.");
      } else if (res.data === -1) {
        setLike(false);
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
        stageNo: mt20id
      });
      if (res.status === 200) {
        setSave(true);
        toast.success("찜에 추가되었습니다.");
      } else if (res.data === 1) {
        setSave(false);
        toast.success("찜이 취소되었습니다.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isPending || cacheLoading) return (
    <main className="detail-page">
      <div className="container" style={{ display: 'flex', justifyContent: 'center', paddingTop: 120 }}>
        <LoadingSpinner text="공연 정보를 불러오고 있습니다" />
      </div>
    </main>
  );

  if (error) return error.message;

  const displayData = data || cachedData;
  if (!displayData) return <div>잘못된 접근입니다.</div>;

  return (
    <>
      <MetaTags
        title={`${data.prfnm} — OPUS`}
        description={`${data.fcltynm} |${data.prfpdfrom} ~${data.prfpdto}`}
        image={data.poster}
      />
      <main className="detail-page">
        <div className="container" id="main-content">
          <div className='detail-grid'>
            <section className="left-col">
              <div className="poster-sticky" id="poster-section">
                <div className="poster-box">
                  <img
                    className="poster-img"
                    src={displayData.poster || "/no-thumbnail.png"}
                    alt={`${displayData.prfnm} 포스터`}
                    onError={(e) => {
                      e.currentTarget.src = "/no-thumbnail.png";
                      e.currentTarget.onerror = null;
                    }}
                  />
                </div>

                <div className="poster-actions">
                  {/* 캐시 모드일 때는 예매 버튼 숨김 */}
                  {!isFromCache && displayData.relates.map((relate, idx) => (
                    <button className="btn btn-primary" id='book-btn' type="button" key={idx}
                      onClick={() => {
                        if (!relate.url) {
                          toast.error("예매 링크가 없는 공연입니다.");
                          return;
                        }
                        window.open(relate.url, "_blank", "noopener,noreferrer");
                      }}>
                      {relate.name}에서 예매하기
                    </button>
                  ))}

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
                      <i className="fa-solid fa-list"></i>
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="right-col">
              <div className="info" id="info-section">
                <div className='info-badge-row'>
                  <span className='info-badge' id='badge-name'>뮤지컬</span>
                  <button className='info-badge' id='share-row' onClick={() => setShareModalOpen(true)}>
                    <i className="fa-solid fa-share-nodes" aria-hidden="true"></i>
                    <span>공유</span>
                  </button>
                </div>

                <ShareModal
                  isOpen={shareModalOpen}
                  onClose={() => setShareModalOpen(false)}
                  url={window.location.href}
                  title={displayData.prfnm}
                  description={`${displayData.fcltynm} | ${displayData.prfpdfrom} ~ ${displayData.prfpdto}`}
                  imageUrl={displayData.poster}
                />

                {isFromCache && (
                  <div className="cache-notice">
                    <i className="fa-solid fa-circle-info" />
                    <span>
                      현재 공연이 종료되어 저장된 정보를 표시하고 있습니다.
                      작성하신 <strong>리뷰와 별점</strong>은 아래에서 정상적으로 확인하실 수 있어요.
                    </span>
                  </div>
                )}

                <h1 className="title">{displayData.prfnm || "(제목 없음)"}</h1>

                <div className="meta-box">
                  {/* 일정·장소는 캐시에도 있으므로 항상 표시 */}
                  <div className="meta-row">
                    <div className="meta-label">일정</div>
                    <div className="meta-value">{displayData.prfpdfrom} ~ {displayData.prfpdto}</div>
                  </div>
                  <div className="meta-row">
                    <div className="meta-label">장소</div>
                    <div className="meta-value">{displayData.fcltynm || "(알 수 없음)"}</div>
                  </div>

                  {/* 캐시 모드일 때는 관람시간·관람등급 행 자체를 숨김 */}
                  {!isFromCache && (
                    <>
                      <div className="meta-row">
                        <div className="meta-label">관람시간</div>
                        <div className="meta-value">{displayData.prfruntime || "(알 수 없음)"}</div>
                      </div>
                      <div className="meta-row">
                        <div className="meta-label">관람등급</div>
                        <div className="meta-value">{displayData.prfage || "(알 수 없음)"}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* 캐시 모드일 때는 상세 정보·출연진 섹션 숨김 */}
                {!isFromCache && (
                  <>
                    <div className="section">
                      <h2 className="section-title">상세 정보</h2>
                      <div className="desc" id="descText">
                        {displayData.styurls.length > 0 && (
                          <div className='desc'>
                            {displayData.styurls.map((url, idx) => (
                              <img key={idx} className='desc-img'
                                src={url} alt={`${displayData.prfnm} 상세 이미지 ${idx + 1}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="section section-divider" id="cast-section">
                      <h2 className="section-title">출연진</h2>
                      <div className="desc" id='cast-desc-div'>{displayData.prfcast || "(알 수 없음)"}</div>
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
                        navigate(`/onStage/reviews/${displayData.mt20id}`);
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
