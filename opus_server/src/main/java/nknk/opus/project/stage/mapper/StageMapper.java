package nknk.opus.project.stage.mapper;

import org.apache.ibatis.annotations.Mapper;

import nknk.opus.project.reviews.model.dto.Reviews;
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
}
