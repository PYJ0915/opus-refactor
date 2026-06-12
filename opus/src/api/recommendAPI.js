import axiosApi from "./axiosAPI";
import { chatbotApi } from "./chatbotAPI";
import { useContentStore } from "../store/useContentStore";

/**
 * 사용자 취향 기반 AI 추천 요청
 * @param {Array} exhibitions - useContentStore의 exhibitions
 * @param {Array} musicals    - useContentStore의 musicals
 */
export async function getAIRecommendations(exhibitions, musicals) {

  // 1. 전시/뮤지컬 목록 확보 — 스토어가 비어있으면 캐시 API로 fallback
  let activeExhibitions = exhibitions;
  let activeMusicals = musicals;

  if (activeExhibitions.length === 0 || activeMusicals.length === 0) {
    try {
      const [exRes, muRes] = await Promise.all([
        axiosApi.get("/stage/cache/list", { params: { stageType: "exhibition", limit: 20 } }),
        axiosApi.get("/stage/cache/list", { params: { stageType: "musical",    limit: 20 } }),
      ]);

      const toCacheItem = (c) => ({
        title:  c.stageTitle,
        period: c.stagePeriod,
        place:  c.stagePlace,
      });

      if (activeExhibitions.length === 0) {
        activeExhibitions = (exRes.data ?? []).map(toCacheItem);

        // 스토어에도 반영
        if (activeExhibitions.length > 0) {
          useContentStore.getState().setExhibitions(activeExhibitions);
        }
      }

      if (activeMusicals.length === 0) {
        activeMusicals = (muRes.data ?? []).map(toCacheItem);

        if (activeMusicals.length > 0) {
          useContentStore.getState().setMusicals(activeMusicals);
        }
      }
    } catch {
      // fallback 실패 시 빈 배열로 진행
    }
  }

  // 2. 내 좋아요/저장/별점 내역 조회
  let preference = { likedStages: [], savedStages: [], ratedStages: [] };
  try {
    const res = await axiosApi.get("/myPage/preferenceContext");
    preference = res.data;
  } catch {
    // 비로그인 시 빈 배열로 진행
  }

  // 3. 컨텍스트 구성
  const allPreferred = [
    ...new Set([...preference.likedStages, ...preference.savedStages])
  ];
  const hasPreference = allPreferred.length > 0 || preference.ratedStages.length > 0;

  let contextData = "";

  if (allPreferred.length > 0) {
    contextData += `### 사용자가 좋아요/저장한 작품 ID\n${allPreferred.join(", ")}\n\n`;
  }

  if (preference.ratedStages.length > 0) {
    contextData += "### 사용자가 별점을 준 작품 (ID: 별점)\n";
    preference.ratedStages.forEach(r => {
      contextData += `- ${r.stageNo}: ${r.rating}점\n`;
    });
    contextData += "\n";
  }

  if (activeExhibitions.length > 0) {
    contextData += "### 현재 전시 목록\n";
    activeExhibitions.forEach(e => {
      contextData += `- ${e.title} | ${e.period} | ${e.place}\n`;
    });
  }

  if (activeMusicals.length > 0) {
    contextData += "\n### 현재 뮤지컬 목록\n";
    activeMusicals.forEach(m => {
      contextData += `- ${m.title} | ${m.period} | ${m.place}\n`;
    });
  }

  // 4. AI 추천 요청
  const message = hasPreference
    ? `사용자의 좋아요/저장/리뷰 내역을 분석해서 현재 진행 중인 전시나 뮤지컬 중 추천해줘.
반드시 위 목록에 있는 실제 작품 제목을 그대로 사용해서 추천해줘. 작품 코드나 ID는 절대 언급하지 마.
추천 이유도 함께 설명해줘.`
    : `현재 진행 중인 전시와 뮤지컬 목록에서 추천해줘.
반드시 위 목록에 있는 실제 작품 제목을 그대로 사용해줘. 작품 코드나 ID는 절대 언급하지 마.
추천 이유도 설명해줘.`;

  return await chatbotApi.chat(message, null, contextData);
}