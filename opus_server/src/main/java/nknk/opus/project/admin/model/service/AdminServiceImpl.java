package nknk.opus.project.admin.model.service;

import java.io.File;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.admin.model.dto.GoodsRegist;
import nknk.opus.project.admin.model.mapper.AdminMapper;
import nknk.opus.project.common.config.FileConfig;
import nknk.opus.project.common.exception.BusinessException;
import nknk.opus.project.notification.model.service.NotificationService;
import nknk.opus.project.order.model.dto.OrderItem;
import nknk.opus.project.order.model.mapper.OrderMapper;
import nknk.opus.project.reviews.model.dto.Report;
import nknk.opus.project.selections.model.dto.Goods;
import nknk.opus.project.selections.model.dto.GoodsImg;
import nknk.opus.project.selections.model.dto.GoodsOption;
import nknk.opus.project.unveiling.model.dto.Unveiling;
import nknk.opus.project.reviews.model.dto.Reviews;

@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class AdminServiceImpl implements AdminService {

	@Autowired
	private AdminMapper mapper;

	@Autowired
	private FileConfig fileConfig;

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private OrderMapper orderMapper;
	
	//  낙관적 락 재시도 횟수
	private static final int MAX_RETRY = 3;

	@Override
	public List<Report> getReport() {
		return mapper.getReport();
	}

	@Override
	public int confirmReview(int reportNo) {
		int hideReview = mapper.hideReview(reportNo);
		int confirmResult = mapper.confirmReview(reportNo);

		return hideReview * confirmResult;
	}

	@Override
	public int rejectReview(int reportNo) {
		int rejectReview = mapper.rejectReview(reportNo);

		return rejectReview;
	}

	@Override
	public List<Reviews> getRestore() {
		return mapper.getRestore();
	}

	@Override
	public int restoreReview(int reviewNo) {
		return mapper.restoreReview(reviewNo);
	}

	@Override
	public int registGoods(GoodsRegist dto) throws Exception {

		String uploadPath = fileConfig.getGoodsUploadPath();

		// GOODS 먼저 INSERT (번호 생성용)
		Goods goods = Goods.builder().goodsName(dto.getGoodsName()).goodsSort(dto.getGoodsSort())
				.goodsCategory(dto.getGoodsCategory()).goodsPrice(dto.getGoodsPrice())
				.deliveryCost(dto.getDeliveryCost()).goodsSeller(dto.getGoodsSeller()).goodsInfo(dto.getGoodsInfo())
				.build();

		int result = mapper.insertGoods(goods);

		int goodsNo = goods.getGoodsNo();
		String category = dto.getGoodsCategory();

		File dir = new File(uploadPath);
		if (!dir.exists())
			dir.mkdirs();

		// 썸네일 저장 (order = 0)
		MultipartFile thumbnail = dto.getThumbnail();

		if (thumbnail != null && !thumbnail.isEmpty()) {

			String ext = thumbnail.getOriginalFilename().substring(thumbnail.getOriginalFilename().lastIndexOf("."));

			String fileName = category + "_" + goodsNo + "_0" + ext;

			thumbnail.transferTo(new File(uploadPath + fileName));

			GoodsImg thumbImg = GoodsImg.builder().goodsNo(goodsNo).goodsImgPath("/images/goods/").goodsImgRe(fileName)
					.goodsImgOrder("0").build();

			mapper.insertGoodsImg(thumbImg);
		}

		// 상세 이미지 (1부터 시작)
		if (dto.getDetailImgs() != null) {

			int order = 1;

			for (MultipartFile img : dto.getDetailImgs()) {

				if (!img.isEmpty()) {

					String ext = img.getOriginalFilename().substring(img.getOriginalFilename().lastIndexOf("."));

					String fileName = category + "_" + goodsNo + "_" + order + ext;

					img.transferTo(new File(uploadPath + fileName));

					GoodsImg goodsImg = GoodsImg.builder().goodsNo(goodsNo).goodsImgPath("/images/goods/")
							.goodsImgRe(fileName).goodsImgOrder(String.valueOf(order)).build();

					mapper.insertGoodsImg(goodsImg);

					order++;
				}
			}
		}

		boolean hasRealOption = false;
		int defaultStock = 0;

		if (dto.getOptionsJson() != null && !dto.getOptionsJson().isEmpty()) {

			ObjectMapper om = new ObjectMapper();
			GoodsOption[] options = om.readValue(dto.getOptionsJson(), GoodsOption[].class);

			for (GoodsOption option : options) {

				// 기본 재고 저장 (옵션 없는 경우 대비)
				defaultStock = option.getStock();

				// 실제 옵션인지 체크 (사이즈 or 컬러 값이 있을 때)
				if ((option.getGoodsSize() != null && !option.getGoodsSize().isBlank())
						|| (option.getGoodsColor() != null && !option.getGoodsColor().isBlank())) {

					hasRealOption = true;

					option.setGoodsNo(goodsNo);
					mapper.insertGoodsOption(option);
				}
			}
		}

		// 옵션이 없을 경우만 NULL NULL + 입력한 재고값
		if (!hasRealOption) {

			GoodsOption nullOption = GoodsOption.builder().goodsNo(goodsNo).goodsSize(null).goodsColor(null)
					.stock(defaultStock) // 프론트에서 입력한 재고 사용
					.build();

			mapper.insertGoodsOption(nullOption);
		}

		return result;
	}

	@Override
	public int updateGoods(int goodsNo, GoodsRegist dto) throws Exception {

		String uploadPath = fileConfig.getGoodsUploadPath();

		// 기본 정보 수정
		Goods goods = Goods.builder().goodsNo(goodsNo).goodsName(dto.getGoodsName()).goodsSort(dto.getGoodsSort())
				.goodsCategory(dto.getGoodsCategory()).goodsPrice(dto.getGoodsPrice())
				.deliveryCost(dto.getDeliveryCost()).goodsSeller(dto.getGoodsSeller()).goodsInfo(dto.getGoodsInfo())
				.build();

		int result = mapper.updateGoods(goods);
		String category = dto.getGoodsCategory();

		File dir = new File(uploadPath);
		if (!dir.exists())
			dir.mkdirs();

		// 썸네일 변경 (새 파일이 있을 때만)
		MultipartFile thumbnail = dto.getThumbnail();
		if (thumbnail != null && !thumbnail.isEmpty()) {
			String ext = thumbnail.getOriginalFilename().substring(thumbnail.getOriginalFilename().lastIndexOf("."));
			String fileName = category + "_" + goodsNo + "_0" + ext;
			thumbnail.transferTo(new File(uploadPath + fileName));

			// 기존 썸네일 삭제 후 재삽입
			mapper.deleteGoodsImgByOrder(goodsNo, "0");
			GoodsImg thumbImg = GoodsImg.builder().goodsNo(goodsNo).goodsImgPath("/images/goods/").goodsImgRe(fileName)
					.goodsImgOrder("0").build();
			mapper.insertGoodsImg(thumbImg);
		}

		// 상세 이미지 추가 (기존 이미지 유지 + 새 이미지 이어서 추가)
		if (dto.getDetailImgs() != null) {
			int lastOrder = mapper.selectLastDetailImgOrder(goodsNo);

			for (MultipartFile img : dto.getDetailImgs()) {
				if (!img.isEmpty()) {
					lastOrder++;
					String ext = img.getOriginalFilename().substring(img.getOriginalFilename().lastIndexOf("."));
					String fileName = category + "_" + goodsNo + "_" + lastOrder + ext;
					img.transferTo(new File(uploadPath + fileName));

					GoodsImg goodsImg = GoodsImg.builder().goodsNo(goodsNo).goodsImgPath("/images/goods/")
							.goodsImgRe(fileName).goodsImgOrder(String.valueOf(lastOrder)).build();
					mapper.insertGoodsImg(goodsImg);
				}
			}
		}

		// 옵션 수정
		if (dto.getOptionsJson() != null && !dto.getOptionsJson().isEmpty()) {

		    ObjectMapper om = new ObjectMapper();
		    GoodsOption[] options = om.readValue(dto.getOptionsJson(), GoodsOption[].class);

		    List<GoodsOption> existingOptions = mapper.selectGoodsOptionsForAdmin(goodsNo);

		    Map<String, GoodsOption> existingMap = new HashMap<>();

		    for (GoodsOption exist : existingOptions) {
		        String key = buildOptionKey(exist.getGoodsSize(), exist.getGoodsColor());
		        existingMap.put(key, exist);
		    }

		    Set<String> submittedKeys = new HashSet<>();

		    boolean hasRealOption = false;
		    Integer nullStock = null;

		    for (GoodsOption option : options) {

		        boolean hasSize = option.getGoodsSize() != null && !option.getGoodsSize().isBlank();
		        boolean hasColor = option.getGoodsColor() != null && !option.getGoodsColor().isBlank();

		        // NULL NULL 옵션
		        if (!hasSize && !hasColor) {
		            nullStock = option.getStock();
		            submittedKeys.add("NULL_NULL");
		            continue;
		        }

		        hasRealOption = true;

		        option.setGoodsNo(goodsNo);

		        String key = buildOptionKey(option.getGoodsSize(), option.getGoodsColor());
		        submittedKeys.add(key);

		        if (existingMap.containsKey(key)) {
		            GoodsOption exist = existingMap.get(key);
		            option.setGoodsOptionNo(exist.getGoodsOptionNo());
		            mapper.updateGoodsOption(option);
		        } else {
		            mapper.insertGoodsOption(option);
		        }
		    }

		    // 기존 옵션 중 제출되지 않은 실옵션은 stock 0 처리
		    for (GoodsOption exist : existingOptions) {

		        String key = buildOptionKey(exist.getGoodsSize(), exist.getGoodsColor());

		        boolean isNullOption = key.equals("NULL_NULL");

		        if (!submittedKeys.contains(key) && !isNullOption) {
		            exist.setStock(0);
		            mapper.updateGoodsOptionStock(exist);
		        }
		    }

		    // NULL NULL 옵션 처리
		    if (!hasRealOption) {

		        GoodsOption existingNull = existingMap.get("NULL_NULL");

		        if (existingNull != null) {
		            existingNull.setStock(nullStock != null ? nullStock : 0);
		            mapper.updateGoodsOptionStock(existingNull);
		        } else {
		            GoodsOption newNull = GoodsOption.builder()
		                    .goodsNo(goodsNo)
		                    .goodsSize(null)
		                    .goodsColor(null)
		                    .stock(nullStock != null ? nullStock : 0)
		                    .build();
		            mapper.insertGoodsOption(newNull);
		        }
		    }
		}

		return result;
	}

	// 관리자용 전체 상품 조회
	@Override
	public List<Goods> getGoodsListForAdmin() {
		List<Goods> goodsList = mapper.selectAllGoodsForAdmin();

		for (Goods goods : goodsList) {
			goods.setGoodsThumbnail(goods.getGoodsImgPath() + goods.getGoodsImgRe());
		}

		return goodsList;
	}

	// 관리자용 상품 상세 조회 (goodsInfo + 이미지 + 옵션)
	@Override
	public Map<String, Object> getGoodsDetailForAdmin(int goodsNo) {
		Goods goods = mapper.selectGoodsDetailForAdmin(goodsNo);
		List<GoodsImg> images = mapper.selectGoodsImgsForAdmin(goodsNo);
		List<GoodsOption> options = mapper.selectGoodsOptionsForAdmin(goodsNo);

		Map<String, Object> result = new java.util.HashMap<>();
		result.put("goodsInfo", goods != null ? goods.getGoodsInfo() : "");
		result.put("images", images);
		result.put("options", options);
		return result;
	}

	// 상품 소프트 삭제
	@Override
	public int deleteGoods(int goodsNo) {
		return mapper.softDeleteGoods(goodsNo);
	}

	// 삭제된 상품 복구
	@Override
	public int restoreGoods(int goodsNo) {
		return mapper.restoreGoods(goodsNo);
	}

	// 상세 이미지 단건 삭제
	@Override
	public int deleteGoodsImage(int goodsImgNo) {
		return mapper.deleteGoodsImgByNo(goodsImgNo);
	}
	
	@Override
	public List<Map<String, Object>> getAllOrders(String status) {
		return mapper.selectAllOrders(status);
	}

	@Override
	public int updateOrderStatus(int orderNo, String status) {

	  // 주문 정보 조회
		Map<String, Object> orderInfo = mapper.selectOrderInfo(orderNo);
		
		if (orderInfo == null) {
			log.error("주문 정보를 찾을 수 없음 - orderNo: {}", orderNo);
			throw new BusinessException("주문 정보를 찾을 수 없습니다.");
		}
		
		String currentStatus = (String) orderInfo.get("ORDER_STATUS");
		String orderId = (String) orderInfo.get("ORDER_ID");
		int memberNo = ((Number) orderInfo.get("MEMBER_NO")).intValue();
		
		// WAITING_FOR_DEPOSIT → PAID 변경 시 재고 차감
		if ("WAITING_FOR_DEPOSIT".equals(currentStatus) && "PAID".equals(status)) {
			
			log.info("입금 대기 → 결제 완료 변경 감지, 재고 차감 시작 - orderNo: {}, orderId: {}", orderNo, orderId);
			
			try {
				// 주문 상품 목록 조회
				List<OrderItem> orderItems = orderMapper.selectOrderItems(orderId);
				
				// 재고 차감 (낙관적 락 + 재시도)
				deductStockForItems(orderItems, orderId);
				
				log.info("재고 차감 완료 - orderNo: {}, orderId: {}", orderNo, orderId);
				
			} catch (Exception e) {
				log.error("재고 차감 실패 - orderNo: {}, orderId: {}", orderNo, orderId, e);
				throw new BusinessException("재고 차감에 실패했습니다: " + e.getMessage());
			}
		}
		
		// 주문 상태 업데이트
		int result = mapper.updateOrderStatus(orderNo, status);
		
		if (result > 0) {
			// 상태별 알림 생성
			String notiTitle = "";
			String notiContent = "";
			
			switch (status) {
				case "PAID":
					notiTitle = "결제가 완료되었습니다.";
					notiContent = "주문번호: " + orderId;
					break;
				case "PREPARING":
					notiTitle = "상품 준비 중입니다.";
					notiContent = "주문번호: " + orderId;
					break;
				case "SHIPPING":
					notiTitle = "배송이 시작되었습니다.";
					notiContent = "주문번호: " + orderId;
					break;
				case "DELIVERED":
					notiTitle = "배송이 완료되었습니다.";
					notiContent = "주문번호: " + orderId;
					break;
				case "CANCELED":
					notiTitle = "주문이 취소되었습니다.";
					notiContent = "주문번호: " + orderId;
					break;
				default:
					return result; // 알림 없이 리턴
			}
			
			// 알림 생성
			try {
				notificationService.createNotification(
					memberNo,
					"ORDER",
					notiTitle,
					notiContent,
					"/mypage/orders"
				);
				log.info("주문 상태 변경 알림 생성 - orderNo: {}, status: {}", orderNo, status);
			} catch (Exception e) {
				log.error("주문 상태 변경 알림 생성 실패", e);
			}
		}
		
		return result;
	}

	@Override
	public int updateTracking(int orderNo, String deliveryCompany, String trackingNumber) {
		
		int result = mapper.updateTracking(orderNo, deliveryCompany, trackingNumber);
		
	    if (result > 0) {
			// 자동으로 SHIPPING 상태로 변경 + 알림 생성
			mapper.updateOrderStatus(orderNo, "SHIPPING");
			
			// 주문 정보 조회
			Map<String, Object> orderInfo = mapper.selectOrderInfo(orderNo);
			
			if (orderInfo != null) {
				int memberNo = ((Number) orderInfo.get("MEMBER_NO")).intValue();
				String orderId = (String) orderInfo.get("ORDER_ID");
				
				try {
					notificationService.createNotification(
						memberNo,
						"ORDER",
						"배송이 시작되었습니다.",
						"주문번호: " + orderId + "\n택배사: " + deliveryCompany,
						"/mypage/orders"
					);
					log.info("배송 시작 알림 생성 - orderNo: {}", orderNo);
				} catch (Exception e) {
					log.error("배송 시작 알림 생성 실패", e);
				}
			}
		}
		
		return result;
	}

	@Override
	public List<Unveiling> getUnveilingListForAdmin() {

		return mapper.selectAllUnveilings();
	}

	@Override
	public int registUnveiling(Unveiling unveiling) {

		// 1) UNVEILING INSERT (selectKey로 unveilingNo 자동 세팅됨)
		int result = mapper.insertUnveiling(unveiling);

		// 2) 이미지 URL이 있으면 UNVEILING_IMG INSERT
		if (unveiling.getThumbUrl() != null && !unveiling.getThumbUrl().isBlank()) {
			mapper.insertUnveilingImg(unveiling);
		}

		return result;
	}

	/**
	 * 주문 상품 목록 전체에 대해 낙관적 락 재고 차감 수행
	 * OrderServiceImpl의 로직과 동일
	 */
	private void deductStockForItems(List<OrderItem> orderItems, String orderId) {
		
		for (OrderItem item : orderItems) {
			
			if (item.getGoodsOptionNo() <= 0) {
				log.info("옵션 없는 상품 재고 차감 스킵 - goodsNo: {}", item.getGoodsNo());
				continue;
			}
			
			deductStockWithRetry(item.getGoodsOptionNo(), item.getQty(), orderId);
		}
	}
	
	/**
	 * 낙관적 락 재고 차감 (재시도 포함)
	 * OrderServiceImpl의 로직과 동일
	 */
	private void deductStockWithRetry(int goodsOptionNo, int qty, String orderId) {
		
		int attempt = 0;
		
		while (attempt < MAX_RETRY) {
			attempt++;
			
			// 최신 version 조회
			int currentVersion = orderMapper.selectOptionVersion(goodsOptionNo);
			
			// 낙관적 락 차감 시도
			int updated = orderMapper.decreaseStock(goodsOptionNo, qty, currentVersion);
			
			if (updated == 1) {
				log.info("[관리자 재고 차감] 성공 - orderId: {}, optionNo: {}, qty: {}, version: {} → {}", 
						orderId, goodsOptionNo, qty, currentVersion, currentVersion + 1);
				return;
			}
			
			// 실패 원인 구분
			int currentStock = orderMapper.selectOptionStock(goodsOptionNo);
			
			if (currentStock < qty) {
				// 재고 부족
				log.warn("[관리자 재고 차감] 재고 부족 - orderId: {}, optionNo: {}, 요청: {}개, 현재: {}개", 
						orderId, goodsOptionNo, qty, currentStock);
				throw new BusinessException("재고가 부족합니다. 현재 재고: " + currentStock + "개 (요청: " + qty + "개)");
			}
			
			// 버전 충돌 → 재시도
			log.info("[관리자 재고 차감] 버전 충돌, 재시도 {}/{} - orderId: {}, optionNo: {}, 현재 재고: {}개", 
					attempt, MAX_RETRY, orderId, goodsOptionNo, currentStock);
		}
		
		// 최대 재시도 초과
		log.error("[관리자 재고 차감] 최대 재시도 초과 - orderId: {}, optionNo: {}", orderId, goodsOptionNo);
		throw new BusinessException("재고 차감 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
	}

	private String buildOptionKey(String size, String color) {

	    String s = (size == null || size.isBlank()) ? "NULL" : size.trim();
	    String c = (color == null || color.isBlank()) ? "NULL" : color.trim();

	    return s + "_" + c;
	}
	
}
