import '../../css/pages/onStage/detail.css'
import { EmailShareButton, FacebookShareButton, LineShareButton, ThreadsShareButton, TwitterShareButton } from "react-share";
import { EmailIcon, FacebookIcon, LineIcon, ThreadsIcon, XIcon } from "react-share";
import { useRef, useState } from 'react';
import axiosApi from '../../api/axiosAPI';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../components/auth/useAuthStore';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllExhibitions } from '../../api/kcisaAPI';

export default function ExhibitionDetail () {
  const { exhibitionId } = useParams();
  const navigate = useNavigate();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const modalBackground = useRef();
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [save, setSave] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["exhibitionDetail", exhibitionId],
    queryFn: async () => {
      const exhibitions = await getAllExhibitions({
        serviceKey: "bcec5111-252e-47c3-9dca-4b943cf5a0ed",
        pageParam: 1
      });
      return exhibitions.find(e => String(e.exhibitionId) === exhibitionId);
    },
    enabled: !!exhibitionId
  });

  const currentURL = window.location.href;

  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(currentURL);
      alert('URL이 복사되었습니다');
    } catch (err) {
      alert('복사에 실패했습니다');
    }
  };

  const toggleLike = async () => {
    if (!loginMemberNo) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    
    try {
      const res = await axiosApi.post("/stage/like", {
        memberNo: loginMemberNo,
        stageNo: item.exhibitionId,
        preferType: "LIKE"
      });

      if (res.data === 1) {
        setLike(true);
        setDislike(false);
        alert("좋아요에 추가되었습니다.");
      } else if (res.data === -1) {
        setLike(false);
        alert("좋아요가 취소되었습니다.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleDislike = async () => {
    if (!loginMemberNo) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      const res = await axiosApi.post("/stage/dislike", {
        memberNo: loginMemberNo,
        stageNo: item.exhibitionId,
        preferType: "DISLIKE"
      });

      if (res.data === 1) {
        setDislike(true);
        setLike(false);
        alert("싫어요에 추가되었습니다.");
      } else if (res.data === -1) {
        setDislike(false);
        alert("싫어요가 취소되었습니다.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const savePerform = async () => {
    if (!loginMemberNo) {
      alert("로그인 후 이용해주세요.");
      return;
    }
    
    try {
      const res = await axiosApi.post("/stage/save", {
        memberNo: loginMemberNo,
        stageNo: item.exhibitionId
      });

      alert(res.data);
      setSave(prev => !prev);
    } catch (error) {
      console.log(error);
    }
  };

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
  
  if (isLoading) return <div>로딩 중...</div>;
  if (!item) return <div>잘못된 접근입니다.</div>;

  return (
    <main className="detail-page">
      <div className="container" id="main-content">
        <div className='detail-grid'>
          <section className="left-col">
            <div className="poster-sticky" id="poster-section">
              <div className="poster-box">
                {item.image? <img className="poster-img" src={item.image} alt={`${item.title} 포스터`} />
                  : <div className="poster-img" style={{height : 220}} />
                }
              </div>

              <div className="poster-actions">
                <button className='btn btn-primary' id='book-btn' type='button'
                  onClick={() => {
                    if(!item.url) {
                      alert("상세 보기 기능이 없는 전시입니다.");
                      return;
                    }
                    window.open(item.url, "_blank", "noopener,noreferrer")
                  }}>
                    상세 보기
                  </button>

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

              {shareModalOpen &&
                <div className={'share-modal-container'} ref={modalBackground} onClick={e => {
                  if(e.target === modalBackground.current) {
                    setShareModalOpen(false);
                  }
                }}>
                  <div className='share-modal-content'>
                    <div className='share-modal-row'>
                      <div className='share-modal-empty'>&times;</div>
                      <div className='share-modal-title'>공유하기</div>
                      <div className='share-modal-close-btn' onClick={() => setShareModalOpen(false)}>&times;</div>
                    </div>
                    <div className='share-modal-icon-row'>
                      <EmailShareButton url={currentURL}>
                        <EmailIcon size={50} round={true} />
                      </EmailShareButton>
                      <FacebookShareButton url={currentURL}>
                        <FacebookIcon size={50} round={true} />
                      </FacebookShareButton>
                      <LineShareButton url={currentURL}>
                        <LineIcon size={50} round={true} />
                      </LineShareButton>
                      <ThreadsShareButton url={currentURL}>
                        <ThreadsIcon size={50} round={true} />
                      </ThreadsShareButton>
                      <TwitterShareButton url={currentURL}>
                        <XIcon size={50} round={true} />
                      </TwitterShareButton>
                    </div>
                    <div className='share-modal-copy-row'>
                      <div>{currentURL}</div>
                      <div className='share-modal-copy-btn' onClick={copyURL}>복사</div>
                    </div>
                  </div>
                </div>
              }

              <h1 className="title">{item.title || "(제목 없음)"}</h1>

              <div className="meta-box">
                <div className="meta-row">
                  <div className="meta-label">일정</div>
                  <div className='meta-value'>{item.period ? <span dangerouslySetInnerHTML={{__html : item.period}}></span> : "(알 수 없음)"}</div>
                </div>
                <div className="meta-row">
                  <div className="meta-label">장소</div>
                  <div className='meta-value'>{item.place ? <span dangerouslySetInnerHTML={{__html : item.place}}></span> : "(알 수 없음)"}</div>
                </div>
                <div className="meta-row">
                  <div className="meta-label">관람시간</div>
                  <div className='meta-value'>{item.eventPeriod ? <span dangerouslySetInnerHTML={{__html : item.eventPeriod}}></span> : "(알 수 없음)"}</div>
                </div>
                <div className="meta-row">
                  <div className="meta-label">관람등급</div>
                  <div className="meta-value">{item.age ? <span dangerouslySetInnerHTML={{__html : item.age}}></span> : "(알 수 없음)"}</div>
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">상세 정보</h2>
                <div className='desc' id='descText'>{item.desc ? <span dangerouslySetInnerHTML={{__html : item.desc}}></span>: "(알 수 없음)"}</div>
              </div>

              <div className="section section-divider" id="cast-section">
                <h2 className="section-title">작가</h2>
                <div className="desc" id='cast-desc-div'>{item.author ? <span dangerouslySetInnerHTML={{__html : item.author}}></span> : "(알 수 없음)"}</div>
              </div>

              <div className="section" id="reviews-section">
                <div className="reviews-head">
                  <h2 className="section-title">관람 후기</h2>
                  <button className="btn btn-sm btn-outline" id='more-review-btn' type="button"
                    onClick={() => {
                      if(!loginMemberNo) {
                        alert("로그인 후 이용해주세요.");
                        return;
                      }
                      navigate(`/onStage/reviews/${item.exhibitionId}`)
                    }}>후기 더보기</button>
                </div>

                <div className="reviews">
                  {bestReview ? (
                    <article className="review">
                      <div className="review__top">
                        <div className="review__user">
                          <div>
                            <div className="review__name">{bestReview.memberEmail?.replace(/(.{3}).+(@.+)/, "$1***$2")}</div>
                            <div className="review__date">{bestReview.reviewWriteDate?.substring(0,10)}</div>
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
  )
}