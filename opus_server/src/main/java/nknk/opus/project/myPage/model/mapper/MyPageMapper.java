package nknk.opus.project.myPage.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import nknk.opus.project.myPage.model.dto.UnveilingHistoryResponse;
import nknk.opus.project.reviews.model.dto.Reviews;

@Mapper
public interface MyPageMapper {

	List<String> getSavedList(int memberNo);

	List<Reviews> getReviewList(int memberNo);
	
	// 경매 응찰 내역 조회 (같은 경매 중 내 최고 응찰가 1건 대표)
	List<UnveilingHistoryResponse> getUnveilingHistory(int memberNo);

	List<String> getLikeList(int memberNo);

}
