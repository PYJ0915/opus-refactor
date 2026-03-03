package nknk.opus.project.bidding.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class BidResponse {

	private int unveilingNo;
	private int currentPrice;
	private int biddingCount;
	private String unveilingStatus;
	
}
