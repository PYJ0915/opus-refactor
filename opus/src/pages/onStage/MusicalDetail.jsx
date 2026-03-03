import '../../css/pages/onStage/detail.css'
import { EmailShareButton, FacebookShareButton, LineShareButton, ThreadsShareButton, TwitterShareButton } from "react-share";
import { EmailIcon, FacebookIcon, LineIcon, ThreadsIcon, XIcon } from "react-share";
import { getMusicalDetail } from '../../api/kopisAPI';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosApi from '../../api/axiosAPI';
import { useAuthStore } from '../../components/auth/useAuthStore';

export default function MusicalDetail () {
  const { mt20id } = useParams();
  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [save, setSave] = useState(false);
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const modalBackground = useRef();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);
  
  const SERVICE_KEY = "f8d2111671454d7bb5b0102d85c7cf1c";
  
  const { isPending, error, data } = useQuery({
    queryKey : ["kopis", "detail", mt20id],
    queryFn: async () => getMusicalDetail(SERVICE_KEY, mt20id),
  });

  // 관람 후기
  const { data : bestReview } = useQuery({
    queryKey : ["bestReview", mt20id],
    queryFn : async () => {
      const res = await axiosApi.get(`/stage/bestReview?stageNo=${mt20id}`);
      return res.data;
    }
  })

  // =============== react-share 사용하기 ===============
  const currentURL = window.location.href;

  const copyURL = async () => {
    try {
      await navigator.clipboard.writeText(currentURL);
      alert('URL이 복사되었습니다');
    } catch (err) {
      alert('복사에 실패했습니다');
    }
  };

  // Like, Dislike  
  const toggleLike = async() => {
    if (!loginMemberNo) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      const res = await axiosApi.post("/stage/like", {
        memberNo : loginMemberNo,
        stageNo : mt20id,
        preferType : "LIKE"
      })

      if(res.data === 1){
        setLike(true);
        setDislike(false);
        alert("좋아요에 추가되었습니다.")
      } else if(res.data === -1) {
        setLike(false);
        alert("좋아요가 취소되었습니다.")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const toggleDislike = async() => {
    if (!loginMemberNo) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      const res = await axiosApi.post("/stage/dislike", {
        memberNo : loginMemberNo,
        stageNo : mt20id,
        preferType : "DISLIKE"
      })

      if(res.data === 1) {
        setDislike(true);
        setLike(false);
        alert("싫어요에 추가되었습니다.");
      } else if(res.data === -1) {
        setLike(false);
        alert("싫어요가 취소되었습니다.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Save
  const savePerform = async() => {
    if (!loginMemberNo) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      const res = await axiosApi.post("/stage/save", {
        memberNo : loginMemberNo,
        stageNo : mt20id
      })

      if(res.status === 200) {
        setSave(true);
        alert("찜에 추가되었습니다.")
      } else if (res.data === 1) {
        setSave(false);
        alert("찜이 취소되었습니다.")
      }
    } catch (error) {
      console.log(error)
    }
  }

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

  if (isPending) return 'Loading...'
  if (error) return error.message
  if (!data) return 'No data'

  return (
    <main className="detail-page">
      <div className="container" id="main-content">
        <div className='detail-grid'>
          <section className="left-col">
            <div className="poster-sticky" id="poster-section">
              <div className="poster-box">
                {data.poster? <img className="poster-img" src={data.poster} alt={`${data.prfnm} 포스터`} />
                  :  <div className="poster-img" style={{height : 220}} />
                }
              </div>

              <div className="poster-actions">
                {data.relates.map((relate, idx) => (
                  <button className="btn btn-primary" id='book-btn' type="button" key={idx}
                    onClick={() => {
                      if (!relate.url) {
                        alert("예매 링크가 없는 공연입니다.");
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

              <h1 className="title">{data.prfnm || "(제목 없음)"}</h1>

              <div className="meta-box">
                <div className="meta-row">
                  <div className="meta-label">일정</div>
                  <div className="meta-value">{data.prfpdfrom} ~ {data.prfpdto}</div>
                </div>
                <div className="meta-row">
                  <div className="meta-label">장소</div>
                  <div className="meta-value">{data.fcltynm || "(알 수 없음)"}</div>
                </div>
                <div className="meta-row">
                  <div className="meta-label">관람시간</div>
                  <div className="meta-value">{data.prfruntime || "(알 수 없음)"}</div>
                </div>
                <div className="meta-row">
                  <div className="meta-label">관람등급</div>
                  <div className="meta-value">{data.prfage || "(알 수 없음)"}</div>
                </div>
              </div>

              <div className="section">
                <h2 className="section-title">상세 정보</h2>

                <div className="desc" id="descText">
                  {data.styurls.length > 0 && (
                    <div className='desc'>
                      {data.styurls.map((url, idx) => (
                        <img key = {idx} className='desc-img'
                          src={url} alt={`${data.prfnm} 상세 이미지 ${idx + 1}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="section section-divider" id="cast-section">
                <h2 className="section-title">출연진</h2>
                <div className="desc" id='cast-desc-div'>{data.prfcast || "(알 수 없음)"}</div>
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
                      navigate(`/onStage/reviews/${data.mt20id}`)
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