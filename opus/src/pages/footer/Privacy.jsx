import "../../css/InfoPages.css";

const privacySections = [
  {
    title: "1. 수집하는 개인정보 항목",
    content: null,
    table: {
      headers: ["구분", "항목", "수집 목적"],
      rows: [
        ["필수", "이메일, 비밀번호, 이름, 전화번호", "회원가입 및 본인 확인"],
        ["필수", "결제 정보, 배송지 주소", "굿즈 구매 및 배송"],
        ["필수", "본인 인증 정보", "경매 서비스 참여"],
        ["선택", "소셜 로그인 정보 (Google)", "간편 로그인"],
        ["자동", "접속 IP, 쿠키, 방문 기록", "서비스 개선 및 보안"],
      ]
    }
  },
  {
    title: "2. 개인정보의 수집 및 이용 목적",
    content: `회사는 다음의 목적을 위해 개인정보를 수집·이용합니다.\n\n· 회원 관리: 회원가입 의사 확인, 회원 자격 유지·관리, 서비스 부정이용 방지\n· 서비스 제공: 굿즈 구매·배송, 경매 참여, 전시·뮤지컬 정보 제공\n· 고객 지원: 문의 처리, 불만 처리, 공지사항 전달\n· 서비스 개선: 접속 빈도 파악, 서비스 이용 분석`
  },
  {
    title: "3. 개인정보의 보유 및 이용 기간",
    content: `회원 탈퇴 시 지체 없이 파기하는 것을 원칙으로 합니다. 단, 관계 법령에 따라 아래와 같이 일정 기간 보관합니다.\n\n· 계약 또는 청약 철회에 관한 기록: 5년 (전자상거래법)\n· 대금 결제 및 재화 공급에 관한 기록: 5년 (전자상거래법)\n· 소비자 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)\n· 접속에 관한 기록: 3개월 (통신비밀보호법)`
  },
  {
    title: "4. 개인정보의 제3자 제공",
    content: `회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.\n\n· 이용자가 사전에 동의한 경우\n· 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우`
  },
  {
    title: "5. 개인정보 처리 위탁",
    content: null,
    table: {
      headers: ["수탁 업체", "위탁 업무", "보유 기간"],
      rows: [
        ["토스페이먼츠", "결제 처리 및 관리", "회원 탈퇴 시 또는 위탁 계약 종료 시"],
        ["배송 파트너사", "굿즈 배송 처리", "배송 완료 후 3개월"],
        ["Google", "소셜 로그인 처리", "회원 탈퇴 시"],
      ]
    }
  },
  {
    title: "6. 이용자의 권리",
    content: `이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.\n\n· 개인정보 열람 요청\n· 오류 정정 요청\n· 삭제 요청\n· 처리 정지 요청\n\n위 권리 행사는 마이페이지 또는 이메일(privacy@opus.co.kr)을 통해 신청하실 수 있으며, 회사는 지체 없이 조치하겠습니다.`
  },
  {
    title: "7. 쿠키(Cookie) 운영",
    content: `회사는 서비스 이용 편의를 위해 쿠키를 사용합니다. 쿠키는 브라우저 설정을 통해 거부하실 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.\n\n· 쿠키 사용 목적: 로그인 상태 유지, 서비스 이용 분석\n· 쿠키 거부 방법: 브라우저 설정 > 개인정보 및 보안 > 쿠키 설정`
  },
  {
    title: "8. 개인정보 보호 책임자",
    content: `개인정보 처리에 관한 업무를 총괄하며, 이용자의 개인정보 관련 불만 처리 및 피해 구제를 담당합니다.\n\n· 책임자: OPUS 개인정보 보호팀\n· 이메일: privacy@opus.co.kr\n· 문의 가능 시간: 평일 오전 10시 ~ 오후 6시`
  }
];

export default function Privacy() {
  return (
    <div className="info-page">
      <div className="info-page__hero">
        <p className="info-page__label">Legal</p>
        <h1 className="info-page__title">개인정보처리방침</h1>
        <p className="info-page__desc">OPUS는 이용자의 개인정보를 소중히 여깁니다.</p>
      </div>

      <div className="info-page__body">
        <div className="info-doc">
          <div className="info-doc__meta">
            <span>시행일: 2026년 1월 1일</span>
            <span>버전: v1.0</span>
          </div>

          <div className="info-doc__summary">
            OPUS(이하 "회사")는 개인정보보호법 등 관련 법령에 따라 이용자의 개인정보를 보호하고,
            이와 관련한 고충을 신속하고 원활하게 처리하기 위해 본 방침을 수립·공개합니다.
          </div>

          <div className="info-doc__sections">
            {privacySections.map((section, idx) => (
              <div key={idx} className="info-doc__section">
                <h2 className="info-doc__section-title">{section.title}</h2>

                {section.content && (
                  <div className="info-doc__section-content">
                    {section.content.split("\n").map((line, i) => (
                      <p key={i} className={line.startsWith("·") ? "info-doc__bullet" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                )}

                {section.table && (
                  <div className="info-doc__table-wrap">
                    <table className="info-doc__table">
                      <thead>
                        <tr>
                          {section.table.headers.map((h, i) => (
                            <th key={i}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((cell, j) => (
                              <td key={j}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
