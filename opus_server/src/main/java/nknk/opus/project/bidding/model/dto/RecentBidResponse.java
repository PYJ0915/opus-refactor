package nknk.opus.project.bidding.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecentBidResponse {
	
	private int bidPrice;
	private String bidDate;
	private String bidderLabel; // 낙찰자 정보 익명으로 전달할 용도

}
