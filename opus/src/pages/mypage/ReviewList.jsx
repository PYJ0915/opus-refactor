import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import { useAuthStore } from "../../components/auth/useAuthStore";
import { getMusicalDetail } from "../../api/kopisAPI";
import { getAllExhibitions } from "../../api/kcisaAPI";
import OrderCardSkeleton from "../../components/common/OrderCardSkeleton";
import "../../css/Orders.css";

const ReviewList = () => {
  const navigate = useNavigate();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  const [reviewItems, setReviewItems] = useState([]);
  const [skeletonCount, setSkeletonCount] = useState(3);
  const [loading, setLoading] = useState(true);
  const SERVICE_KEY = import.meta.env.VITE_KOPIS_KEY;

  const getStageType = (stageNo) => {
    if (!stageNo) return "알 수 없음";
    if (stageNo.startsWith("PF")) return "뮤지컬";
    return "전시";
  };

  useEffect(() => {
    const fetchReviewList = async () => {
      try {
        setLoading(true);
        setReviewItems([]);

        const res = await axiosApi.get("/myPage/reviewList");
        const reviews = res.data;

        if (reviews.length === 0) {
          setLoading(false);
          return;
        }

        setSkeletonCount(reviews.length);

        const exhibitions = await getAllExhibitions({
          serviceKey: import.meta.env.VITE_KCISA_KEY,
          pageParam: 1
        });

        for (const review of reviews) {
          const stageNo = review.stageNo;
          let item = null;

          if (stageNo.startsWith("PF")) {
            const data = await getMusicalDetail(SERVICE_KEY, stageNo);
            if (data) {
              item = {
                reviewNo: review.reviewNo,
                stageNo,
                title: data.prfnm,
                image: data.poster,
                content: review.reviewContent,
                writeDate: review.reviewWriteDate?.substring(0, 10)
              };
            }
          } else {
            const ex = exhibitions.find(e => e.exhibitionId === stageNo);
            if (ex) {
              item = {
                reviewNo: review.reviewNo,
                stageNo,
                title: ex.title,
                image: ex.image,
                content: review.reviewContent,
                writeDate: review.reviewWriteDate?.substring(0, 10)
              };
            }
          }

          if (item) {
            setReviewItems(prev => [...prev, item]);
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

    fetchReviewList();
  }, [loginMemberNo]);

  const goToDetail = (stageNo, itemData) => {
    if (!stageNo) return;
    if (stageNo.startsWith("PF")) {
      navigate(`/onStage/musical/${stageNo}`);
    } else {
      navigate(`/onStage/exhibition/${stageNo}`, { state: { item: itemData } });
    }
  };

  const isEmpty = !loading && skeletonCount === 0 && reviewItems.length === 0;

  return (
    <div className="orders-page">
      <section className="orders-header">
        <h1 className="orders-title">작성한 후기</h1>
        <p className="orders-subtitle">
          내가 남긴 관람 후기를 확인할 수 있습니다.
        </p>
      </section>

      <section className="orders-list">
        {isEmpty ? (
          <div className="orders-empty">
            <i className="fa-solid fa-comment-slash"></i>
            <p>작성한 후기가 없습니다.</p>
          </div>
        ) : (
          <>
            {reviewItems.map((item) => (
              <div
                key={item.reviewNo}
                className="order-card"
                onClick={() => goToDetail(item.stageNo, item)}
              >
                <div className="order-card__header">
                  <div className="order-info">
                    <span className="order-date">{getStageType(item.stageNo)}</span>
                    <span className="order-id">작성일: {item.writeDate}</span>
                  </div>
                  <button
                    className="detail-btn"
                    onClick={(e) => { e.stopPropagation(); goToDetail(item.stageNo, item); }}
                  >
                    작품 보기
                  </button>
                </div>
                <div className="order-card__body">
                  <div className="order-product">
                    <div className="product-image">
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className="product-info">
                      <p className="product-name">{item.title}</p>
                      <p className="product-price">{item.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {Array.from({ length: skeletonCount }).map((_, i) => (
              <OrderCardSkeleton key={`skeleton-${i}`} />
            ))}
          </>
        )}
      </section>
    </div>
  );
};

export default ReviewList;