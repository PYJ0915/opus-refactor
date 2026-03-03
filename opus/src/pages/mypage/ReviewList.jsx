import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import { useAuthStore } from "../../components/auth/useAuthStore";
import { getMusicalDetail } from "../../api/kopisAPI";
import { getAllExhibitions } from "../../api/kcisaAPI";
import "../../css/Orders.css";

const ReviewList = () => {
  const navigate = useNavigate();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  const [reviewItems, setReviewItems] = useState([]);
  const SERVICE_KEY = "f8d2111671454d7bb5b0102d85c7cf1c";

  const getStageType = (stageNo) => {
    if (!stageNo) return "알 수 없음";
    if (stageNo.startsWith("PF")) return "뮤지컬";
    return "전시";
  };

  useEffect(() => {
    const fetchReviewList = async () => {
      if (!loginMemberNo) return;

      try {
        const res = await axiosApi.get("/myPage/reviewList", {
          params: { memberNo: loginMemberNo }
        });

        const reviews = res.data;

        const exhibitions = await getAllExhibitions({
          serviceKey: "bcec5111-252e-47c3-9dca-4b943cf5a0ed",
          pageParam: 1
        });

        const detailedItems = await Promise.all(
          reviews.map(async (review) => {
            const stageNo = review.stageNo;

            if (stageNo.startsWith("PF")) {
              const data = await getMusicalDetail(SERVICE_KEY, stageNo);
              if (!data) return null;

              return {
                reviewNo: review.reviewNo,
                stageNo,
                title: data.prfnm,
                image: data.poster,
                content: review.reviewContent,
                writeDate: review.reviewWriteDate?.substring(0, 10)
              };
            }

            const ex = exhibitions.find(e => e.exhibitionId === stageNo);
            if (!ex) return null;

            return {
              reviewNo: review.reviewNo,
              stageNo,
              title: ex.title,
              image: ex.image,
              content: review.reviewContent,
              writeDate: review.reviewWriteDate?.substring(0, 10)
            };
          })
        );

        setReviewItems(detailedItems.filter(Boolean));
      } catch (err) {
        console.error(err);
      }
    };

    fetchReviewList();
  }, [loginMemberNo]);

  const goToDetail = (stageNo, itemData) => {
    if (!stageNo) return;

    if (stageNo.startsWith("PF")) {
      navigate(`/onStage/musical/${stageNo}`);
    } else {
      navigate(`/onStage/exhibition/${stageNo}`, {
        state : { item : itemData }
      });
    }
  };

  return (
    <main className="main orders-page">
      <section className="orders-header">
        <h1 className="orders-title">작성한 후기</h1>
        <p className="orders-subtitle">
          내가 남긴 관람 후기를 확인할 수 있습니다.
        </p>
      </section>

      <section className="orders-list">
        {reviewItems.length === 0 ? (
          <div className="orders-empty">
            <i className="fa-solid fa-comment-slash"></i>
            <p>작성한 후기가 없습니다.</p>
          </div>
        ) : (
          reviewItems.map((item) => (
            <div
              key={item.reviewNo}
              className="order-card"
              onClick={() => goToDetail(item.stageNo, item)}
            >
              <div className="order-card__header">
                <div className="order-info">
                  <span className="order-date">
                    {getStageType(item.stageNo)}
                  </span>
                  <span className="order-id">
                    작성일: {item.writeDate}
                  </span>
                </div>
                <button
                  className="detail-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToDetail(item.stageNo, item);
                  }}
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
          ))
        )}
      </section>
    </main>
  );
};

export default ReviewList;