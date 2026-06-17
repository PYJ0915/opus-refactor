// 카카오 SDK 초기화 (앱에서 한 번만 실행)
export function initKakao() {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY);
  }
}

// 카카오톡 공유
export function shareKakao({ title, description, imageUrl, url }) {
  // SDK 로드 및 초기화 확인
  if (!window.Kakao) {
    alert("카카오 SDK가 로드되지 않았습니다. 잠시 후 다시 시도해주세요.");
    return;
  }
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(import.meta.env.VITE_KAKAO_APP_KEY);
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