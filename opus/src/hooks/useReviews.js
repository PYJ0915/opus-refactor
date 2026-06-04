import { useState, useEffect } from 'react';
import axiosApi from '../api/axiosAPI';
import { toast } from 'react-toastify';
import { showConfirm } from '../components/toast/ToastUtils';
import { useAuthStore } from '../components/auth/useAuthStore';

export function useReviews(stageNo, { onLoaded } = {}) {
  const token = useAuthStore(state => state.token);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [writeReview, setWriteReview] = useState("");

  const openForm = () => setIsFormOpen(v => !v);
  const closeForm = () => setIsFormOpen(false);

  const [reviews, setReviews] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [sortType, setSortType] = useState("latest");

  // 수정 상태
  const [editId, setEditId] = useState(null);
  const [editReview, setEditReview] = useState("");
  const [originReview, setOriginReview] = useState("");

  const showReviews = async () => {
    try {
      const resp = await axiosApi.get("/reviews/getReviews", {
        params: { stageNo }
      });
      if (resp.status === 200) setReviews(resp.data);
    } catch (error) {
      console.error(error);
    }
  };

  const showReviewsCount = async () => {
    try {
      const resp = await axiosApi.get("/reviews/getReviewsCount", {
        params: { stageNo }
      });
      if (resp.status === 200) setReviewsCount(resp.data);
    } catch (error) {
      console.error(error);
    }
  };

  // 초기 로딩 — 댓글/좋아요 카운트는 onLoaded 콜백으로 Reviews.jsx에서 처리
  useEffect(() => {
    const loadData = async () => {
      await showReviewsCount();

      const resp = await axiosApi.get("/reviews/getReviews", {
        params: { stageNo }
      });

      if (resp.status === 200) {
        setReviews(resp.data);
        onLoaded?.(resp.data);
      }
    };

    loadData();
  }, [stageNo]);

  const submitReview = async () => {
    if (!token) {
      toast.error("로그인 후 이용해주세요.");
      return;
    }

    if (writeReview.trim().length === 0) {
      toast.warning("후기를 입력해주세요.");
      return;
    }

    const res = await axiosApi.post("/reviews/addReview", {
      stageNo,
      reviewContent: writeReview
    });

    if (res.status === 200) {
      toast.success("후기가 등록되었습니다.");
      setWriteReview("");
      setIsFormOpen(false);
      document.activeElement?.blur();
      showReviews();
      showReviewsCount();
    } else {
      toast.error("후기 등록에 실패하였습니다.");
    }
  };

  const clickEditBtn = (review) => {
    setEditId(Number(review.reviewNo));
    setOriginReview(review.reviewContent);
    setEditReview(review.reviewContent);
  };

  const clickEditCancelBtn = () => {
    setEditReview(originReview);
    setEditId(null);
  };

  const saveEdit = async (reviewNo) => {
    try {
      const resp = await axiosApi.put(`/reviews/${reviewNo}`, {
        reviewContent: editReview
      });

      if (resp.status === 200) {
        setEditId(null);
        showReviews();
        toast.success("후기가 수정되었습니다.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteReview = async (reviewNo) => {
    showConfirm(
      "후기를 삭제하시겠습니까?",
      "삭제한 후기는 복구할 수 없습니다.",
      async () => {
        try {
          const resp = await axiosApi.delete(`/reviews/${reviewNo}`);
          if (resp.status === 200) {
            toast.success("후기가 삭제되었습니다.");
            showReviews();
            showReviewsCount();
          }
        } catch (error) {
          console.log(error);
          toast.error("후기 삭제에 실패했습니다.");
        }
      },
      "삭제"
    );
  };

  return {
    reviews, reviewsCount, visibleCount, setVisibleCount,
    sortType, setSortType,
    isFormOpen, openForm, closeForm,
    writeReview, setWriteReview,
    submitReview,
    editId, editReview, setEditReview,
    clickEditBtn, clickEditCancelBtn, saveEdit,
    deleteReview,
    showReviews, showReviewsCount,
  };
}
