package nknk.opus.project.unveiling.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import nknk.opus.project.unveiling.model.dto.Unveiling;

@Mapper
public interface UnveilingMapper {

	Unveiling selectUnveilingForUpdate(int unveilingNo); // 입찰 직전 현재 경매 상태 정보 조회(+ 행 잠금)
																							// 동시 입찰 방지
	
	int updateAfterBid(Unveiling unveiling); // 입찰 직후 현재가, 횟수, 상태 최신화
	
	Unveiling selectUnveilingDetail(int unveilingNo); // 화면 조회 용도
	
	int selectIsFinished(int unveilingNo); // 경매 마감 여부 조회 용도
	
	int updateStatusEnded(int unveilingNo); // 경매 상태 변경(종료) 용도
	
	int finalizeAuctionUsingMemberNo(Unveiling u);
	
	int markPaid(int unveilingNo);
	
	int selectIsPaymentExpired(int unveilingNo);
	
	int markPaymentExpired(int unveilingNo);

	List<Unveiling> selectUnveilingList();
	
	List<Unveiling> selectUnveilingsToFinalize(); // 낙찰 확정 대상 경매 목록

	void markNoWinner(int unveilingNo);
	
	List<Unveiling> selectUnveilingsToAlert(); // 마감 1시간 이내 + 아직 알림 미발송인 LIVE 경매 목록 조회
	
	int markAlertSent(int unveilingNo);	// 알림 발송 완료 처리

	int updateFinishDate(Unveiling unveiling);
	
	
}
