package nknk.opus.project.selections.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class GoodsOption {

	private int goodsOptionNo;
	private int goodsNo;
	private String goodsSize;
	private String goodsColor;
	private int stock;
	private int optionPrice;
	
}
