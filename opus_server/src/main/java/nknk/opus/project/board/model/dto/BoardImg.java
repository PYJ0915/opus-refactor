package nknk.opus.project.board.model.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BoardImg {
	private int boardImgNo;
	private int boardNo;

	private String boardImgPath; // 설정의 opus.board.web-path (/images/board/)
	private String boardImgOg; // 원본 파일명
	private String boardImgRe; // 서버 저장용 변경명 (UUID 등)
	private int boardImgOrder; // 0~4 권장 (정렬/썸네일 뽑기 편함)

	public String getBoardImgFullpath() { // 가공 필드: 전체 경로 반환
		if (boardImgPath == null)
			return boardImgRe;
		if (boardImgRe == null)
			return boardImgPath;
		return boardImgPath + boardImgRe;
	}
}