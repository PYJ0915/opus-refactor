import React from 'react';

const REPORT_REASONS = [
  "영리목적/홍보성", "개인정보노출", "불법정보",
  "음란성/선정성", "욕설/인신공격", "같은 내용 반복(도배)",
  "운영규칙 위반", "기타"
];

export function maskEmail(email) {
  if (!email) return "";
  const [id, domain] = email.split("@");
  if (!id) return email;

  if (id.length <= 2) return id[0] + "*" + "@" + domain;

  const maskLength = 3;
  const start = Math.floor((id.length - maskLength) / 2);
  const end = start + maskLength;
  const maskedId = id.slice(0, start) + "***" + id.slice(end);

  return `${maskedId}@${domain}`;
}

export default function CommentSection({
  reviewNo,
  comments = [],
  inputComment,
  setInputComment,
  onSubmit,
  onDelete,
  editCommentId,
  editCommentContent,
  setEditCommentContent,
  onClickEdit,
  onCancelEdit,
  onSaveEdit,
  loginMemberNo,
}) {
  return (
    <div className='comments-section'>
      <div className='comment-list'>
        {comments.map(c => {
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
                      <button onClick={() => onClickEdit(c)} className="comment-edit-btn">수정</button>
                      <button onClick={() => onDelete(c.commentNo, reviewNo)} className="comment-delete-btn">삭제</button>
                    </div>
                  )}
                </div>

                {editCommentId === c.commentNo ? (
                  <div>
                    <textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      id='update_comment_textarea'
                    />
                    <div className='update_comment_inner_btn_box'>
                      <button className='update_comment_inner_btn' onClick={onCancelEdit}>취소</button>
                      <button className='update_comment_inner_btn' onClick={() => onSaveEdit(c.commentNo, reviewNo)}>저장하기</button>
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

      <div className="comment-input">
        <input
          className="input input--sm"
          type="text"
          placeholder="댓글을 입력하세요"
          value={inputComment[reviewNo] || ""}
          onChange={(e) => setInputComment(prev => ({ ...prev, [reviewNo]: e.target.value }))}
        />
        <button
          className="btn btn--dark btn--sm"
          id="submitCommentBtn"
          type="button"
          onClick={() => onSubmit(reviewNo)}
        >
          등록
        </button>
      </div>
    </div>
  );
}
