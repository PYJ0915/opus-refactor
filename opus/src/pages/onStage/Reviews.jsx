import { useParams } from 'react-router-dom';
import { useRef, useEffect, useCallback, useState } from 'react';
import axiosApi from '../../api/axiosAPI';
import '../../css/pages/onStage/reviews.css';
import { useAuthStore } from "../../components/auth/useAuthStore";

import { useReviews } from '../../hooks/useReviews';
import { useComments } from '../../hooks/useComments';
import { useLike } from '../../hooks/useLike';
import { useReport } from '../../hooks/useReport';

import ReviewItem from '../../components/reviews/ReviewItem';
import RatingDistribution from '../../components/reviews/RatingDistribution';
import StarRating from "../../components/reviews/StarRating";

export default function Reviews() {
  const { stageNo } = useParams();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  if (!stageNo) {
    return <div style={{ padding: 80 }}>잘못된 접근입니다.</div>;
  }

  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    axiosApi.get("/reviews/averageRating", { params: { stageNo } })
      .then(resp => { if (resp.status === 200) setAverageRating(resp.data); })
      .catch(console.error);
  }, [stageNo]);

  const { getLikeCount, ...likeHook } = useLike();
  const { getCommentCount, ...commentsHook } = useComments();

  const {
    reviews, reviewsCount, visibleCount, setVisibleCount,
    sortType, setSortType,
    isFormOpen, openForm, closeForm,
    writeReview, setWriteReview,
    writeRating, setWriteRating,
    submitReview,
    editId, editReview, setEditReview,
    clickEditBtn, clickEditCancelBtn, saveEdit,
    deleteReview,
  } = useReviews(stageNo, {
    onLoaded: (loadedReviews) => {
      loadedReviews.forEach(r => {
        getCommentCount(r.reviewNo);
        getLikeCount(r.reviewNo);
      });
    }
  });

  const reportHook = useReport();

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortType === "latest") {
      return new Date(b.reviewWriteDate) - new Date(a.reviewWriteDate);
    }
    if (sortType === "popular") {
      return (likeHook.likeCount[b.reviewNo] ?? 0) - (likeHook.likeCount[a.reviewNo] ?? 0);
    }
    return 0;
  });

  const sentinelRef = useRef(null);

  const loadMore = useCallback(() => {
    if (visibleCount < sortedReviews.length) {
      setVisibleCount(prev => prev + 5);
    }
  }, [visibleCount, sortedReviews.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <main className="reviews-page">

      {/* 헤더 + 작성 폼 */}
      <section id="review-header" className="section section--mb-lg">
        <div className="review-header__inner">
          <div>
            <h1 className="h1">작품 후기</h1>
            <p className="sub">관람하신 작품에 대한 솔직한 후기를 남겨주세요</p>
          </div>
          <button
            id="write-review-btn"
            className="btn btn--dark"
            type="button"
            onClick={openForm}
          >
            {isFormOpen ? "입력창 접기" : "후기 작성하기"}
          </button>
        </div>

        <div
          id="review-form"
          className={`card card--p-lg${isFormOpen ? "" : " hidden"}`}
          aria-hidden={isFormOpen ? "false" : "true"}
        >
          <div className="form">
            <div className="review-rating-field">
              <p className="review-rating-field__label">별점</p>
              <StarRating rating={writeRating} onChange={setWriteRating} size={28} />
            </div>
            <div className="field">
              <textarea
                className="textarea"
                placeholder="작품에 대한 솔직한 후기를 작성해주세요"
                value={writeReview}
                onChange={(e) => setWriteReview(e.target.value)}
              />
            </div>
            <div className="form__actions">
              <button className="btn btn--outline" type="button" id="cancel-review-btn" onClick={closeForm}>
                취소
              </button>
              <button className="btn btn--dark" type="button" id="submit-review-btn" onClick={submitReview}>
                등록하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 별점 평균 + 분포 — 하나의 카드로 통합 */}
      {reviewsCount > 0 && (
        <section className="section section--mb-md">
          <div className="avg-rating-summary">

            {/* 왼쪽: 숫자 + 별 + 개수 */}
            <div className="avg-rating-summary__left">
              <div className="avg-rating-summary__score">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={(averageRating)} readonly size={16} />
              <p className="avg-rating-summary__label">전체 {reviewsCount}개 후기</p>
            </div>

            {/* 오른쪽: 분포 바 */}
            <div className="avg-rating-summary__right">
              <RatingDistribution stageNo={stageNo} totalCount={reviewsCount} />
            </div>

          </div>
        </section>
      )}

      {/* 정렬 + 총 개수 */}
      <section id="review-controls" className="section section--mb-md">
        <div className="row row--between row--gap-md">
          <div className="count">
            총 <span className="count__strong">{reviewsCount}</span>개의 후기
          </div>
          <div className="seg">
            <button
              className={`seg-sort-btn${sortType === "latest" ? " is-active" : ""}`}
              type="button"
              onClick={() => setSortType("latest")}
            >
              최신순
            </button>
            <button
              className={`seg-sort-btn${sortType === "popular" ? " is-active" : ""}`}
              type="button"
              onClick={() => setSortType("popular")}
            >
              인기순
            </button>
          </div>
        </div>
      </section>

      {/* 후기 목록 */}
      <section id="reviews-list" className="list">
        {reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <i className="far fa-comment-dots" aria-hidden="true" />
            </div>
            <p className="empty-state__title">아직 작성된 후기가 없습니다</p>
            <p className="empty-state__desc">
              이 작품을 관람하셨나요?<br />첫 번째 후기를 남겨보세요.
            </p>
          </div>
        ) : (
          sortedReviews.slice(0, visibleCount).map((review) => (
            <ReviewItem
              key={review.reviewNo}
              review={review}
              loginMemberNo={loginMemberNo}
              editId={editId}
              editReview={editReview}
              setEditReview={setEditReview}
              onClickEdit={clickEditBtn}
              onCancelEdit={clickEditCancelBtn}
              onSaveEdit={saveEdit}
              onDelete={deleteReview}
              likeCount={likeHook.likeCount}
              likedMap={likeHook.likedMap}
              onToggleLike={likeHook.toggleLike}
              comment={commentsHook.comment}
              commentCount={commentsHook.commentCount}
              openCommentId={commentsHook.openCommentId}
              inputComment={commentsHook.inputComment}
              setInputComment={commentsHook.setInputComment}
              onToggleComment={commentsHook.toggleComment}
              onSubmitComment={commentsHook.submitComment}
              onDeleteComment={commentsHook.deleteComment}
              editCommentId={commentsHook.editCommentId}
              editCommentContent={commentsHook.editCommentContent}
              setEditCommentContent={commentsHook.setEditCommentContent}
              onClickEditComment={commentsHook.clickEditCommentBtn}
              onCancelEditComment={commentsHook.cancelEditComment}
              onSaveEditComment={commentsHook.saveEditComment}
              reportOpenId={reportHook.reportOpenId}
              reportReasonType={reportHook.reportReasonType}
              setReportReasonType={reportHook.setReportReasonType}
              reportReason={reportHook.reportReason}
              setReportReason={reportHook.setReportReason}
              onToggleReport={reportHook.toggleReport}
              onSubmitReport={reportHook.submitReport}
              setReportOpenId={reportHook.setReportOpenId}
            />
          ))
        )}
      </section>

      {/* 무한스크롤 sentinel */}
      {visibleCount < sortedReviews.length && (
        <div ref={sentinelRef} className="scroll-sentinel">
          <span className="scroll-sentinel__text">불러오는 중...</span>
        </div>
      )}

    </main>
  );
}