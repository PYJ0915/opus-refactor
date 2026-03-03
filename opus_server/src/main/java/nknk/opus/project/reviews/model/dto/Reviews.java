package nknk.opus.project.reviews.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Reviews {
	private int reviewNo;
	private int memberNo;
	private String memberEmail;
	private String stageNo;
	private String reviewContent;
	private String reviewWriteDate;
	private String reviewUpdateDate;
	private char reviewDelFl;
	private int reviewCount;
}
