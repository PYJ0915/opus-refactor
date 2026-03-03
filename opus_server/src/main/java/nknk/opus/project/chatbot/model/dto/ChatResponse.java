package nknk.opus.project.chatbot.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {

	private String message;           // AI 응답
    private String conversationId;    // 대화 ID
    private int promptTokens;         // 입력 토큰
    private int completionTokens;     // 출력 토큰
    private int totalTokens;          // 총 토큰
    private String model;             // 사용된 모델
	
}
