import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { orderApi } from "../../api/orderAPI";
import Loading from "../../components/common/Loading";
import "../../css/OrderDetail.css";
import CancelOrderModal from "./CancelOrderModal";
import ScrollToTop from "../../components/common/ScrollToTop";

const OrderDetail = () => {
  const { orderNo } = useParams();
  const navigate = useNavigate();

  // 주문 상세 상태
  const [order, setOrder] = useState(null);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 취소 모달 열림 여부
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // 주문 상세 조회 함수
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        console.log("==== 주문 상세 조회 시작 ====")
        const data = await orderApi.getOrderDetail(orderNo);
        console.log("주문 상세 조회 완료", data)
        setOrder(data);
      } catch (error) {
        console.error("주문 상세 조회 실패:", error);
        alert("주문 정보를 불러오는데 실패했습니다.");
        navigate("/mypage/orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderNo, navigate]);

  // 주문 취소 모달 열기
  const handleOpenCancelModal = () => {
    setIsCancelModalOpen(true);
  };

  // 주문 취소
  const handleConfirmCancel = async (cancelReason) => {
    try {
      console.log("주문 취소 시작", order.orderId, cancelReason);
      await orderApi.cancelOrder(order.orderId, cancelReason);
      alert("주문이 취소되었습니다.");

      // 새로고침
      const data = await orderApi.getOrderDetail(orderNo);
      setOrder(data);
    } catch (error) {
      console.error("주문 취소 실패:", error);
      alert(error.response?.data?.message || "주문 취소에 실패했습니다.");
    }
  };

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

  if (isLoading) {
    return <Loading />;
  }

  if (!order) {
    return <div>주문 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <main className="main order-detail-page">
      {/* 주문 상태 헤더 */}
      <section className="order-status-header">
        <h1 className="order-status-title">
          {order.orderStatus === "CANCELED" ? "주문이 취소되었습니다" : "주문이 완료되었습니다"}
        </h1>
        <p className="order-date">{order.orderDate}</p>
      </section>

      {/* 주문 정보 */}
      <section className="order-info-section">
        <h2 className="section-title">주문 정보</h2>
        <div className="info-box">
          <div className="info-row">
            <span className="info-label">주문번호</span>
            <span className="info-value">{order.orderId}</span>
          </div>
          <div className="info-row">
            <span className="info-label">주문일시</span>
            <span className="info-value">{order.orderDate}</span>
          </div>
          <div className="info-row">
            <span className="info-label">주문상태</span>
            <span className={`info-value status-${order.orderStatus.toLowerCase()}`}>
              {{
                READY: "주문접수",
                WAITING_FOR_DEPOSIT: "입금대기",
                PAID: "결제완료",
                PREPARING: "배송준비중",
                SHIPPING: "배송중",
                DELIVERED: "배송완료",
                CANCELED: "취소",
                REFUNDED: "환불완료",
              }[order.orderStatus] || order.orderStatus}
            </span>
          </div>
        </div>
      </section>

      {/* 주문 상품 */}
      <section className="order-items-section">
        <h2 className="section-title">주문 상품</h2>
        <div className="items-box">
          {order.items.map((item) => (
            <div key={item.orderItemNo} className="item-card">
              <div className="item-image">
                <img
                  src={`${import.meta.env.VITE_API_URL}${item.thumbnail}`}
                  alt={item.goodsName}
                />
              </div>
              <div className="item-info">
                <p className="item-name">{item.goodsName}</p>
                <p className="item-option">
                  {item.goodsSize && `사이즈: ${item.goodsSize}`}
                  {item.goodsColor && ` / 색상: ${item.goodsColor}`}
                </p>
                <p className="item-qty">수량: {item.qty}개</p>
              </div>
              <div className="item-price">
                {Number(item.unitPrice * item.qty).toLocaleString()}원
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 결제 정보 */}
      <section className="payment-info-section">
        <h2 className="section-title">결제 정보</h2>
        <div className="info-box">
          <div className="info-row">
            <span className="info-label">결제 수단</span>
            <span className="info-value">{order.paymentMethod}</span>
          </div>
          <div className="info-row">
            <span className="info-label">상품 금액</span>
            <span className="info-value">{Number(order.goodsAmount).toLocaleString()}원</span>
          </div>
          <div className="info-row">
            <span className="info-label">배송비</span>
            <span className="info-value">{Number(order.deliveryAmount).toLocaleString()}원</span>
          </div>
          <div className="info-row info-row--total">
            <span className="info-label">총 결제 금액</span>
            <span className="info-value">{Number(order.totalAmount).toLocaleString()}원</span>
          </div>

          {/* 가상계좌 정보 */}
          {order.paymentMethod === "가상계좌" && order.virtualAccountNumber && (
            <>
              <div className="info-divider"></div>
              <div className="info-row">
                <span className="info-label">입금 은행</span>
                <span className="info-value">{getBankName(order.virtualAccountBank)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">계좌번호</span>
                <span className="info-value">{order.virtualAccountNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">입금 기한</span>
                <span className="info-value">{order.virtualAccountDueDate}</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 배송 정보 */}
      <section className="delivery-info-section">
        <h2 className="section-title">배송 정보</h2>
        <div className="info-box">
          <div className="info-row">
            <span className="info-label">수령인</span>
            <span className="info-value">{order.recipient}</span>
          </div>
          <div className="info-row">
            <span className="info-label">연락처</span>
            <span className="info-value">{order.recipientTel}</span>
          </div>
          <div className="info-row">
            <span className="info-label">주소</span>
            <span className="info-value">
              [{order.postcode}] {order.basicAddress} {order.detailAddress}
            </span>
          </div>
          {order.deliveryReq && (
            <div className="info-row">
              <span className="info-label">배송 메모</span>
              <span className="info-value">{order.deliveryReq}</span>
            </div>
          )}

          {/* 송장 정보 */}
          {order.orderStatus === "PREPARING" && !order.trackingNumber && (
            <>
              <div className="info-divider"></div>
              <div className="info-row">
                <span className="info-label">배송 현황</span>
                <span className="info-value" style={{ color: "#c2410c" }}>
                  배송 준비 중입니다. 곧 출발 예정입니다.
                </span>
              </div>
            </>
          )}

          {/* ✅ 송장번호 표시 (배송중 이상일 때) */}
          {order.trackingNumber && (
            <>
              <div className="info-divider"></div>
              <div className="info-row">
                <span className="info-label">택배사</span>
                <span className="info-value">{order.deliveryCompany}</span>
              </div>
              <div className="info-row">
                <span className="info-label">송장번호</span>
                <span className="info-value">{order.trackingNumber}</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 액션 버튼 */}
      <section className="order-actions">
        {(order.orderStatus === "READY" ||
          order.orderStatus === "WAITING_FOR_DEPOSIT" ||
          order.orderStatus === "PAID") && (
            <button
              className="cancel-btn"
              onClick={handleOpenCancelModal}
            >
              주문 취소
            </button>
          )}

        <button
          className="back-btn"
          onClick={() => navigate("/mypage/orders")}
        >
          목록으로
        </button>
      </section>

      {/* 주문 취소 모달 */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        orderInfo={{
          orderId: order?.orderId,
        }}
      />

    </main>
  );
};

export default OrderDetail;