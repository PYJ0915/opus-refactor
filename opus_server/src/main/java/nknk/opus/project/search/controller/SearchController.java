package nknk.opus.project.search.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import nknk.opus.project.board.model.mapper.BoardMapper;
import nknk.opus.project.board.model.service.BoardService;
import nknk.opus.project.selections.model.mapper.SelectionsMapper;
import nknk.opus.project.selections.model.service.SelectionsService;
import nknk.opus.project.stage.model.service.StageService;
import nknk.opus.project.unveiling.model.mapper.UnveilingMapper;
import nknk.opus.project.unveiling.model.service.UnveilingService;

@RestController
@RequestMapping("search")
@RequiredArgsConstructor
public class SearchController {

	private final SelectionsMapper selectionsMapper;

	private final UnveilingMapper unveilingMapper;

	private final BoardMapper boardMapper;
	
	private final StageService stageService;

	@GetMapping
	public ResponseEntity<Map<String, Object>> search(@RequestParam("q") String query) {
		Map<String, Object> result = new HashMap<>();

		// 굿즈 검색
		result.put("goods", selectionsMapper.searchGoods(query, 5));

		// 경매 검색
		result.put("auctions", unveilingMapper.searchUnveilings(query, 5));
		
		// 게시글 검색 (공지 + 홍보)
		result.put("boards", boardMapper.searchBoards(query, 5));
		
		// 전시 캐시 검색 추가
	    result.put("exhibitions", stageService.searchStageCache(query, "exhibition"));
	    
	    // 뮤지컬 캐시 검색 추가
	    result.put("musicals", stageService.searchStageCache(query, "musical"));

		return ResponseEntity.ok(result);
	}
}