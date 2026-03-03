package nknk.opus.project.chatbot.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.chatbot.model.dto.ChatHistory;
import nknk.opus.project.chatbot.model.dto.ChatRequest;
import nknk.opus.project.chatbot.model.dto.ChatResponse;
import nknk.opus.project.chatbot.model.service.ChatbotService;

@Slf4j
@RestController
@RequestMapping("chatbot")
public class ChatbotController {

	@Autowired
	private ChatbotService service;

    /**
     * AI 챗봇 대화
     */
    @PostMapping("chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        log.info("챗봇 요청: {}", request.getMessage());
        
        ChatResponse response = service.chat(request);
        
        log.info("응답 생성 완료 - 토큰: {}, 모델: {}", 
                response.getTotalTokens(), response.getModel());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 대화 히스토리 조회
     */
    @GetMapping("history/{conversationId}")
    public ResponseEntity<List<ChatHistory>> getHistory(
            @PathVariable String conversationId) {
        
        List<ChatHistory> history = service.getChatHistory(conversationId);
        
        return ResponseEntity.ok(history);
    }
	
}
