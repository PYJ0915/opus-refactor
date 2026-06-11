import { EmailShareButton, FacebookShareButton, LineShareButton, ThreadsShareButton, TwitterShareButton } from "react-share";
import { EmailIcon, FacebookIcon, LineIcon, ThreadsIcon, XIcon } from "react-share";
import { shareKakao, copyUrl } from "../../utils/shareUtils";
import { toast } from "react-toastify";
import { useRef } from "react";
import "../../css/ShareModal.css"

export default function ShareModal({ isOpen, onClose, url, title, description, imageUrl }) {
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

  return (
    <div
      className="share-modal-container"
      ref={modalBackground}
      onClick={(e) => { if (e.target === modalBackground.current) onClose(); }}
    >
      <div className="share-modal-content">
        <div className="share-modal-row">
          <div className="share-modal-empty" />
          <div className="share-modal-title">공유하기</div>
          <div className="share-modal-close-btn" onClick={onClose}>&times;</div>
        </div>

        <div className="share-modal-icon-row">
          <button className="share-modal-kakao-btn" onClick={handleKakao}>
            <img
              src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_medium.png"
              alt="카카오톡 공유"
              width={50}
              height={50}
            />
          </button>

          <EmailShareButton url={url} subject={title} body={description}>
            <EmailIcon size={50} round />
          </EmailShareButton>

          <FacebookShareButton url={url}>
            <FacebookIcon size={50} round />
          </FacebookShareButton>

          <LineShareButton url={url}>
            <LineIcon size={50} round />
          </LineShareButton>

          <ThreadsShareButton url={url}>
            <ThreadsIcon size={50} round />
          </ThreadsShareButton>

          <TwitterShareButton url={url} title={title}>
            <XIcon size={50} round />
          </TwitterShareButton>
        </div>

        <div className="share-modal-copy-row">
          <div>{url}</div>
          <div className="share-modal-copy-btn" onClick={handleCopy}>복사</div>
        </div>
      </div>
    </div>
  );
}