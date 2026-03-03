package nknk.opus.project.reviews.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.reviews.model.service.ReviewLikeService;

@RestController
@RequestMapping("/reviews")
public class ReviewLikeController {
	
	@Autowired
	private ReviewLikeService service;
	
    @PostMapping("/like")
    public ResponseEntity<Boolean> toggleLike(Authentication authentication, @RequestBody Map<String, Integer> body) {
        try {
            int memberNo = Integer.parseInt(authentication.getName());
            int reviewNo = body.get("reviewNo");

            boolean liked = service.toggleLike(reviewNo, memberNo);
            return ResponseEntity.status(HttpStatus.OK).body(liked);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/likeCount")
    public ResponseEntity<Integer> getLikeCount(@RequestParam("reviewNo") int reviewNo) {
    	try {
    		int result = service.getLikeCount(reviewNo);
            return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
    }
    
    @GetMapping("/isLiked")
    public ResponseEntity<Boolean> isLiked(Authentication authentication, @RequestParam("reviewNo") int reviewNo) {
    	try {
    		int memberNo = Integer.parseInt(authentication.getName());
    		Boolean result = service.isLiked(reviewNo, memberNo);

    		return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
    }

}
	