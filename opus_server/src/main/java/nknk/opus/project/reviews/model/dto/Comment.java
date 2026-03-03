package nknk.opus.project.reviews.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Comment {
	private int commentNo;
	private int reviewNo;
	private int memberNo;
	private String commentContent;
	private String commentWriteDate;
	private String commentUpdateDate;
	private String commentDelFl;
	private String memberEmail;
}