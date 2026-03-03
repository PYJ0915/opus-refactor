package nknk.opus.project.chatbot.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class ChatRequest {
	
	private String message;           // 사용자 메시지
    private String conversationId;    // 대화 ID (선택)
    private String contextData; // 실제 데이터

}
