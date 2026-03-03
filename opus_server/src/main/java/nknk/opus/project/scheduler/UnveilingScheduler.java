package nknk.opus.project.scheduler;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.unveiling.model.dto.Unveiling;
import nknk.opus.project.unveiling.model.mapper.UnveilingMapper;
import nknk.opus.project.unveiling.model.service.UnveilingService;

@Slf4j
@Component
public class UnveilingScheduler {

	@Autowired
	private UnveilingMapper unveilingMapper;

	@Autowired
	private UnveilingService unveilingService;

	// 1분마다 실행 - 낙찰 확정
	@Scheduled(fixedDelay = 60000)
	public void finalizeEndedAuctions() {

		List<Unveiling> targets = unveilingMapper.selectUnveilingsToFinalize();

		if (targets.isEmpty())
			return;

		log.info("[스케줄러] 낙찰 확정 대상 경매 {}건 발견", targets.size());

		for (Unveiling u : targets) {
			try {
				unveilingService.finalizeAuction(u.getUnveilingNo());
				log.info("[스케줄러] 낙찰 확정 완료 - unveilingNo: {}", u.getUnveilingNo());
			} catch (IllegalStateException e) {
				if (e.getMessage().contains("입찰이 없어")) {
					// 입찰자 없이 마감된 경매 → 유찰 처리 (더 이상 재시도 안 함)
					unveilingMapper.markNoWinner(u.getUnveilingNo());
					log.info("[스케줄러] 유찰 처리 완료 - unveilingNo: {}", u.getUnveilingNo());
				} else {
					log.error("[스케줄러] 낙찰 확정 실패 - unveilingNo: {}, 사유: {}", u.getUnveilingNo(), e.getMessage());
				}
			} catch (Exception e) {
				log.error("[스케줄러] 낙찰 확정 실패 - unveilingNo: {}, 사유: {}", u.getUnveilingNo(), e.getMessage());
			}
		}
	}

	// 5분마다 실행 — 마감 1시간 전 응찰자 알림
	@Scheduled(fixedDelay = 300000)
	public void sendDeadlineAlerts() {

		List<Unveiling> targets = unveilingMapper.selectUnveilingsToAlert();

		if (targets.isEmpty())
			return;

		log.info("[스케줄러] 마감 임박 알림 대상 경매 {}건 발견", targets.size());

		for (Unveiling u : targets) {
			try {
				unveilingService.sendDeadlineAlertEmails(u.getUnveilingNo(), u.getUnveilingTitle(),
						u.getProductionArtist(), u.getFinishDate());
				unveilingMapper.markAlertSent(u.getUnveilingNo());
				log.info("[스케줄러] 마감 임박 알림 발송 완료 - unveilingNo: {}", u.getUnveilingNo());
			} catch (Exception e) {
				log.error("[스케줄러] 마감 임박 알림 실패 - unveilingNo: {}, 사유: {}", u.getUnveilingNo(), e.getMessage());
			}
		}
	}
}
