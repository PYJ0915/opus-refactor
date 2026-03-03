import { create } from "zustand";
import { notificationApi } from "../api/notificationAPI";

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isOpen: false,
    isLoading: false,

    // 패널 열기/닫기
    togglePanel: () => set((state) => ({ isOpen: !state.isOpen })),
    closePanel: () => set({ isOpen: false }),

    // 알림 목록 불러오기 (패널 열 때 호출)
    fetchNotifications: async () => {
        set({ isLoading: true });
        try {
            const list = await notificationApi.getNotifications();
            set({ notifications: list, isLoading: false });
        } catch (e) {
            console.error("알림 목록 조회 실패:", e);
            set({ isLoading: false });
        }
    },

    // 읽지 않은 수만 조회 (30초 Polling용)
    fetchUnreadCount: async () => {
        try {
            const count = await notificationApi.getUnreadCount();
            set({ unreadCount: count });
        } catch (e) {
            console.error("읽지 않은 알림 수 조회 실패:", e);
        }
    },

    // 단건 읽음 처리 (비동기 처리 개선)
    markAsRead: async (notiNo) => {
        try {
            await notificationApi.markAsRead(notiNo);
            set((state) => ({
                notifications: state.notifications.map((n) =>
                    n.notiNo === notiNo ? { ...n, isRead: "Y" } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));
        } catch (e) {
            console.error("읽음 처리 실패:", e);
        }
    },

    // 전체 읽음 처리
    markAllAsRead: async () => {
        try {
            await notificationApi.markAllAsRead();
            set((state) => ({
                notifications: state.notifications.map((n) => ({ ...n, isRead: "Y" })),
                unreadCount: 0,
            }));
        } catch (e) {
            console.error("전체 읽음 처리 실패:", e);
        }
    },

    // 개별 삭제 (에러 처리 개선)
    deleteNotification: async (notiNo) => {
        try {
            await notificationApi.deleteNotification(notiNo);
            set((state) => {
                const deletedNoti = state.notifications.find((n) => n.notiNo === notiNo);
                const next = state.notifications.filter((n) => n.notiNo !== notiNo);

                return {
                    notifications: next,
                    unreadCount: deletedNoti && deletedNoti.isRead === "N"
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount,
                };
            });
        } catch (e) {
            console.error("알림 삭제 실패:", e);
        }
    },

    // 전체 비우기
    clearNotifications: async () => {
        try {
            await notificationApi.clearNotifications();
            set({ notifications: [], unreadCount: 0 });
        } catch (e) {
            console.error("전체 비우기 실패:", e);
        }
    },

    // 로그아웃 시 초기화
    reset: () => set({ notifications: [], unreadCount: 0, isOpen: false, isLoading: false }),
}));
