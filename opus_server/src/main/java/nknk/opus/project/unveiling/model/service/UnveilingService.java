package nknk.opus.project.unveiling.model.service;

import java.util.List;
import java.util.Map;

import nknk.opus.project.bidding.model.dto.BidStateResponse;
import nknk.opus.project.bidding.model.dto.RecentBidResponse;
import nknk.opus.project.unveiling.model.dto.Unveiling;

public interface UnveilingService {
	
	Unveiling getDetail(int unveilingNo);
	
	List<RecentBidResponse> getRecentBiddings(int unveilingNo, int limit);
	
	BidStateResponse getBidState(int unveilingNo);
	
	Map<String, Object> finalizeAuction(int unveilingNo);
	
	Map<String, Object> mockPay(int unveilingNo, int memberNo);

	List<Unveiling> getList();
	
	void sendDeadlineAlertEmails(int unveilingNo, String unveilingTitle, String productionArtist, String finishDate);


}
