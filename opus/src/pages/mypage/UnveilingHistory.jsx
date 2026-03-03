import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import { useAuthStore } from "../../components/auth/useAuthStore";
import "../../css/Orders.css";

const UnveilingHistory = () => {
  const navigate = useNavigate();
  const loginMember = useAuthStore(state => state.member);
  const loginMemberNo = loginMember?.memberNo;

  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    const fetchUnveilingHistory = async () => {
      if (!loginMemberNo) return;
      try {
        const res = await axiosApi.get("/myPage/unveilingHistory", {
          params: { memberNo: loginMemberNo }
        });
        setHistoryItems(res.data);
      } catch (err) {
        console.error("응찰 내역 조회 실패:", err);
      }
    };
    fetchUnveilingHistory();
  }, [loginMemberNo]);

  // 낙찰 여부 + 결제 상태를 하나로 묶어서 우측에 표시
  const getStatusBadges = (item) => {
    const { unveilingStatus, finalizedFl, winnerMemberNo, paymentStatus } = item;
    const badges = [];

    // 1) 낙찰 여부
    if (unveilingStatus === "LIVE") {
      badges.push(<span key="bid" className="uvh-badge uvh-badge--live">진행중</span>);
    } else if (finalizedFl === 1) {
      badges.push(
        winnerMemberNo === loginMemberNo
          ? <span key="bid" className="uvh-badge uvh-badge--won">낙찰</span>
          : <span key="bid" className="uvh-badge uvh-badge--lost">유찰</span>
      );
    } else if (unveilingStatus === "NO_WINNER") {
      badges.push(<span key="bid" className="uvh-badge uvh-badge--lost">유찰</span>);
    } else {
      badges.push(<span key="bid" className="uvh-badge uvh-badge--ended">종료</span>);
    }

    // 2) 결제 상태 (낙찰자 + NONE 아닌 경우만)
    if (winnerMemberNo === loginMemberNo && paymentStatus && paymentStatus !== "NONE") {
      const map = {
        PENDING: <span key="pay" className="uvh-badge uvh-badge--pending">결제 대기</span>,
        PAID:    <span key="pay" className="uvh-badge uvh-badge--paid">결제 완료</span>,
        EXPIRED: <span key="pay" className="uvh-badge uvh-badge--expired">결제 만료</span>,
      };
      if (map[paymentStatus]) badges.push(map[paymentStatus]);
    }

    return badges;
  };

  const formatPrice = (price) =>
    price ? `${price.toLocaleString()}원` : "-";

  const formatDate = (dateStr) =>
    dateStr ? String(dateStr).substring(0, 10) : "-";

  return (
    <main className="main orders-page">
      <section className="orders-header">
        <h1 className="orders-title">경매 응찰 내역</h1>
        <p className="orders-subtitle">
          참여한 경매의 응찰 내역을 확인할 수 있습니다.
        </p>
      </section>

      <section className="orders-list">
        {historyItems.length === 0 ? (
          <div className="orders-empty">
            <i className="fa-solid fa-gavel"></i>
            <p>참여한 경매가 없습니다.</p>
          </div>
        ) : (
          historyItems.map((item) => (
            <div
              key={item.unveilingNo}
              className="order-card"
              onClick={() => navigate(`/unveiling/${item.unveilingNo}`)}
            >
              <div className="order-card__header">
                {/* 좌측: 응찰일 */}
                <div className="order-info">
                  <span className="order-date">응찰일: {formatDate(item.bidDate)}</span>
                </div>
                {/* 우측: 뱃지 묶음 (detail-btn 자리) */}
                <div className="uvh-badge-group">
                  {getStatusBadges(item)}
                </div>
              </div>

              <div className="order-card__body">
                <div className="order-product">
                  <div className="product-image">
                    {item.thumbUrl ? (
                      <img src={item.thumbUrl} alt={item.unveilingTitle} />
                    ) : (
                      <div className="product-image--empty">
                        <i className="fa-solid fa-image" />
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <p className="product-name">{item.unveilingTitle}</p>
                    <p className="product-artist">{item.productionArtist}</p>
                    <p className="product-price">
                      내 응찰가: <strong>{formatPrice(item.myMaxBidPrice)}</strong>
                    </p>
                    {item.finalizedFl === 1 && item.winnerMemberNo === loginMemberNo && (
                      <p className="product-price">
                        낙찰가: <strong>{formatPrice(item.finalPrice)}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
};

export default UnveilingHistory;