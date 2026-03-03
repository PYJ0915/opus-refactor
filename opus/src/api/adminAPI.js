import axiosApi from "./axiosAPI";

export const adminApi = {

  // 상품 등록 (멀티파트)
  registGoods: async (formData) => {
    const resp = await axiosApi.post("/admin/goods", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return resp.data;
  },

  // 상품 수정 
  updateGoods: async (goodsNo, formData) => {
    const resp = await axiosApi.put(`/admin/goods/${goodsNo}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return resp.data;
  },

  // 관리자용 상품 목록
  getGoodsList: async () => {
    const resp = await axiosApi.get("/admin/goods");
    return resp.data;
  },

  // 상품 상세 조회 (goodsInfo + 이미지 + 옵션)
  getGoodsDetail: async (goodsNo) => {
    const resp = await axiosApi.get(`/admin/goods/${goodsNo}/detail`);
    return resp.data;
  },

  // 상품 삭제
  deleteGoods: async (goodsNo) => {
    const resp = await axiosApi.delete(`/admin/goods/${goodsNo}`);
    return resp.data;
  },

  // 상품 복구
  restoreGoods: async (goodsNo) => {
    const resp = await axiosApi.patch(`/admin/goods/${goodsNo}/restore`);
    return resp.data;
  },

  // 상세 이미지 단건 삭제
  deleteGoodsImage: async (goodsImgNo) => {
    const resp = await axiosApi.delete(`/admin/goods/image/${goodsImgNo}`);
    return resp.data;
  },

  // 전체 주문 목록
  getAllOrders: async (status) => {
    const resp = await axiosApi.get("/admin/orders", {
      params: status ? { status } : {}
    });
    return resp.data;
  },

  // 주문 상태 변경
  updateOrderStatus: async (orderNo, status) => {
    const resp = await axiosApi.patch(`/admin/orders/${orderNo}/status`, { status });
    return resp.data;
  },

  // 송장번호 입력
  updateTracking: async (orderNo, deliveryCompany, trackingNumber) => {
    const resp = await axiosApi.patch(`/admin/orders/${orderNo}/tracking`, {
      deliveryCompany,
      trackingNumber
    });
    return resp.data;
  },

  // 경매 목록 조회
  getUnveilingList: async () => {
    const resp = await axiosApi.get("/admin/unveilings");
    return resp.data;
  },

  // 경매 등록
  registUnveiling: async (data) => {
    const resp = await axiosApi.post("/admin/unveilings", data);
    return resp.data;
  },
};