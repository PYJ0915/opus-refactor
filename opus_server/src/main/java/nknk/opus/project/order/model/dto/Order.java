package nknk.opus.project.order.model.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Order {

	// 기본 정보
    private int orderNo;              // 주문 번호 (PK)
    private String orderId;           // 주문 고유 ID (UUID)
    private int memberNo;             // 회원 번호 (FK)
    
    // 주문자 정보
    private String ordererName;       // 주문자명
    private String email;             // 이메일
    
    // 수령인 정보
    private String recipient;         // 수령인
    private String recipientTel;      // 수령인 연락처
    private String postcode;          // 우편번호
    private String basicAddress;      // 기본 주소
    private String detailAddress;     // 상세 주소
    private String deliveryReq;       // 배송 요청사항
    
    // 결제 정보
    private String paymentKey;        // 토스 결제 키
    private String paymentMethod;     // 결제 수단 (카드, 간편결제, 가상계좌)
    private int totalAmount;          // 총 결제 금액
    private int goodsAmount;          // 상품 금액
    private int deliveryAmount;       // 배송비
    
    // 주문 상태
    private String orderStatus;       // 주문 상태
    private String orderDate;         // 주문일
    private String approvedAt;        // 결제 승인 시각
    
    // 가상계좌 정보 (무통장 입금용)
    private String virtualAccountBank;      // 은행명
    private String virtualAccountNumber;    // 계좌번호
    private String virtualAccountDueDate;   // 입금 기한
    
    // 취소/환불 정보
    private String cancelReason;      // 취소 사유
    private String canceledAt;        // 취소 시각
    private String refundStatus;      // 환불 상태
    
    // 배송 정보
    private String trackingNumber;    // 송장 번호
    private String deliveryCompany;   // 택배사
    private String deliveredAt;       // 배송 완료 시각
    
 // 주문 상품 목록
    private List<OrderItem> items;
	
}
