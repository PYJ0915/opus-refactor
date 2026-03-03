import { useEffect, useState } from "react";
import { adminApi } from "../../api/adminAPI";

const STATUS_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "READY", label: "주문접수" },
  { value: "WAITING_FOR_DEPOSIT", label: "입금대기" },
  { value: "PAID", label: "결제완료" },
  { value: "PREPARING", label: "배송준비중" },
  { value: "SHIPPING", label: "배송중" },
  { value: "DELIVERED", label: "배송완료" },
  { value: "CANCELED", label: "취소" },
];

const STATUS_LABEL = {
  READY: "주문접수",
  WAITING_FOR_DEPOSIT: "입금대기",
  PAID: "결제완료",
  PREPARING: "배송준비중",
  SHIPPING: "배송중",
  DELIVERED: "배송완료",
  CANCELED: "취소"
};

const NEXT_STATUS = {
  READY: "PAID",
  WAITING_FOR_DEPOSIT: "PAID",
  PAID: "PREPARING",
  SHIPPING: "DELIVERED"
};

const DeliveryManage = () => {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [trackingModal, setTrackingModal] = useState(null);
  const [trackingForm, setTrackingForm] = useState({ 
    deliveryCompany: "", 
    trackingNumber: "" 
  });

  const fetchOrders = async () => {
    try {
      const data = await adminApi.getAllOrders(
        filterStatus === "ALL" ? null : filterStatus
      );
      setOrders(data);
    } catch (e) {
      console.error(e);
      alert("주문 목록 조회에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleStatusChange = async (orderNo, newStatus) => {
    if (!window.confirm(`주문 상태를 [${STATUS_LABEL[newStatus]}]으로 변경하시겠습니까?`)) 
      return;
    
    try {
      alert(`주문 상태를 [${STATUS_LABEL[newStatus]}]으로 변경했습니다.`)
      await adminApi.updateOrderStatus(orderNo, newStatus);
      fetchOrders();
    } catch (e) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const handleTrackingSubmit = async () => {
    if (!trackingForm.deliveryCompany || !trackingForm.trackingNumber) {
      alert("택배사와 송장번호를 모두 입력하세요.");
      return;
    }
    
    try {
      await adminApi.updateTracking(
        trackingModal.orderNo,
        trackingForm.deliveryCompany,
        trackingForm.trackingNumber
      );
      alert("송장번호가 등록되었습니다.");
      setTrackingModal(null);
      setTrackingForm({ deliveryCompany: "", trackingNumber: "" });
      fetchOrders();
    } catch (e) {
      alert("송장 등록에 실패했습니다.");
    }
  };

  return (
    <div>
      <h2 style={{ 
        fontSize: "20px", 
        fontWeight: 900, 
        marginBottom: "20px", 
        color: "#111827" 
      }}>
        배송 관리
      </h2>

      {/* 상태 필터 */}
      <div className="orders-filter" style={{ marginBottom: "20px" }}>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`filter-btn ${filterStatus === opt.value ? "active" : ""}`}
            onClick={() => setFilterStatus(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* 주문 목록 */}
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <i className="fa-solid fa-box-open"></i>
            <p>해당 상태의 주문이 없습니다.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.ORDER_NO} className="order-card">
              <div className="order-card__header">
                <div className="order-info">
                  <span className="order-date">{order.ORDER_DATE}</span>
                  <span className="order-id">주문번호: {order.ORDER_ID}</span>
                  <span className="order-id">주문자: {order.MEMBER_EMAIL}</span>
                </div>
                <span className={`order-status order-status--${order.ORDER_STATUS?.toLowerCase()}`}>
                  {STATUS_LABEL[order.ORDER_STATUS] || order.ORDER_STATUS}
                </span>
              </div>

              <div className="order-card__body">
                <div className="order-product">
                  <div className="product-info">
                    <p className="product-name">
                      {order.FIRST_GOODS_NAME}
                      {order.TOTAL_ITEM_COUNT > 1 && (
                        <span className="product-count">
                          {" "}외 {order.TOTAL_ITEM_COUNT - 1}건
                        </span>
                      )}
                    </p>
                    <p className="product-price">
                      {Number(order.TOTAL_AMOUNT).toLocaleString()}원 · {order.PAYMENT_METHOD}
                    </p>
                    <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>
                      {order.POSTCODE && `[${order.POSTCODE}] `}
                      {order.BASIC_ADDRESS} {order.DETAIL_ADDRESS}
                    </p>
                    {order.TRACKING_NUMBER && (
                      <p style={{ fontSize: "13px", color: "#6b7280" }}>
                        {order.DELIVERY_COMPANY} / {order.TRACKING_NUMBER}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="order-card__footer">
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {/* 다음 상태로 변경 */}
                  {NEXT_STATUS[order.ORDER_STATUS] && (
                    <button
                      className="detail-btn"
                      onClick={() => handleStatusChange(
                        order.ORDER_NO, 
                        NEXT_STATUS[order.ORDER_STATUS]
                      )}
                    >
                      {STATUS_LABEL[NEXT_STATUS[order.ORDER_STATUS]]}(으)로 변경
                    </button>
                  )}

                  {/* 송장 입력 */}
                  {order.ORDER_STATUS === "PREPARING" && (
                    <button
                      className="detail-btn"
                      onClick={() => {
                        setTrackingModal({ orderNo: order.ORDER_NO });
                        setTrackingForm({ 
                          deliveryCompany: "", 
                          trackingNumber: "" 
                        });
                      }}
                    >
                      송장번호 입력
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 송장 입력 모달 */}
      {trackingModal && (
        <div style={{
          position: "fixed", 
          inset: 0,
          background: "rgba(0,0,0,0.4)", 
          zIndex: 1000,
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", 
            borderRadius: "12px",
            padding: "32px", 
            width: "400px", 
            maxWidth: "90vw"
          }}>
            <h3 style={{ fontWeight: 900, marginBottom: "20px" }}>
              송장번호 입력
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <input
                style={{ 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "8px", 
                  padding: "10px 14px", 
                  fontSize: "14px" 
                }}
                placeholder="택배사 (예: CJ대한통운)"
                value={trackingForm.deliveryCompany}
                onChange={(e) => setTrackingForm(p => ({ 
                  ...p, 
                  deliveryCompany: e.target.value 
                }))}
              />
              <input
                style={{ 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "8px", 
                  padding: "10px 14px", 
                  fontSize: "14px" 
                }}
                placeholder="송장번호"
                value={trackingForm.trackingNumber}
                onChange={(e) => setTrackingForm(p => ({ 
                  ...p, 
                  trackingNumber: e.target.value 
                }))}
              />
            </div>
            <div style={{ 
              display: "flex", 
              gap: "8px", 
              marginTop: "20px", 
              justifyContent: "flex-end" 
            }}>
              <button 
                className="detail-btn" 
                onClick={() => setTrackingModal(null)}
              >
                취소
              </button>
              <button 
                className="shop-btn" 
                onClick={handleTrackingSubmit}
              >
                등록
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryManage;