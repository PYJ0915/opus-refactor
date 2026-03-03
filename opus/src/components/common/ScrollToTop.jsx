import { useCallback, useEffect, useState } from "react";

/**
 * 페이지 최상단으로 스크롤하는 버튼 컴포넌트
 * 
 * @param {number} showThreshold - 버튼이 나타나는 스크롤 위치 (기본값: 500px)
 * @returns {JSX.Element}
 */
const ScrollToTop = ({ showThreshold = 500 }) => {
  const [showTop, setShowTop] = useState(false);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > showThreshold);
    
    // 초기 스크롤 위치 확인
    onScroll();
    
    // 스크롤 이벤트 리스너 등록
    window.addEventListener("scroll", onScroll, { passive: true });
    
    // 클린업: 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener("scroll", onScroll);
  }, [showThreshold]);

  // 최상단으로 스크롤
  const onTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      className={`to-top ${showTop ? "is-show" : ""}`}
      onClick={onTop}
      aria-label="페이지 최상단으로 이동"
    >
      <i className="fa-solid fa-arrow-up" />
    </button>
  );
};

export default ScrollToTop;
