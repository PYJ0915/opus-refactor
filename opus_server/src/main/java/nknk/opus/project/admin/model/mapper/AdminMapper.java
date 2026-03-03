package nknk.opus.project.admin.model.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import nknk.opus.project.reviews.model.dto.Report;
import nknk.opus.project.selections.model.dto.Goods;
import nknk.opus.project.selections.model.dto.GoodsImg;
import nknk.opus.project.selections.model.dto.GoodsOption;
import nknk.opus.project.unveiling.model.dto.Unveiling;
import nknk.opus.project.reviews.model.dto.Reviews;


@Mapper
public interface AdminMapper {

	List<Report> getReport();

	int hideReview(int reportNo);

	int confirmReview(int reportNo);

	int rejectReview(int reportNo);

	List<Reviews> getRestore();

	int restoreReview(int reviewNo);


	// 상품 등록
	int insertGoods(Goods goods);

	void insertGoodsImg(GoodsImg goodsImg);

	void insertGoodsOption(GoodsOption option);

	int updateGoods(Goods goods);

  int deleteGoodsImgByOrder(@Param("goodsNo") int goodsNo, @Param("order") String order);

  int selectLastDetailImgOrder(int goodsNo);
	
  int deleteGoodsOptions(int goodsNo);

	
	// 상품 목록/상세 조회
	List<Goods> selectAllGoodsForAdmin();

	Goods selectGoodsDetailForAdmin(int goodsNo); 

  List<GoodsImg> selectGoodsImgsForAdmin(int goodsNo); 

  List<GoodsOption> selectGoodsOptionsForAdmin(int goodsNo); 


	// 상품 삭제 / 복구
	int softDeleteGoods(int goodsNo);

	int restoreGoods(int goodsNo);

	int deleteGoodsImgByNo(int goodsImgNo);

	// 주문/배송 관리
	List<Map<String, Object>> selectAllOrders(@Param("status") String status);

	// 주문 정보 조회 (알림용)
	Map<String, Object> selectOrderInfo(@Param("orderNo") int orderNo);

	int updateOrderStatus(@Param("orderNo") int orderNo, 
			@Param("status") String status);

	int updateTracking(@Param("orderNo") int orderNo, 
			@Param("deliveryCompany") String deliveryCompany, 
			@Param("trackingNumber") String trackingNumber);

	List<Unveiling> selectAllUnveilings();

	int insertUnveiling(Unveiling unveiling);

	void insertUnveilingImg(Unveiling unveiling);

	void updateGoodsOption(GoodsOption option);

	void updateGoodsOptionStock(GoodsOption existing);

}
