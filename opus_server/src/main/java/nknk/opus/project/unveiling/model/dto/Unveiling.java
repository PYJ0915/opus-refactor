package nknk.opus.project.unveiling.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Unveiling {

	private int unveilingNo;
	
	private String unveilingTitle;
	
	private String productionArtist;
	
	private String productionYear;
	
	private String productionMaterial;
	
	private String productionSize;
	
	private int startPrice;
	
	private int currentPrice;
	
	private int finalPrice;
	
	private int biddingCount;
	
	private String finishDate;
	
	private String productionDetail;
	
	private String artistDetail;
	
	private String unveilingStatus;
	
	private int memberNo;
	
	private int finalizedFl;
	
	private String paymentStatus;
	
	private String thumbUrl;
	
	private int alertSentFl; // 마감 임박 알림 발송 여부 (0: 미발송, 1: 발송완료)
	
}
