package nknk.opus.project.order.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class PaymentConfirmRequest {
	
	private String paymentKey;
    private String orderId;
    private int amount;
    
}
