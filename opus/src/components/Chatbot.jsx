import { useState, useEffect, useRef } from "react";
import { chatbotApi } from "../api/chatbotAPI";
import "../css/Chatbot.css";
import { useContentStore } from "../store/useContentStore";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  // 전달 데이터
  const exhibitions = useContentStore((s) => s.exhibitions);
  const musicals = useContentStore((s) => s.musicals);
  const goods = useContentStore((s) => s.goods);

  // 정보성 키워드
  const DETAIL_KEYWORDS = [
    "전시", "뮤지컬", "공연", "언제", "어디서", "어디",
    "얼마", "가격", "기간", "장소", "상품", "굿즈", "몇 시",

    // 추가 — 인기·추천 감지용
    "인기", "핫한", "핫", "요즘", "추천", "랭킹",
    "최신", "화제", "흥행", "뜨는", "지금",
    "어떤 거", "뭐가 좋아", "뭐 볼까", "볼만한", "재밌는"
  ];

  const needsDetail = (message) =>
    DETAIL_KEYWORDS.some(k => message.includes(k));

  const buildContextData = () => {
    let context = "";

    if (exhibitions.length > 0) {
      context += "### 전시 목록\n";
      exhibitions.forEach(e => {
        context += `- [${e.status}] ${e.title} | ${e.period} | ${e.place}\n`;
      });
    }

    if (musicals.length > 0) {
      context += "\n### 뮤지컬 목록\n";
      musicals.forEach(m => {
        context += `- [${m.status}] ${m.title} | ${m.period} | ${m.place}\n`;
      });
    }

    if (goods.length > 0) {
      context += "\n### 굿즈 상품 목록\n";
      goods.forEach(g => {
        context += `- ${g.name} | ${Number(g.price).toLocaleString()}원 | ${g.sort} / ${g.category}\n`;
      });
    }

    return context || null;
  };

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 챗봇 열기
  const handleOpen = () => {
    setIsOpen(true);

    // 환영 메시지
    if (messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: `안녕하세요! OPUS 문화 플랫폼 AI 도우미입니다 😊

전시, 뮤지컬, 경매, 굿즈 등 OPUS의 모든 서비스에 대해 편하게 질문해 주세요.

💡 전시·뮤지컬 정보가 필요하신 경우
On-Stage 탭을 먼저 한 번 방문하신 후 질문해 주시면
현재 공연·전시 중인 실제 데이터를 기반으로 더 정확하게 안내해 드릴 수 있습니다!`,
        timestamp: new Date()
      }]);
    }
  };

  // 메시지 전송
  const handleSend = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // 사용자 메시지 추가
    const newUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    // API 호출
    setIsLoading(true);
    try {

      // 정보성 키워드 있을 때만 contextData 포함
      const contextData = needsDetail(userMessage)
        ? buildContextData()
        : null;

      const response = await chatbotApi.chat(userMessage, conversationId, contextData);

      // conversationId 저장
      if (!conversationId) {
        setConversationId(response.conversationId);
        console.log("대화 시작:", response.conversationId);
      }

      console.log("토큰 사용:", response.totalTokens, "모델:", response.model);

      // AI 응답 추가
      const aiMessage = {
        role: "assistant",
        content: response.message,
        timestamp: new Date(),
        tokens: response.totalTokens
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("챗봇 오류:", error);

      // 에러 메시지
      const errorMessage = {
        role: "assistant",
        content: "죄송합니다. 일시적인 오류가 발생했습니다. 😔\n잠시 후 다시 시도해주세요.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter 키로 전송
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 새 대화 시작
  const handleNewConversation = () => {
    setMessages([{
      role: "assistant",
      content: "새 대화를 시작합니다! 무엇을 도와드릴까요? 😊",
      timestamp: new Date()
    }]);
    setConversationId(null);
  };



  return (
    <>
      {/* 챗봇 버튼 */}
      {!isOpen && (
        <button
          className="chatbot-button"
          onClick={handleOpen}
          aria-label="챗봇 열기"
        >
          <i className="fa-solid fa-comment-dots"></i>
        </button>
      )}

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="chatbot-container">
          {/* 헤더 */}
          <div className="chatbot-header">
            <div className="chatbot-header__info">
              <i className="fa-solid fa-robot"></i>
              <div>
                <span className="chatbot-title">OPUS AI 상담</span>
                <span className="chatbot-model">gpt-4o-mini</span>
              </div>
            </div>
            <div className="chatbot-header__actions">
              <button
                className="chatbot-header__new"
                onClick={handleNewConversation}
                title="새 대화"
              >
                <i className="fa-solid fa-plus"></i>
              </button>
              <button
                className="chatbot-header__close"
                onClick={() => setIsOpen(false)}
                aria-label="챗봇 닫기"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>

          {/* 메시지 영역 */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message message--${msg.role}`}
              >
                <div className="message__avatar">
                  {msg.role === "user" ? (
                    <i className="fa-solid fa-user"></i>
                  ) : (
                    <i className="fa-solid fa-robot"></i>
                  )}
                </div>
                <div className="message__content">
                  {msg.content}
                </div>
              </div>
            ))}

            {/* 로딩 */}
            {isLoading && (
              <div className="message message--assistant">
                <div className="message__avatar">
                  <i className="fa-solid fa-robot"></i>
                </div>
                <div className="message__content message__content--loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              disabled={isLoading}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
              aria-label="메시지 전송"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>

          {/* 푸터 */}
          <div className="chatbot-footer">
            Powered by GPT-4o-mini
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;