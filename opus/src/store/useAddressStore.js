import { create } from "zustand";
import addressAPI from "../api/addressAPI";

export const useAddressStore = create((set, get) => ({
  addresses: [],
  selectedAddressId: null,
  isLoading: false,

  /* 배송지 목록 조회 */
  fetchAddresses: async () => {
    set({ isLoading: true });
    try {
      const resp = await addressAPI.fetchAddresses();

      const list = resp.data ?? [];
      const defaultAddr = list.find(a => a.isDefault === "Y");

      set({
        addresses: list,
        selectedAddressId:
          defaultAddr?.addressNo ?? list[0]?.addressNo ?? null,
        isLoading: false
      });
    } catch (e) {
      console.error(e);
      set({ isLoading: false });
    }
  },

  selectAddress: (id) => set({ selectedAddressId: id }),

  addAddress: async (form) => {
    await addressAPI.addAddress({
      recipient: form.recipient,
      recipientTel: form.recipientTel,
      postcode: form.postcode,
      basicAddress: form.basicAddress,
      detailAddress: form.detailAddress,
      deliveryReq: form.deliveryReq,
      isDefault: form.isDefault ?? "N"
    });

    await get().fetchAddresses();
  },

  updateAddress: async (id, form) => {
    await addressAPI.updateAddress(id, {
      recipient: form.recipient,
      recipientTel: form.recipientTel,
      postcode: form.postcode,
      basicAddress: form.basicAddress,
      detailAddress: form.detailAddress,
      deliveryReq: form.deliveryReq,
      isDefault: form.isDefault ?? "N"
    });
    await get().fetchAddresses();
  },

  deleteAddress: async (id) => {
    await addressAPI.deleteAddress(id);
    await get().fetchAddresses();
  },

  // 기존 배송지 설정
  setDefaultAddress: async (id) => {
    try {
      // 새 기본 배송지 설정
      await addressAPI.setDefaultAddress(id);

      // 다시 조회
      await get().fetchAddresses();
    } catch (error) {
      console.error("기본 배송지 설정 실패", error);
    }
  },
}));
