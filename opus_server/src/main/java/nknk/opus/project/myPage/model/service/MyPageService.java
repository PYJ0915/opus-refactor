package nknk.opus.project.myPage.model.service;

import java.util.List;

import nknk.opus.project.myPage.model.dto.UnveilingHistoryResponse;
import nknk.opus.project.reviews.model.dto.Reviews;

public interface MyPageService {

	List<String> getSavedList(int memberNo);

	List<Reviews> getReviewList(int memberNo);
	
	// 경매 응찰 내역
	List<UnveilingHistoryResponse> getUnveilingHistory(int memberNo);

	List<String> getLikeList(int memberNo);

}
