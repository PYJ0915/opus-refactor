package nknk.opus.project.board.model.service;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.board.model.dto.Board;
import nknk.opus.project.board.model.dto.BoardImg;
import nknk.opus.project.board.model.mapper.BoardMapper;
import nknk.opus.project.member.model.dto.Role;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BoardServiceImpl implements BoardService {

	private final BoardMapper mapper;

	@Value("${opus.board.folder-path}")
	private String folderPath;

	@Value("${opus.board.web-path}")
	private String webPath;

	private boolean isAdmin(String role) {
		return Role.ADMIN.getKey().equals(role);
	}

	/* 게시글 목록 조회 */
	@Override
	public List<Board> selectBoardList(int boardTypeCode, String sort) {
		return mapper.selectBoardList(boardTypeCode, sort);
	}

	/* 게시글 상세 조회 + 조회수 증가 */
	@Override
	public Board selectBoardDetail(int boardNo) {
		int result = mapper.updateViewCount(boardNo);
		if (result > 0) {
			return mapper.selectBoardDetail(boardNo);
		}
		return null;
	}

	/* 게시글 등록 (텍스트 + 이미지 업로드) */
	@Override
	public int insertBoard(Board board, List<MultipartFile> images) {

		int result = mapper.insertBoard(board);
		if (result <= 0)
			return 0;

		int boardNo = board.getBoardNo();

		if (images == null || images.isEmpty())
			return 1;

		File dir = new File(folderPath);
		if (!dir.exists())
			dir.mkdirs();

		List<BoardImg> uploadList = new ArrayList<>();
		List<String> savedFiles = new ArrayList<>();

		List<String> allowedExts = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp");
		long maxSize = 10 * 1024 * 1024; // 10mb

		try {
			for (MultipartFile file : images) {
				if (file == null || file.isEmpty())
					continue;

				if (file.getSize() > maxSize) {
					throw new RuntimeException("10MB 이하의 이미지만 업로드 가능합니다.");
				}

				String originalName = file.getOriginalFilename();
				String ext = "";
				if (originalName != null && originalName.lastIndexOf(".") != -1) {
					ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
				}

				if (!allowedExts.contains(ext)) {
					throw new RuntimeException("이미지 파일(.jpg, .png, .gif, .webp)만 업로드 가능합니다.");
				}

				String rename = UUID.randomUUID().toString().replace("-", "") + ext;
				int order = uploadList.size();

				BoardImg img = BoardImg.builder().boardNo(boardNo).boardImgPath(webPath).boardImgOg(originalName)
						.boardImgRe(rename).boardImgOrder(order).build();

				file.transferTo(new File(dir, rename));
				savedFiles.add(rename);
				uploadList.add(img);
			}

			int imgResult = 0;
			for (BoardImg img : uploadList) {
				imgResult += mapper.insertBoardImageOne(img);
			}
			if (imgResult != uploadList.size()) {
				throw new RuntimeException("이미지 DB 저장 실패");
			}

			return 1;

		} catch (Exception e) {
			for (String rename : savedFiles) {
				try {
					File f = new File(dir, rename);
					if (f.exists())
						f.delete();
				} catch (Exception ignore) {
				}
			}

			log.error("게시글 등록 실패: {}", e.getMessage());
			throw new RuntimeException(e.getMessage());
		}
	}

	/* 게시글 텍스트 수정 */
	@Override
	public int updateBoard(Board board, int memberNo, String role) {
		if (isAdmin(role)) {
			return mapper.adminUpdateBoard(board);
		}

		board.setMemberNo(memberNo);
		return mapper.updateBoard(board);
	}

	/* 게시글 삭제(논리 삭제) */
	@Override
	public int deleteBoard(int boardNo, int memberNo, String role) {
		if (isAdmin(role)) {
			return mapper.adminDeleteBoard(boardNo);
		}

		return mapper.deleteBoard(boardNo, memberNo);
	}

	/* 게시글 전체 수정 (텍스트 + 이미지 교체) */
	@Override
	public int updateBoardWithImages(Board board, List<MultipartFile> images, int memberNo, String role) {

		int result;
		if (isAdmin(role)) {
			result = mapper.adminUpdateBoard(board);
		} else {
			board.setMemberNo(memberNo);
			result = mapper.updateBoard(board);
		}
		if (result <= 0)
			return 0;

		if (images == null || images.isEmpty())
			return 1;

		List<String> oldRenames = mapper.selectBoardImageRenames(board.getBoardNo());
		mapper.deleteBoardImages(board.getBoardNo());

		File dir = new File(folderPath);
		if (!dir.exists())
			dir.mkdirs();

		List<BoardImg> uploadList = new ArrayList<>();
		List<String> savedFiles = new ArrayList<>();

		List<String> allowedExts = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp");
		long maxSize = 10 * 1024 * 1024;

		try {
			for (MultipartFile file : images) {
				if (file == null || file.isEmpty())
					continue;

				if (file.getSize() > maxSize) {
					throw new RuntimeException("10MB 이하의 이미지만 업로드 가능합니다.");
				}

				String originalName = file.getOriginalFilename();
				String ext = "";
				if (originalName != null && originalName.lastIndexOf(".") != -1) {
					ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
				}
				if (!allowedExts.contains(ext)) {
					throw new RuntimeException("이미지 파일(.jpg, .png, .gif, .webp)만 업로드 가능합니다.");
				}

				String rename = UUID.randomUUID().toString().replace("-", "") + ext;
				int order = uploadList.size();

				BoardImg img = BoardImg.builder().boardNo(board.getBoardNo()).boardImgPath(webPath)
						.boardImgOg(originalName).boardImgRe(rename).boardImgOrder(order).build();

				file.transferTo(new File(dir, rename));
				savedFiles.add(rename);
				uploadList.add(img);
			}

			int imgResult = 0;
			for (BoardImg img : uploadList) {
				imgResult += mapper.insertBoardImageOne(img);
			}
			if (imgResult != uploadList.size()) {
				throw new RuntimeException("이미지 DB 저장 실패");
			}

			for (String old : oldRenames) {
				try {
					File f = new File(dir, old);
					if (f.exists())
						f.delete();
				} catch (Exception ignore) {
				}
			}

			return 1;

		} catch (Exception e) {
			for (String rename : savedFiles) {
				try {
					File f = new File(dir, rename);
					if (f.exists())
						f.delete();
				} catch (Exception ignore) {
				}
			}
			log.error("게시글 수정(이미지 포함) 실패: {}", e.getMessage());
			throw new RuntimeException(e.getMessage());
		}
	}

	/* 게시글 이미지 부분 수정(선택 삭제 + 새 이미지 추가 + 순서 재정렬) */
	@Override
	public int updateBoardImagesPartial(Board board, String deleteImgNosJson, List<MultipartFile> images, int memberNo,
			String role) {

		int result;
		if (isAdmin(role)) {
			result = mapper.adminUpdateBoard(board);
		} else {
			board.setMemberNo(memberNo);
			result = mapper.updateBoard(board);
		}
		if (result <= 0)
			return 0;

		List<Integer> deleteNos = new ArrayList<>();
		try {
			if (deleteImgNosJson != null && !deleteImgNosJson.isBlank()) {
				ObjectMapper om = new ObjectMapper();
				deleteNos = om.readValue(deleteImgNosJson, new TypeReference<List<Integer>>() {
				});
			}
		} catch (Exception e) {
			throw new RuntimeException("삭제 목록 파싱 실패");
		}

		int boardNo = board.getBoardNo();
		File dir = new File(folderPath);
		if (!dir.exists())
			dir.mkdirs();

		if (!deleteNos.isEmpty()) {
			List<String> renames = mapper.selectImageRenamesByNos(boardNo, deleteNos);
			mapper.deleteImagesByNos(boardNo, deleteNos);

			for (String r : renames) {
				try {
					File f = new File(dir, r);
					if (f.exists())
						f.delete();
				} catch (Exception ignore) {
				}
			}
			mapper.reorderImages(boardNo);
		}

		if (images == null || images.isEmpty())
			return 1;

		int currentCount = mapper.countImages(boardNo);

		List<String> allowedExts = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp");
		long maxSize = 10 * 1024 * 1024;

		List<BoardImg> uploadList = new ArrayList<>();
		List<String> savedFiles = new ArrayList<>();

		try {
			for (MultipartFile file : images) {
				if (file == null || file.isEmpty())
					continue;

				if (file.getSize() > maxSize)
					throw new RuntimeException("10MB 이하의 이미지만 업로드 가능합니다.");

				String originalName = file.getOriginalFilename();
				String ext = "";
				if (originalName != null && originalName.lastIndexOf(".") != -1) {
					ext = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
				}
				if (!allowedExts.contains(ext))
					throw new RuntimeException("이미지 파일만 업로드 가능합니다.");

				String rename = UUID.randomUUID().toString().replace("-", "") + ext;
				int order = currentCount + uploadList.size();

				BoardImg img = BoardImg.builder().boardNo(boardNo).boardImgPath(webPath).boardImgOg(originalName)
						.boardImgRe(rename).boardImgOrder(order).build();

				file.transferTo(new File(dir, rename));
				savedFiles.add(rename);
				uploadList.add(img);
			}

			int imgResult = 0;
			for (BoardImg img : uploadList) {
				imgResult += mapper.insertBoardImageOne(img);
			}
			if (imgResult != uploadList.size()) {
				throw new RuntimeException("이미지 DB 저장 실패");
			}

			return 1;

		} catch (Exception e) {
			for (String r : savedFiles) {
				try {
					File f = new File(dir, r);
					if (f.exists())
						f.delete();
				} catch (Exception ignore) {
				}
			}
			throw new RuntimeException(e.getMessage());
		}
	}

	/* 작성 게시글 조회 (기업회원만) */
	@Override
	public List<Board> selectMyBoards(int memberNo) {
		return mapper.selectMyBoards(memberNo);
	}
}