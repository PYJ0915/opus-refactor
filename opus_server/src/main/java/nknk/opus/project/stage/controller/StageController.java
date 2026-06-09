package nknk.opus.project.stage.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.reviews.model.dto.Reviews;
import nknk.opus.project.stage.model.dto.StageCache;
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
	
	/**
	 * 전시/뮤지컬 기본 정보 캐시 저장 (프론트가 외부 API 성공 시 호출)
	 * 인증 불필요 — SecurityConfig에서 /stage/cache/** permitAll 처리 필요
	 */
	@PostMapping("/cache")
	public ResponseEntity<Void> cacheStageInfo(@RequestBody StageCache stageCache) {
	    try {
	        service.upsertStageCache(stageCache);
	        return ResponseEntity.ok().build();
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}

	/**
	 * 캐시된 전시/뮤지컬 정보 조회 (외부 API 실패 시 프론트가 호출)
	 * 인증 불필요
	 */
	@GetMapping("/cache/{stageNo}")
	public ResponseEntity<StageCache> getCachedStageInfo(
	        @PathVariable("stageNo") String stageNo) {
	    try {
	        StageCache cache = service.getStageCache(stageNo);
	        if (cache == null) {
	            return ResponseEntity.notFound().build();
	        }
	        return ResponseEntity.ok(cache);
	    } catch (Exception e) {
	        e.printStackTrace();
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
	}
}
