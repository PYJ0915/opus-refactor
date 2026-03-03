import axiosApi from "./axiosAPI";

export const notificationApi = {

    // 알림 목록 (최신 20개)
    getNotifications: async () => {
        const resp = await axiosApi.get("/notifications");
        return resp.data;
    },

    // 읽지 않은 알림 수
    getUnreadCount: async () => {
        const resp = await axiosApi.get("/notifications/unread-count");
        return resp.data.count;
    },

    // 단건 읽음
    markAsRead: async (notiNo) => {
        await axiosApi.put(`/notifications/${notiNo}/read`);
    },

    // 전체 읽음
    markAllAsRead: async () => {
        await axiosApi.put("/notifications/read-all");
    },

    // 개별 삭제 
    deleteNotification: async (notiNo) => {
        await axiosApi.delete(`/notifications/${notiNo}`);
    },

    // 전체 비우기
    clearNotifications: async () => {
        await axiosApi.delete("/notifications");
    },
};