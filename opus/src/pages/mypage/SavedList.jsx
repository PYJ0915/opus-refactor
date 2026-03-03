import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosApi from "../../api/axiosAPI";
import { useAuthStore } from "../../components/auth/useAuthStore";
import { getMusicalDetail } from "../../api/kopisAPI";
import { getAllExhibitions } from "../../api/kcisaAPI";
import "../../css/Orders.css";

const SavedList = () => {
  const navigate = useNavigate();
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  const [savedItems, setSavedItems] = useState([]);
  const SERVICE_KEY = "f8d2111671454d7bb5b0102d85c7cf1c";

  const getStageType = (stageNo) => {
    if (!stageNo) return "알 수 없음";
    if (stageNo.startsWith("PF")) return "뮤지컬";
    return "전시";
  };

  useEffect(() => {
    const fetchSavedList = async () => {
      if (!loginMemberNo) return;

      try {
        const res = await axiosApi.get("/myPage/savedList", {
          params: { memberNo: loginMemberNo }
        });

        const stageNos = res.data;

        const exhibitions = await getAllExhibitions({
          serviceKey: "bcec5111-252e-47c3-9dca-4b943cf5a0ed",
          pageParam: 1
        });

        const detailedItems = await Promise.all(
          stageNos.map(async (stageNo) => {
            if (stageNo.startsWith("PF")) {
              const data = await getMusicalDetail(SERVICE_KEY, stageNo);
              if (!data) return null;

              return {
                stageNo,
                title: data.prfnm,
                place: data.fcltynm,
                image: data.poster
              };
            }

            const ex = exhibitions.find(e => e.exhibitionId === stageNo);
            if (!ex) return null;

            return {
              stageNo,
              title: ex.title,
              place: ex.place,
              image: ex.image
            };
          })
        );

        setSavedItems(detailedItems.filter(Boolean));
      } catch (err) {
        console.error(err);
      }
    };

    fetchSavedList();
  }, [loginMemberNo]);

  const goToDetail = (stageNo) => {
    if (!stageNo) return;

    if (stageNo.startsWith("PF")) {
      navigate(`/onStage/musical/${stageNo}`);
    } else {
      navigate(`/onStage/exhibition/${stageNo}`);
    }
  };

  return (
    <main className="main orders-page">
      <section className="orders-header">
        <h1 className="orders-title">찜한 작품</h1>
        <p className="orders-subtitle">
          관심 등록한 공연 및 전시 목록을 확인하실 수 있습니다.
        </p>
      </section>

      <section className="orders-list">
        {savedItems.length === 0 ? (
          <div className="orders-empty">
            <i className="fa-solid fa-heart-circle-xmark"></i>
            <p>찜한 작품이 없습니다.</p>
          </div>
        ) : (
          savedItems.map((item) => (
            <div
              key={item.stageNo}
              className="order-card"
              onClick={() => goToDetail(item.stageNo)}
            >
              <div className="order-card__header">
                <div className="order-info">
                  <span className="order-date">
                    {getStageType(item.stageNo)}
                  </span>
                </div>
                <button
                  className="detail-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToDetail(item.stageNo);
                  }}
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
          ))
        )}
      </section>
    </main>
  );
};

export default SavedList;