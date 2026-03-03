package nknk.opus.project.stage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.reviews.model.dto.Reviews;
import nknk.opus.project.stage.model.dto.StagePrefer;
import nknk.opus.project.stage.model.service.StageService;

@RestController
@RequestMapping("/stage")
public class StageController {

	@Autowired
	private StageService service;
	
	@PostMapping("/like")
	public ResponseEntity<Integer> toggleLike(@RequestBody StagePrefer stage) {
		try {
			int result = service.toggleLike(stage);
			
			return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0);
		}
	}
	
	@PostMapping("/dislike")
	public ResponseEntity<Integer> toggleDislike(@RequestBody StagePrefer stage) {
		try {
			int result = service.toggleDislike(stage);
			
			return ResponseEntity.status(HttpStatus.OK).body(result);
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0);
		}
	}
	
	@PostMapping("/save")
	public ResponseEntity<String> savePerform(@RequestBody StagePrefer stage) {
		try {
			int result = service.savePerform(stage);
			
			if(result == 0) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("찜 등록에 실패하였습니다.");
			}
			
			return ResponseEntity.status(HttpStatus.OK).body("찜에 추가되었습니다.");
		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
		}
	}
	
	@GetMapping("/bestReview")
	public ResponseEntity<Reviews> bestReview(@RequestParam("stageNo") String stageNo) {
		Reviews review = service.selectBestReview(stageNo);
		
		if(review == null) {
	        return ResponseEntity.status(HttpStatus.OK).body(null);
	    }
		
		return ResponseEntity.status(HttpStatus.OK).body(review);
	}
}
