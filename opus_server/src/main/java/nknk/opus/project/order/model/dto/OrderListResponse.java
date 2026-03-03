package nknk.opus.project.order.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class OrderListResponse {
	
	private int orderNo;              // 주문 번호
    private String orderId;           // 주문 ID
    private String orderDate;         // 주문일
    private String orderStatus;       // 주문 상태
    private int totalAmount;          // 총 결제 금액
    private String paymentMethod;     // 결제 수단
    
    // 대표 상품 정보 (첫 번째 상품)
    private String firstGoodsName;    // 첫 번째 상품명
    private String firstThumbnail;    // 첫 번째 상품 썸네일
    private int totalItemCount;       // 총 상품 개수
    
    // 배송 정보
    private String trackingNumber;    // 송장 번호
    private String deliveryCompany;   // 택배사

}
