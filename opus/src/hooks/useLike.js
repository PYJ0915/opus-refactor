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
      const resp = await axiosApi.get("/reviews/likeCount", {
        params: { reviewNo }
      });

      if (resp.status === 200) {
        setLikeCount(prev => ({
          ...prev,
          [reviewNo]: resp.data
        }));
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

    try {
      const resp = await axiosApi.post("/reviews/like", { reviewNo });

      if (resp.status === 200) {
        setLikedMap(prev => ({
          ...prev,
          [reviewNo]: resp.data
        }));
        getLikeCount(reviewNo);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return { likeCount, likedMap, getLikeCount, toggleLike };
}
