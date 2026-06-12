package nknk.opus.project.stage.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import nknk.opus.project.reviews.model.dto.Reviews;
import nknk.opus.project.stage.model.dto.StageCache;
import nknk.opus.project.stage.model.dto.StagePrefer;
import nknk.opus.project.stage.model.mapper.StageMapper;

@Service
@Transactional(rollbackFor = Exception.class)
public class StageServiceImpl implements StageService {
	
	@Autowired
	private StageMapper mapper;

	@Override
	public int toggleLike(StagePrefer stage) {
		mapper.deleteOpposite(stage);
		
		int exist = mapper.checkLike(stage);
		
		if(exist > 0) {
			mapper.deleteLike(stage);
			return -1; // 취소
		} else {
			mapper.insertLike(stage);
			return 1; // 추가
		}
	}

	@Override
	public int toggleDislike(StagePrefer stage) {
		mapper.deleteOpposite(stage);
		
		int exist = mapper.checkLike(stage);
		
		if(exist > 0) {
			mapper.deleteLike(stage);
			return -1;
		} else {
			mapper.insertLike(stage);
			return 1;
		}
	}

	@Override
	public int savePerform(StagePrefer stage) {
		int exist = mapper.checkSave(stage);
		
		if(exist > 0) {
			mapper.deleteSave(stage);
			return -1;
		} else {
			mapper.savePerform(stage);
			return 1;
		}
	}

	@Override
	public Reviews selectBestReview(String stageNo) {
		return mapper.selectBestReview(stageNo);
	}
	
	@Override
	public void upsertStageCache(StageCache stageCache) {
	    mapper.upsertStageCache(stageCache);
	}

	@Override
	public StageCache getStageCache(String stageNo) {
	    return mapper.selectStageCache(stageNo);
	}
	
	@Override
	public List<StageCache> searchStageCache(String query, String stageType) {
	    return mapper.searchStageCache(query, stageType);
	}
	
	@Override
	public List<StageCache> getStageCacheList(String stageType, int limit) {
	    return mapper.selectStageCacheList(stageType, limit);
	}
}
