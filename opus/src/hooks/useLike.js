import { useState } from 'react';
import axiosApi from '../api/axiosAPI';
import { toast } from 'react-toastify';
import { useAuthStore } from '../components/auth/useAuthStore';

export function useLike() {
  const token = useAuthStore(state => state.token);

  const [likeCount, setLikeCount] = useState({});
  const [likedMap, setLikedMap] = useState({});

  const getLikeCount = async (reviewNo) => {
    try {
      // 1) 좋아요 수
      const countResp = await axiosApi.get("/reviews/likeCount", {
        params: { reviewNo }
      });
      if (countResp.status === 200) {
        setLikeCount(prev => ({ ...prev, [reviewNo]: countResp.data }));
      }

      // 2) 내가 좋아요 눌렀는지 — 로그인 상태일 때만
      if (token) {
        const likedResp = await axiosApi.get("/reviews/isLiked", {
          params: { reviewNo }
        });
        if (likedResp.status === 200) {
          setLikedMap(prev => ({ ...prev, [reviewNo]: likedResp.data }));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleLike = async (reviewNo) => {
    if (!token) {
      toast.error("로그인 후 이용해주세요.");
      return;
    }

    // 현재 상태 저장 (롤백용)
    const prevLiked = likedMap[reviewNo] ?? false;
    const prevCount = likeCount[reviewNo] ?? 0;

    // 낙관적으로 즉시 UI 업데이트
    setLikedMap(prev => ({ ...prev, [reviewNo]: !prevLiked }));
    setLikeCount(prev => ({ ...prev, [reviewNo]: prevLiked ? prevCount - 1 : prevCount + 1 }));

    try {
      const resp = await axiosApi.post("/reviews/like", { reviewNo });

      if (resp.status === 200) {
        setLikedMap(prev => ({ ...prev, [reviewNo]: resp.data }));
      }
    } catch (error) {
      // 실패 시 원래 상태로 롤백
      setLikedMap(prev => ({ ...prev, [reviewNo]: prevLiked }));
      setLikeCount(prev => ({ ...prev, [reviewNo]: prevCount }));
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
      console.error(error);
    }
  };

  return { likeCount, likedMap, getLikeCount, toggleLike };
}