const KEY = "opus_recently_viewed";
const MAX = 8; // 최대 저장 개수

export function addRecentlyViewed(goods) {
  try {
    const saved = getRecentlyViewed();
    // 중복 제거
    const filtered = saved.filter(item => item.goodsNo !== goods.goodsNo);
    // 앞에 추가 후 최대 개수 초과분 제거
    const next = [goods, ...filtered].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function clearRecentlyViewed() {
  localStorage.removeItem(KEY);
}