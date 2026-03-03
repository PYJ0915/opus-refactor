export default function AuctionInfo() {
  return (
    <section id="auction-info" className="info">
      <div className="info__inner">
        <h2 className="info__h2">경매 안내</h2>

        <div className="info__grid">
          <div className="info-card">
            <div className="info-card__icon">
              <i className="fa-solid fa-user-check" />
            </div>
            <h3 className="info-card__title">본인 인증</h3>
            <p className="info-card__desc">
              안전한 경매 참여를 위해 <br />
              본인 인증이 필요합니다
            </p>
          </div>

          <div className="info-card">
            <div className="info-card__icon">
              <i className="fa-solid fa-gavel" />
            </div>
            <h3 className="info-card__title">마감형 입찰</h3>
            <p className="info-card__desc">
              정해진 마감 시간까지<br />
              최고가 입찰자가 낙찰됩니다
            </p>
          </div>

          <div className="info-card">
            <div className="info-card__icon">
              <i className="fa-solid fa-shield-halved" />
            </div>
            <h3 className="info-card__title">안전한 거래</h3>
            <p className="info-card__desc">
              전문가 검증을 거친<br />
              신뢰 가능한 작품만 등록됩니다
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
