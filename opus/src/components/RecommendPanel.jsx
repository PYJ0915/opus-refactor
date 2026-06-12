import { useState } from "react";
import { getAIRecommendations } from "../api/recommendAPI";
import { useContentStore } from "../store/useContentStore";
import { useAuthStore } from "./auth/useAuthStore";
import LoadingSpinner from "./common/LoadingSpinner";
import "../css/RecommendPanel.css";

export default function RecommendPanel({ isOpen, onToggle, onClose, hidden }) {
  const [recommendation, setRecommendation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const exhibitions = useContentStore((s) => s.exhibitions);
  const musicals = useContentStore((s) => s.musicals);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  const handleGetRecommendation = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setRecommendation("");

    try {
      const res = await getAIRecommendations(exhibitions, musicals);
      setRecommendation(res.message);
    } catch {
      setRecommendation(
        "추천을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!hidden && (
        <button
          className="recommend-btn"
          onClick={() => {
            onToggle();
            if (!isOpen) handleGetRecommendation();
          }}
          title="AI 맞춤 추천"
        >
          ✨
        </button>
      )}

      {isOpen && (
        <div className="recommend-panel">
          <div className="recommend-panel__header">
            <div>
              <p className="recommend-panel__title">
                AI 맞춤 추천
              </p>

              <p className="recommend-panel__subtitle">
                {isLoggedIn ? "취향 기반 추천" : "인기 작품 추천"}
              </p>
            </div>

            <button
              className="recommend-panel__close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div className={`recommend-panel__body${isLoading ? " recommend-panel__body--loading" : ""}`}>
            {isLoading ? (
              <LoadingSpinner text="AI가 추천을 준비 중입니다..." />
            ) : recommendation ? (
              <p className="recommend-panel__content">
                {recommendation}
              </p>
            ) : null}
          </div>

          {!isLoading && recommendation && (
            <div className="recommend-panel__footer">
              <button
                className="recommend-panel__refresh"
                onClick={handleGetRecommendation}
              >
                🔄 다른 추천 받기
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}