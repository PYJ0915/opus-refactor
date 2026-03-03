import { useState } from "react";
import "../../css/CancelOrderModal.css";

const CancelOrderModal = ({ isOpen, onClose, onConfirm, orderInfo }) => {

  // 취소 사유 상태
  const [cancelReason, setCancelReason] = useState("");

  // 미리 정의된 취소 사유 중 선택된 사유
  const [selectedReason, setSelectedReason] = useState("");

  // 취소 사유 직접 입력 여부
  const [isCustomReason, setIsCustomReason] = useState(false);

  // 미리 정의된 취소 사유
  const predefinedReasons = [
    "단순 변심",
    "상품 정보 상이",
    "배송 지연",
    "다른 상품 잘못 주문",
    "가격 변동",
    "직접 입력"
  ];

  // 사유 선택 핸들러
  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    
    if (reason === "직접 입력") {
      // 직접 입력 선택 시 입력창 열고 취소 사유 비우기
      setIsCustomReason(true);
      setCancelReason("");
    } else {
      // 나머지는 취소 사유에 미리 선택된 취소 사유 채우기
      setIsCustomReason(false);
      setCancelReason(reason);
    }
  };

  // 취소 확인 핸들러
  const handleConfirm = () => {
    if (!cancelReason.trim()) {
      alert("취소 사유를 선택하거나 입력해주세요.");
      return;
    }
    
    // 확인 선택 시 주문 취소
    if(!confirm("취소 후에는 되돌릴 수 없습니다. 현재 주문을 취소하시겠습니까?")) return;

    // 주문 취소 함수에 취소 사유 전달
    onConfirm(cancelReason);
    // 모달 닫기 핸들러
    handleClose();
  };

  // 모달 닫기 핸들러
  const handleClose = () => {
    setCancelReason("");
    setSelectedReason("");
    setIsCustomReason(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="cancel-modal-overlay" onClick={handleClose}>
      <div className="cancel-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="cancel-modal__header">
          <h2 className="cancel-modal__title">주문 취소</h2>
          <button 
            className="cancel-modal__close"
            onClick={handleClose}
            aria-label="닫기"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* 바디 */}
        <div className="cancel-modal__body">
          {/* 주문 정보 */}
          {orderInfo && (
            <div className="cancel-order-info">
              <p className="cancel-order-info__label">주문번호</p>
              <p className="cancel-order-info__value">{orderInfo.orderId}</p>
            </div>
          )}

          {/* 안내 메시지 */}
          <div className="cancel-notice">
            <i className="fa-solid fa-circle-info"></i>
            <p>주문 취소 시 결제가 취소되며, 환불은 결제 수단에 따라 3~5일 소요될 수 있습니다.</p>
          </div>

          {/* 취소 사유 선택 */}
          <div className="cancel-reason-section">
            <label className="cancel-label">취소 사유를 선택해주세요</label>
            
            <div className="cancel-reason-options">
              {predefinedReasons.map((reason) => (
                <button
                  key={reason}
                  className={`reason-option ${selectedReason === reason ? "selected" : ""}`}
                  onClick={() => handleReasonSelect(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>

            {/* 직접 입력 */}
            {isCustomReason && (
              <div className="custom-reason">
                <textarea
                  className="custom-reason__textarea"
                  placeholder="취소 사유를 입력해주세요."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  minLength={10}
                />
                <p className="custom-reason__count">
                  {cancelReason.length}자
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 푸터 */}
        <div className="cancel-modal__footer">
          <button 
            className="cancel-modal__btn cancel-modal__btn--secondary"
            onClick={handleClose}
          >
            취소
          </button>
          <button 
            className="cancel-modal__btn cancel-modal__btn--primary"
            onClick={handleConfirm}
            disabled={!cancelReason.trim()}
          >
            주문 취소하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;
