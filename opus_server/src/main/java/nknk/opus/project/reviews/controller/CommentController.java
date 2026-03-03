package nknk.opus.project.reviews.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.reviews.model.dto.Comment;
import nknk.opus.project.reviews.model.service.CommentService;

@RestController
@RequestMapping("/comment")
public class CommentController {

	@Autowired
	private CommentService service;

	@GetMapping("/getComment")
	public ResponseEntity<List<Comment>> getComment(@RequestParam("reviewNo") int reviewNo){
	    try {
	        List<Comment> result = service.getComment(reviewNo);
	        return ResponseEntity.status(HttpStatus.OK).body(result);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
	    }
	}
    
    @PostMapping("/addComment")
    public ResponseEntity<String> addComment(Authentication authentication, @RequestBody Comment inputComment) {
    	try {
    		int memberNo = Integer.parseInt(authentication.getName());
    		inputComment.setMemberNo(memberNo);
    		
			int result = service.addComment(inputComment);
			
			if(result == 0) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("댓글 등록에 실패하였습니다.");
			}
			
			return ResponseEntity.status(HttpStatus.OK).body("댓글을 등록하였습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
    }
    
    @PostMapping("/deleteComment")
    public ResponseEntity<String> deleteComment(Authentication authentication, @RequestBody Comment inputComment){
    	try {
			int memberNo = Integer.parseInt(authentication.getName());
			int writerNo = service.getWriterNo(inputComment.getCommentNo());
			
			if(memberNo != writerNo) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("삭제 권한이 없습니다.");
			}
			
			int result = service.deleteComment(inputComment.getCommentNo());
			
			if(result == 0) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("댓글 삭제에 실패하였습니다.");
			}
			
			return ResponseEntity.status(HttpStatus.OK).body("댓글을 삭제하였습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
    }
    
    @PostMapping("/updateComment")
    public ResponseEntity<String> updateComment(Authentication authentication, @RequestBody Comment inputComment){
    	try {
			int memberNo = Integer.parseInt(authentication.getName());
			int writerNo = service.getWriterNo(inputComment.getCommentNo());
			
			if(memberNo != writerNo) {
				return ResponseEntity.status(HttpStatus.FORBIDDEN).body("수정 권한이 없습니다.");
			}
			
			int result = service.updateComment(inputComment);
			
			if(result == 0) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("댓글 수정에 실패하였습니다.");
			}
			
			return ResponseEntity.status(HttpStatus.OK).body("댓글을 수정하였습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
    }
    
    @GetMapping("/getCommentCount")
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
