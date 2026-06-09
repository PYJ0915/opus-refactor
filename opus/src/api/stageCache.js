import axiosApi from "./axiosAPI";

const SESSION_KEY = "opus_cached_stages";

// sessionStorage에서 이미 저장된 stageNo Set을 불러옴
function getCachedSet() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

// sessionStorage에 저장된 Set을 업데이트
function addToCachedSet(stageNo) {
  try {
    const set = getCachedSet();
    set.add(stageNo);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
  } catch {
    // sessionStorage 쓰기 실패는 무시
  }
}

/**
 * 상세 페이지 진입 시 외부 API 성공하면 호출.
 * 같은 브라우저 세션 동안 이미 저장한 항목은 서버 요청을 스킵함.
 */
export async function saveStageCache({ stageNo, stageType, stageTitle, stageThumbnail, stagePeriod, stagePlace }) {
  if (getCachedSet().has(stageNo)) return;

  try {
    await axiosApi.post("/stage/cache", {
      stageNo, stageType, stageTitle, stageThumbnail, stagePeriod, stagePlace,
    });
    addToCachedSet(stageNo);
  } catch {
    // 캐시 저장 실패는 무시
  }
}

/**
 * 외부 API 실패 시 서버 캐시에서 복원.
 */
export async function loadStageCache(stageNo) {
  try {
    const res = await axiosApi.get(`/stage/cache/${stageNo}`);
    return res.data;
  } catch {
    return null;
  }
}
