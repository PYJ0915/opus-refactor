package nknk.opus.project.admin.model.service;

import java.util.List;
import java.util.Map;

import nknk.opus.project.admin.model.dto.GoodsRegist;
import nknk.opus.project.reviews.model.dto.Report;
import nknk.opus.project.selections.model.dto.Goods;
import nknk.opus.project.unveiling.model.dto.Unveiling;
import nknk.opus.project.reviews.model.dto.Reviews;


public interface AdminService {

	List<Report> getReport();

	int confirmReview(int reportNo);

	int rejectReview(int reportNo);

	List<Reviews> getRestore();

	int restoreReview(int reviewNo);

	int registGoods(GoodsRegist dto) throws Exception;

	int updateGoods(int goodsNo, GoodsRegist dto) throws Exception;

	List<Goods> getGoodsListForAdmin();

	Map<String, Object> getGoodsDetailForAdmin(int goodsNo);

	int deleteGoods(int goodsNo);

	int restoreGoods(int goodsNo);

	int deleteGoodsImage(int goodsImgNo);

	int updateOrderStatus(int orderNo, String status);

	List<Map<String, Object>> getAllOrders(String status);

	int updateTracking(int orderNo, String deliveryCompany, String trackingNumber);

	List<Unveiling> getUnveilingListForAdmin(); // 관리자 경매 목록 조회

	int registUnveiling(Unveiling unveiling); // 관리자 경매 등록
	
}
