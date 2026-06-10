package nknk.opus.project.scheduler;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.notification.model.service.NotificationService;
import nknk.opus.project.unveiling.model.dto.Unveiling;
import nknk.opus.project.unveiling.model.mapper.UnveilingMapper;
import nknk.opus.project.unveiling.model.service.UnveilingService;

@Slf4j
@Component
@RequiredArgsConstructor
public class UnveilingScheduler {

	private final UnveilingMapper unveilingMapper;

	private final UnveilingService unveilingService;
	
	private final NotificationService notificationService;

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
	
	// ── 신규: 1분마다 UPCOMING → LIVE 자동 전환 ──
    @Scheduled(fixedDelay = 60000)
    public void activateUpcomingAuctions() {
        List<Unveiling> targets = unveilingMapper.selectUnveilingsToActivate();
        if (targets.isEmpty()) return;

        log.info("[스케줄러] LIVE 전환 대상 {}건", targets.size());
        for (Unveiling u : targets) {
            try {
                // AND UNVEILING_STATUS = 'UPCOMING' 조건 덕분에 동시성 안전
                int updated = unveilingMapper.updateStatusLive(u.getUnveilingNo());
                if (updated > 0) {
                    log.info("[스케줄러] LIVE 전환 완료 - unveilingNo: {}", u.getUnveilingNo());
                }
            } catch (Exception e) {
                log.error("[스케줄러] LIVE 전환 실패 - {}: {}", u.getUnveilingNo(), e.getMessage());
            }
        }
    }
	
	// 기존 스케줄러 아래에 추가 — 1분마다 UPCOMING → LIVE 전환된 경매 감지
    @Scheduled(fixedDelay = 60000)
    public void notifyLiveAuctions() {
        List<Unveiling> targets = unveilingMapper.selectNewlyLiveUnveilings();
        if (targets.isEmpty()) return;

        log.info("[스케줄러] LIVE 알림 발송 대상 {}건", targets.size());
        for (Unveiling u : targets) {
            try {
                List<Integer> memberNos = unveilingMapper.selectAlertMemberNos(u.getUnveilingNo());

                for (int memberNo : memberNos) {
                    try {
                        notificationService.createNotification(
                            memberNo, "AUCTION",
                            "🔔 알림 신청한 경매가 시작되었습니다!",
                            u.getUnveilingTitle() + " - " + u.getProductionArtist(),
                            "/unveiling/" + u.getUnveilingNo()
                        );
                    } catch (Exception e) {
                        log.warn("[스케줄러] 개별 알림 실패 - unveilingNo: {}, memberNo: {}",
                            u.getUnveilingNo(), memberNo);
                    }
                }

                // 신청자가 0명이어도 중복 실행 방지를 위해 발송 완료 처리
                unveilingMapper.markLiveAlertSent(u.getUnveilingNo());
                log.info("[스케줄러] LIVE 알림 완료 - unveilingNo: {}, {}명",
                    u.getUnveilingNo(), memberNos.size());

            } catch (Exception e) {
                log.error("[스케줄러] LIVE 알림 실패 - {}: {}", u.getUnveilingNo(), e.getMessage());
            }
        }
    }
}
