package nknk.opus.project.order.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@PropertySource("classpath:/config.properties")
public class EmailService {
	
	@Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    /**
     * 입금 완료 이메일 발송
     */
    public void sendDepositConfirmEmail(String toEmail, String ordererName, 
                                       String orderId, int amount) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[OPUS] 입금이 확인되었습니다.");
            
            String content = String.format("""
                <html>
                <body>
                    <h2>입금이 확인되었습니다</h2>
                    <p>%s님, 안녕하세요.</p>
                    <p>주문하신 상품의 입금이 확인되었습니다.</p>
                    <hr>
                    <p><strong>주문번호:</strong> %s</p>
                    <p><strong>결제금액:</strong> %,d원</p>
                    <hr>
                    <p>빠른 시일 내에 배송 준비를 시작하겠습니다.</p>
                    <p>감사합니다.</p>
                </body>
                </html>
                """, ordererName, orderId, amount);
            
            helper.setText(content, true);
            
            mailSender.send(message);
            
        } catch (Exception e) {
            throw new RuntimeException("이메일 발송 실패", e);
        }
    }
}
