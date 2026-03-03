package nknk.opus.project.bidding.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import nknk.opus.project.bidding.model.dto.Bidding;
import nknk.opus.project.bidding.model.dto.RecentBidResponse;

@Mapper
public interface BiddingMapper {
	
	int insertBidding(Bidding bidding);
	
	List<RecentBidResponse> selectRecentBiddings(@Param("unveilingNo") int unveilingNo,
												 @Param("limit") int limit);
	
	int selectMaxBidPrice(int unveilingNo);
	
	Bidding selectTopBid(int unveilingNo);
	
	List<Integer> selectDistinctBidderMemberNos(int unveilingNo); // 해당 경매 응찰자 memberNo 목록 조회 (중복 제거) — 마감 임박 알림 발송용

}
