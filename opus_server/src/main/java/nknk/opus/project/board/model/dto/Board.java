package nknk.opus.project.board.model.dto;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonIgnore;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Board {
	private int boardNo;
	private int boardTypeCode;
	private int memberNo;

	private String boardTitle;
	private String boardContent;

	private String boardWriteDate;
	private String boardCategory;
	private String boardDelFl;
	private String boardUpdateDate;

	private int boardViewCount;

	private String writerCompany;
	private String boardName;

	// 목록에서 썸네일만 뽑을 때
	private String boardImgPath;
	private String boardImgRe;

	private List<BoardImg> imageList;

	// 1) 목록 썸네일: 조인으로 가져온 (boardImgPath + boardImgRe)
	public String getBoardThumbnail() {
		if (boardImgPath != null && boardImgRe != null) {
			return boardImgPath + boardImgRe;
		}

		// 2) 상세에서 imageList가 있을 때 첫 이미지(ORDER 0)를 썸네일로
		if (imageList != null && !imageList.isEmpty()) {
			return imageList.get(0).getBoardImgFullpath();
		}

		return null;
	}
}