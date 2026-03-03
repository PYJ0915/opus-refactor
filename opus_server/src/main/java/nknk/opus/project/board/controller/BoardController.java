package nknk.opus.project.board.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import nknk.opus.project.board.model.dto.Board;
import nknk.opus.project.board.model.service.BoardService;
import nknk.opus.project.member.model.dto.Role;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {

	private final BoardService service;

	/** 토큰(로그인) 필수 체크 */
	private void requireAuth(Authentication authentication) {
		if (authentication == null || authentication.getPrincipal() == null) {
			throw new RuntimeException("로그인이 필요합니다.");
		}
	}

	/** Authentication에서 memberNo 추출 */
	private int getMemberNo(Authentication authentication) {
		requireAuth(authentication);
		return Integer.parseInt((String) authentication.getPrincipal());
	}

	/** Authentication에서 role 추출 */
	private String getRole(Authentication authentication) {
		requireAuth(authentication);
		return authentication.getAuthorities().stream().map(a -> a.getAuthority()).findFirst().orElse(null);
	}

	/* 게시글 목록 조회 */
	@GetMapping("/list/{boardTypeCode}")
	public List<Board> selectBoardList(@PathVariable("boardTypeCode") int boardTypeCode,
			@RequestParam(value = "sort", defaultValue = "latest") String sort) {
		return service.selectBoardList(boardTypeCode, sort);
	}

	/* 게시글 상세 조회 + 조회수 증가 */
	@GetMapping("/detail/{boardNo}")
	public Board selectBoardDetail(@PathVariable("boardNo") int boardNo) {
		return service.selectBoardDetail(boardNo);
	}

	/* 게시글 등록 */
	@PostMapping(value = "/insert", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public int insertBoard(Authentication authentication, @RequestPart("board") Board board,
			@RequestPart(value = "images", required = false) List<MultipartFile> images) {

		int memberNo = getMemberNo(authentication);
		String role = getRole(authentication);

		if (Role.COMPANY.getKey().equals(role) && board.getBoardTypeCode() != 2) {
			throw new RuntimeException("기업회원은 2번 게시판만 작성 가능합니다.");
		}

		board.setMemberNo(memberNo);
		return service.insertBoard(board, images);
	}

	/* 게시글 텍스트 수정 */
	@PutMapping("/update/{boardNo}")
	public int updateBoard(Authentication authentication, @PathVariable("boardNo") int boardNo,
			@RequestBody Board board) {

		int memberNo = getMemberNo(authentication);
		String role = getRole(authentication);

		board.setBoardNo(boardNo);
		// memberNo는 서비스에서 role에 따라 필요한 경우만 세팅함
		return service.updateBoard(board, memberNo, role);
	}

	/* 게시글 전체 수정 (텍스트 + 이미지 교체) */
	@PutMapping(value = "/update-with-images/{boardNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public int updateBoardWithImages(Authentication authentication, @PathVariable("boardNo") int boardNo,
			@RequestPart("board") Board board,
			@RequestPart(value = "images", required = false) List<MultipartFile> images) {

		int memberNo = getMemberNo(authentication);
		String role = getRole(authentication);

		board.setBoardNo(boardNo);
		return service.updateBoardWithImages(board, images, memberNo, role);
	}

	/* 게시글 이미지 부분 수정 (기존삭제 + 신규추가) */
	@PutMapping(value = "/update-images/{boardNo}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public int updateBoardImagesPartial(Authentication authentication, @PathVariable("boardNo") int boardNo,
			@RequestPart("board") Board board,
			@RequestPart(value = "deleteImgNos", required = false) String deleteImgNosJson,
			@RequestPart(value = "images", required = false) List<MultipartFile> images) {

		int memberNo = getMemberNo(authentication);
		String role = getRole(authentication);

		board.setBoardNo(boardNo);
		return service.updateBoardImagesPartial(board, deleteImgNosJson, images, memberNo, role);
	}

	/* 게시글 삭제 */
	@DeleteMapping("/delete/{boardNo}")
	public int deleteBoard(Authentication authentication, @PathVariable("boardNo") int boardNo) {

		int memberNo = getMemberNo(authentication);
		String role = getRole(authentication);

		return service.deleteBoard(boardNo, memberNo, role);
	}

	/* 작성 게시글 조회 (기업회원만) */
	@GetMapping("/my")
	public List<Board> selectMyBoards(Authentication authentication) {

		int memberNo = getMemberNo(authentication);
		String role = getRole(authentication);

		if (!Role.COMPANY.getKey().equals(role)) {
			throw new RuntimeException("기업 회원만 접근 가능합니다.");
		}

		return service.selectMyBoards(memberNo);
	}
}