// XML을 JS 배열 형태로 변환하기
export function parseKopisXML(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, "text/xml");
  const dbNodes = Array.from(doc.getElementsByTagName("db"));

  const items = dbNodes.map((db) => {
    const get = (tag) => db.getElementsByTagName(tag)?.[0]?.textContent?.trim() ?? "";

    return {
      mt20id : get("mt20id"),
      poster : get("poster"),
      prfnm : get("prfnm"),
      prfstate : get("prfstate"),
      prfpdfrom : get("prfpdfrom"),
      prfpdto : get("prfpdto"),
      fcltynm : get("fcltynm"),
      prfruntime : get("prfruntime"),
      prfage : get("prfage"),
      prfcast : get("prfcast"),
    };
  });

  return items;
}

// JS Date의 형식을 YYYYMMDD로 만들기(stdate, eddate에 적용)
export function formatYYYYMMDD(d) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  
  return `${yyyy}${mm}${dd}`;
}

// 날짜 구간 설정
function setDay(today, days) {
  const newDay = new Date(today);
  newDay.setDate(today.getDate() + days);
  
  return newDay;
}

const today = new Date();

export const dateRange = [
  {
    // 보름 전 (어제~15일 전)
    start : formatYYYYMMDD(setDay(today, -15)),
    end : formatYYYYMMDD(setDay(today, -1))
  },
  {
    // 이번 한 달 (오늘~31일 후)
    start : formatYYYYMMDD(today),
    end : formatYYYYMMDD(setDay(today, 31))
  },
  {
    // 두 달 후
    start : formatYYYYMMDD(setDay(today, 32)),
    end : formatYYYYMMDD(setDay(today, 62))
  },
  {
    // 세 달 후
    start : formatYYYYMMDD(setDay(today, 63)),
    end : formatYYYYMMDD(setDay(today, 93))
  }
]

// 뮤지컬 공연 조회
export async function getAllMusicals({
  serviceKey, startDate, endDate, pageParam, rows = 100, search=""
}) {
  if(!serviceKey) throw new Error("발급받은 서비스 키가 없습니다.");
  
  const params = new URLSearchParams({
    service : serviceKey,
    stdate : startDate,
    eddate : endDate,
    cpage : pageParam,
    rows,
    shcate : 'GGGA',
    signgucode : 11,
    kidstate : 'N'
  })
  
  if(search.trim()) {
    params.set("shprfnm", search.trim())
  }
  
  const BASE_URL = "https://opus-api.duckdns.org";
  const res = await fetch(`${BASE_URL}/onStage/musicals?${params.toString()}`);
  
  if(!res.ok) {
    throw new Error(`KOPIS 요청 실패 : ${res.status}`);
  }
  
  const xmlText = await res.text();

  const fixedXmlText = xmlText.replace(
    /encoding="EUC-KR"/i,
    'encoding="UTF-8"'
  );

  const items = parseKopisXML(fixedXmlText);

  return { items, hasNext: items.length === rows };
}

// 뮤지컬 공연 조회 결과 하나로
export async function getMergedMusicals({ serviceKey }) {
  const responses = await Promise.all(dateRange.map((r) => getAllMusicals({serviceKey, startDate : r.start, endDate : r.end})));

  // 하나의 결과로 합치기 (flatMap 사용)
  const mergedMap = responses.flatMap((res) => res.items);

  // 중복 제거
  const resultMap = new Map();
  mergedMap.forEach((item) => {
    resultMap.set(item.mt20id, item);
  })

  return Array.from(resultMap.values());
}

// 상세 정보 이미지 리스트 형태로
function parseStyurls(db) {
  return Array.from(db.getElementsByTagName("styurl")).map(
    (node) => node.textContent.trim()
  )
}

// 예매처 정보(예매처명, URL) 리스트 형태로
function parseRelates(db) {
  return Array.from(db.getElementsByTagName("relate")).map((relate) => ({
    name : relate.getElementsByTagName("relatenm")?.[0]?.textContent?.trim() ?? "",
    url : relate.getElementsByTagName("relateurl")?.[0]?.textContent?.trim() ?? "",
  }))
}

// 상세 뮤지컬 공연 조회
export async function getMusicalDetail(serviceKey, mt20id) {
  const res = await fetch(
    `https://opus-api.duckdns.org/onStage/musicals/detail?service=${serviceKey}&mt20id=${mt20id}`
  );

  if(!res.ok) {
    throw new Error(`상세 조회 실패 : ${res.status}`);
  }

  const xmlText = await res.text();

  const fixedXmlText = xmlText.replace(
    /encoding="EUC-KR"/i,
    'encoding="UTF-8"'
  );

  const doc = new DOMParser().parseFromString(fixedXmlText, "text/xml");
  const db = doc.getElementsByTagName("db")[0];

  if(!db) return null;

  return {
    ...parseKopisXML(fixedXmlText)[0],
    styurls: parseStyurls(db),
    relates: parseRelates(db),
  };
}