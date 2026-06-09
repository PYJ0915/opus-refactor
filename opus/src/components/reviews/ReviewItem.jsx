import React, { useRef, useEffect, useState } from 'react';
import CommentSection, { maskEmail } from './CommentSection';
import StarRating from "../common/StarRating";

const REPORT_REASONS = [
  "영리목적/홍보성", "개인정보노출", "불법정보",
  "음란성/선정성", "욕설/인신공격", "같은 내용 반복(도배)",
  "운영규칙 위반", "기타"
];

export default function ReviewItem({
  review,
  loginMemberNo,
  // 수정
  editId,
  editReview,
  setEditReview,
  onClickEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  // 좋아요
  likeCount,
  likedMap,
  onToggleLike,
  // 댓글
  comment,
  commentCount,
  openCommentId,
  inputComment,
  setInputComment,
  onToggleComment,
  onSubmitComment,
  onDeleteComment,
  editCommentId,
  editCommentContent,
  setEditCommentContent,
  onClickEditComment,
  onCancelEditComment,
  onSaveEditComment,
  // 신고
  reportOpenId,
  reportReasonType,
  setReportReasonType,
  reportReason,
  setReportReason,
  onToggleReport,
  onSubmitReport,
  setReportOpenId,
}) {
  const isMine = Number(review.memberNo) === Number(loginMemberNo);

  // meatball 메뉴 — ReviewItem 내부에서 독립적으로 관리
  const [menuOpen, setMenuOpen] = useState(false);
  const meatRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuOpen && meatRef.current && !meatRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    <article key={review.reviewNo} className="review-item card card--p-lg">
      <div className="review__top">
        <div className="user">
          <div className="user__meta">
            <div className="user__name">{maskEmail(review.memberEmail)}</div>
            <div className="user__date">{review.reviewWriteDate}</div>
          </div>
        </div>

        {/* meatball 메뉴 */}
        <div className='meat-wrapper' ref={meatRef}>
          <button
            className="icon-btn icon-btn--muted"
            type="button"
            aria-label="더보기"
            onClick={() => setMenuOpen(v => !v)}
          >
            <i className="fa-solid fa-ellipsis" aria-hidden="true"></i>
          </button>

          {menuOpen && (
            <div className="meat-container">
              {isMine ? (
                <>
                  <div className='meat-content-update' onClick={() => { onClickEdit(review); setMenuOpen(false); }}>수정</div>
                  <div className='meat-content-delete' onClick={() => { onDelete(review.reviewNo); setMenuOpen(false); }}>삭제</div>
                </>
              ) : (
                <div className='meat-content-report' onClick={() => { onToggleReport(review.reviewNo); setMenuOpen(false); }}>신고</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 신고 폼 */}
      {reportOpenId === review.reviewNo && (
        <div className="report-box">
          <div className="report-reason-group">
            {REPORT_REASONS.map(reason => (
              <label key={reason} className="report-radio">
                <input
                  type="radio"
                  name={`report-${review.reviewNo}`}
                  value={reason}
                  checked={reportReasonType[review.reviewNo] === reason}
                  onChange={(e) => setReportReasonType(prev => ({ ...prev, [review.reviewNo]: e.target.value }))}
                />
                {reason}
              </label>
            ))}
          </div>

          <textarea
            className="report-textarea"
            placeholder="상세 내용을 입력해주세요 (선택)"
            value={reportReason[review.reviewNo] || ""}
            onChange={(e) => setReportReason(prev => ({ ...prev, [review.reviewNo]: e.target.value }))}
          />

          <div className="report-actions">
            <button className="btn btn--outline btn--sm" onClick={() => setReportOpenId(null)} id='report-cancel-btn'>취소</button>
            <button className="btn btn--danger btn--sm" id='report-action-btn' onClick={() => onSubmitReport(review)}>신고</button>
          </div>
        </div>
      )}

      {/* 본문 */}
      <div className="review__body">
        <StarRating rating={review.reviewRating} readonly size={16} />
        {editId !== review.reviewNo ? (
          <p className='text'>{review.reviewContent}</p>
        ) : (
          <textarea className='text-edit' value={editReview} onChange={(e) => setEditReview(e.target.value)} />
        )}
      </div>

      {editId === review.reviewNo && (
        <div className="review__edit-actions">
          <button className="btn btn--outline btn--sm" onClick={onCancelEdit}>취소</button>
          <button className="btn btn--dark btn--sm" onClick={() => onSaveEdit(review.reviewNo)}>저장</button>
        </div>
      )}

      {/* 좋아요 / 댓글 토글 */}
      <div className="review__actions">
        <button className="action-btn" type="button" onClick={() => onToggleLike(review.reviewNo)}>
          <i className={likedMap[review.reviewNo] ? "fa-solid fa-heart text-red" : "fa-regular fa-heart"}></i>
          <span>좋아요 {likeCount[review.reviewNo] ?? 0}</span>
        </button>

        <button className="comment-toggle action-btn" type="button" onClick={() => onToggleComment(review.reviewNo)}>
          <i className="fa-regular fa-comment" aria-hidden="true"></i>
          <span>댓글 {commentCount[review.reviewNo] ?? 0}</span>
        </button>
      </div>

      {/* 댓글 섹션 */}
      {openCommentId === review.reviewNo && (
        <CommentSection
          reviewNo={review.reviewNo}
          comments={comment[review.reviewNo] || []}
          inputComment={inputComment}
          setInputComment={setInputComment}
          onSubmit={onSubmitComment}
          onDelete={onDeleteComment}
          editCommentId={editCommentId}
          editCommentContent={editCommentContent}
          setEditCommentContent={setEditCommentContent}
          onClickEdit={onClickEditComment}
          onCancelEdit={onCancelEditComment}
          onSaveEdit={onSaveEditComment}
          loginMemberNo={loginMemberNo}
        />
      )}
    </article>
  );
}
