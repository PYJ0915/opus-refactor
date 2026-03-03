package nknk.opus.project.order.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelRequest {

	private String orderId; // 주문 ID
	private String cancelReason; // 취소 사유

}
