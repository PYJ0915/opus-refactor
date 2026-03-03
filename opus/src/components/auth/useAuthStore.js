import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 1. 초기값 설정: false 대신 null을 사용하여 로컬스토리지를 읽어오는 중(Hydration)임을 구분함
      token: null,
      member: null,
      isLoggedIn: null, 

      // 2. 로그인 함수: 기존 데이터를 보존하면서 로그인 정보를 추가함
      login: (data) => {
        set((state) => ({
          ...state, // 기존 카트(items 등) 데이터를 지우지 않고 유지함 (Overwrite 방지)
          isLoggedIn: true,
          token: data.token,
          member: data.member,
        }));
      },

      // 3. 로그아웃 함수: 모든 데이터를 초기화하고 스토리지 흔적을 지움
      logout: () => {
        // Zustand 상태값을 기본값으로 변경

        // 로컬 스토리지 비우기
        localStorage.removeItem("auth-storage");
        localStorage.removeItem("opus_cart");

        set({
          token: null,
          member: null,
          isLoggedIn: false,
          items: [],         // 로그아웃 시 장바구니 리스트 초기화
          checkedKeys: [],    // 선택된 항목 리스트 초기화
          hasMerged: false,   // 장바구니 병합 여부 플래그 초기화
        });

      },
    }),
    {
      name: "auth-storage", // 로컬스토리지에 저장될 키 이름
      
      // 4. 병합 로직: 새로고침 시 로컬 데이터와 코드 초기값을 합치는 방식 정의
      merge: (persistedState, currentState) => ({
        ...currentState,    // 현재의 초기 구조를 먼저 잡고
        ...(persistedState), // 로컬에 저장된 과거 데이터를 그 위에 덮어씌워 복구함
      }),
    }
  )
);
