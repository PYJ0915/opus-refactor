package nknk.opus.project.chatbot.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import nknk.opus.project.chatbot.model.dto.ChatHistory;

@Mapper
public interface ChatbotMapper {
	
	 /**
     * 대화 저장
     */
    int insertChatHistory(ChatHistory history);

    /**
     * 대화 조회 (최근 N개)
     */
    List<ChatHistory> getChatHistory(
            @Param("conversationId") String conversationId,
            @Param("limit") int limit);

}
