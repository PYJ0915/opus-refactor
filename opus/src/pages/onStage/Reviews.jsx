import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import '../../css/pages/onStage/reviews.css'
import axiosApi from '../../api/axiosAPI';
import { useAuthStore } from "../../components/auth/useAuthStore";

export default function Reviews() {
  const { stageNo } = useParams();
  const token = useAuthStore(state => state.token);
  
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  if (!stageNo) {
    return <div style={{ padding: 80 }}>잘못된 접근입니다.</div>;
  }

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [writeReview, setWriteReview] = useState("");
  
  const openForm = () => setIsFormOpen(v => !v);
  const closeForm = () => setIsFormOpen(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const meatBackgroundRefs = useRef({});

  const setMeatRef = (reviewNo, el) => {
    meatBackgroundRefs.current[reviewNo] = el;
  };

  const meatCloseHandler = (e) => {
    if (openMenuId !== null) {
      const currentRef = meatBackgroundRefs.current[openMenuId];
      if (currentRef && !currentRef.contains(e.target)) {
        setOpenMenuId(null);
      }
    }
  };

    useEffect(() => {
    document.addEventListener("mousedown", meatCloseHandler);
    return () => {
      document.removeEventListener("mousedown", meatCloseHandler);
    };
  }, [openMenuId]);

  const toggleMeatOpen = (reviewNo) => {
    setOpenMenuId(prev => (prev === reviewNo ? null : reviewNo));
  };

  // 후기 조회
  const [reviews, setReviews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);

  const showReviews = async() => {
    try {
      const resp = await axiosApi.get("/reviews/getReviews", {
        params : {stageNo}
      })

      if(resp.status === 200) {
        setReviews(resp.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

    // 후기 개수 가져오기
  const [reviewsCount, setReviewsCount] = useState(0);

  const showReviewsCount = async () => {
    try {
      const resp = await axiosApi.get("/reviews/getReviewsCount", {
        params : {stageNo}
      })

      if(resp.status === 200) {
        setReviewsCount(resp.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await showReviewsCount();

      const resp = await axiosApi.get("/reviews/getReviews", {
        params: { stageNo }
      });

      if (resp.status === 200) {
        setReviews(resp.data);

        resp.data.forEach(r => {
          getCommentCount(r.reviewNo);
          getLikeCount(r.reviewNo);
          // getIsLiked(r.reviewNo);
        });
      }
    };

    loadData();
  }, [stageNo]);


  // 후기 수정
  const [editId, setEditId] = useState(null);
  const [editReview, setEditReview] = useState("");
  const [originReview, setOriginReview] = useState("");

  const clickEditBtn = (review) => {
    setEditId(Number(review.reviewNo));
    setOriginReview(review.reviewContent);
    setEditReview(review.reviewContent);
  }

  const clickEditCancelBtn = () => {
    setEditReview(originReview);
    setEditId(null);
  }

  const saveEdit = async(reviewNo) => {
    try {
      const resp = await axiosApi.post("/reviews/updateReview", {
        reviewNo,
        reviewContent : editReview,
      })

      if(resp.status === 200) {
        setEditId(null);
        showReviews();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const submitReview = async() => {
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    if(writeReview.trim().length === 0) {
      alert("후기를 입력해주세요.");
      return;
    };

    const res = await axiosApi.post("/reviews/addReview", {
      stageNo : stageNo,  
      reviewContent : writeReview
    })

    if (res.status === 200) {
      alert("후기가 등록되었습니다.");
      setWriteReview("");
      setIsFormOpen(false);
      document.activeElement?.blur(); 

      showReviews();
      showReviewsCount();
    } else {
      alert("후기 등록에 실패하였습니다.");
    }
  }

  // 후기 삭제
  const deleteReview = async(reviewNo) => {
    if(!confirm("후기를 삭제하시겠습니까?")) return;

    try {
      const resp = await axiosApi.post("/reviews/deleteReview", {
        reviewNo
      })

      if(resp.status === 200) {
        alert("후기가 삭제되었습니다.");
        showReviews();
        showReviewsCount();
      }
    } catch (error) {
      console.log(error); 
    }
  }

  // 댓글 조회
  const [openCommentId, setOpenCommentId] = useState(null);
  const [comment, setComment] = useState({});

  const toggleComment = async(reviewNo) => {
    if(openCommentId === reviewNo) {
      setOpenCommentId(null);
      return;
    }

    try {
      const resp = await axiosApi.get("/comment/getComment", {
        params: {reviewNo}
      })

      if(resp.status === 200){
        setComment(prev => ({
          ...prev,
          [reviewNo] : resp.data
        }))
        setOpenCommentId(reviewNo)
      }
    } catch (error) {
      console.error(error);
    }
  }

  // 댓글 등록
  const [inputComment, setInputComment] = useState({});

  const submitComment = async(reviewNo) => {
    if(!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const content = inputComment[reviewNo];

    if(!content || content.trim().length === 0) {
      alert("댓글을 입력해주세요.");
      return;
    }

    try {
      const resp = await axiosApi.post("/comment/addComment", {
        reviewNo,
        commentContent : content
      })

      if(resp.status === 200) {
        alert("댓글이 등록되었습니다.");
        getCommentCount(reviewNo);

        setInputComment(prev => ({
          ...prev,
          [reviewNo] : ""
        }))

        const resp = await axiosApi.get("/comment/getComment", {
        params: {reviewNo}
      })

      if(resp.status === 200){
        setComment(prev => ({
          ...prev,
          [reviewNo] : resp.data
        }))
      }
    }
    } catch (error) {
      console.log(error);
    }
  }

  // 댓글 삭제
  const deleteComment = async(commentNo, reviewNo) => {
    if(!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const resp = await axiosApi.post("/comment/deleteComment", {
        commentNo
      })

      if(resp.status === 200) {
        alert("댓글이 삭제되었습니다.");
        getCommentCount(reviewNo);
    
      const resp = await axiosApi.get("/comment/getComment", {
        params: {reviewNo}
      })

      if(resp.status === 200){
        setComment(prev => ({
          ...prev,
          [reviewNo] : resp.data
        }))
      }
    }
    } catch (error) {
      console.log(error);
    }
  }

  // 댓글 수정
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [originComment, setOriginComment] = useState("");

  const clickEditCommentBtn = (c) => {
    setEditCommentId(c.commentNo);
    setOriginComment(c.commentContent);
    setEditCommentContent(c.commentContent);
  };

  const cancelEditComment = () => {
    setEditCommentContent(originComment);
    setEditCommentId(null);
  };

  const saveEditComment = async (commentNo, reviewNo) => {
    try {
      const resp = await axiosApi.post("/comment/updateComment", {
        commentNo,
        commentContent: editCommentContent
      });

      if (resp.status === 200) {
        alert("댓글이 수정되었습니다.");
        setEditCommentId(null);

        const resp = await axiosApi.get("/comment/getComment", {
          params: { reviewNo }
        });

        if (resp.status === 200) {
          setComment(prev => ({
            ...prev,
            [reviewNo]: resp.data
          }));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 댓글 개수 가져오기
  const [commentCount, setCommentCount] = useState({});

  const getCommentCount = async (reviewNo) => {
    try {
      const resp = await axiosApi.get("/comment/getCommentCount", {
        params: { reviewNo }
      });

      if (resp.status === 200) {
        setCommentCount(prev => ({
          ...prev,
          [reviewNo]: resp.data
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 후기 좋아요
  // 좋아요 개수
  const [likeCount, setLikeCount] = useState({});

  const [sortType, setSortType] = useState("latest");
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortType === "latest") {
      return new Date(b.reviewWriteDate) - new Date(a.reviewWriteDate);
    }
  
    if (sortType === "popular") {
      const likeA = likeCount[a.reviewNo] ?? 0;
      const likeB = likeCount[b.reviewNo] ?? 0;
      return likeB - likeA;
    }
  
    return 0;
  });

  // 내가 눌렀는지
  const [likedMap, setLikedMap] = useState({});

  // 좋아요 개수 조회
  const getLikeCount = async (reviewNo) => {
    try {
      const resp = await axiosApi.get("/reviews/likeCount", {
        params: { reviewNo }
      });

      if (resp.status === 200) {
        setLikeCount(prev => ({
          ...prev,
          [reviewNo]: resp.data
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleLike = async (reviewNo) => {
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    try {
      const resp = await axiosApi.post("/reviews/like", { reviewNo });

      if (resp.status === 200) {
        const liked = resp.data;

        setLikedMap(prev => ({
          ...prev,
          [reviewNo]: liked
        }));

        // 개수 다시 조회
        getLikeCount(reviewNo);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 후기 신고
  const [reportOpenId, setReportOpenId] = useState(null);
  const [reportReasonType, setReportReasonType] = useState({});
  const [reportReason, setReportReason] = useState({});

  const toggleReport = (reviewNo) => {
    setReportOpenId(prev => (prev === reviewNo ? null : reviewNo));
  }

  const submitReport = async (review) => {
    if (!token) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    const selectedReason = reportReasonType[review.reviewNo];
    const reasonDetail = reportReason[review.reviewNo] || "";

    if (!selectedReason) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    if (selectedReason === "기타" && reasonDetail.trim().length === 0) {
      alert("기타 사유를 선택한 경우 상세 내용을 입력해주세요.");
      return;
    }

    try {
      const resp = await axiosApi.post("/reviews/addReport", {
        reviewNo: review.reviewNo,
        reporterNo: loginMemberNo,
        reportedNo: review.memberNo,
        reportReason: selectedReason,
        reportDetail: reasonDetail
      });

      if (resp.status === 200) {
        alert("신고가 접수되었습니다.");
        setReportOpenId(null);

        setReportReason(prev => ({ ...prev, [review.reviewNo]: "" }));
        setReportReasonType(prev => ({ ...prev, [review.reviewNo]: "" }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const maskEmail = (email) => {
    if (!email) return "";

    const [id, domain] = email.split("@");
    if (!id) return email;

    if (id.length <= 2) {
      return id[0] + "*" + "@" + domain;
    }

    const maskLength = 3;
    const start = Math.floor((id.length - maskLength) / 2);
    const end = start + maskLength;

    const maskedId = id.slice(0, start) + "***" + id.slice(end);

    return `${maskedId}@${domain}`;
  };

  return (
    <main className="reviews-page">
      <section id="review-header" className="section section--mb-lg">
        <div className="row row--between row--gap-lg section__head">
          <div>
            <h1 className="h1">작품 후기</h1>
            <p className="sub">관람하신 작품에 대한 솔직한 후기를 남겨주세요</p>
          </div>

          <button id="write-review-btn" className="btn btn--dark" type="button" onClick={openForm}>
            {isFormOpen ? "입력창 접기" : "후기 작성하기"}
          </button>
        </div>

        {/* 후기 작성란 */}
        <div id="review-form"
          className={`card card--p-lg ${isFormOpen ? "" : "hidden"}`}
          aria-hidden={isFormOpen ? "false" : "true"}>
          <div className="form">
            <div className="field">
              <textarea className="textarea" placeholder="작품에 대한 솔직한 후기를 작성해주세요"
                value={writeReview} onChange={(e) => setWriteReview(e.target.value)} />
            </div>

            <div className="form__actions">
              <button className="btn btn--outline" type="button" id="cancel-review-btn" onClick={closeForm}>취소</button>
              <button className="btn btn--dark" type="button" id='submit-review-btn' onClick={submitReview}>등록하기</button>
            </div>
          </div>
        </div>
      </section>

      {/* 후기 개수 가져오기 */}
      <section id="review-controls" className="section section--mb-md">
        <div className="row row--between row--gap-md">
          <div className="count">
            총 <span className="count__strong">{reviewsCount}</span>개의 후기
          </div>

          <div className="seg">
            <button
              className={`seg-sort-btn ${sortType === "latest" ? "is-active" : ""}`}
              type="button"
              onClick={() => setSortType("latest")}
            >
              최신순
            </button>

            <button
              className={`seg-sort-btn ${sortType === "popular" ? "is-active" : ""}`}
              type="button"
              onClick={() => setSortType("popular")}
            >
              인기순
            </button>
          </div>
        </div>
      </section>

      {/* 후기 보여주기 */}
      <section id="reviews-list" className="list">
        {reviews.length === 0 ? (
          <div>등록된 후기가 없습니다.</div>
        ) : (
          sortedReviews.slice(0, visibleCount).map((review) => {
            const isMine = Number(review.memberNo) === Number(loginMemberNo);

            return(
              <article key={review.reviewNo} className="review-item card card--p-lg">
                <div className="review__top">
                  <div className="user">
                    <div className="user__meta">
                      <div className="user__name">{maskEmail(review.memberEmail)}</div>
                      <div className="user__date">{review.reviewWriteDate  }</div>
                    </div>
                  </div>

                  {/* ========== meatball menu ========== */}
                  <div className='meat-wrapper' ref={(el) => setMeatRef(review.reviewNo, el)}>
                    <button className="icon-btn icon-btn--muted" type="button" aria-label="더보기" onClick={() => toggleMeatOpen(review.reviewNo)}>
                      <i className="fa-solid fa-ellipsis" aria-hidden="true"></i>
                    </button>
                    {openMenuId === review.reviewNo && (
                      <div className="meat-container">
                        {isMine ? (
                          <>
                            <div className='meat-content-update'
                              onClick={() => {
                                clickEditBtn(review);
                                setOpenMenuId(null);
                              }}>
                              수정
                            </div>
                            <div className='meat-content-delete'
                              onClick={() => {
                                deleteReview(review.reviewNo);
                                setOpenMenuId(null);
                              }}>
                              삭제
                            </div>
                          </>
                        ) : (
                          <div
                            className='meat-content-report'
                            onClick={() => {
                              toggleReport(review.reviewNo);
                              setOpenMenuId(null);
                            }}
                          >
                            신고
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ===== 신고 입력 ===== */}
                {reportOpenId === review.reviewNo && (
                  <div className="report-box">
                    <div className="report-reason-group">
                      {["영리목적/홍보성", "개인정보노출", "불법정보", "음란성/선정성", "욕설/인신공격", "같은 내용 반복(도배)", "운영규칙 위반", "기타"].map(reason => (
                        <label key={reason} className="report-radio">
                          <input
                            type="radio"
                            name={`report-${review.reviewNo}`}
                            value={reason}
                            checked={reportReasonType[review.reviewNo] === reason}
                            onChange={(e) =>
                              setReportReasonType(prev => ({
                                ...prev,
                                [review.reviewNo]: e.target.value
                              }))
                            }
                          />
                          {reason}
                        </label>
                      ))}
                    </div>
                    
                    <textarea
                      className="report-textarea"
                      placeholder="상세 내용을 입력해주세요 (선택)"
                      value={reportReason[review.reviewNo] || ""}
                      onChange={(e) =>
                        setReportReason(prev => ({
                          ...prev,
                          [review.reviewNo]: e.target.value
                        }))
                      }
                    />

                    <div className="report-actions">
                      <button
                        className="btn btn--outline btn--sm"
                        onClick={() => setReportOpenId(null)}
                        id='report-cancle-btn'
                      >
                        취소
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        id='report-action-btn'
                        onClick={() => submitReport(review)}
                      >
                        신고
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="review__body">
                  {editId !== review.reviewNo ? (
                    <p className='text'>{review.reviewContent}</p>
                    ) : (
                      <textarea className='text-edit' value={editReview} onChange={(e) => setEditReview(e.target.value)}></textarea>
                    )}
                </div>
                {editId === review.reviewNo && (
                  <div>
                    <button onClick={() => saveEdit(review.reviewNo)}>저장</button>
                    <button onClick={clickEditCancelBtn}>취소</button>
                  </div>
                )}
                
                {/* 후기에 딸린 좋아요 개수, 댓글 개수 가져오기 */}
                <div className="review__actions">
                  <button
                    className="action-btn"
                    type="button"
                    onClick={() => toggleLike(review.reviewNo)}
                  >
                    <i
                      className={
                        likedMap[review.reviewNo]
                          ? "fa-solid fa-heart text-red"
                          : "fa-regular fa-heart"
                      }
                    ></i>
                    <span>좋아요 {likeCount[review.reviewNo] ?? 0}</span>
                  </button>

                  <button className="comment-toggle action-btn" type="button"
                    onClick={() => toggleComment(review.reviewNo)}>
                    <i className="fa-regular fa-comment" aria-hidden="true"></i>
                    <span>댓글 {commentCount[review.reviewNo] ?? 0}</span>
                  </button>
                </div>

                {/* 댓글 보여주기 + 입력창 */}
                {openCommentId === review.reviewNo && (
                  <div className='comments-section'>
                    <div className='comment-list'>
                      {(comment[review.reviewNo] || []).map(c => {
                        const isCommentMine = Number(c.memberNo) === Number(loginMemberNo);
                      
                        return (
                          <div key={c.commentNo} className="comment">
                            <div className="comment__main">
                              <div className="comment__meta">
                                <div className='comment-update-info-box'>
                                  <div className='user__name'>{maskEmail(c.memberEmail)}</div>
                                  <div className='user__date'>{c.commentWriteDate}</div>
                                </div>
                        
                                {isCommentMine && (
                                  <div className='comment-update-btn-box'>
                                    <button
                                      onClick={() => clickEditCommentBtn(c)}
                                      className="comment-edit-btn"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => deleteComment(c.commentNo, review.reviewNo)}
                                      className="comment-delete-btn"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {/* 수정 모드 */}
                              {editCommentId === c.commentNo ? (
                                <div>
                                  <textarea
                                    value={editCommentContent}
                                    onChange={(e) => setEditCommentContent(e.target.value)}
                                    id='update_comment_textarea'
                                  />
                                  <div className='update_comment_inner_btn_box'>
                                    <button className='update_comment_inner_btn' onClick={cancelEditComment}>취소</button>
                                    <button className='update_comment_inner_btn' onClick={() => saveEditComment(c.commentNo, review.reviewNo)}>저장하기</button>
                                  </div>
                                </div>
                              ) : (
                                <p className="comment__text" id="review_comment_text">{c.commentContent}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 댓글 작성하기 */}
                    <div className="comment-input">
                      <input className="input input--sm" type="text" placeholder="댓글을 입력하세요" 
                        value={inputComment[review.reviewNo] || ""}
                        onChange={(e) => setInputComment(prev => ({
                          ...prev,
                          [review.reviewNo] : e.target.value
                        }))}
                      />
                      <button className="btn btn--dark btn--sm" id="submitCommentBtn" type="button"
                        onClick={() => submitComment(review.reviewNo)}>등록</button>
                    </div>
                  </div>
                )}
              </article>
            )
          })
        )}
      </section>

      {sortedReviews.length > visibleCount && (
        <div className="more">
          <button
            className="btn btn--outline btn--lg"
            type="button"
            onClick={() => setVisibleCount(prev => prev + 5)}
          >
            더보기
          </button>
        </div>
      )}
    </main>
  )
}