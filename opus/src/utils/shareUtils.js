import { toast } from "react-toastify";

// 카카오 SDK 초기화 — 앱 시작 시 한 번만 호출
export function initKakao() {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY);
  }
}

// 카카오톡 공유
export function shareKakao({ title, description, imageUrl, url }) {
  if (!window.Kakao?.isInitialized()) {
    // 미초기화 시 즉시 초기화 시도 (동기)
    initKakao();
  }
  if (!window.Kakao?.isInitialized()) {
    alert("카카오 SDK가 준비되지 않았습니다. 페이지를 새로고침 후 다시 시도해주세요.");
    return;
  }

  window.Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title,
      description,
      imageUrl,
      link: { mobileWebUrl: url, webUrl: url },
    },
    buttons: [{ title: "OPUS에서 보기", link: { mobileWebUrl: url, webUrl: url } }],
  });
}

// URL 클립보드 복사
export async function copyUrl(url) {
  await navigator.clipboard.writeText(url);
}

// 팝업 차단 우회: 클릭 핸들러에서 직접 호출하는 헬퍼
// 비동기 없이 즉시 window.open 을 실행해야 크롬 팝업 차단을 피할 수 있음
export function openPopup(url, width = 600, height = 400) {
  const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - height) / 2);
  const popup = window.open(
    url,
    "_blank",
    `width=${width},height=${height},left=${left},top=${top}`
  );
  
  if (!popup || popup.closed || typeof popup.closed === "undefined") {
    toast.warn("팝업이 차단되었습니다. 브라우저 또는 확장프로그램에서 팝업을 허용해주세요.");
  }
}