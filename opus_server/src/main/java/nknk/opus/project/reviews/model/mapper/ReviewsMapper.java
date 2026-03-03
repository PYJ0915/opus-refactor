package nknk.opus.project.reviews.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import nknk.opus.project.reviews.model.dto.Report;
import nknk.opus.project.reviews.model.dto.Reviews;

@Mapper
public interface ReviewsMapper {
	int addReview(Reviews inputReview);

	List<Reviews> getReviews(String stageNo);

	int getReviewsCount(String stageNo);

	int getWriterNo(int reviewNo);

	int updateReview(Reviews inputReview);

	int deleteReview(int reviewNo);

	int addReport(Report report);
}
