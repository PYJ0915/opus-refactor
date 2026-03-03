package nknk.opus.project.stage.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class StagePrefer {
	private int memberNo;
	private String stageNo;
	private String preferType;
	private int likeCount;
	private String memberEmail;
}