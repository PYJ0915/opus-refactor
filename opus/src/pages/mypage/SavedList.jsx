import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import { useAuthStore } from "../../components/auth/useAuthStore";
import { getMusicalDetail } from "../../api/kopisAPI";
import { getAllExhibitions } from "../../api/kcisaAPI";
import OrderCardSkeleton from "../../components/common/OrderCardSkeleton";
import "../../css/Orders.css";

const SavedList = () => {
  const navigate = useNavigate();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  const [savedItems, setSavedItems] = useState([]);
  const [skeletonCount, setSkeletonCount] = useState(3); // 초기 스켈레톤 개수
  const [loading, setLoading] = useState(true);
  const SERVICE_KEY = import.meta.env.VITE_KOPIS_KEY;

  const getStageType = (stageNo) => {
    if (!stageNo) return "알 수 없음";
    if (stageNo.startsWith("PF")) return "뮤지컬";
    return "전시";
  };

  useEffect(() => {
    const fetchSavedList = async () => {
      try {
        setLoading(true);
        setSavedItems([]);

        const res = await axiosApi.get("/myPage/savedList");
        const stageNos = res.data;

        if (stageNos.length === 0) {
          setLoading(false);
          return;
        }

        // 실제 개수만큼 스켈레톤 표시
        setSkeletonCount(stageNos.length);

        const exhibitions = await getAllExhibitions({
          serviceKey: import.meta.env.VITE_KCISA_KEY,
          pageParam: 1
        });

        // 점진적 렌더링 — 완성된 것부터 하나씩 추가
        for (const stageNo of stageNos) {
          let item = null;

          if (stageNo.startsWith("PF")) {
            const data = await getMusicalDetail(SERVICE_KEY, stageNo);
            if (data) {
              item = {
                stageNo,
                title: data.prfnm,
                place: data.fcltynm,
                image: data.poster
              };
            }
          } else {
            const ex = exhibitions.find(e => e.exhibitionId === stageNo);
            if (ex) {
              item = {
                stageNo,
                title: ex.title,
                place: ex.place,
                image: ex.image
              };
            }
          }

          if (item) {
            setSavedItems(prev => [...prev, item]);
            // 카드 하나 추가될 때마다 스켈레톤 하나 줄임
            setSkeletonCount(prev => Math.max(0, prev - 1));
          } else {
            setSkeletonCount(prev => Math.max(0, prev - 1));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setSkeletonCount(0);
      }
    };

    fetchSavedList();
  }, []);

  const goToDetail = (stageNo) => {
    if (!stageNo) return;
    if (stageNo.startsWith("PF")) {
      navigate(`/onStage/musical/${stageNo}`);
    } else {
      navigate(`/onStage/exhibition/${stageNo}`);
    }
  };

  const isEmpty = !loading && skeletonCount === 0 && savedItems.length === 0;

  return (
    <div className="orders-page">
      <section className="orders-header">
        <h1 className="orders-title">찜한 작품</h1>
        <p className="orders-subtitle">
          관심 등록한 공연 및 전시 목록을 확인하실 수 있습니다.
        </p>
      </section>

      <section className="orders-list">
        {isEmpty ? (
          <div className="orders-empty">
            <i className="fa-solid fa-heart-circle-xmark"></i>
            <p>찜한 작품이 없습니다.</p>
          </div>
        ) : (
          <>
            {/* 완성된 카드 */}
            {savedItems.map((item) => (
              <div
                key={item.stageNo}
                className="order-card"
                onClick={() => goToDetail(item.stageNo)}
              >
                <div className="order-card__header">
                  <div className="order-info">
                    <span className="order-date">{getStageType(item.stageNo)}</span>
                  </div>
                  <button
                    className="detail-btn"
                    onClick={(e) => { e.stopPropagation(); goToDetail(item.stageNo); }}
                  >
                    상세보기
                  </button>
                </div>
                <div className="order-card__body">
                  <div className="order-product">
                    <div className="product-image">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="product-info">
                      <p className="product-name">{item.title}</p>
                      <p className="product-price">{item.place}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 아직 로딩 중인 자리 — 스켈레톤 */}
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <OrderCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </section>
    </div>
  );
};

export default SavedList;