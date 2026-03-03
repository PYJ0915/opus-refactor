import { useState } from "react";
import "../../css/InfoPages.css";

const faqData = [
  {
    category: "회원",
    items: [
      {
        q: "회원가입은 어떻게 하나요?",
        a: "이메일 또는 구글 소셜 계정으로 가입하실 수 있습니다. 이메일 가입 시 인증 코드(6자리)가 발송되며, 5분 이내에 입력하셔야 합니다."
      },
      {
        q: "비밀번호를 잊어버렸어요.",
        a: "구글 소셜 로그인 계정은 비밀번호 변경 기능을 지원하지 않습니다. 일반 이메일 계정의 경우 로그인 화면에서 '비밀번호 찾기'를 이용하시거나, 마이페이지 > 비밀번호 변경에서 재설정하실 수 있습니다."
      },
      {
        q: "회원 탈퇴는 어떻게 하나요?",
        a: "마이페이지에서 탈퇴 신청이 가능합니다. 단, 진행 중인 경매나 미완료 주문이 있는 경우 탈퇴가 제한됩니다. 모든 거래가 완료된 후 탈퇴해 주세요."
      },
      {
        q: "연락처(전화번호)를 변경하고 싶어요.",
        a: "마이페이지 > 내 정보에서 연락처를 변경하실 수 있습니다. 변경 시 중복 확인 절차가 진행됩니다."
      }
    ]
  },
  {
    category: "전시·뮤지컬",
    items: [
      {
        q: "전시 및 뮤지컬 예매는 어디서 하나요?",
        a: "OPUS는 전시·뮤지컬 정보를 제공하는 플랫폼입니다. 실제 예매는 각 공연·전시의 공식 예매처 링크를 통해 외부 사이트에서 진행됩니다. 상세 페이지에서 예매 링크를 확인하세요."
      },
      {
        q: "공연 정보는 얼마나 자주 업데이트되나요?",
        a: "뮤지컬 정보는 KOPIS(공연예술통합전산망), 전시 정보는 KCISA(한국문화정보원) 공공데이터를 기반으로 제공됩니다. 데이터는 공공기관 업데이트 주기에 따라 반영됩니다."
      },
      {
        q: "관람 후기는 어떻게 작성하나요?",
        a: "전시 또는 뮤지컬 상세 페이지 하단의 후기 섹션에서 작성하실 수 있습니다. 작성한 후기는 마이페이지 > 작성 후기에서 확인 및 관리하실 수 있습니다."
      }
    ]
  },
  {
    category: "굿즈 쇼핑",
    items: [
      {
        q: "배송비는 얼마인가요?",
        a: "5만원 이상 구매 시 무료배송이 적용됩니다. 5만원 미만 주문의 경우 배송비가 별도로 부과됩니다."
      },
      {
        q: "주문 취소는 어떻게 하나요?",
        a: "마이페이지 > 주문내역에서 주문 상세 페이지로 이동 후 취소 신청이 가능합니다. 배송이 시작된 이후에는 취소가 제한될 수 있습니다."
      },
      {
        q: "배송지를 여러 개 등록할 수 있나요?",
        a: "네, 가능합니다. 결제 페이지에서 배송지를 추가·수정·삭제하실 수 있으며, 자주 사용하는 배송지를 기본 배송지로 설정해두실 수 있습니다."
      },
      {
        q: "주문 상태는 어떻게 확인하나요?",
        a: "마이페이지 > 주문내역에서 확인하실 수 있습니다. 주문 상태는 '주문접수 → 입금대기 → 결제완료 → 배송중 → 배송완료' 순으로 진행됩니다."
      }
    ]
  },
  {
    category: "미술품 경매",
    items: [
      {
        q: "경매에 참여하려면 어떻게 해야 하나요?",
        a: "경매 참여를 위해서는 본인 인증이 필요합니다. 인증 완료 후 진행 중인 경매의 상세 페이지에서 입찰에 참여하실 수 있습니다."
      },
      {
        q: "경매 방식은 어떻게 되나요?",
        a: "OPUS의 미술품 경매는 마감형 최고가 낙찰 방식으로 운영됩니다. 경매 마감 시간까지 가장 높은 금액을 제시한 참여자가 낙찰됩니다."
      },
      {
        q: "경매 내역은 어디서 확인하나요?",
        a: "마이페이지 > 경매 내역에서 참여한 경매 목록과 낙찰 여부를 확인하실 수 있습니다."
      }
    ]
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [activeCategory, setActiveCategory] = useState("전체");

  const categories = ["전체", ...faqData.map(f => f.category)];

  const filteredData = activeCategory === "전체"
    ? faqData
    : faqData.filter(f => f.category === activeCategory);

  const toggle = (key) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="info-page">
      <div className="info-page__hero">
        <p className="info-page__label">Support</p>
        <h1 className="info-page__title">자주 묻는 질문</h1>
        <p className="info-page__desc">궁금하신 점을 빠르게 찾아보세요.</p>
      </div>

      <div className="info-page__body">
        {/* 카테고리 탭 */}
        <div className="info-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`info-tab ${activeCategory === cat ? "is-active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ 아코디언 */}
        <div className="faq-list">
          {filteredData.map((group) => (
            <div key={group.category} className="faq-group">
              <p className="faq-group__label">{group.category}</p>
              {group.items.map((item, idx) => {
                const key = `${group.category}-${idx}`;
                const isOpen = openIndex === key;
                return (
                  <div key={key} className={`faq-item ${isOpen ? "is-open" : ""}`}>
                    <button
                      className="faq-item__question"
                      onClick={() => toggle(key)}
                    >
                      <span>Q. {item.q}</span>
                      <i className={`fa-solid ${isOpen ? "fa-minus" : "fa-plus"}`} />
                    </button>
                    <div className="faq-item__answer">
                      <div className="faq-item__answer-inner">
                        <span className="faq-item__a-mark">A.</span>
                        <p>{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* 하단 문의 안내 */}
        <div className="info-contact-box">
          <p className="info-contact-box__text">원하는 답변을 찾지 못하셨나요?</p>
          <p className="info-contact-box__sub">고객센터 이메일로 문의해 주시면 빠르게 답변드리겠습니다.</p>
          <a href="mailto:support@opus.co.kr" className="info-contact-box__btn">
            이메일 문의하기
          </a>
          {/* mailto 안 먹히는 경우 대비 */}
          <p className="info-contact-box__email">support@opus.co.kr</p>
        </div>
      </div>
    </div>
  );
}
