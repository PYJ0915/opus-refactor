package nknk.opus.project.reviews.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import nknk.opus.project.reviews.model.dto.Comment;

@Mapper
public interface CommentMapper {

	List<Comment> getComment(int reviewNo);

	int addComment(Comment inputComment);

	int getWriterNo(int commentNo);

	int deleteComment(int commentNo);

	int updateComment(Comment inputComment);

	int getCommentCount(int reviewNo);
}
