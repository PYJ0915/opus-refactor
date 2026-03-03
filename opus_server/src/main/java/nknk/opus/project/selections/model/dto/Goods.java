package nknk.opus.project.selections.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class Goods {

	// 굿즈 기본 필드 (DB와 동일)
	private int goodsNo;
	private String goodsName;
	private String goodsSort;
	private String goodsCategory;
	private String goodsInfo;
	private String goodsSeller;
	private int goodsPrice;
	private int deliveryCost;
	private String goodsRegDate;	
	private String goodsDelFl;
	
	// 굿즈 썸네일
	private String goodsThumbnail;
	
	// 굿즈 이미지 경로 및 변경명
	private String goodsImgPath;
	private String goodsImgRe;
	
}
