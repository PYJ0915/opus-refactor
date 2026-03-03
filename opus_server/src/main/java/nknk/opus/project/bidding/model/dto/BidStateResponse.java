package nknk.opus.project.bidding.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BidStateResponse {

	private int unveilingNo;
	
	private int startPrice;
    private int currentPrice;
    private int biddingCount;

    private String unveilingStatus; 
    private boolean finishedFl;   // FINISH_DATE <= SYSDATE 여부

    private boolean bidAllowedFl; // 지금 입찰 가능 여부
    private String reason;      // 불가능 사유(가능이면 null)

    private int tick;           // 호가 단위
    private int nextBidPrice;   // 다음 자동 입찰가
    
    private int topBidderMemberNo; // 종료 전, 현재 상태에서 최고가 입찰자    
    private int finalizedFl;
    private int winnerMemberNo;
    private int finalPrice;
    private String paymentStatus;
}
