package nknk.opus.project.order.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class TossPaymentResponse {
	
	private String paymentKey;
    private String orderId;
    private String orderName;
    private String method;  // 카드, 가상계좌, 간편결제 등
    private int totalAmount;
    private String status;  // READY, IN_PROGRESS, WAITING_FOR_DEPOSIT, DONE, CANCELED, PARTIAL_CANCELED, ABORTED, EXPIRED
    private String approvedAt;
    
    // 카드 결제 정보
    private Card card;
    
    // 가상계좌 정보
    private VirtualAccount virtualAccount;

}
