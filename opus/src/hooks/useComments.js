import { useState } from 'react';
import axiosApi from '../api/axiosAPI';
import { toast } from 'react-toastify';
import { showConfirm } from '../components/toast/ToastUtils';
import { useAuthStore } from '../components/auth/useAuthStore';

export function useComments() {
  const token = useAuthStore(state => state.token);

  const [openCommentId, setOpenCommentId] = useState(null);
  const [comment, setComment] = useState({});
  const [commentCount, setCommentCount] = useState({});
  const [inputComment, setInputComment] = useState({});

  // 댓글 수정
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [originComment, setOriginComment] = useState("");

  const getCommentCount = async (reviewNo) => {
    try {
      const resp = await axiosApi.get("/comment/getCommentCount", {
        params: { reviewNo }
      });

      if (resp.status === 200) {
        setCommentCount(prev => ({
          ...prev,
          [reviewNo]: resp.data
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toggleComment = async (reviewNo) => {
    if (openCommentId === reviewNo) {
      setOpenCommentId(null);
      return;
    }

    try {
      const resp = await axiosApi.get("/comment/getComment", {
        params: { reviewNo }
      });

      if (resp.status === 200) {
        setComment(prev => ({
          ...prev,
          [reviewNo]: resp.data
        }));
        setOpenCommentId(reviewNo);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const submitComment = async (reviewNo) => {
    if (!token) {
      toast.error("로그인 후 이용해주세요.");
      return;
    }

    const content = inputComment[reviewNo];

    if (!content || content.trim().length === 0) {
      toast.warning("댓글을 입력해주세요.");
      return;
    }

    try {
      const resp = await axiosApi.post("/comment/addComment", {
        reviewNo,
        commentContent: content
      });

      if (resp.status === 200) {
        toast.success("댓글이 등록되었습니다.");
        getCommentCount(reviewNo);

        setInputComment(prev => ({ ...prev, [reviewNo]: "" }));

        const refreshResp = await axiosApi.get("/comment/getComment", {
          params: { reviewNo }
        });

        if (refreshResp.status === 200) {
          setComment(prev => ({ ...prev, [reviewNo]: refreshResp.data }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteComment = (commentNo, reviewNo) => {
    showConfirm(
      "댓글을 삭제하시겠습니까?",
      "삭제한 댓글은 복구할 수 없습니다.",
      async () => {
        try {
          const resp = await axiosApi.delete(`/comment/${commentNo}`);

          if (resp.status === 200) {
            toast.success("댓글이 삭제되었습니다.");
            getCommentCount(reviewNo);

            const commentResp = await axiosApi.get("/comment/getComment", {
              params: { reviewNo }
            });

            if (commentResp.status === 200) {
              setComment(prev => ({ ...prev, [reviewNo]: commentResp.data }));
            }
          }
        } catch (error) {
          toast.error("댓글 삭제에 실패했습니다.");
          console.error(error);
        }
      },
      "삭제"
    );
  };

  const clickEditCommentBtn = (c) => {
    setEditCommentId(c.commentNo);
    setOriginComment(c.commentContent);
    setEditCommentContent(c.commentContent);
  };

  const cancelEditComment = () => {
    setEditCommentContent(originComment);
    setEditCommentId(null);
  };

  const saveEditComment = async (commentNo, reviewNo) => {
    try {
      const resp = await axiosApi.put(`/comment/${commentNo}`, {
        commentContent: editCommentContent
      });

      if (resp.status === 200) {
        toast.success("댓글이 수정되었습니다.");
        setEditCommentId(null);

        const refreshResp = await axiosApi.get("/comment/getComment", {
          params: { reviewNo }
        });

        if (refreshResp.status === 200) {
          setComment(prev => ({ ...prev, [reviewNo]: refreshResp.data }));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    comment, commentCount, openCommentId,
    inputComment, setInputComment,
    toggleComment, submitComment, deleteComment,
    editCommentId, editCommentContent, setEditCommentContent,
    clickEditCommentBtn, cancelEditComment, saveEditComment,
    getCommentCount,
  };
}
