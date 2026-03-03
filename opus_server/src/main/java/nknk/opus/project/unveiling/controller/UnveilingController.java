package nknk.opus.project.unveiling.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.bidding.model.dto.BidStateResponse;
import nknk.opus.project.bidding.model.dto.RecentBidResponse;
import nknk.opus.project.unveiling.model.dto.Unveiling;
import nknk.opus.project.unveiling.model.service.UnveilingService;

@RestController
@RequestMapping("/api/unveilings")
public class UnveilingController {
	
	@Autowired
	private UnveilingService unveilingService;
	
	@GetMapping
	public ResponseEntity<List<Unveiling>> list() {
	    return ResponseEntity.ok(unveilingService.getList());
	}

	
	@GetMapping("/{unveilingNo}")
	public ResponseEntity<Unveiling> detail(@PathVariable("unveilingNo") int unveilingNo) {
		return ResponseEntity.ok(unveilingService.getDetail(unveilingNo));
	}
	
	@GetMapping("/{unveilingNo}/biddings")
	public ResponseEntity<List<RecentBidResponse>> recentBiddings(
										@PathVariable("unveilingNo") int unveilingNo,
										@RequestParam(value="limit", defaultValue="10") int limit) {
		
	    return ResponseEntity.ok(unveilingService.getRecentBiddings(unveilingNo, limit));
	}

	@GetMapping("/{unveilingNo}/bid-state")
	public ResponseEntity<BidStateResponse> bidState(@PathVariable("unveilingNo") int unveilingNo) {
	    return ResponseEntity.ok(unveilingService.getBidState(unveilingNo));
	}
	
	@PostMapping("/{unveilingNo}/finalize")
	public ResponseEntity<Void> finalize(@PathVariable("unveilingNo") int unveilingNo,
	                                     Authentication authentication) {
	    if (authentication == null) return ResponseEntity.status(401).build();

	    boolean isAdmin = authentication.getAuthorities().stream()
	            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

	    if (!isAdmin) return ResponseEntity.status(403).build();

	    unveilingService.finalizeAuction(unveilingNo);
	    return ResponseEntity.ok().build();
	}

    @PostMapping("/{unveilingNo}/pay")
    public ResponseEntity<Map<String, Object>> pay(@PathVariable("unveilingNo") int unveilingNo,
    												Authentication authentication) {
        
        if (authentication == null) return ResponseEntity.status(401).build();
        int memberNo = Integer.parseInt(authentication.getName());

        Map<String, Object> res = unveilingService.mockPay(unveilingNo, memberNo);

        // 서비스가 결제 불가(만료 포함) 상태를 "statusCode"로 넘겨주면 그대로 사용
        Object statusObj = res.get("statusCode");
        int statusCode = (statusObj instanceof Number) ? ((Number) statusObj).intValue() : 200;

        return ResponseEntity.status(statusCode).body(res);
    }
	
	
	
}






