import axiosApi from "./axiosAPI";

const addressAPI = {

  // 배송지 목록 조회
  fetchAddresses: () =>
    axiosApi.get("/addresses"),

  // 배송지 추가
  addAddress: (data) => 
    axiosApi.post("/addresses", data),

  // 배송지 수정
  updateAddress: (id, data) =>
    axiosApi.put(`/addresses/${id}`, data),

  // 배송지 삭제
  deleteAddress: (id) =>
    axiosApi.delete(`/addresses/${id}`),

  // 기본 배송지 설정
  setDefaultAddress: (id) =>
    axiosApi.put(`/addresses/${id}/default`),

  // 기존 기본 배송지 해제 (추가)
  clearDefaultAddress: () =>
    axiosApi.put("/addresses/default/clear"),
};

export default addressAPI;

