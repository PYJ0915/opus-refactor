import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { orderApi } from "../../api/orderAPI";
import "../../css/Payment.css"

const PaymentFail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const abandonedRef = useRef(false);
  
  const errorCode = searchParams.get("code") || "UNKNOWN_ERROR";
  const errorMessage = searchParams.get("message") || "알 수 없는 오류가 발생했습니다.";
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId || abandonedRef.current) return;
    abandonedRef.current = true;

    orderApi.abandonOrder(orderId)
      .then(() => console.log("모바일 결제 취소 - 주문 철회 완료:", orderId))
      .catch((err) => console.error("주문 철회 실패:", err));
  }, [orderId]);

  return (
    <main className="main payment-fail">
      <section className="payment-result">
        <div className="payment-result__icon payment-result__icon--error">
          <i className="fa-solid fa-circle-xmark"></i>
        </div>
        
        <h1 className="payment-result__title">결제에 실패했습니다</h1>
        
        <div className="payment-result__error">
          <p className="payment-error-code">오류 코드: {errorCode}</p>
          <p className="payment-error-message">{errorMessage}</p>
        </div>

        <div className="payment-result__actions">
          <button 
            className="payment-btn payment-btn--outline"
            onClick={() => navigate("/selections/cart")}
          >
            장바구니로 돌아가기
          </button>
          <button 
            className="payment-btn payment-btn--solid"
            onClick={() => navigate("/selections/checkout")}
          >
            다시 시도하기
          </button>
        </div>
      </section>
    </main>
  );
};

export default PaymentFail;