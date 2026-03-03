import axiosApi from "./axiosAPI";


export const orderApi = {

  // 주문 생성 (결제 전)
  createOrder: async (orderData) => {
    try {
      const resp = await axiosApi.post("/orders", orderData);
      return resp.data;
    } catch (error) {
      console.error("주문 생성 실패:", error);
      throw error;
    }
  },

  // 결제 승인 (최종 확정)
  confirmPayment: async (confirmData) => {
    try {
      const resp = await axiosApi.post("/orders/confirm", confirmData);
      return resp.data;
    } catch (error) {
      console.error("결제 승인 실패:", error);
      throw error;
    }
  },

  // 내 주문 목록 조회
  getMyOrders: async () => {
    const response = await axiosApi.get(`/orders/my`, {
      withCredentials: true
    });
    return response.data;
  },

  // 주문 상태별 목록 조회
  getMyOrdersByStatus: async (status) => {
    const response = await axiosApi.get(`/orders/my`, {
      params: { status },
      withCredentials: true
    });
    return response.data;
  },

  // 주문 상세 조회
  getOrderDetail: async (orderNo) => {
    const response = await axiosApi.get(`/orders/my/${orderNo}`, {
      withCredentials: true
    });
    return response.data;
  },

  // 주문 취소
  cancelOrder: async (orderId, cancelReason) => {
    const response = await axiosApi.post(`/orders/cancel`, {
      orderId,
      cancelReason
    }, {
      withCredentials: true
    });
    return response.data;
  },

}