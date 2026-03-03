package nknk.opus.project.admin.model.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class GoodsRegist {

	// 기본 상품 정보
    private String goodsName;
    private String goodsSort;       // "exhibition" | "musical"
    private String goodsCategory;   // "poster" | "accessories" | "clothes" 등
    private int goodsPrice;
    private int deliveryCost;
    private String goodsSeller;
    private String goodsInfo;       // 상세 설명

    // 파일
    private MultipartFile thumbnail;        // 썸네일 1장
    private List<MultipartFile> detailImgs; // 상세 이미지 복수

    // 옵션 (JSON 문자열)
    private String optionsJson;
	
}
