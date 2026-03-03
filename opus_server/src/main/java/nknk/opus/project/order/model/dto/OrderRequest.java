package nknk.opus.project.order.model.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class OrderRequest {
	
	private List<OrderItem> items;
    private String recipient;
    private String recipientTel;
    private String postcode;
    private String basicAddress;
    private String detailAddress;
    private String deliveryReq;
    private String email;
    private String ordererName;
    private int totalAmount;
    private String paymentMethod;
}
