import {
  EmailShareButton,
  EmailIcon,
  FacebookIcon,
  LineIcon,
  ThreadsIcon,
  XIcon,
} from "react-share";
import { shareKakao, copyUrl } from "../../utils/shareUtils";
import { toast } from "react-toastify";
import { useRef } from "react";
import "../../css/ShareModal.css";

export default function ShareModal({
  isOpen,
  onClose,
  url,
  title,
  description,
  imageUrl,
}) {
  const modalBackground = useRef();

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await copyUrl(url);
      toast.success("URL이 복사되었습니다");
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  const handleKakao = () => {
    shareKakao({ title, description, imageUrl, url });
  };

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  const handleLine = () => {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  const handleThreads = () => {
    window.open(
      `https://www.threads.net/intent/post?text=${encodeURIComponent(`${title} ${url}`)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=600"
    );
  };

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  };

  return (
    <div
      className="share-modal-container"
      ref={modalBackground}
      onClick={(e) => {
        if (e.target === modalBackground.current) onClose();
      }}
    >
      <div className="share-modal-content">
        <div className="share-modal-row">
          <div className="share-modal-empty" />
          <div className="share-modal-title">공유하기</div>
          <div className="share-modal-close-btn" onClick={onClose}>
            &times;
          </div>
        </div>

        <div className="share-modal-icon-row">
          {/* 카카오 */}
          <button
            className="share-modal-icon-btn"
            onClick={handleKakao}
            title="카카오톡 공유"
          >
            <img
              src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
              alt="카카오톡 공유"
              width={50}
              height={50}
            />
          </button>

          {/* 이메일 — mailto라 팝업 차단 무관, react-share 그대로 유지 */}
          <EmailShareButton url={url} subject={title} body={description}>
            <EmailIcon size={50} round />
          </EmailShareButton>

          {/* Facebook */}
          <button
            className="share-modal-icon-btn"
            onClick={handleFacebook}
            title="페이스북 공유"
          >
            <FacebookIcon size={50} round />
          </button>

          {/* LINE */}
          <button
            className="share-modal-icon-btn"
            onClick={handleLine}
            title="라인 공유"
          >
            <LineIcon size={50} round />
          </button>

          {/* Threads */}
          <button
            className="share-modal-icon-btn"
            onClick={handleThreads}
            title="쓰레드 공유"
          >
            <ThreadsIcon size={50} round />
          </button>

          {/* X (트위터) */}
          <button
            className="share-modal-icon-btn"
            onClick={handleTwitter}
            title="X(트위터) 공유"
          >
            <XIcon size={50} round />
          </button>
        </div>

        <div className="share-modal-copy-row">
          <div>{url}</div>
          <div className="share-modal-copy-btn" onClick={handleCopy}>
            복사
          </div>
        </div>
      </div>
    </div>
  );
}