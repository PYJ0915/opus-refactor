import "../../css/InfoPages.css";

const values = [
  {
    icon: "fa-solid fa-landmark",
    title: "문화의 접근성",
    desc: "누구나 쉽게 전시와 공연 정보를 탐색하고, 문화 생활을 시작할 수 있도록 합니다."
  },
  {
    icon: "fa-solid fa-handshake",
    title: "신뢰와 투명성",
    desc: "공공데이터를 기반으로 정확한 정보를 제공하고, 경매와 거래에서 투명한 운영을 지향합니다."
  },
  {
    icon: "fa-solid fa-palette",
    title: "예술가와의 연대",
    desc: "미술품 경매와 굿즈 판매를 통해 예술가와 창작자의 작품이 더 많은 이들에게 닿도록 돕습니다."
  }
];

const services = [
  {
    label: "On-Stage",
    title: "전시·뮤지컬 정보",
    desc: "전국의 전시와 뮤지컬 공연 정보를 한곳에서. KOPIS·KCISA 공공데이터를 기반으로 정확하고 최신화된 문화 일정을 제공합니다.",
    icon: "fa-solid fa-ticket"
  },
  {
    label: "Unveiling",
    title: "미술품 경매",
    desc: "검증된 작품을 마감형 최고가 낙찰 방식으로 투명하게 거래합니다. 새로운 컬렉터와 예술가를 연결하는 공간입니다.",
    icon: "fa-solid fa-gavel"
  },
  {
    label: "Selections",
    title: "문화 굿즈 쇼핑",
    desc: "전시와 공연에서 파생된 아카이브 자료, 포스터, 음반, 액세서리까지. 문화를 일상으로 가져오는 큐레이션 스토어입니다.",
    icon: "fa-solid fa-bag-shopping"
  },
  {
    label: "Proposals",
    title: "공지·이벤트",
    desc: "OPUS의 새로운 소식과 이벤트를 가장 먼저 만나보세요. 뮤지컬, 전시, 경매, 굿즈 전 분야의 최신 프로모션을 안내합니다.",
    icon: "fa-solid fa-bullhorn"
  }
];

const stats = [
  { number: "4+", label: "핵심 서비스" },
  { number: "1,000+", label: "전시·공연 정보" },
  { number: "30+", label: "굿즈 상품" },
  { number: "24/7", label: "AI 상담 지원" }
];

export default function About() {
  return (
    <div className="info-page">
      {/* 히어로 */}
      <div className="info-page__hero about-hero">
        <p className="info-page__label">About OPUS</p>
        <h1 className="info-page__title">문화를 더 가까이,<br />일상 속으로</h1>
        <p className="info-page__desc">
          OPUS는 전시·뮤지컬·경매·굿즈를 하나의 플랫폼에서 연결하는
          문화 종합 서비스입니다.
        </p>
      </div>

      <div className="info-page__body">

        {/* 수치 */}
        <div className="about-stats">
          {stats.map((s, i) => (
            <div key={i} className="about-stat">
              <p className="about-stat__number">{s.number}</p>
              <p className="about-stat__label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* 미션 */}
        <div className="about-mission">
          <p className="about-mission__eyebrow">Mission</p>
          <blockquote className="about-mission__quote">
            "예술과 일상 사이의 거리를 좁히고,<br />
            더 많은 사람이 문화를 누릴 수 있는 세상을 만듭니다."
          </blockquote>
          <p className="about-mission__body">
            우리는 공연장 앞에 줄을 서지 않아도, 갤러리에 발길이 닿지 않아도
            문화를 경험할 수 있어야 한다고 믿습니다. OPUS는 정보 탐색부터
            티켓 예매, 작품 구입, 굿즈 쇼핑까지 문화 소비의 전 여정을
            하나의 공간에서 완성합니다.
          </p>
        </div>

        {/* 서비스 소개 */}
        <div className="about-services">
          <p className="about-section-eyebrow">Services</p>
          <h2 className="about-section-title">OPUS가 제공하는 서비스</h2>
          <div className="about-services__grid">
            {services.map((s, i) => (
              <div key={i} className="about-service-card">
                <div className="about-service-card__top">
                  <span className="about-service-card__label">{s.label}</span>
                  <i className={`${s.icon} about-service-card__icon`} />
                </div>
                <h3 className="about-service-card__title">{s.title}</h3>
                <p className="about-service-card__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 핵심 가치 */}
        <div className="about-values">
          <p className="about-section-eyebrow">Values</p>
          <h2 className="about-section-title">우리가 지향하는 것</h2>
          <div className="about-values__grid">
            {values.map((v, i) => (
              <div key={i} className="about-value-card">
                <div className="about-value-card__icon-wrap">
                  <i className={v.icon} />
                </div>
                <h3 className="about-value-card__title">{v.title}</h3>
                <p className="about-value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 연락처 */}
        <div className="about-contact">
          <p className="about-section-eyebrow">Contact</p>
          <h2 className="about-section-title">문의하기</h2>
          <div className="about-contact__grid">
            <div className="about-contact__item">
              <i className="fa-solid fa-envelope" />
              <div>
                <p className="about-contact__label">이메일</p>
                <p className="about-contact__value">support@opus.co.kr</p>
              </div>
            </div>
            <div className="about-contact__item">
              <i className="fa-solid fa-clock" />
              <div>
                <p className="about-contact__label">운영 시간</p>
                <p className="about-contact__value">평일 10:00 – 18:00</p>
              </div>
            </div>
            <div className="about-contact__item">
              <i className="fa-solid fa-location-dot" />
              <div>
                <p className="about-contact__label">주소</p>
                <p className="about-contact__value">서울특별시 OPUS 빌딩</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
