package nknk.opus.project.reviews.model.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface ReviewLikeMapper {

    int checkLike(@Param("reviewNo") int reviewNo,
                  @Param("memberNo") int memberNo);

    int insertLike(@Param("reviewNo") int reviewNo,
                   @Param("memberNo") int memberNo);

    int deleteLike(@Param("reviewNo") int reviewNo,
                   @Param("memberNo") int memberNo);

    int getLikeCount(@Param("reviewNo") int reviewNo);
}
