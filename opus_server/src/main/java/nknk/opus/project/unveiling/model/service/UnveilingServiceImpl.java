package nknk.opus.project.unveiling.model.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.bidding.model.dto.BidStateResponse;
import nknk.opus.project.bidding.model.dto.Bidding;
import nknk.opus.project.bidding.model.dto.RecentBidResponse;
import nknk.opus.project.bidding.model.mapper.BiddingMapper;
import nknk.opus.project.common.util.UnveilingUtils;
import nknk.opus.project.member.model.mapper.MemberMapper;
import nknk.opus.project.notification.model.service.NotificationService;
import nknk.opus.project.unveiling.model.dto.Unveiling;
import nknk.opus.project.unveiling.model.mapper.UnveilingMapper;

@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class UnveilingServiceImpl implements UnveilingService {

	@Autowired
	private UnveilingMapper unveilingMapper;

	@Autowired
	private BiddingMapper biddingMapper;

	@Autowired
	private MemberMapper memberMapper;

	@Autowired
	private JavaMailSender mailSender;

	@Autowired
	private NotificationService notificationService;

	@Override
	public List<Unveiling> getList() {
		return unveilingMapper.selectUnveilingList();
	}

	@Override
	public Unveiling getDetail(int unveilingNo) {
		Unveiling u = unveilingMapper.selectUnveilingDetail(unveilingNo);
		if (u == null)
			throw new IllegalArgumentException("존재하지 않는 경매입니다.");
		return u;
	}

	@Override
	public List<RecentBidResponse> getRecentBiddings(int unveilingNo, int limit) {
		Unveiling u = unveilingMapper.selectUnveilingDetail(unveilingNo);
		if (u == null)
			throw new IllegalArgumentException("존재하지 않는 경매입니다.");

		if (limit <= 0)
			limit = 10;
		if (limit > 50)
			limit = 50;

		List<RecentBidResponse> list = biddingMapper.selectRecentBiddings(unveilingNo, limit);

		for (int i = 0; i < list.size(); i++) {
			list.get(i).setBidderLabel("익명 " + (i + 1));
		}

		return list;
	}

	@Override
	public BidStateResponse getBidState(int unveilingNo) {

		Unveiling u = unveilingMapper.selectUnveilingDetail(unveilingNo);
		if (u == null)
			throw new IllegalArgumentException("존재하지 않는 경매입니다.");

		int finishedFlag = unveilingMapper.selectIsFinished(unveilingNo);
		boolean finishedFl = (finishedFlag == 1);

		String status = u.getUnveilingStatus();
		boolean live = (status != null && "LIVE".equalsIgnoreCase(status));
		boolean bidAllowedFl = live && !finishedFl;

		int startPrice = u.getStartPrice();
		int currentPrice = (u.getCurrentPrice() > 0) ? u.getCurrentPrice() : startPrice;
		int tick = UnveilingUtils.calcTick(currentPrice);
		int nextBidPrice = bidAllowedFl ? (currentPrice + tick) : 0;

		String reason = null;
		if (!bidAllowedFl) {
			if (finishedFl)
				reason = "마감된 경매입니다.";
			else
				reason = "진행중인 경매만 응찰할 수 있습니다.";
		}

		Bidding topBid = biddingMapper.selectTopBid(unveilingNo);
		int topBidderMemberNo = (topBid != null) ? topBid.getMemberNo() : 0;

		int finalizedFl = u.getFinalizedFl();
		int winnerMemberNo = u.getMemberNo();
		int finalPrice = u.getFinalPrice();
		String paymentStatus = (u.getPaymentStatus() == null) ? "NONE" : u.getPaymentStatus();

		return BidStateResponse.builder().unveilingNo(unveilingNo).startPrice(startPrice).currentPrice(currentPrice)
				.biddingCount(u.getBiddingCount()).unveilingStatus(u.getUnveilingStatus()).finishedFl(finishedFl)
				.bidAllowedFl(bidAllowedFl).reason(reason).tick(tick).nextBidPrice(nextBidPrice)
				.finalizedFl(finalizedFl).winnerMemberNo(winnerMemberNo).finalPrice(finalPrice)
				.paymentStatus(paymentStatus).topBidderMemberNo(topBidderMemberNo).build();
	}

	@Override
	public Map<String, Object> finalizeAuction(int unveilingNo) {
		Unveiling u = unveilingMapper.selectUnveilingForUpdate(unveilingNo);
		if (u == null)
			throw new IllegalArgumentException("존재하지 않는 경매입니다.");

		int finishedFl = unveilingMapper.selectIsFinished(unveilingNo);

		if (finishedFl == 1 && (u.getUnveilingStatus() == null || !"ENDED".equalsIgnoreCase(u.getUnveilingStatus()))) {
			unveilingMapper.updateStatusEnded(unveilingNo);
			u.setUnveilingStatus("ENDED");
		}

		if (u.getUnveilingStatus() == null || !"ENDED".equalsIgnoreCase(u.getUnveilingStatus())) {
			throw new IllegalStateException("종료된 경매만 낙찰 확정할 수 있습니다.");
		}

		if (u.getFinalizedFl() == 1) {
			String paymentStatus = (u.getPaymentStatus() == null) ? "NONE" : u.getPaymentStatus();
			return Map.of("unveilingNo", unveilingNo, "finalizedFl", true, "winnerMemberNo", u.getMemberNo(),
					"finalPrice", u.getFinalPrice(), "paymentStatus", paymentStatus);
		}

		Bidding top = biddingMapper.selectTopBid(unveilingNo);
		if (top == null)
			throw new IllegalStateException("입찰이 없어 낙찰자를 확정할 수 없습니다.");

		u.setMemberNo(top.getMemberNo());
		u.setFinalPrice(top.getBidPrice());

		int r = unveilingMapper.finalizeAuctionUsingMemberNo(u);
		if (r == 0)
			throw new IllegalStateException("낙찰 확정 처리에 실패했습니다.");

		try {
			String email = memberMapper.findEmailByMemberNo(top.getMemberNo());
			if (email != null) {
				sendWinnerEmail(email, unveilingNo, u.getUnveilingTitle(), u.getProductionArtist(), top.getBidPrice());
			}

			// 사이트 알림 생성
			notificationService.createNotification(
				top.getMemberNo(),
				"AUCTION",
				"🎉 낙찰을 축하드립니다!",
				u.getUnveilingTitle() + " - " + String.format("₩%,d", top.getBidPrice()),
				"/unveiling/" + unveilingNo
			);
			log.info("낙찰 알림 생성 완료 - unveilingNo: {}, memberNo: {}", unveilingNo, top.getMemberNo());

		} catch (Exception e) {
			log.warn("[낙찰 확정 메일 발송 실패] unveilingNo: {}, 사유: {}", unveilingNo, e.getMessage());
		}

		return Map.of("unveilingNo", unveilingNo, "finalizedFl", true, "winnerMemberNo", top.getMemberNo(),
				"finalPrice", top.getBidPrice(), "paymentStatus", "PENDING");
	}

	@Override
	public Map<String, Object> mockPay(int unveilingNo, int memberNo) {

		if (unveilingNo <= 0) {
			return Map.of("statusCode", 400, "message", "경매번호가 올바르지 않습니다.", "unveilingNo", unveilingNo);
		}
		if (memberNo <= 0) {
			return Map.of("statusCode", 400, "message", "회원번호가 올바르지 않습니다.", "unveilingNo", unveilingNo);
		}

		Unveiling u = unveilingMapper.selectUnveilingForUpdate(unveilingNo);
		if (u == null) {
			return Map.of("statusCode", 404, "message", "존재하지 않는 경매입니다.", "unveilingNo", unveilingNo);
		}

		if (u.getFinalizedFl() != 1) {
			return Map.of("statusCode", 409, "message", "낙찰 확정 후 결제할 수 있습니다.", "unveilingNo", unveilingNo);
		}

		if (u.getMemberNo() <= 0 || u.getMemberNo() != memberNo) {
			return Map.of("statusCode", 409, "message", "낙찰자만 결제할 수 있습니다.", "unveilingNo", unveilingNo);
		}

		String paymentStatus = (u.getPaymentStatus() == null) ? "NONE" : u.getPaymentStatus();

		if ("EXPIRED".equalsIgnoreCase(paymentStatus)) {
			return Map.of("statusCode", 409, "message", "결제 기한이 만료되었습니다.", "unveilingNo", unveilingNo, "paymentStatus",
					"EXPIRED");
		}

		int expiredFl = unveilingMapper.selectIsPaymentExpired(unveilingNo);
		if (expiredFl == 1) {
			unveilingMapper.markPaymentExpired(unveilingNo);
			return Map.of("statusCode", 409, "message", "결제 기한이 만료되었습니다.", "unveilingNo", unveilingNo, "paymentStatus",
					"EXPIRED");
		}

		if (!"PENDING".equalsIgnoreCase(paymentStatus)) {
			return Map.of("statusCode", 409, "message", "결제 가능한 상태가 아닙니다.", "unveilingNo", unveilingNo, "paymentStatus",
					paymentStatus);
		}

		int r = unveilingMapper.markPaid(unveilingNo);
		if (r == 0) {
			return Map.of("statusCode", 500, "message", "결제 처리에 실패했습니다.", "unveilingNo", unveilingNo);
		}

		try {
			String email = memberMapper.findEmailByMemberNo(memberNo);
			if (email != null) {
				sendPaymentRequestEmail(email, unveilingNo, u.getFinalPrice());
			}
		} catch (Exception e) {
			log.warn("[결제 신청 메일 발송 실패] unveilingNo: {}, 사유: {}", unveilingNo, e.getMessage());
		}

		return Map.of("statusCode", 200, "message", "결제 신청이 완료되었습니다. 안내 메일을 확인해주세요.", "unveilingNo", unveilingNo,
				"paymentStatus", "PAID");
	}

	/**
	 * 마감 임박 알림 이메일 발송 — 해당 경매에 응찰한 회원 전원에게 발송
	 * 스케줄러에서 호출 (markAlertSent는 스케줄러에서 처리)
	 */
	@Override
	@Transactional(readOnly = true)
	public void sendDeadlineAlertEmails(int unveilingNo, String unveilingTitle, String productionArtist, String finishDate) {

		// 해당 경매 응찰자 전원의 memberNo 조회 (중복 제거)
		List<Integer> bidderMemberNos = biddingMapper.selectDistinctBidderMemberNos(unveilingNo);

		if (bidderMemberNos.isEmpty()) {
			log.info("[마감 임박 알림] 응찰자 없음 - unveilingNo: {}", unveilingNo);
			return;
		}

		int successCount = 0;
		for (int memberNo : bidderMemberNos) {
			try {
				String email = memberMapper.findEmailByMemberNo(memberNo);
				if (email != null) {
					sendDeadlineAlertEmail(email, unveilingNo, unveilingTitle, productionArtist, finishDate);
				}

				// 사이트 알림 생성
				notificationService.createNotification(
					memberNo,
					"AUCTION",
					"⏰ 경매 마감 1시간 전입니다!",
					unveilingTitle + " - " + productionArtist,
					"/unveiling/" + unveilingNo
				);
				
				successCount++;
				log.info("[마감 임박 알림] 발송 완료 - unveilingNo: {}, memberNo: {}", unveilingNo, memberNo);

			} catch (Exception e) {
				log.warn("[마감 임박 알림 개별 발송 실패] unveilingNo: {}, memberNo: {}, 사유: {}", unveilingNo, memberNo, e.getMessage());
			}
		}

		log.info("[마감 임박 알림] 발송 완료 - unveilingNo: {}, 총 {}명 중 {}명 성공", unveilingNo, bidderMemberNos.size(), successCount);
	}

	/* 마감 임박 알림 이메일 */
	private void sendDeadlineAlertEmail(String email, int unveilingNo, String unveilingTitle, String productionArtist, String finishDate) {
		try {
			String htmlContent = """
					<!DOCTYPE html>
					<html>
					<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
					    <div style="max-width:560px; margin:32px auto; background-color:#ffffff; border:1px solid #e5e7eb;">
					        <div style="background-color:#111827; padding:28px 36px; display:flex; justify-content:space-between; align-items:center;">
					            <span style="font-size:20px; font-weight:900; color:#ffffff;">OPUS</span>
					            <span style="font-size:11px; color:rgba(255,255,255,0.45); text-transform:uppercase;">Auction Alert</span>
					        </div>
					        <div style="padding:36px 36px 28px;">
					            <h1 style="font-size:20px; font-weight:900; color:#111827; margin:0 0 20px;">
					                경매 마감 1시간 전입니다.
					            </h1>
					            <p style="font-size:14px; color:#374151; line-height:1.8; margin:0 0 24px;">
					                응찰하신 경매가 곧 마감됩니다.<br/>
					                마지막 기회를 놓치지 마세요.
					            </p>
					            <div style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:4px; padding:24px; margin-bottom:24px;">
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">경매번호</p>
					                <p style="margin:0 0 16px; font-size:16px; font-weight:900; color:#111827;">No. %d</p>
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">작품명</p>
					                <p style="margin:0 0 16px; font-size:16px; font-weight:900; color:#111827;">%s</p>
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">작가</p>
					                <p style="margin:0 0 16px; font-size:15px; color:#111827;">%s</p>
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">마감 일시</p>
					                <p style="margin:0; font-size:15px; font-weight:900; color:#dc2626;">%s</p>
					            </div>
					            <div style="background-color:#fffbeb; border:1px solid #fde68a; border-radius:4px; padding:12px 14px; font-size:12px; color:#92400e; line-height:1.7;">
					                ⚠ 마감 후에는 응찰이 불가합니다. 지금 바로 경매 페이지를 확인해주세요.
					            </div>
					        </div>
					        <div style="background-color:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 36px;">
					            <p style="font-size:11px; color:#9ca3af; margin:0;">© 2026 OPUS. All rights reserved.<br/>본 메일은 발신 전용입니다.</p>
					        </div>
					    </div>
					</body>
					</html>
					"""
					.formatted(unveilingNo, unveilingTitle, productionArtist, finishDate);

			MimeMessage mimeMessage = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
			helper.setTo(email);
			helper.setSubject("[OPUS] 경매 마감 1시간 전 - " + unveilingTitle);
			helper.setText(htmlContent, true);
			mailSender.send(mimeMessage);

		} catch (Exception e) {
			throw new RuntimeException("메일 발송 실패: " + e.getMessage());
		}
	}

	/* 결제 신청 안내 이메일 발송 */
	private void sendPaymentRequestEmail(String email, int unveilingNo, int finalPrice) {
		try {
			String htmlContent = """
					<!DOCTYPE html>
					<html>
					<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
					    <div style="max-width:560px; margin:32px auto; background-color:#ffffff; border:1px solid #e5e7eb;">
					        <div style="background-color:#111827; padding:28px 36px;">
					            <span style="font-size:20px; font-weight:900; color:#ffffff;">OPUS</span>
					        </div>
					        <div style="padding:36px 36px 28px;">
					            <h1 style="font-size:20px; font-weight:900; color:#111827; margin:0 0 20px;">
					                결제 신청이 접수되었습니다.
					            </h1>
					            <p style="font-size:14px; color:#374151; line-height:1.8; margin:0 0 24px;">
					                아래 방법 중 하나로 결제를 진행해 주시면<br/>
					                담당자 확인 후 최종 처리됩니다.
					            </p>
					            <div style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:4px; padding:24px; margin-bottom:24px;">
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">낙찰 경매번호</p>
					                <p style="margin:0 0 16px; font-size:18px; font-weight:900; color:#111827;">No. %d</p>
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">낙찰가</p>
					                <p style="margin:0; font-size:18px; font-weight:900; color:#111827;">₩%s</p>
					            </div>
					            <p style="font-size:14px; color:#374151; line-height:1.8; margin:0 0 8px;">
					                <strong>① 계좌이체</strong><br/>
					                은행명: OO은행 / 계좌번호: 000-0000-0000 / 예금주: OPUS
					            </p>
					            <p style="font-size:14px; color:#374151; line-height:1.8; margin:0 0 24px;">
					                <strong>② 방문 결제</strong><br/>
					                영업시간(월~금 10:00 ~ 18:00) 내 방문 후 카드 결제 가능합니다.
					            </p>
					            <div style="background-color:#fffbeb; border:1px solid #fde68a; border-radius:4px; padding:12px 14px; font-size:12px; color:#92400e; line-height:1.7;">
					                ⚠ 결제는 낙찰 확정일로부터 <strong>1일 이내</strong>에 완료되어야 합니다.
					            </div>
					        </div>
					        <div style="background-color:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 36px;">
					            <p style="font-size:11px; color:#9ca3af; margin:0;">© 2026 OPUS. All rights reserved.</p>
					        </div>
					    </div>
					</body>
					</html>
					"""
					.formatted(unveilingNo, String.format("%,d", finalPrice));

			MimeMessage mimeMessage = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
			helper.setTo(email);
			helper.setSubject("[OPUS] 결제 신청이 접수되었습니다 - 경매번호 No." + unveilingNo);
			helper.setText(htmlContent, true);
			mailSender.send(mimeMessage);

		} catch (Exception e) {
			throw new RuntimeException("메일 발송 실패: " + e.getMessage());
		}
	}

	/* 낙찰 확정 안내 이메일 발송 */
	private void sendWinnerEmail(String email, int unveilingNo, String unveilingTitle, String productionArtist, int bidPrice) {
		try {
			String htmlContent = """
					<!DOCTYPE html>
					<html>
					<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
					    <div style="max-width:560px; margin:32px auto; background-color:#ffffff; border:1px solid #e5e7eb;">
					        <div style="background-color:#111827; padding:28px 36px;">
					            <span style="font-size:20px; font-weight:900; color:#ffffff;">OPUS</span>
					        </div>
					        <div style="padding:36px 36px 28px;">
					            <h1 style="font-size:20px; font-weight:900; color:#111827; margin:0 0 20px;">
					                낙찰을 축하드립니다! 🎉
					            </h1>
					            <p style="font-size:14px; color:#374151; line-height:1.8; margin:0 0 24px;">
					                고객님께서 응찰하신 작품의 최고가 입찰자로 확정되었습니다.<br/>
					                아래 내용을 확인하시고 기한 내 결제를 완료해 주세요.
					            </p>
					            <div style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:4px; padding:24px; margin-bottom:24px;">
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">경매번호</p>
					                <p style="margin:0 0 16px; font-size:16px; font-weight:900; color:#111827;">No. %d</p>
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">작품명</p>
					                <p style="margin:0 0 16px; font-size:16px; font-weight:900; color:#111827;">%s</p>
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">작가</p>
					                <p style="margin:0 0 16px; font-size:15px; color:#111827;">%s</p>
					                <p style="margin:0 0 8px; font-size:13px; color:#6b7280;">낙찰가</p>
					                <p style="margin:0; font-size:20px; font-weight:900; color:#111827;">₩%s</p>
					            </div>
					            <p style="font-size:14px; color:#374151; line-height:1.8; margin:0 0 8px;">
					                <strong>① 계좌이체</strong><br/>
					                은행명: OO은행 / 계좌번호: 000-0000-0000 / 예금주: OPUS
					            </p>
					            <p style="font-size:14px; color:#374151; line-height:1.8; margin:0 0 24px;">
					                <strong>② 방문 결제</strong><br/>
					                영업시간(월~금 10:00 ~ 18:00) 내 방문 후 카드 결제 가능합니다.
					            </p>
					            <div style="background-color:#fffbeb; border:1px solid #fde68a; border-radius:4px; padding:12px 14px; font-size:12px; color:#92400e; line-height:1.7;">
					                ⚠ 결제는 낙찰 확정일로부터 <strong>1일 이내</strong>에 완료되어야 합니다.<br/>
					                기한 내 미결제 시 낙찰이 취소될 수 있습니다.
					            </div>
					        </div>
					        <div style="background-color:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 36px;">
					            <p style="font-size:11px; color:#9ca3af; margin:0;">© 2026 OPUS. All rights reserved.</p>
					        </div>
					    </div>
					</body>
					</html>
					"""
					.formatted(unveilingNo, unveilingTitle, productionArtist, String.format("%,d", bidPrice));

			MimeMessage mimeMessage = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
			helper.setTo(email);
			helper.setSubject("[OPUS] 낙찰을 축하드립니다 - 경매번호 No." + unveilingNo);
			helper.setText(htmlContent, true);
			mailSender.send(mimeMessage);

		} catch (Exception e) {
			throw new RuntimeException("메일 발송 실패: " + e.getMessage());
		}
	}

}