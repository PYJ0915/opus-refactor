package nknk.opus.project.bidding.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Bidding {

	private int bidNo;
	private int bidPrice;
	private String bidDate;
	
	private int unveilingNo;
	private int memberNo;
	
}
