package nknk.opus.project.stage.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import nknk.opus.project.reviews.model.dto.Reviews;
import nknk.opus.project.stage.model.dto.StageCache;
import nknk.opus.project.stage.model.dto.StagePrefer;

@Mapper
public interface StageMapper {

	int checkLike(StagePrefer stage);

	int deleteLike(StagePrefer stage);

	int insertLike(StagePrefer stage);

	int checkDislike(StagePrefer stage);

	int deleteDislike(StagePrefer stage);

	int insertDislike(StagePrefer stage);

	void deleteOpposite(StagePrefer stage);

	int checkSave(StagePrefer stage);

	void deleteSave(StagePrefer stage);

	int savePerform(StagePrefer stage);

	Reviews selectBestReview(String stageNo);
	
	// 캐시 저장 (있으면 UPDATE, 없으면 INSERT)
    void upsertStageCache(StageCache stageCache);

    // 캐시 조회
    StageCache selectStageCache(String stageNo);

	List<StageCache> searchStageCache(@Param("query") String query, @Param("stageType") String stageType);

	List<StageCache> selectStageCacheList(@Param("stageType") String stageType, @Param("limit") int limit);
}
