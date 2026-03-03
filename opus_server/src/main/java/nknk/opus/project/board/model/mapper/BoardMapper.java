package nknk.opus.project.board.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import nknk.opus.project.board.model.dto.Board;
import nknk.opus.project.board.model.dto.BoardImg;

@Mapper
public interface BoardMapper {

	List<Board> selectBoardList(@Param("boardTypeCode") int boardTypeCode, @Param("sort") String sort);

	Board selectBoardDetail(@Param("boardNo") int boardNo);

	int updateViewCount(@Param("boardNo") int boardNo);

	int insertBoard(Board board);

	int insertBoardImageOne(BoardImg img);

	int updateBoard(Board board); // WHERE BOARD_NO AND MEMBER_NO AND DEL_FL='N'

	int deleteBoard(@Param("boardNo") int boardNo, @Param("memberNo") int memberNo);

	int adminUpdateBoard(Board board); // WHERE BOARD_NO AND DEL_FL='N'

	int adminDeleteBoard(@Param("boardNo") int boardNo);

	List<String> selectBoardImageRenames(@Param("boardNo") int boardNo);

	int deleteBoardImages(@Param("boardNo") int boardNo);

	List<String> selectImageRenamesByNos(@Param("boardNo") int boardNo, @Param("deleteNos") List<Integer> deleteNos);

	int deleteImagesByNos(@Param("boardNo") int boardNo, @Param("deleteNos") List<Integer> deleteNos);

	int countImages(@Param("boardNo") int boardNo);

	int reorderImages(@Param("boardNo") int boardNo);

	List<Board> selectMyBoards(@Param("memberNo") int memberNo);
}