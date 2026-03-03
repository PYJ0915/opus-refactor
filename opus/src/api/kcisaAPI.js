// 전시 조회
export async function getAllExhibitions({ serviceKey, pageParam }) {
  if(!serviceKey) {
    throw new Error("발급받은 서비스 키가 없습니다.");
  }

  const params = new URLSearchParams({
    serviceKey : serviceKey,
    pageNo : pageParam ?? 1,
  });

  // https://api.kcisa.kr/openapi/API_CCA_145/request?serviceKey=bcec5111-252e-47c3-9dca-4b943cf5a0ed&numOfRows=10&pageNo=1
  // const res = await fetch(`/onStage/exhibitions?${params.toString()}`);
  // const BASE_URL = "https://api.kcisa.kr/openapi";
  // const res = await fetch(`${BASE_URL}/API_CCA_145/request?${params.toString()}`);
  const BASE_URL = "https://opus-api.duckdns.org";
  const res = await fetch(`${BASE_URL}/onStage/exhibitions?${params.toString()}`);

  if(!res.ok) {
    throw new Error("전시 정보 요청 실패");
  }

  const text = await res.text();  

  // XML 파싱하기
  const xml = new DOMParser().parseFromString(text, "text/xml");

  const items = [...xml.getElementsByTagName("item")].map(item => {
    return {
      title : item.getElementsByTagName("TITLE")[0]?.textContent,
      place : item.getElementsByTagName("CNTC_INSTT_NM")[0]?.textContent,
      desc : item.getElementsByTagName("DESCRIPTION")[0]?.textContent,
      image : item.getElementsByTagName("IMAGE_OBJECT")[0]?.textContent,
      exhibitionId : item.getElementsByTagName("LOCAL_ID")[0]?.textContent,
      url : item.getElementsByTagName("URL")[0]?.textContent,
      author : item.getElementsByTagName("AUTHOR")[0]?.textContent,
      contributor : item.getElementsByTagName("CONTRIBUTOR")[0]?.textContent,
      contact : item.getElementsByTagName("CONTACT_POINT")[0]?.textContent,
      age : item.getElementsByTagName("AUDIENCE")[0]?.textContent,
      period : item.getElementsByTagName("PERIOD")[0]?.textContent,
      eventPeriod : item.getElementsByTagName("EVENT_PERIOD")[0]?.textContent,
    }
  })

  return items;
}