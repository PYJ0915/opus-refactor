package nknk.opus.project.reviews.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import nknk.opus.project.reviews.model.dto.Comment;
import nknk.opus.project.reviews.model.service.CommentService;

@RestController
@RequestMapping("comment")
@RequiredArgsConstructor
public class CommentController {

	private final CommentService service;

	@GetMapping("getComment")
	public ResponseEntity<List<Comment>> getComment(@RequestParam("reviewNo") int reviewNo) {
		try {
			List<Comment> result = service.getComment(reviewNo);
			return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@PostMapping("addComment")
	public ResponseEntity<String> addComment(Authentication authentication, @RequestBody Comment inputComment) {
		try {
			int memberNo = Integer.parseInt(authentication.getName());
			inputComment.setMemberNo(memberNo);

			int result = service.addComment(inputComment);

			if (result == 0) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("댓글 등록에 실패하였습니다.");
			}

			return ResponseEntity.status(HttpStatus.OK).body("댓글을 등록하였습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}

	@DeleteMapping("{commentNo}")
	public ResponseEntity<String> deleteComment(@PathVariable("commentNo") int commentNo,
			Authentication authentication) {
		
		int memberNo = Integer.parseInt(authentication.getName());
		int writerNo = service.getWriterNo(commentNo);

		if (memberNo != writerNo) {
			return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
		}
		service.deleteComment(commentNo);
		return ResponseEntity.ok().build();
	}

	@PutMapping("{commentNo}")
	public ResponseEntity<String> updateComment(@PathVariable("commentNo") int commentNo,
												Authentication authentication, 
												@RequestBody Comment inputComment) {
			int memberNo = Integer.parseInt(authentication.getName());
			int writerNo = service.getWriterNo(commentNo);

			if (memberNo != writerNo) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
			}

			inputComment.setCommentNo(commentNo);
			service.updateComment(inputComment);
			return ResponseEntity.ok().build();
	}

	@GetMapping("getCommentCount")
	public ResponseEntity<Integer> getCommentCount(@RequestParam("reviewNo") int reviewNo) {
		try {
			int result = service.getCommentCount(reviewNo);
			return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
}
