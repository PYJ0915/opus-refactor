import axiosApi from "./axiosAPI";

// 상품 목록 조회
export const fetchGoodsList = async () => {
  return await axiosApi.get("/selections");
};

// 상품 상세 조회
export const fetchGoodsDetail = async (goodsNo) => {
  return await axiosApi.get(`/selections/${goodsNo}`);
};

// 상품 이미지 목록 조회
export const fetchGoodsImgList = async (goodsNo) => {
  return await axiosApi.get(`/selections/${goodsNo}/images`);
};

// 상품 옵션 조회
export const fetchGoodsOptions = async (goodsNo) => {
  return await axiosApi.get(`/selections/${goodsNo}/options`);
};