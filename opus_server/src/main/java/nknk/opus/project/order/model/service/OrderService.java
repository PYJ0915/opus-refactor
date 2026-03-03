package nknk.opus.project.order.model.service;

import java.util.List;
import java.util.Map;

import nknk.opus.project.order.model.dto.CancelRequest;
import nknk.opus.project.order.model.dto.Order;
import nknk.opus.project.order.model.dto.OrderListResponse;
import nknk.opus.project.order.model.dto.OrderRequest;
import nknk.opus.project.order.model.dto.PaymentConfirmRequest;
import nknk.opus.project.order.model.dto.TossPaymentResponse;

public interface OrderService {

	Map<String, Object> createOrder(OrderRequest request, int memberNo);

	TossPaymentResponse confirmPayment(PaymentConfirmRequest request, int memberNo);

	void completeVirtualAccountDeposit(String orderId);

	List<OrderListResponse> getOrderList(int memberNo);

	List<OrderListResponse> getOrderListByStatus(int memberNo, String status);

	Order getOrderDetail(int orderNo, int memberNo);

	void cancelOrder(CancelRequest request, int memberNo);

	void updateTrackingInfo(int orderNo, String trackingNumber, String deliveryCompany);

	void completeDelivery(int orderNo);

}
