package nknk.opus.project.reviews.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import nknk.opus.project.reviews.model.dto.Comment;
import nknk.opus.project.reviews.model.mapper.CommentMapper;
import nknk.opus.project.reviews.model.mapper.ReviewsMapper;

@Service
@Transactional(rollbackFor = Exception.class)
public class CommentServiceImpl implements CommentService {
	
	@Autowired
	private CommentMapper mapper;

	@Override
	public List<Comment> getComment(int reviewNo) {
		return mapper.getComment(reviewNo);
	}

	@Override
	public int addComment(Comment inputComment) {
		return mapper.addComment(inputComment);
	}

	@Override
	public int getWriterNo(int commentNo) {
		return mapper.getWriterNo(commentNo);
	}

	@Override
	public int deleteComment(int commentNo) {
		return mapper.deleteComment(commentNo);
	}

	@Override
	public int updateComment(Comment inputComment) {
		return mapper.updateComment(inputComment);
	}

	@Override
	public int getCommentCount(int reviewNo) {
		return mapper.getCommentCount(reviewNo);
	}
}
