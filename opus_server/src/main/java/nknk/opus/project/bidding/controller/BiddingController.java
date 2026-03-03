package nknk.opus.project.bidding.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.bidding.model.dto.BidResponse;
import nknk.opus.project.bidding.model.dto.Bidding;
import nknk.opus.project.bidding.model.service.BiddingService;

@RestController
@RequestMapping("/api/bids")
public class BiddingController {

	@Autowired
	private BiddingService biddingService;
	
	@PostMapping("/{unveilingNo}")
	public ResponseEntity<BidResponse> placeBid(@PathVariable("unveilingNo") int unveilingNo,
        										@RequestBody(required = false) Bidding bidding,
												Authentication authentication) {

	    if (bidding == null) bidding = new Bidding();
	    
	    bidding.setUnveilingNo(unveilingNo);

	    // 토큰에서 memberNo 추출
	    int memberNo = Integer.parseInt(authentication.getName());
	    bidding.setMemberNo(memberNo);

	    BidResponse res = biddingService.placeBid(bidding);

	    return ResponseEntity.ok(res);
	}

    
    
}







