package nknk.opus.project.reviews.model.service;

public interface ReviewLikeService {

	boolean toggleLike(int reviewNo, int memberNo);

	int getLikeCount(int reviewNo);

	Boolean isLiked(int reviewNo, int memberNo);
}
