import { useParams } from 'react-router-dom';
import '../../css/pages/onStage/reviews.css';
import { useAuthStore } from "../../components/auth/useAuthStore";

import { useReviews } from '../../hooks/useReviews';
import { useComments } from '../../hooks/useComments';
import { useLike } from '../../hooks/useLike';
import { useReport } from '../../hooks/useReport';

import ReviewItem from '../../components/reviews/ReviewItem';
import StarRating from "../../components/common/StarRating";

export default function Reviews() {
  const { stageNo } = useParams();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  if (!stageNo) {
    return <div style={{ padding: 80 }}>잘못된 접근입니다.</div>;
  }

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

  return (
    <main className="reviews-page">

      {/* 헤더 + 작성 폼 */}
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

        <div
          id="review-form"
          className={`card card--p-lg${isFormOpen ? "" : "hidden"}`}
          aria-hidden={isFormOpen ? "false" : "true"}
        >
          <div className="form">
            <div className="field" style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>별점</p>
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
              <button className="btn btn--outline" type="button" id="cancel-review-btn" onClick={closeForm}>취소</button>
              <button className="btn btn--dark" type="button" id="submit-review-btn" onClick={submitReview}>등록하기</button>
            </div>
          </div>
        </div>
      </section>

      {/* 정렬 + 총 개수 */}
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
            >최신순</button>
            <button
              className={`seg-sort-btn ${sortType === "popular" ? "is-active" : ""}`}
              type="button"
              onClick={() => setSortType("popular")}
            >인기순</button>
          </div>
        </div>
      </section>

      {/* 후기 목록 */}
      <section id="reviews-list" className="list">
        {reviews.length === 0 ? (
          <div>등록된 후기가 없습니다.</div>
        ) : (
          sortedReviews.slice(0, visibleCount).map((review) => (
            <ReviewItem
              key={review.reviewNo}
              review={review}
              loginMemberNo={loginMemberNo}
              // 수정/삭제
              editId={editId}
              editReview={editReview}
              setEditReview={setEditReview}
              onClickEdit={clickEditBtn}
              onCancelEdit={clickEditCancelBtn}
              onSaveEdit={saveEdit}
              onDelete={deleteReview}
              // 좋아요
              likeCount={likeHook.likeCount}
              likedMap={likeHook.likedMap}
              onToggleLike={likeHook.toggleLike}
              // 댓글
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
              // 신고
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
  );
}
