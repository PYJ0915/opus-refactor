import { useState } from "react";
import { useNavigate } from "react-router-dom";

const VISIBLE_COUNT = 5;
const CARD_WIDTH = 260;
const GAP = 24;

function MdPickSlider({ title, data, type }) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const total = data.length;
  const canSlide = total > VISIBLE_COUNT;
  const maxIndex = Math.max(0, total - VISIBLE_COUNT);

  const handlePrev = () => setIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  const handleNext = () => setIndex((prev) => (prev === maxIndex ? 0 : prev + 1));

  const handleCardClick = (item) => {
    if (type === "exhibition") {
      navigate(`/onStage/exhibition/${item.exhibitionId}`, { state: { item } });
    } else {
      navigate(`/onStage/musical/${item.mt20id}`);
    }
  };

  const renderExhibitionCard = (item) => (
    <div className="mdpick-card" onClick={() => handleCardClick(item)}>
      <div className="mdpick-card__thumb">
        <img src={item.image} alt={item.title} />
      </div>
      <div className="mdpick-card__body">
        <p className="mdpick-card__title">{item.title}</p>
        <p className="mdpick-card__meta">{item.place}</p>
        <p className="mdpick-card__meta">{item.period}</p>
      </div>
    </div>
  );

  const renderMusicalCard = (item) => (
    <div className="mdpick-card" onClick={() => handleCardClick(item)}>
      <div className="mdpick-card__thumb">
        <img src={item.poster} alt={item.prfnm} />
      </div>
      <div className="mdpick-card__body">
        <p className="mdpick-card__title">{item.prfnm}</p>
        <p className="mdpick-card__meta">{item.fcltynm}</p>
        <p className="mdpick-card__meta">{item.prfpdfrom} ~ {item.prfpdto}</p>
      </div>
    </div>
  );

  if (data.length === 0) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="section__head">
            <h2 className="section__title">{title}</h2>
          </div>
          <div style={{ padding: "40px 0", color: "#9ca3af", fontWeight: 700 }}>
            불러오는 중...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="section__head">
          <h2 className="section__title">{title}</h2>
        </div>

        <div className="mdpick-layout">
          <div className="mdpick-hitbox">
            <div className="mdpick-content">
              <div className="slider-viewport">
                <div
                  className="slider-track"
                  style={{
                    transform: `translateX(-${index * (CARD_WIDTH + GAP)}px)`,
                  }}
                >
                  {data.map((item, i) => (
                    <div
                      className="mdpick-cardwrap"
                      key={type === "exhibition" ? item.exhibitionId : item.mt20id || i}
                    >
                      {type === "exhibition"
                        ? renderExhibitionCard(item)
                        : renderMusicalCard(item)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {canSlide && (
              <>
                <button
                  className="slider-btn slider-btn--prev"
                  onClick={handlePrev}
                  type="button"
                  aria-label="Previous"
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button
                  className="slider-btn slider-btn--next"
                  onClick={handleNext}
                  type="button"
                  aria-label="Next"
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MdPickSlider;