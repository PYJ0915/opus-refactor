package nknk.opus.project.reviews.model.service;

import java.util.List;

import nknk.opus.project.reviews.model.dto.Report;
import nknk.opus.project.reviews.model.dto.Reviews;

public interface ReviewsService {
	int addReview(Reviews inputReview);

	List<Reviews> getReviews(String stageNo);

	int getReviewsCount(String stageNo);

	int updateReview(Reviews inputReview);

	int getWriterNo(int reviewNo);

	int deleteReview(int reviewNo);

	int addReport(Report report);
}
