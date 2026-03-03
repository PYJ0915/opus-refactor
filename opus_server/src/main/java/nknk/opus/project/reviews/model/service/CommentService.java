package nknk.opus.project.reviews.model.service;

import java.util.List;

import nknk.opus.project.reviews.model.dto.Comment;

public interface CommentService {

	List<Comment> getComment(int reviewNo);

	int addComment(Comment inputComment);

	int getWriterNo(int commentNo);

	int deleteComment(int commentNo);

	int updateComment(Comment inputComment);

	int getCommentCount(int reviewNo);
}
