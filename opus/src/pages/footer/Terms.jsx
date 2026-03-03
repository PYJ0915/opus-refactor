import "../../css/InfoPages.css";

const terms = [
  {
    title: "제1조 (목적)",
    content: `본 약관은 OPUS(이하 "회사")가 운영하는 문화 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`
  },
  {
    title: "제2조 (정의)",
    content: `① "서비스"란 OPUS 플랫폼을 통해 제공되는 전시·뮤지컬 정보, 미술품 경매(Unveiling), 문화 굿즈 쇼핑(Selections), 공지·이벤트(Proposals) 등 모든 기능을 의미합니다.\n② "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.\n③ "회원"이란 회사에 개인정보를 제공하고 회원등록을 완료한 자로서, 회사의 서비스를 지속적으로 이용할 수 있는 자를 말합니다.`
  },
  {
    title: "제3조 (약관의 효력 및 변경)",
    content: `① 본 약관은 서비스를 이용하고자 하는 모든 이용자에게 효력이 발생합니다.\n② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할 수 있습니다.\n③ 약관이 변경되는 경우 회사는 변경 사항을 시행일 7일 전부터 공지합니다. 단, 이용자에게 불리한 변경의 경우 30일 전에 공지합니다.`
  },
  {
    title: "제4조 (회원가입)",
    content: `① 이용자는 회사가 정한 가입 양식에 따라 정보를 기입한 후 약관에 동의함으로써 회원가입을 신청합니다.\n② 회사는 이메일 인증을 통한 일반 회원가입과 구글 소셜 로그인을 통한 간편가입을 지원합니다.\n③ 회사는 다음 각 호에 해당하는 경우 가입 신청을 거절하거나 이후 회원자격을 정지·해지할 수 있습니다.\n  - 타인의 명의를 사용한 경우\n  - 허위 정보를 기재한 경우\n  - 서비스 운영을 고의로 방해하는 경우`
  },
  {
    title: "제5조 (회원 탈퇴 및 자격 상실)",
    content: `① 회원은 언제든지 마이페이지를 통해 탈퇴를 요청할 수 있습니다.\n② 단, 다음에 해당하는 경우 탈퇴가 제한됩니다.\n  - 진행 중인 경매(입찰 포함)가 있는 경우\n  - 미완료 주문(배송 전 단계)이 있는 경우\n③ 탈퇴 처리 후 회원 정보는 관계 법령에 따라 일정 기간 보관 후 파기됩니다.`
  },
  {
    title: "제6조 (경매 서비스 이용)",
    content: `① 미술품 경매(Unveiling) 서비스는 본인 인증을 완료한 회원만 참여할 수 있습니다.\n② 경매는 마감형 최고가 낙찰 방식으로 운영되며, 경매 종료 시점에 최고 입찰가를 제시한 이용자가 낙찰됩니다.\n③ 낙찰 후 정해진 기간 내에 대금을 납부하지 않을 경우 낙찰이 취소될 수 있으며, 서비스 이용이 제한될 수 있습니다.`
  },
  {
    title: "제7조 (굿즈 쇼핑 서비스)",
    content: `① 굿즈 구매 시 5만원 이상 주문에 대해 무료배송이 적용됩니다.\n② 주문 취소는 배송 시작 전까지 가능하며, 배송 중인 상품은 수령 후 반품 절차를 따릅니다.\n③ 상품의 하자 또는 오배송의 경우 수령일로부터 7일 이내에 교환·환불을 신청하실 수 있습니다.`
  },
  {
    title: "제8조 (개인정보 보호)",
    content: `회사는 이용자의 개인정보를 관련 법령 및 개인정보처리방침에 따라 보호합니다. 개인정보의 수집·이용·제공에 관한 사항은 별도의 개인정보처리방침에서 규정합니다.`
  },
  {
    title: "제9조 (면책조항)",
    content: `① 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중단 등 불가항력으로 인한 서비스 제공 불가에 대해 책임을 지지 않습니다.\n② 전시·뮤지컬 정보는 공공데이터(KOPIS, KCISA) 기반으로 제공되며, 정보의 정확성에 대해 회사는 보증하지 않습니다.\n③ 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못하거나 손실이 발생한 경우 회사는 책임을 지지 않습니다.`
  },
  {
    title: "제10조 (분쟁 해결 및 준거법)",
    content: `① 서비스 이용과 관련하여 발생한 분쟁에 대해 회사와 이용자는 상호 협의하여 해결하도록 노력합니다.\n② 분쟁이 해결되지 않을 경우 관할 법원은 회사 본사 소재지를 관할하는 법원으로 합니다.\n③ 본 약관과 관련된 모든 사항은 대한민국 법률을 준거법으로 합니다.`
  }
];

export default function Terms() {
  return (
    <div className="info-page">
      <div className="info-page__hero">
        <p className="info-page__label">Legal</p>
        <h1 className="info-page__title">이용약관</h1>
        <p className="info-page__desc">OPUS 서비스 이용에 관한 약관입니다.</p>
      </div>

      <div className="info-page__body">
        <div className="info-doc">
          <div className="info-doc__meta">
            <span>시행일: 2026년 1월 1일</span>
            <span>버전: v1.0</span>
          </div>

          <div className="info-doc__summary">
            본 약관은 OPUS 문화 플랫폼 서비스 이용에 관한 기본적인 사항을 규정합니다.
            서비스 가입 및 이용 전 반드시 읽어보시기 바랍니다.
          </div>

          <div className="info-doc__sections">
            {terms.map((section, idx) => (
              <div key={idx} className="info-doc__section">
                <h2 className="info-doc__section-title">{section.title}</h2>
                <div className="info-doc__section-content">
                  {section.content.split("\n").map((line, i) => (
                    <p key={i} className={line.startsWith("  -") ? "info-doc__list-item" : ""}>
                      {line.startsWith("  -") ? `• ${line.replace("  -", "").trim()}` : line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
