package nknk.opus.project.stage.model.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import nknk.opus.project.reviews.model.dto.Reviews;
import nknk.opus.project.stage.mapper.StageMapper;
import nknk.opus.project.stage.model.dto.StagePrefer;

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
}
