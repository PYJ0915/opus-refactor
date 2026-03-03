import axiosApi from "./axiosAPI"

export const cartApi = {

  // 장바구니 목록 조회
  selectCartItems: async () => {
    const resp = await axiosApi.get("/cart");
    return resp.data;
  },

  // 장바구니에 추가
  addToCart: async (cartData) => {
    const resp = await axiosApi.post("/cart", cartData);
    return resp.data;
  },

  // 수량 변경
  updateCartQty: async (cartNo, qty) => {
    const resp = await axiosApi.put(`/cart/${cartNo}`, null, {
      params: { qty },
    });
    return resp.data;
  },

  // 장바구니 항목 삭제
  removeFromCart: async (cartNo) => {
    const resp = await axiosApi.delete(`/cart/${cartNo}`);
    return resp.data;
  },

  // 장바구니 비우기
  clearCart: async () => {
    const resp = await axiosApi.delete("/cart");
    return resp.data;
  },

  // 로컬 장바구니 병합
  mergeLocalCart: async (localItems) => {
    const resp = await axiosApi.post("/cart/merge", localItems);
    return resp.data;
  },
}


