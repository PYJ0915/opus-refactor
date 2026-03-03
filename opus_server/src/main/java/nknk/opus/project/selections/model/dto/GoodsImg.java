package nknk.opus.project.selections.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class GoodsImg {
	
	private int goodsImgNo;
	private int goodsNo;
	private String goodsImgPath;
	private String goodsImgOg;
	private String goodsImgRe;
	private String goodsImgOrder;
	private String goodsImgFullpath;
	
}
