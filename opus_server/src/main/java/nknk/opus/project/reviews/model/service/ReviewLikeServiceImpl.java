package nknk.opus.project.reviews.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import nknk.opus.project.reviews.model.mapper.ReviewLikeMapper;

@Service
@Transactional(rollbackFor = Exception.class)
public class ReviewLikeServiceImpl implements ReviewLikeService {

    @Autowired
    private ReviewLikeMapper mapper;

    public boolean toggleLike(int reviewNo, int memberNo) {
        int exists = mapper.checkLike(reviewNo, memberNo);

        if (exists > 0) {
            mapper.deleteLike(reviewNo, memberNo);
            // 좋아요 취소
            return false; 
        } else {
            mapper.insertLike(reviewNo, memberNo);
            // 좋아요 추가됨
            return true;
        }
    }

    public int getLikeCount(int reviewNo) {
        return mapper.getLikeCount(reviewNo);
    }

    public Boolean isLiked(int reviewNo, int memberNo) {
        return mapper.checkLike(reviewNo, memberNo) > 0;
    }

}
