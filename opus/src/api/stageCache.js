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

export async function saveStageCache() {
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
