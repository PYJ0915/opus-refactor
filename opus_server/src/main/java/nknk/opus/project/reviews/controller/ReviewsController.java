package nknk.opus.project.reviews.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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

import nknk.opus.project.reviews.model.dto.Report;
import nknk.opus.project.reviews.model.dto.Reviews;
import nknk.opus.project.reviews.model.service.ReviewsService;

@RestController
@RequestMapping("reviews")
public class ReviewsController {

	@Autowired
	private ReviewsService service;
	
	@GetMapping("getReviews")
	public ResponseEntity<List<Reviews>> getReviews(@RequestParam("stageNo") String stageNo) {
		try {
			List<Reviews> result = service.getReviews(stageNo);
			return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	@GetMapping("getReviewsCount")
	public ResponseEntity<Integer> showReviewsCount(@RequestParam("stageNo") String stageNo) {
		try {
			int result = service.getReviewsCount(stageNo);
			
			return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	@PostMapping("addReview")
	public ResponseEntity<String> addReview(Authentication authentication, @RequestBody Reviews inputReview) {

		try {
			int memberNo = Integer.parseInt(authentication.getName());
	        inputReview.setMemberNo(memberNo);
			int result = service.addReview(inputReview);
			
			if(result == 0) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("후기 등록에 실패하였습니다.");
			};
			
			return ResponseEntity.status(HttpStatus.OK).body("후기가 등록되었습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	@DeleteMapping("{reviewNo}")
	public ResponseEntity<Void> deleteReview(@PathVariable("reviewNo") int reviewNo,
	                                         Authentication authentication) {
	    int loginMemberNo = Integer.parseInt(authentication.getName());
	    int writerNo = service.getWriterNo(reviewNo);
	    if (writerNo != loginMemberNo) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	    }
	    service.deleteReview(reviewNo);
	    return ResponseEntity.ok().build();
	}

	@PutMapping("{reviewNo}")
	public ResponseEntity<Void> updateReview(@PathVariable("reviewNo") int reviewNo,
	                                         @RequestBody Reviews inputReview,
	                                         Authentication authentication) {
	    int loginMemberNo = Integer.parseInt(authentication.getName());
	    int writerNo = service.getWriterNo(reviewNo);
	    if (writerNo != loginMemberNo) {
	        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	    }
	    inputReview.setReviewNo(reviewNo);
	    service.updateReview(inputReview);
	    return ResponseEntity.ok().build();
	}
	
    @PostMapping("addReport")
    public ResponseEntity<String> addReport(Authentication authentication, @RequestBody Report report) {
        try {
            int reporterNo = Integer.parseInt(authentication.getName());
            report.setReporterNo(reporterNo);

            int result = service.addReport(report);

            if (result == 0) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("신고 등록에 실패하였습니다.");
            }

			return ResponseEntity.status(HttpStatus.OK).body("신고가 등록되었습니다.");
        } catch (Exception e) {
            e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/averageRating")
    public ResponseEntity<Double> getAverageRating(@RequestParam("stageNo") String stageNo) {
        double avg = service.getAverageRating(stageNo);
        return ResponseEntity.ok(avg);
    }
    
    @GetMapping("/ratingDistribution")
    public ResponseEntity<List<Map<String, Object>>> getRatingDistribution(
            @RequestParam("stageNo") String stageNo) {
        return ResponseEntity.ok(service.getRatingDistribution(stageNo));
    }
}
