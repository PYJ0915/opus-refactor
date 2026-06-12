package nknk.opus.project.myPage.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import nknk.opus.project.myPage.model.dto.UnveilingHistoryResponse;
import nknk.opus.project.myPage.model.service.MyPageService;
import nknk.opus.project.reviews.model.dto.Reviews;

@RestController
@RequestMapping("/myPage")
@RequiredArgsConstructor
public class MyPageController {

	private final MyPageService service;

	@GetMapping("/savedList")
	public ResponseEntity<List<String>> getSavedList(Authentication authentication) {
		int memberNo = getMemberNo(authentication);
		List<String> list = service.getSavedList(memberNo);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/likeList")
	public ResponseEntity<List<String>> getLikeList(Authentication authentication) {
		int memberNo = getMemberNo(authentication);
		List<String> list = service.getLikeList(memberNo);
		return ResponseEntity.ok(list);
	}

	@GetMapping("/reviewList")
	public ResponseEntity<List<Reviews>> getReviewList(Authentication authentication) {
		int memberNo = getMemberNo(authentication);
		List<Reviews> list = service.getReviewList(memberNo);
		return ResponseEntity.ok(list);
	}

	// 경매 응찰 내역
	@GetMapping("/unveilingHistory")
	public ResponseEntity<List<UnveilingHistoryResponse>> getUnveilingHistory(Authentication authentication) {
		int memberNo = getMemberNo(authentication);
		List<UnveilingHistoryResponse> list = service.getUnveilingHistory(memberNo);
		return ResponseEntity.ok(list);
	}

	/** 챗봇 추천용 — 내 좋아요+저장 목록 통합 조회 */
	@GetMapping("/preferenceContext")
	public ResponseEntity<Map<String, Object>> getPreferenceContext(Authentication authentication) {
		int memberNo = Integer.parseInt((String) authentication.getPrincipal());

		Map<String, Object> context = new HashMap<>();
		context.put("likedStages", service.getLikeList(memberNo));
		context.put("savedStages", service.getSavedList(memberNo));
		context.put("ratedStages", service.getRatedStages(memberNo));

		return ResponseEntity.ok(context);
	}

	// JWT 토큰의 principal에서 memberNo를 꺼내는 헬퍼 메서드
	private int getMemberNo(Authentication authentication) {
		return Integer.parseInt((String) authentication.getPrincipal());
	}

}
