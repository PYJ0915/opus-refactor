package nknk.opus.project.order.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import nknk.opus.project.order.model.dto.Order;
import nknk.opus.project.order.model.dto.OrderItem;
import nknk.opus.project.order.model.dto.OrderListResponse;

@Mapper
public interface OrderMapper {

	/**
	 * 주문 생성
	 */
	int createOrder(Order order);

	/**
	 * 주문 상품 추가
	 */
	int insertOrderItem(OrderItem orderItem);

	/**
	 * 주문 조회 (ORDER_ID로) - 토스 결제 시 사용
	 */
	Order selectOrderByOrderId(String orderId);

	/**
	 * 주문 조회 (ORDER_NO로)
	 */
	Order selectOrderByOrderNo(int orderNo);

	/**
	 * 결제 승인 후 주문 업데이트
	 */
	int updateOrderAfterPayment(Order order);

	/**
	 * 주문 상태 업데이트
	 */
	int updateOrderStatus(Order order);

	/**
	 * 주문 상품 목록 조회 (ORDER_ID 기준)
	 */
	List<OrderItem> selectOrderItems(String orderId);

	/**
	 * [수정] 낙관적 락 기반 재고 차감
	 *
	 * WHERE 절에 VERSION 조건 추가 → 동시 주문 시 한 건만 성공
	 * 반환값이 0이면 충돌(다른 트랜잭션이 먼저 수정) 또는 재고 부족
	 *
	 * @param goodsOptionNo 옵션 번호
	 * @param qty           차감 수량
	 * @param version       프론트에서 받은 현재 버전
	 * @return 업데이트된 행 수 (1=성공, 0=충돌/재고부족)
	 */
	int decreaseStock(@Param("goodsOptionNo") int goodsOptionNo,
	                  @Param("qty") int qty,
	                  @Param("version") int version);

	/**
	 * [추가] 재고 원복 (주문 취소 / 결제 실패 보상 처리)
	 * version 체크 없이 단순 증가 (보상 트랜잭션)
	 */
	int increaseStock(@Param("goodsOptionNo") int goodsOptionNo,
	                  @Param("qty") int qty);

	/**
	 * [추가] 단건 재고/버전 조회 (충돌 시 원인 구분용)
	 * 재고부족인지 버전충돌인지 구분하여 재시도 여부 결정
	 */
	int selectOptionStock(@Param("goodsOptionNo") int goodsOptionNo);

	/**
	 * [추가] 단건 버전 조회 (재시도 시 최신 버전 확인용)
	 */
	int selectOptionVersion(@Param("goodsOptionNo") int goodsOptionNo);

	/**
	 * 상품명 조회
	 */
	String selectGoodsName(int goodsNo);

	/**
	 * 회원별 주문 목록 조회
	 */
	List<OrderListResponse> selectOrderListByMember(@Param("memberNo") int memberNo);

	/**
	 * 주문 상태별 목록 조회
	 */
	List<OrderListResponse> selectOrderListByStatus(@Param("memberNo") int memberNo,
			@Param("orderStatus") String orderStatus);

	/**
	 * 주문 상세 조회
	 */
	Order selectOrderDetail(@Param("orderNo") int orderNo, @Param("memberNo") int memberNo);

	/**
	 * 주문 취소 처리
	 */
	int cancelOrder(@Param("orderId") String orderId, @Param("cancelReason") String cancelReason);

	/**
	 * 송장번호 등록
	 */
	int updateTrackingInfo(@Param("orderNo") int orderNo, @Param("trackingNumber") String trackingNumber,
			@Param("deliveryCompany") String deliveryCompany);

	/**
	 * 배송 완료 처리
	 */
	int completeDelivery(@Param("orderNo") int orderNo);
}
