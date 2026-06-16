import "../../css/CartSuccessModal.css"

const CartSuccessModal = ({
  isOpen,
  onClose,
  onGoCart,
  onContinue,
  goods,
  qty,
  selectedOption
}) => {
  if (!isOpen) return null;

  return (
    <div className="opus-modal-overlay is-open">
      <div
        className="opus-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartModalTitle"
      >
        {/* Header */}
        <div className="opus-modal__head">
          <h3 className="opus-modal__title" id="cartModalTitle">
            장바구니에 담았어요
          </h3>
          <button
            className="opus-modal__close"
            type="button"
            aria-label="닫기"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="opus-modal__body">
          <div className="opus-modal__product">
            <div className="opus-modal__thumb">
              <img
                src={`${import.meta.env.VITE_API_URL}${goods.goodsThumbnail}`}
                alt={goods.goodsName}
              />
            </div>

            <div className="opus-modal__info">
              <p className="opus-modal__name">{goods.goodsName}</p>
              <p className="opus-modal__meta">
                수량 <strong>{qty}</strong>
                {selectedOption && (
                  <>
                    <span className="dot">·</span>
                    <span>
                      {selectedOption.goodsColor || ""}
                      {selectedOption.goodsSize
                        ? ` / ${selectedOption.goodsSize}`
                        : ""}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="opus-modal__hint">
            계속 쇼핑하시거나, 장바구니로 이동해 결제를 진행할 수 있어요.
          </div>
        </div>

        {/* Footer */}
        <div className="opus-modal__foot">
          <button
            className="opus-btn opus-btn--ghost"
            type="button"
            onClick={onContinue}
          >
            계속 쇼핑하기
          </button>
          <button
            className="opus-btn opus-btn--solid"
            type="button"
            onClick={onGoCart}
          >
            장바구니로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSuccessModal;
