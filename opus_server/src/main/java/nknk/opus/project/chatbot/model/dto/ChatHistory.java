package nknk.opus.project.chatbot.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatHistory {

	private int chatNo;
	private String conversationId;
	private String role; // "user" or "assistant"
	private String content;
	private String createdAt;

}
