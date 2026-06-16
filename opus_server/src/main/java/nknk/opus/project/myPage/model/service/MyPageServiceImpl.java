package nknk.opus.project.myPage.model.service;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import nknk.opus.project.myPage.model.dto.UnveilingHistoryResponse;
import nknk.opus.project.myPage.model.mapper.MyPageMapper;
import nknk.opus.project.reviews.model.dto.Reviews;

@Service
@Transactional(rollbackFor = Exception.class)
@RequiredArgsConstructor
public class MyPageServiceImpl implements MyPageService {
	
	private final MyPageMapper mapper;

	@Override
	public List<String> getSavedList(int memberNo) {
		return mapper.getSavedList(memberNo);
	}

	@Override
	public List<Reviews> getReviewList(int memberNo) {
		return mapper.getReviewList(memberNo);
	}
	
	@Override
	public List<UnveilingHistoryResponse> getUnveilingHistory(int memberNo) {

		return mapper.getUnveilingHistory(memberNo);
	}

	@Override
	public List<String> getLikeList(int memberNo) {
		return mapper.getLikeList(memberNo);
	}
	
	@Override
	public List<Map<String, Object>> getRatedStages(int memberNo) {
		return mapper.getRatedStages(memberNo);
	}

}
