package nknk.opus.project.bidding.model.service;

import nknk.opus.project.bidding.model.dto.BidResponse;
import nknk.opus.project.bidding.model.dto.Bidding;

public interface BiddingService {
	
	BidResponse placeBid(Bidding bidding);

}
