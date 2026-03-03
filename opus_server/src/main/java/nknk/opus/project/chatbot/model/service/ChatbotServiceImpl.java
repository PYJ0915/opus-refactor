package nknk.opus.project.chatbot.model.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.openai.client.OpenAIClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.completions.CompletionUsage;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.chatbot.model.dto.ChatHistory;
import nknk.opus.project.chatbot.model.dto.ChatRequest;
import nknk.opus.project.chatbot.model.dto.ChatResponse;
import nknk.opus.project.chatbot.model.mapper.ChatbotMapper;

@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class ChatbotServiceImpl implements ChatbotService{

	@Autowired
	private OpenAIClient openAIClient;

	@Autowired
	private ChatbotMapper mapper;

	@Value("${openai.model}")
	private String model;

	@Value("${openai.max.tokens}")
	private int maxTokens;

	@Value("${openai.temperature}")
	private double temperature;

	@Override
    public ChatResponse chat(ChatRequest request) {
        log.info("=== AI 챗봇 요청 ===");
        log.info("메시지: {}", request.getMessage());

        try {
            // 대화 ID 생성 또는 가져오기
            String conversationId = request.getConversationId();
            if (conversationId == null || conversationId.isEmpty()) {
                conversationId = UUID.randomUUID().toString();
                log.info("새 대화 생성: {}", conversationId);
            }

         // ChatCompletion 파라미터 구성
            ChatCompletionCreateParams.Builder builder =
                    ChatCompletionCreateParams.builder()
                            .model(model)
                            .addSystemMessage(buildSystemPrompt(request.getContextData()))
                            .temperature(temperature)
                            .maxCompletionTokens((long) maxTokens);

            // 이전 대화 히스토리 추가
            List<ChatHistory> history =
                    mapper.getChatHistory(conversationId, 10);

            for (ChatHistory h : history) {

                if ("user".equals(h.getRole())) {
                    builder.addUserMessage(h.getContent());
                } else if ("assistant".equals(h.getRole())) {
                    builder.addAssistantMessage(h.getContent());
                }
            }

            // 현재 사용자 메시지 추가
            builder.addUserMessage(request.getMessage());
            
         // OpenAI 호출
            ChatCompletion completion =
                    openAIClient.chat().completions().create(builder.build());

         // 응답 추출
            String aiResponse = "응답을 생성하지 못했습니다.";

            if (!completion.choices().isEmpty()) {
                aiResponse = completion.choices()
                        .get(0)
                        .message()
                        .content()
                        .orElse(aiResponse);
            }
            
            int promptTokens = 0;
            int completionTokens = 0;
            int totalTokens = 0;

            if (completion.usage().isPresent()) {

            	CompletionUsage usage = completion.usage().get();

                promptTokens = (int) usage.promptTokens();
                completionTokens = (int) usage.completionTokens();
                totalTokens = (int) usage.totalTokens();
            }
            
            // DB 저장
            saveChatHistory(conversationId, "user", request.getMessage());
            saveChatHistory(conversationId, "assistant", aiResponse);
            
            // 응답 반환
            return ChatResponse.builder()
                    .message(aiResponse)
                    .conversationId(conversationId)
                    .promptTokens(promptTokens)
                    .completionTokens(completionTokens)
                    .totalTokens(totalTokens)
                    .model(completion.model())
                    .build();

        } catch (Exception e) {
            log.error("AI 챗봇 오류", e);
            throw new RuntimeException("챗봇 응답 생성 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 대화 히스토리 불러오기
     */
    @Override
    public List<ChatHistory> getChatHistory(String conversationId) {
        return mapper.getChatHistory(conversationId, 50);
    }
    
    /**
     * 시스템 프롬프트 생성
     */
    private String buildSystemPrompt(String contextData) {
    	String base =
    	        "당신은 OPUS 문화 플랫폼의 공식 AI 어시스턴트입니다.\n" +
    	        "OPUS는 전시·뮤지컬 정보(On-Stage), 공지/이벤트 게시판(Proposals),\n" +
    	        "미술품 경매(Unveiling), 문화 굿즈 쇼핑(Selections) 서비스를 운영합니다.\n\n" +

    	        "## 담당 업무\n" +
    	        "[On-Stage] 전시·뮤지컬 정보 안내 (일정, 장소, 관람등급, 출연진)\n" +
    	        "[Proposals] 공지사항 및 이벤트·홍보 게시판 안내\n" +
    	        "[Unveiling] 미술품 경매 절차 안내 (마감형 최고가 낙찰, 본인인증 필요)\n" +
    	        "[Selections] 굿즈 상품 안내, 장바구니, 결제, 주문내역, 배송비(5만원 이상 무료)\n" +
    	        "[마이페이지] 연락처·비밀번호 변경, 찜 리스트, 후기, 주문·경매 내역, 회원탈퇴\n\n" +

    	        "## 응답 원칙\n" +
    	        "- 항상 정중한 존댓말 사용\n" +
    	        "- 5줄 이내로 간결하게 안내\n" +
    	        "- 아래 플랫폼 데이터가 제공된 경우, 반드시 해당 데이터만 기반으로 답변\n" +
    	        "- 데이터에 없는 공연명·상품명은 절대 언급하지 않음\n" +
    	        "- 데이터가 제공되지 않은 경우 해당 페이지에서 직접 확인을 안내\n" +
    	        "- 데이터가 없는 질문은 추측하지 말고 고객센터 안내\n" +
    	        "- 자연스러운 한국어 사용, 이모지 절제\n" + 
    	        
    	        
    	        "## 데이터 없을 때 안내 원칙\n" +
    	        "전시·뮤지컬 관련 질문을 받았는데 현재 데이터가 제공되지 않은 경우, "  +
    	        "임의로 작품을 지어내지 말고 "  +
    	        "'더 정확한 안내를 위해 On-Stage 탭을 한 번 방문하신 후 다시 질문해 주세요!'라고 안내해.\n";
    	
    	// 키워드 감지 시에만 contextData가 들어옴
        	if (contextData != null && !contextData.isBlank()) {
                base +=
                    "## 현재 공연·전시 실시간 데이터\n"
                  + contextData + "\n\n"

                  + "## 인기 공연·전시 판단 기준\n"
                  + "사용자가 인기작·추천작·핫한 공연·전시를 물어볼 경우, "
                  + "위 데이터 목록 안에서만 선택하고 아래 기준을 복합적으로 고려해서 판단해.\n\n"

                  + "### 판단 기준 (우선순위 순)\n"
                  + "1. 롱런 여부: 초연 이후 재연·삼연을 반복하며 오랫동안 사랑받는 작품일수록 인기가 높다.\n"
                  + "2. 원작 인지도: 동명의 영화·소설·만화 등 원작이 유명할수록 대중적 관심이 높다.\n"
                  + "3. 수상 이력: 토니상(Tony Awards), 한국뮤지컬어워즈, 대한민국 문화예술상 등 권위 있는 시상식 수상 작품을 우선한다.\n"
                  + "4. 배우 인지도: 주연 배우가 대중적으로 잘 알려진 경우 티켓 수요가 높다.\n"
                  + "5. 제작 규모: 대형 라이선스 작품(브로드웨이·웨스트엔드 원작)은 일반적으로 높은 완성도와 관심을 가진다.\n"
                  + "6. 시즌성: 연말·연초·방학 시즌에 가족 단위 관람객이 선호하는 작품을 우선 고려한다.\n\n"

                  + "### 전시 인기 판단 기준\n"
                  + "1. 작가 인지도: 세계적으로 알려진 작가(모네, 반 고흐, 쿠사마 야요이 등)의 전시는 높은 관심도를 가진다.\n"
                  + "2. 기획 규모: 국립·시립 미술관 또는 대형 갤러리 주관 전시를 우선한다.\n"
                  + "3. 희소성: 국내 최초 공개 또는 해외 유명 소장품 특별전은 화제성이 높다.\n"
                  + "4. 미디어아트 여부: 체험형·몰입형 전시는 최근 MZ세대에게 인기가 높다.\n\n"

                  + "### 답변 원칙\n"
                  + "- 반드시 위 데이터 목록에 있는 작품만 소개할 것. 목록에 없는 작품은 절대 언급하지 마.\n"
                  + "- 추천 시 작품명, 공연 기간, 장소, 추천 이유(위 기준 기반)를 함께 제공해.\n"
                  + "- 인기 기준은 판매량이 아닌 위 항목들을 종합한 판단임을 자연스럽게 안내해.\n"
                  + "- 확실하지 않은 정보는 추측하지 말고 '정확한 정보는 공식 사이트에서 확인하세요'로 안내해.\n"
                  + "- 최대 3~5개만 추려서 소개하고, 간결하고 자연스러운 말투로 답해.\n";
            }

            return base;
       }
    

    /**
     * 대화 히스토리 저장
     */
    private void saveChatHistory(String conversationId, String role, String content) {
        ChatHistory history = ChatHistory.builder()
                .conversationId(conversationId)
                .role(role)
                .content(content)
                .build();
        mapper.insertChatHistory(history);
    }

}
