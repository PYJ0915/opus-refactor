const KEY = "saveId";

/* 기존 함수명 유지 */
export const getSavedEmail = () => {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
};

export const setSavedEmail = (email) => {
  try {
    localStorage.setItem(KEY, email);
  } catch {}
};

export const clearSavedEmail = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {}
};