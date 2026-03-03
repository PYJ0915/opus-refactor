package nknk.opus.project.order.model.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.common.exception.BusinessException;
import nknk.opus.project.common.exception.ResourceNotFoundException;
import nknk.opus.project.notification.model.service.NotificationService;
import nknk.opus.project.order.model.dto.CancelRequest;
import nknk.opus.project.order.model.dto.Order;
import nknk.opus.project.order.model.dto.OrderItem;
import nknk.opus.project.order.model.dto.OrderListResponse;
import nknk.opus.project.order.model.dto.OrderRequest;
import nknk.opus.project.order.model.dto.PaymentConfirmRequest;
import nknk.opus.project.order.model.dto.TossPaymentResponse;
import nknk.opus.project.order.model.mapper.OrderMapper;

@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class OrderServiceImpl implements OrderService {

	@Autowired
	private OrderMapper mapper;

	@Autowired
	private TossPaymentService tossPaymentService;

	@Autowired
	private EmailService emailService; // 이메일 발송 서비스

	@Autowired
	private NotificationService notificationService;

	// 낙관적 락 충돌 시 최대 재시도 횟수
	private static final int MAX_RETRY = 3;

	/**
	 * 주문 생성 (결제 전)
	 */
	@Override
	public Map<String, Object> createOrder(OrderRequest request, int memberNo) {

		// 주문 생성 전 재고 존재 여부 사전 검증
		validateStockBeforeOrder(request.getItems());

		// 1. 주문 번호 생성
		String orderId = "ORDER_" + System.currentTimeMillis() + "_" + memberNo;

		log.info("===== 주문 생성 시작 =====");
		log.info("orderId: {}", orderId);
		log.info("memberNo: {}", memberNo);
		log.info("recipient: {}", request.getRecipient());
		log.info("totalAmount: {}", request.getTotalAmount());

		// 2. 주문 정보 DB 저장
		Order order = Order.builder().orderId(orderId).memberNo(memberNo).recipient(request.getRecipient())
				.recipientTel(request.getRecipientTel()).postcode(request.getPostcode())
				.basicAddress(request.getBasicAddress()).detailAddress(request.getDetailAddress())
				.deliveryReq(request.getDeliveryReq()).email(request.getEmail()).ordererName(request.getOrdererName())
				.totalAmount(request.getTotalAmount()).goodsAmount(request.getTotalAmount()).deliveryAmount(0)
				.paymentMethod(request.getPaymentMethod()).orderStatus("READY").build();

		log.info("Order 객체 생성 완료: {}", order);

		int result = mapper.createOrder(order);

		if (result != 1) {
			throw new BusinessException("주문 생성에 실패했습니다.");
		}

		// 생성된 ORDER_NO 가져오기
		int orderNo = order.getOrderNo();

		// 3. 주문 상품 저장
		for (OrderItem item : request.getItems()) {
			OrderItem orderItem = OrderItem.builder().orderNo(orderNo).goodsNo(item.getGoodsNo())
					.goodsOptionNo(item.getGoodsOptionNo()).qty(item.getQty()).unitPrice(item.getUnitPrice()).build();

			mapper.insertOrderItem(orderItem);
		}

		// 4. 주문명 생성
		// 4. 주문명 생성
		String orderName = generateOrderName(request.getItems());
		int itemCount = request.getItems().size(); // 총 상품 개수

		notificationService.createNotification(memberNo, "ORDER", "주문이 완료되었습니다.", itemCount == 1 ? orderName // 1개면 상품명만
				: orderName + " 외 " + (itemCount - 1) + "건", // 2개 이상이면 "외 N건"
				"/mypage/orders");

		// 5. 응답 데이터
		Map<String, Object> response = new HashMap<>();
		response.put("orderId", orderId);
		response.put("orderName", orderName);
		response.put("amount", request.getTotalAmount());

		log.info("주문 생성 완료 - orderId: {}, memberNo: {}, amount: {}", orderId, memberNo, request.getTotalAmount());

		return response;
	}

	/**
	 * 결제 승인
	 */
	@Override
	public TossPaymentResponse confirmPayment(PaymentConfirmRequest request, int memberNo) {

		// 1. 주문 정보 조회
		Order order = mapper.selectOrderByOrderId(request.getOrderId());

		if (order == null) {
			throw new ResourceNotFoundException("주문 정보를 찾을 수 없습니다.");
		}

		if (order.getMemberNo() != memberNo) {
			throw new BusinessException("권한이 없습니다.");
		}

		// 2. 금액 검증 (변조 방지)
		if (order.getTotalAmount() != request.getAmount()) {
			throw new BusinessException("결제 금액이 일치하지 않습니다.");
		}

		// 3. 이미 승인된 주문인지 확인
		if ("PAID".equals(order.getOrderStatus())) {
			throw new BusinessException("이미 처리된 주문입니다.");
		}

		// 4. 토스페이먼츠 승인 요청
		TossPaymentResponse paymentResponse = tossPaymentService.confirmPayment(request);
		
		try {
			// 5. 주문 상태 업데이트
			String tossStatus = paymentResponse.getStatus();

			if ("DONE".equals(tossStatus)) {

				// 재고 차감
				List<OrderItem> orderItems = mapper.selectOrderItems(request.getOrderId());
				deductStockForItems(orderItems, request.getOrderId());

				order.setOrderStatus("PAID");
			} else if ("WAITING_FOR_DEPOSIT".equals(tossStatus)) {
				order.setOrderStatus("WAITING_FOR_DEPOSIT");
				log.info("가상계좌 발급 완료 - orderId: {}, 입금 대기 중 (재고 차감은 입금 완료 시)", request.getOrderId());
			} else {
				order.setOrderStatus("FAILED");
			}

			order.setPaymentKey(paymentResponse.getPaymentKey());
			order.setApprovedAt(paymentResponse.getApprovedAt());

			// 가상계좌인 경우 정보 저장
			if ("가상계좌".equals(paymentResponse.getMethod()) && paymentResponse.getVirtualAccount() != null) {
				order.setVirtualAccountBank(paymentResponse.getVirtualAccount().getBankName());
				order.setVirtualAccountNumber(paymentResponse.getVirtualAccount().getAccountNumber());
				order.setVirtualAccountDueDate(paymentResponse.getVirtualAccount().getDueDate());
			}

			mapper.updateOrderAfterPayment(order);

			log.info("결제 승인 완료 - orderId: {}, status: {}", request.getOrderId(), paymentResponse.getStatus());

			log.info("Virtual Account Info: {}", paymentResponse.getVirtualAccount());

			return paymentResponse;

		} catch (Exception e) {

			try {
				if (order.getPaymentKey() != null) {
					tossPaymentService.cancelPayment(order.getPaymentKey(), "재고 부족으로 자동 취소");
				}
			} catch (Exception cancelEx) {
				log.error("자동 결제 취소 실패", cancelEx);
			}

			order.setOrderStatus("FAILED");
			mapper.updateOrderStatus(order);

			throw e;
		}
	}

	/**
	 * 가상계좌 입금 완료 처리 토스페이먼츠 Webhook에서 호출됨
	 */
	@Override
	public void completeVirtualAccountDeposit(String orderId) {

		log.info("가상계좌 입금 완료 처리 시작 - orderId: {}", orderId);

		// 1. 주문 조회
		Order order = mapper.selectOrderByOrderId(orderId);

		if (order == null) {
			log.error("주문을 찾을 수 없음 - orderId: {}", orderId);
			throw new ResourceNotFoundException("주문을 찾을 수 없습니다.");
		}

		// 2. 이미 입금 완료된 주문인지 확인 (중복 처리 방지)
		if ("PAID".equals(order.getOrderStatus())) {
			log.warn("이미 입금 완료된 주문 - orderId: {}", orderId);
			return; // 중복 처리 방지
		}

		// 3. 가상계좌 주문인지 확인
		if (!"가상계좌".equals(order.getPaymentMethod())) {
			log.error("가상계좌 주문이 아님 - orderId: {}, method: {}", orderId, order.getPaymentMethod());
			throw new BusinessException("가상계좌 주문이 아닙니다.");
		}

		// 4. 입금 대기 상태인지 확인
		if (!"WAITING_FOR_DEPOSIT".equals(order.getOrderStatus())) {
			log.error("입금 대기 상태가 아님 - orderId: {}, status: {}", orderId, order.getOrderStatus());
			throw new BusinessException("입금 대기 상태가 아닙니다.");
		}

		// 4. 재고 차감
		List<OrderItem> orderItems = mapper.selectOrderItems(orderId);
		deductStockForItems(orderItems, orderId);

		// 5. 주문 상태를 '결제 완료'로 변경
		order.setOrderStatus("PAID");
		order.setApprovedAt(LocalDateTime.now().toString());

		int result = mapper.updateOrderStatus(order);

		if (result != 1) {
			log.error("주문 상태 업데이트 실패 - orderId: {}", orderId);
			throw new BusinessException("주문 상태 업데이트에 실패했습니다.");
		}

		// 6. 입금 완료 이메일 발송
		try {
			sendDepositConfirmEmail(order); // 기존 private 메서드 활용
		} catch (Exception e) {
			log.error("입금 완료 이메일 발송 실패 (주문 처리는 완료) - orderId: {}", orderId, e);
		}

		log.info("가상계좌 입금 완료 처리 완료 - orderId: {}", orderId);

	}

	@Override
	public List<OrderListResponse> getOrderList(int memberNo) {
		log.info("회원별 주문 목록 조회 - memberNo: {}", memberNo);

		List<OrderListResponse> orderList = mapper.selectOrderListByMember(memberNo);

		log.info("조회된 주문 개수: {}", orderList.size());

		return orderList;
	}

	@Override
	public List<OrderListResponse> getOrderListByStatus(int memberNo, String orderStatus) {
		log.info("주문 상태별 목록 조회 - memberNo: {}, status: {}", memberNo, orderStatus);

		List<OrderListResponse> orderList = mapper.selectOrderListByStatus(memberNo, orderStatus);

		return orderList;
	}

	@Override
	public Order getOrderDetail(int orderNo, int memberNo) {
		log.info("주문 상세 조회 - orderNo: {}, memberNo: {}", orderNo, memberNo);

		Order orderDetail = mapper.selectOrderDetail(orderNo, memberNo);

		if (orderDetail == null) {
			throw new BusinessException("주문을 찾을 수 없습니다.");
		}

		return orderDetail;
	}

	@Override
	public void cancelOrder(CancelRequest request, int memberNo) {
		log.info("주문 취소 요청 - orderId: {}, memberNo: {}", request.getOrderId(), memberNo);

		// 1. 주문 조회
		Order order = mapper.selectOrderByOrderId(request.getOrderId());

		if (order == null) {
			throw new BusinessException("주문을 찾을 수 없습니다.");
		}

		// 2. 권한 확인
		if (order.getMemberNo() != memberNo) {
			throw new BusinessException("주문 취소 권한이 없습니다.");
		}

		// 3. 취소 가능 상태 확인
		String status = order.getOrderStatus();
		if (!status.equals("READY") && !status.equals("WAITING_FOR_DEPOSIT") && !status.equals("PAID")) {
			throw new BusinessException("취소 가능한 주문 상태가 아닙니다.");
		}

		// 4. 결제 취소 (토스페이먼츠 API 호출)
		if (status.equals("PAID")) {
			try {
				tossPaymentService.cancelPayment(order.getPaymentKey(), request.getCancelReason());
			} catch (Exception e) {
				log.error("토스페이먼츠 취소 실패", e);
				throw new BusinessException("결제 취소에 실패했습니다.");
			}
		}

		// 5. DB 업데이트
		int result = mapper.cancelOrder(request.getOrderId(), request.getCancelReason());

		if (result == 0) {
			throw new BusinessException("주문 취소에 실패했습니다.");
		}

		// WAITING_FOR_DEPOSIT은 재고 차감이 아직 안 됐으므로 원복 불필요
		if ("PAID".equals(status)) {
			List<OrderItem> orderItems = mapper.selectOrderItems(request.getOrderId());
			for (OrderItem item : orderItems) {
				if (item.getGoodsOptionNo() > 0) {
					int restoreResult = mapper.increaseStock(item.getGoodsOptionNo(), item.getQty());
					log.info("재고 원복 완료 - optionNo: {}, qty: {}, result: {}", item.getGoodsOptionNo(), item.getQty(),
							restoreResult);
				}
			}
		}

		log.info("주문 취소 완료 - orderId: {}", request.getOrderId());
	}

	@Override
	public void updateTrackingInfo(int orderNo, String trackingNumber, String deliveryCompany) {
		log.info("송장번호 등록 - orderNo: {}, tracking: {}", orderNo, trackingNumber);

		int result = mapper.updateTrackingInfo(orderNo, trackingNumber, deliveryCompany);

		if (result == 0) {
			throw new BusinessException("송장번호 등록에 실패했습니다.");
		}
	}

	@Override
	public void completeDelivery(int orderNo) {
		log.info("배송 완료 처리 - orderNo: {}", orderNo);

		int result = mapper.completeDelivery(orderNo);

		if (result == 0) {
			throw new BusinessException("배송 완료 처리에 실패했습니다.");
		}
	}

	/**
	 * 입금 완료 이메일 발송
	 */
	private void sendDepositConfirmEmail(Order order) {
		if (emailService != null) {
			emailService.sendDepositConfirmEmail(order.getEmail(), order.getOrdererName(), order.getOrderId(),
					order.getTotalAmount());
		}
	}

	/**
	 * 주문명 생성
	 */
	private String generateOrderName(List<OrderItem> items) {
		if (items.isEmpty()) {
			return "OPUS 상품";
		}

		String firstItemName = selectGoodsName(items.get(0).getGoodsNo());

		if (items.size() == 1) {
			return firstItemName;
		}

		return firstItemName + " 외 " + (items.size() - 1) + "건";
	}

	private String selectGoodsName(int goodsNo) {
		return mapper.selectGoodsName(goodsNo);
	}

	/**
	 * 주문 상품 목록 전체에 대해 낙관적 락 재고 차감 수행
	 *
	 * 하나라도 실패하면 BusinessException → @Transactional rollback → 이미 차감된 재고도 DB 트랜잭션
	 * 롤백으로 원상 복구됨
	 *
	 * @param orderItems 주문 상품 목록 (ORDER_ITEM 기준)
	 * @param orderId    로그용 주문 ID
	 */
	private void deductStockForItems(List<OrderItem> orderItems, String orderId) {

		for (OrderItem item : orderItems) {

			if (item.getGoodsOptionNo() <= 0) {
				// 옵션 없는 상품은 재고 차감 스킵
				log.info("옵션 없는 상품 재고 차감 스킵 - goodsNo: {}", item.getGoodsNo());
				continue;
			}

			deductStockWithRetry(item.getGoodsOptionNo(), item.getQty(), orderId);
		}
	}

	/**
	 * 낙관적 락 재고 차감 (재시도 포함)
	 *
	 * 동작 흐름: 1. DB에서 현재 VERSION 조회 2. decreaseStock(optionNo, qty, version) UPDATE
	 * 실행 - WHERE VERSION = #{version} AND STOCK >= #{qty} 조건 3. 0 rows 반환 시 → 충돌 또는
	 * 재고부족 구분 - STOCK < qty → 재고 부족 → 즉시 예외 (재시도 불필요) - STOCK >= qty → 버전 충돌 → 최신
	 * version으로 갱신 후 재시도 4. MAX_RETRY 초과 시 예외 발생
	 *
	 * @param goodsOptionNo 옵션 번호
	 * @param qty           차감 수량
	 * @param orderId       로그용 주문 ID
	 */
	private void deductStockWithRetry(int goodsOptionNo, int qty, String orderId) {

		int attempt = 0;

		while (attempt < MAX_RETRY) {
			attempt++;

			// 최신 version 조회 (매 시도마다 갱신)
			int currentVersion = mapper.selectOptionVersion(goodsOptionNo);

			// 낙관적 락 차감 시도
			int updated = mapper.decreaseStock(goodsOptionNo, qty, currentVersion);

			if (updated == 1) {
				log.info("재고 차감 성공 - orderId: {}, optionNo: {}, qty: {}, version: {} → {}", orderId, goodsOptionNo, qty,
						currentVersion, currentVersion + 1);
				return;
			}

			// 실패 원인 구분: 최신 재고 조회
			int currentStock = mapper.selectOptionStock(goodsOptionNo);

			if (currentStock < qty) {
				// 실제 재고 부족 → 재시도 의미 없음
				log.warn("재고 부족 - orderId: {}, optionNo: {}, 요청: {}개, 현재 재고: {}개", orderId, goodsOptionNo, qty,
						currentStock);
				throw new BusinessException("재고가 부족합니다. 현재 재고: " + currentStock + "개 (요청: " + qty + "개)");
			}

			// 버전 충돌 (다른 트랜잭션이 먼저 수정) → 재시도
			log.info("버전 충돌 감지, 재시도 {}/{} - orderId: {}, optionNo: {}, 현재 재고: {}개", attempt, MAX_RETRY, orderId,
					goodsOptionNo, currentStock);
		}

		// MAX_RETRY 초과 (극단적 동시 경합)
		log.error("재고 차감 최대 재시도 초과 - orderId: {}, optionNo: {}", orderId, goodsOptionNo);
		throw new BusinessException("주문 처리 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
	}

	/**
	 * [추가] 주문 생성 전 재고 사전 검증
	 *
	 * createOrder 시점에 재고가 0이면 주문 자체를 막음 단, 이 시점의 재고는 '참고용'이며 실제 확정은
	 * confirmPayment에서 낙관적 락으로 처리 (여러 사용자가 동시에 이 검증을 통과해도 confirmPayment에서 한 명만 성공)
	 *
	 * @param items 주문 상품 요청 목록
	 */
	private void validateStockBeforeOrder(List<OrderItem> items) {
		for (OrderItem item : items) {
			if (item.getGoodsOptionNo() <= 0)
				continue;

			int currentStock = mapper.selectOptionStock(item.getGoodsOptionNo());

			if (currentStock < item.getQty()) {
				log.warn("주문 생성 전 재고 부족 - optionNo: {}, 요청: {}, 현재: {}", item.getGoodsOptionNo(), item.getQty(),
						currentStock);
				throw new BusinessException("재고가 부족합니다. 현재 재고: " + currentStock + "개 (요청: " + item.getQty() + "개)");
			}
		}
	}

}
