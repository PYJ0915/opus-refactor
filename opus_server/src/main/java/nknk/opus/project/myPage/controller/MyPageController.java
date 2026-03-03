package nknk.opus.project.myPage.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.myPage.model.dto.UnveilingHistoryResponse;
import nknk.opus.project.myPage.model.service.MyPageService;
import nknk.opus.project.reviews.model.dto.Reviews;

@RestController
@RequestMapping("/myPage")
public class MyPageController {

	@Autowired
	private MyPageService service;
	
	@GetMapping("/savedList")
	public ResponseEntity<List<String>> getSavedList(@RequestParam("memberNo") int memberNo) {
		List<String> list = service.getSavedList(memberNo);
		
		return ResponseEntity.ok(list);
	}
	
	@GetMapping("/likeList")
	public ResponseEntity<List<String>> getLikeList(@RequestParam("memberNo") int memberNo) {
	    List<String> list = service.getLikeList(memberNo);
	    return ResponseEntity.ok(list);
	}
	
	@GetMapping("/reviewList")
	public ResponseEntity<List<Reviews>> getReviewList(@RequestParam("memberNo") int memberNo) {
		List<Reviews> list = service.getReviewList(memberNo);
		
		return ResponseEntity.ok(list);
	}
	
	// 경매 응찰 내역
	@GetMapping("/unveilingHistory")
	public ResponseEntity<List<UnveilingHistoryResponse>> getUnveilingHistory(@RequestParam("memberNo") int memberNo) {
		List<UnveilingHistoryResponse> list = service.getUnveilingHistory(memberNo);
		return ResponseEntity.ok(list);
	}
	
	
}


	