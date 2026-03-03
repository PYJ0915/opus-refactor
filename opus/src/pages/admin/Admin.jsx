import { useEffect, useState } from "react";
import axiosApi from "../../api/axiosAPI";
import "../../css/Orders.css";
import DeliveryManage from "./DeliveryManage";
import GoodsManage from "./GoodsManage";
import UnveilingManage from "./UnveilingManage";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("report");
  const [items, setItems] = useState([]);

  const fetchAdminData = async () => {
    try {
      if (activeTab === "report") {
        const resp = await axiosApi.get("/admin/report");
        if (resp.status === 200) setItems(resp.data);
      } else if (activeTab === "restore") {
        const resp = await axiosApi.get("/admin/restore");
        if (resp.status === 200) setItems(resp.data);
      }
    } catch (error) {
      console.error(error);
      setItems([]);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const confirmReview = async (reportNo) => {
    try {
      const resp = await axiosApi.post("/admin/confirmReview", null, { params: { reportNo } });
      if (resp.status === 200) {
        alert("신고된 후기가 삭제되었습니다. (신고 승인)");
        fetchAdminData();
      }
    } catch (error) { console.log(error); }
  };

  const cancleReview = async (reportNo) => {
    try {
      const resp = await axiosApi.post("/admin/rejectReview", null, { params: { reportNo } });
      if (resp.status === 200) {
        alert("신고된 후기를 목록에서 삭제하였습니다. (신고 거절)");
        fetchAdminData();
      }
    } catch (error) { console.log(error); }
  };

  const restoreReview = async (reviewNo) => {
    try {
      const resp = await axiosApi.post("/admin/restoreReview", null, { params: { reviewNo } });
      if (resp.status === 200) {
        alert("삭제된 후기를 복구하였습니다.");
        fetchAdminData();
      }
    } catch (error) { console.log(error); }
  };

  return (
    <main className="main orders-page">
      <section className="orders-header">
        <h1 className="orders-title">관리자 페이지</h1>
        <p className="orders-subtitle">
          신고 / 복구 / 상품 / 배송 / 경매를 관리할 수 있습니다.
        </p>
      </section>

      <section className="orders-header">
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className={`filter-btn ${activeTab === "report" ? "active" : ""}`} onClick={() => setActiveTab("report")}>신고 관리</button>
          <button className={`filter-btn ${activeTab === "restore" ? "active" : ""}`} onClick={() => setActiveTab("restore")}>복구 관리</button>
          <button className={`filter-btn ${activeTab === "goodsManage" ? "active" : ""}`} onClick={() => setActiveTab("goodsManage")}>상품 관리</button>
          <button className={`filter-btn ${activeTab === "delivery" ? "active" : ""}`} onClick={() => setActiveTab("delivery")}>배송 관리</button>
          <button className={`filter-btn ${activeTab === "unveiling" ? "active" : ""}`} onClick={() => setActiveTab("unveiling")}>경매 관리</button>
        </div>
      </section>

      {/* 신고 관리 탭 */}
      {activeTab === "report" && (
        <section className="orders-list">
          <h2 style={{ marginBottom: "10px" }}>신고 관리</h2>
          {items.length === 0 ? (
            <div className="orders-empty">
              <i className="fa-solid fa-database"></i>
              <p>신고 내역이 없습니다.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="order-card">
                <div className="order-card__header">
                  <div className="order-info">
                    <span className="order-date">신고된 후기</span>
                    <span className="product-price">작성자: {item.reporterNo}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="detail-btn" onClick={() => confirmReview(item.reportNo)}>승인</button>
                    <button className="detail-btn" onClick={() => cancleReview(item.reportNo)}>취소</button>
                  </div>
                </div>
                <div className="order-card__body">
                  <div className="order-product">
                    <div className="product-info">
                      <p className="product-name">{item.reportReason || "신고 사유 없음"}</p>
                      <p className="product-name">{item.reportDetail || "신고 상세 내용 없음"}</p>
                      <p className="product-name">신고 상태: {item.reportStatus}</p>
                      <p className="product-name">신고일: {item.reportDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* 복구 관리 탭 */}
      {activeTab === "restore" && (
        <section className="orders-list">
          <h2 style={{ marginBottom: "10px" }}>복구 관리</h2>
          {items.length === 0 ? (
            <div className="orders-empty">
              <i className="fa-solid fa-database"></i>
              <p>복구 요청이 없습니다.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="order-card">
                <div className="order-card__header">
                  <div className="order-info">
                    <span className="order-date">복구 요청</span>
                    <span className="product-price">작성자: {item.reporterNo}</span>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="detail-btn" onClick={() => restoreReview(item.reviewNo)}>복구</button>
                  </div>
                </div>
                <div className="order-card__body">
                  <div className="order-product">
                    <div className="product-info">
                      <p className="product-name">회원 이메일 : {item.memberEmail}</p>
                      <p className="product-name">공연/전시 번호 : {item.stageNo}</p>
                      <p className="product-name">후기 내용 : {item.reviewContent}</p>
                      <p className="product-name">작성일 : {item.reviewWriteDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {/* 상품 관리 탭 */}
      {activeTab === "goodsManage" && <GoodsManage />}

      {/* 배송 관리 탭 */}
      {activeTab === "delivery" && <DeliveryManage />}

      {/* 경매 관리 탭 */}
      {activeTab === "unveiling" && (
        <section className="orders-list">
          <UnveilingManage />
        </section>
      )}
    </main>
  );
};

export default Admin;