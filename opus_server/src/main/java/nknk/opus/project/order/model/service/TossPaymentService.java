package nknk.opus.project.order.model.service;

import org.apache.ibatis.annotations.Param;

import nknk.opus.project.order.model.dto.PaymentConfirmRequest;
import nknk.opus.project.order.model.dto.TossPaymentResponse;

public interface TossPaymentService {

	String getSecretKey();

	TossPaymentResponse confirmPayment(PaymentConfirmRequest request);

	/**
	 * 결제 취소 (토스페이먼츠 API 호출)
	 */
	TossPaymentResponse cancelPayment(@Param("paymentKey") String paymentKey, @Param("cancelReason") String cancelReason);

}
