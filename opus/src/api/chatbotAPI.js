import axiosApi from "./axiosAPI";

export const chatbotApi = {
  /**
   * AI 챗봇 대화
   */
  chat: async (message, conversationId = null, contextData = null) => {
    const response = await axiosApi.post(`/chatbot/chat`, {
      message,
      conversationId,
      contextData
    });
    return response.data;
  },

  /**
   * 대화 히스토리 조회
   */
  getHistory: async (conversationId) => {
    const response = await axiosApi.get(
      `/chatbot/history/${conversationId}`
    );
    return response.data;
  }
};