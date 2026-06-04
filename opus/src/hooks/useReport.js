import { useState } from 'react';
import axiosApi from '../api/axiosAPI';
import { toast } from 'react-toastify';
import { useAuthStore } from '../components/auth/useAuthStore';

export function useReport() {
  const token = useAuthStore(state => state.token);
  const loginMemberNo = useAuthStore(state => state.member?.memberNo);

  const [reportOpenId, setReportOpenId] = useState(null);
  const [reportReasonType, setReportReasonType] = useState({});
  const [reportReason, setReportReason] = useState({});

  const toggleReport = (reviewNo) => {
    setReportOpenId(prev => (prev === reviewNo ? null : reviewNo));
  };

  const submitReport = async (review) => {
    if (!token) {
      toast.error("로그인 후 이용해주세요.");
      return;
    }

    const selectedReason = reportReasonType[review.reviewNo];
    const reasonDetail = reportReason[review.reviewNo] || "";

    if (!selectedReason) {
      toast.warning("신고 사유를 선택해주세요.");
      return;
    }

    if (selectedReason === "기타" && reasonDetail.trim().length === 0) {
      toast.warning("기타 사유를 선택한 경우 상세 내용을 입력해주세요.");
      return;
    }

    try {
      const resp = await axiosApi.post("/reviews/addReport", {
        reviewNo: review.reviewNo,
        reporterNo: loginMemberNo,
        reportedNo: review.memberNo,
        reportReason: selectedReason,
        reportDetail: reasonDetail
      });

      if (resp.status === 200) {
        toast.success("신고가 접수되었습니다.");
        setReportOpenId(null);
        setReportReason(prev => ({ ...prev, [review.reviewNo]: "" }));
        setReportReasonType(prev => ({ ...prev, [review.reviewNo]: "" }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    reportOpenId, setReportOpenId,
    reportReasonType, setReportReasonType,
    reportReason, setReportReason,
    toggleReport, submitReport,
  };
}
