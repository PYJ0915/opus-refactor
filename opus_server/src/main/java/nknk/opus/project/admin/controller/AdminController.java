package nknk.opus.project.admin.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.admin.model.dto.GoodsRegist;
import nknk.opus.project.admin.model.service.AdminService;
import nknk.opus.project.common.exception.ApiExceptionHandler;
import nknk.opus.project.reviews.model.dto.Report;
import nknk.opus.project.reviews.model.dto.Reviews;
import nknk.opus.project.selections.model.dto.Goods;
import nknk.opus.project.unveiling.model.dto.Unveiling;

@Slf4j
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ApiExceptionHandler apiExceptionHandler;

	@Autowired
	private AdminService service;

    AdminController(ApiExceptionHandler apiExceptionHandler) {
        this.apiExceptionHandler = apiExceptionHandler;
    }
	
	@GetMapping("/report")
	public ResponseEntity<List<Report>> getReport() {
		try {
			List<Report> result = service.getReport();
			return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@PostMapping("/confirmReview")
	public ResponseEntity<String> confirmReview(@RequestParam("reportNo") int reportNo) {
		try {
			int result = service.confirmReview(reportNo);
			if (result == 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("후기 삭제에 실패하였습니다.");
			return ResponseEntity.status(HttpStatus.OK).body("신고된 후기가 삭제되었습니다. (신고 승인)");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	@PostMapping("/rejectReview")
	public ResponseEntity<String> rejectReview(@RequestParam("reportNo") int reportNo) {
		try {
			int result = service.rejectReview(reportNo);
			if (result == 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("신고된 후기를 목록에서의 삭제에 실패하였습니다.");
			return ResponseEntity.status(HttpStatus.OK).body("신고된 후기를 목록에서 삭제하였습니다. (신고 거절)");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	@GetMapping("/restore")
	public ResponseEntity<List<Reviews>> getRestore() {
		try {
			List<Reviews> result = service.getRestore();
			return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	@PostMapping("/restoreReview")
	public ResponseEntity<String> restoreReview(@RequestParam("reviewNo") int reviewNo) {
		try {
			int result = service.restoreReview(reviewNo);
			if (result == 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("삭제된 후기 복구에 실패하였습니다.");
			return ResponseEntity.status(HttpStatus.OK).body("삭제된 후기를 복구하였습니다");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	/** 상품 등록 */
	@PostMapping("/goods")
	public ResponseEntity<String> registGoods(@ModelAttribute GoodsRegist dto) {
		try {
			log.info("상품 등록 요청: {}", dto.getGoodsName());
			int result = service.registGoods(dto);
			if (result == 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("상품 등록에 실패했습니다.");
			return ResponseEntity.ok("상품이 등록되었습니다.");
		} catch (Exception e) {
			log.error("상품 등록 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/** 상품 수정 */
	@PutMapping("/goods/{goodsNo}")
	public ResponseEntity<String> updateGoods(@PathVariable("goodsNo") int goodsNo, @ModelAttribute GoodsRegist dto) {
		try {
			log.info("상품 수정 요청: goodsNo={}, name={}", goodsNo, dto.getGoodsName());
			int result = service.updateGoods(goodsNo, dto);
			if (result == 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("상품 수정에 실패했습니다.");
			return ResponseEntity.ok("상품이 수정되었습니다.");
		} catch (Exception e) {
			log.error("상품 수정 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/** 관리자용 상품 목록 조회 */
	@GetMapping("/goods")
	public ResponseEntity<List<Goods>> getGoodsList() {
		try {
			List<Goods> list = service.getGoodsListForAdmin();
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			log.error("상품 목록 조회 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	/**
	 * 관리자용 상품 상세 조회 (goodsInfo + 이미지 + 옵션)
	 * 수정 폼 진입 시 기존 데이터 프리필용
	 */
	@GetMapping("/goods/{goodsNo}/detail")
	public ResponseEntity<Map<String, Object>> getGoodsDetail(@PathVariable("goodsNo") int goodsNo) {
		try {
			Map<String, Object> detail = service.getGoodsDetailForAdmin(goodsNo);
			return ResponseEntity.ok(detail);
		} catch (Exception e) {
			log.error("상품 상세 조회 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	/** 상품 삭제 (소프트 딜리트) */
	@DeleteMapping("/goods/{goodsNo}")
	public ResponseEntity<String> deleteGoods(@PathVariable("goodsNo") int goodsNo) {
		try {
			int result = service.deleteGoods(goodsNo);
			if (result == 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("삭제 실패");
			return ResponseEntity.ok("삭제 완료");
		} catch (Exception e) {
			log.error("상품 삭제 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
		}
	}

	/**
	 * 삭제된 상품 복구
	 */
	@PatchMapping("/goods/{goodsNo}/restore")
	public ResponseEntity<String> restoreGoods(@PathVariable("goodsNo") int goodsNo) {
		try {
			int result = service.restoreGoods(goodsNo);
			if (result == 0) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("복구 실패");
			}
			return ResponseEntity.ok("상품이 복구되었습니다.");
		} catch (Exception e) {
			log.error("상품 복구 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
		}
	}

	/**
	 * 상세 이미지 단건 삭제 (수정 폼에서 X 버튼 클릭 시)
	 */
	@DeleteMapping("/goods/image/{goodsImgNo}")
	public ResponseEntity<String> deleteGoodsImage(@PathVariable("goodsImgNo") int goodsImgNo) {
		try {
			int result = service.deleteGoodsImage(goodsImgNo);
			if (result == 0) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("이미지 삭제 실패");
			}
			return ResponseEntity.ok("이미지가 삭제되었습니다.");
		} catch (Exception e) {
			log.error("이미지 삭제 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
		}
	}

	/** 전체 주문 목록 조회 */
	@GetMapping("/orders")
	public ResponseEntity<List<Map<String, Object>>> getAllOrders(@RequestParam(value = "status", required = false) String status) {
		try {
			log.info("주문 목록 조회 - status: {}", status);
			List<Map<String, Object>> orders = service.getAllOrders(status);
			log.info("조회된 주문 개수: {}", orders.size());
			return ResponseEntity.ok(orders);
		} catch (Exception e) {
			log.error("주문 목록 조회 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	/** 주문 상태 변경 */
	@PatchMapping("/orders/{orderNo}/status")
	public ResponseEntity<String> updateOrderStatus(@PathVariable("orderNo") int orderNo, @RequestBody Map<String, String> body) {
		try {
			String status = body.get("status");
			log.info("주문 상태 변경 - orderNo: {}, status: {}", orderNo, status);
			int result = service.updateOrderStatus(orderNo, status);
			if (result == 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("상태 변경 실패");
			return ResponseEntity.ok("상태가 변경되었습니다.");
		} catch (Exception e) {
			log.error("상태 변경 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
		}
	}

	/** 송장번호 입력 */
	@PatchMapping("/orders/{orderNo}/tracking")
	public ResponseEntity<String> updateTracking(@PathVariable("orderNo") int orderNo, @RequestBody Map<String, String> body) {
		try {
			String deliveryCompany = body.get("deliveryCompany");
			String trackingNumber = body.get("trackingNumber");
			log.info("송장 등록 - orderNo: {}, company: {}, tracking: {}", orderNo, deliveryCompany, trackingNumber);
			int result = service.updateTracking(orderNo, deliveryCompany, trackingNumber);
			if (result == 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("송장 입력 실패");
			return ResponseEntity.ok("송장번호가 등록되었습니다.");
		} catch (Exception e) {
			log.error("송장 등록 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류");
		}
	}

	/** 관리자용 경매 목록 조회 */
	@GetMapping("/unveilings")
	public ResponseEntity<List<Unveiling>> getUnveilingList() {
		try {
			List<Unveiling> list = service.getUnveilingListForAdmin();
			return ResponseEntity.ok(list);
		} catch (Exception e) {
			log.error("경매 목록 조회 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	/** 경매 등록 */
	@PostMapping("/unveilings")
	public ResponseEntity<String> registUnveiling(@RequestBody Unveiling unveiling) {
		
		try {
			int result = service.registUnveiling(unveiling);
			if (result == 0) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("경매 등록에 실패했습니다.");
			return ResponseEntity.ok("경매가 등록되었습니다.");
		} catch (Exception e) {
			log.error("경매 등록 오류", e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다: " + e.getMessage());
		}
	}

}