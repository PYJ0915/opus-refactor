import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../../api/orderAPI";
import Loading from "../../components/common/Loading";
import "../../css/Orders.css";
import ScrollToTop from "../../components/common/ScrollToTop";

const Orders = () => {
  const navigate = useNavigate();

  // 주문 목록 상태
  const [orders, setOrders] = useState([]);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 주문 현황 상태
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // 주문 상태 필터 옵션
  const statusOptions = [
    { value: "ALL", label: "전체" },
    { value: "WAITING_FOR_DEPOSIT", label: "입금대기" },
    { value: "PAID", label: "결제완료" },
    { value: "PREPARING", label: "배송준비중" },
    { value: "SHIPPING", label: "배송중" },
    { value: "DELIVERED", label: "배송완료" },
    { value: "CANCELED", label: "취소" },
  ];

  // 주문 목록 조회 함수
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);

        console.log("==== 주문 목록 조회 시작 ====")

        const data = selectedStatus === "ALL"
          ? await orderApi.getMyOrders()
          : await orderApi.getMyOrdersByStatus(selectedStatus);

        console.log("주문 목록 조회 완료", data)

        setOrders(data);
      } catch (error) {
        console.error("주문 목록 조회 실패:", error);
        alert("주문 목록을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [selectedStatus]);

  // 주문 상태 한글 변환
  const getStatusLabel = (status) => {
    const statusMap = {
      "READY": "주문접수",
      "WAITING_FOR_DEPOSIT": "입금대기",
      "PAID": "결제완료",
      "PREPARING": "배송준비중",
      "SHIPPING": "배송중",
      "DELIVERED": "배송완료",
      "CANCELED": "취소",
      "REFUNDED": "환불완료"
    };
    return statusMap[status] || status;
  };

  // 주문 상세 페이지로 이동
  const goToDetail = (orderNo) => {
    navigate(`/mypage/orders/${orderNo}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <main className="main orders-page">
      <section className="orders-header">
        <h1 className="orders-title">주문 내역</h1>
        <p className="orders-subtitle">구매하신 상품의 주문 내역을 확인하실 수 있습니다.</p>
      </section>

      {/* 필터 */}
      <section className="orders-filter">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            className={`filter-btn ${selectedStatus === option.value ? "active" : ""}`}
            onClick={() => setSelectedStatus(option.value)}
          >
            {option.label}
          </button>
        ))}
      </section>

      {/* 주문 목록 */}
      <section className="orders-list">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <i className="fa-solid fa-box-open"></i>
            <p>주문 내역이 없습니다.</p>
            <button
              className="shop-btn"
              onClick={() => navigate("/selections")}
            >
              쇼핑 계속하기
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.orderNo}
              className="order-card"
              onClick={() => goToDetail(order.orderNo)}
            >
              {/* 주문 헤더 */}
              <div className="order-card__header">
                <div className="order-info">
                  <span className="order-date">{order.orderDate}</span>
                  <span className="order-id">주문번호: {order.orderId}</span>
                </div>
                <span className={`order-status order-status--${order.orderStatus.toLowerCase()}`}>
                  {getStatusLabel(order.orderStatus)}
                </span>
              </div>

              {/* 주문 상품 */}
              <div className="order-card__body">
                <div className="order-product">
                  <div className="product-image">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${order.firstThumbnail}`}
                      alt={order.firstGoodsName}
                    />
                  </div>
                  <div className="product-info">
                    <p className="product-name">
                      {order.firstGoodsName}
                      {order.totalItemCount > 1 && (
                        <span className="product-count">
                          외 {order.totalItemCount - 1}건
                        </span>
                      )}
                    </p>
                    <p className="product-price">
                      {Number(order.totalAmount).toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>

              {/* 주문 푸터 */}
              <div className="order-card__footer">
                <div className="delivery-info">
                  {order.trackingNumber ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontWeight: 700, color: "#374151" }}>
                        {order.deliveryCompany}
                      </span>
                      <span>송장번호: {order.trackingNumber}</span>
                    </div>
                  ) : order.orderStatus === "PREPARING" ? (
                    // 배송준비중일 때 안내 문구
                    <span style={{ color: "#c2410c", fontWeight: 600 }}>
                      배송 준비 중입니다
                    </span>
                  ) : null}
                </div>
                <button
                  className="detail-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToDetail(order.orderNo);
                  }}
                >
                  상세보기
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default Orders;