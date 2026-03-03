import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { orderApi } from "../../api/orderAPI";
import Loading from "../../components/common/Loading";
import "../../css/Payment.css"
import { useCartStore } from "../../store/useCartStore";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isConfirming, setIsConfirming] = useState(true);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      // URL에서 파라미터 추출
      const paymentKey = searchParams.get("paymentKey");
      const orderId = searchParams.get("orderId");
      const amount = searchParams.get("amount");

      if (!paymentKey || !orderId || !amount) {
        alert("잘못된 접근입니다.");
        navigate("/selections/cart");
        return;
      }

      try {
        const requestData = {
          paymentKey,
          orderId,
          amount: parseInt(amount)
        };

        console.log("전송할 데이터:", requestData);
        console.log("amount after parseInt:", requestData.amount);
        console.log("amount type after parseInt:", typeof requestData.amount);

        console.log("==== 전송 시작 ====")

        // 백엔드에 최종 승인 요청
        const response = await orderApi.confirmPayment(requestData);
        
        console.log("결제 승인 응답:", response);

        setOrderInfo(response);
        setIsConfirming(false);

        // 장바구니 비우기
        useCartStore.getState().clearCart();

      } catch (error) {
        console.error("=== 결제 승인 실패 ===");
        console.error("에러 전체:", error);
        console.error("에러 응답:", error.response);
        console.error("에러 응답 데이터:", error.response?.data);
        console.error("에러 응답 상태:", error.response?.status);
        console.error("에러 메시지:", error.message);

        const errorMessage = error.responsse?.data?.message
          || error.message
          || "결제 승인에 실패했습니다.";

        alert(errorMessage);
        navigate(`/payment/fail?code=CONFIRM_ERROR&message=${encodeURIComponent(errorMessage)}`);
      }
    };

    confirmPayment();
  }, [searchParams, navigate]);

  // 은행 코드 -> 은행명 매핑
  const getBankName = (bankCode) => {
    const bankMap = {
      "06": "국민은행",
      "88": "신한은행",
      "11": "농협은행",
      "20": "우리은행",
      "90": "카카오뱅크",
      "92": "토스뱅크",
      "03": "기업은행",
      "81": "하나은행",
      "39": "경남은행",
      "34": "광주은행",
      "31": "대구은행",
      "32": "부산은행",
      "37": "전북은행",
      "35": "제주은행",
      "71": "우체국",
      "23": "SC제일은행",
      "27": "씨티은행",
      "45": "새마을금고",
      "48": "신협",
      "07": "Sh수협은행"
    };

    return bankMap[bankCode] || `은행코드(${bankCode})`;
  };

  if (isConfirming) {
    return (
      <div className="payment-loading">
        <Loading />
        <p>결제를 확인하고 있습니다...</p>
      </div>
    );
  }

  return (
    <main className="main payment-success">
      <section className="payment-result">
        <div className="payment-result__icon">
          <i className="fa-solid fa-circle-check"></i>
        </div>

        <h1 className="payment-result__title">결제가 완료되었습니다</h1>

        <div className="payment-result__info">
          <div className="payment-info-row">
            <span className="payment-info-label">주문번호</span>
            <span className="payment-info-value">{orderInfo?.orderId}</span>
          </div>
          <div className="payment-info-row">
            <span className="payment-sinfo-label">결제 금액</span>
            <span className="payment-info-value">
              {Number(orderInfo?.totalAmount).toLocaleString()}원
            </span>
          </div>
          <div className="payment-info-row">
            <span className="payment-info-label">결제 수단</span>
            <span className="payment-info-value">{orderInfo?.method}</span>
          </div>

          {/* 가상계좌인 경우 계좌 정보 표시 */}
          {orderInfo?.method === "가상계좌" && orderInfo?.virtualAccount && (
            <>
              <div className="payment-info-row">
                <span className="payment-info-label">입금 은행</span>
                <span className="payment-info-value">{orderInfo.virtualAccount.bankName
                  ?? getBankName(orderInfo.virtualAccount.bankCode)}</span>
              </div>
              <div className="payment-info-row">
                <span className="payment-info-label">계좌번호</span>
                <span className="payment-info-value">{orderInfo.virtualAccount.accountNumber}</span>
              </div>
              <div className="payment-info-row">
                <span className="payment-info-label">입금 기한</span>
                <span className="payment-info-value">
                  {new Date(orderInfo.virtualAccount.dueDate).toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="payment-result__actions">
          <button
            className="payment-btn payment-btn--outline"
            onClick={() => navigate("/mypage/orders")}
          >
            주문 내역 보기
          </button>
          <button
            className="payment-btn payment-btn--solid"
            onClick={() => navigate("/")}
          >
            홈으로 가기
          </button>
        </div>
      </section>
    </main>
  );
};

export default PaymentSuccess;