package nknk.opus.project.chatbot.model.service;

import java.util.List;

import nknk.opus.project.chatbot.model.dto.ChatHistory;
import nknk.opus.project.chatbot.model.dto.ChatRequest;
import nknk.opus.project.chatbot.model.dto.ChatResponse;

public interface ChatbotService {
	 
    /**
     * AI 챗봇 대화
     */
    ChatResponse chat(ChatRequest request);
    
    /**
     * 대화 히스토리 조회
     */
    List<ChatHistory> getChatHistory(String conversationId);

}
