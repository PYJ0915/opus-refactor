package nknk.opus.project.stage.model.service;

import nknk.opus.project.reviews.model.dto.Reviews;
import nknk.opus.project.stage.model.dto.StageCache;
import nknk.opus.project.stage.model.dto.StagePrefer;

public interface StageService {

	int toggleLike(StagePrefer stage);

	int toggleDislike(StagePrefer stage);

	int savePerform(StagePrefer stage);

	Reviews selectBestReview(String stageNo);
	
	void upsertStageCache(StageCache stageCache);
	
    StageCache getStageCache(String stageNo);

	Object searchStageCache(String query, String string);  
}
