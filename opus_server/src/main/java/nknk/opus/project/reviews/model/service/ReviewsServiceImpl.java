package nknk.opus.project.reviews.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import nknk.opus.project.reviews.model.dto.Report;
import nknk.opus.project.reviews.model.dto.Reviews;
import nknk.opus.project.reviews.model.mapper.ReviewsMapper;

@Service
@Transactional(rollbackFor = Exception.class)
public class ReviewsServiceImpl implements ReviewsService {
	
	@Autowired
	private ReviewsMapper mapper;

	@Override
	public int addReview(Reviews inputReview) {
		return mapper.addReview(inputReview);
	}

	@Override
	public List<Reviews> getReviews(String stageNo) {
		return mapper.getReviews(stageNo);
	}

	@Override
	public int getReviewsCount(String stageNo) {
		return mapper.getReviewsCount(stageNo);
	}

	@Override
	public int getWriterNo(int reviewNo) {
		return mapper.getWriterNo(reviewNo);
	}
	
	@Override
	public int updateReview(Reviews inputReview) {
		return mapper.updateReview(inputReview);
	}

	@Override
	public int deleteReview(int reviewNo) {
		return mapper.deleteReview(reviewNo);
	}

	@Override
	public int addReport(Report report) {
		return mapper.addReport(report);
	}


}
