package nknk.opus.project.notification.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.common.exception.BusinessException;
import nknk.opus.project.common.exception.ResourceNotFoundException;
import nknk.opus.project.notification.model.dto.Notification;
import nknk.opus.project.notification.model.mapper.NotificationMapper;

@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class NotificationServiceImpl implements NotificationService {

	@Autowired
	private NotificationMapper mapper;

	@Override
	public List<Notification> getNotifications(int memberNo) {
		return mapper.selectNotifications(memberNo);
	}

	@Override
	public int countUnread(int memberNo) {
		return mapper.countUnread(memberNo);
	}

	@Override
	public void markAsRead(int notiNo, int memberNo) {
		// 본인 알림인지 확인 후 읽음 처리
		List<Notification> notifications = mapper.selectNotifications(memberNo);
		boolean isOwner = notifications.stream().anyMatch(n -> n.getNotiNo() == notiNo);

		if (!isOwner) {
			throw new BusinessException("권한이 없습니다.");
		}

		mapper.markAsRead(notiNo);
	}

	@Override
	public void markAllAsRead(int memberNo) {
		mapper.markAllAsRead(memberNo);
	}

	@Override
	public void createNotification(int memberNo, String notiType, String notiTitle, String notiContent,
			String notiLink) {
		Notification notification = Notification.builder().memberNo(memberNo).notiType(notiType).notiTitle(notiTitle)
				.notiContent(notiContent).notiLink(notiLink).build();

		int result = mapper.insertNotification(notification);
		if (result != 1) {
			log.warn("알림 생성 실패 - memberNo: {}, type: {}", memberNo, notiType);
		}
	}

	// 개별 삭제
	// 본인 알림인지 확인 후 삭제
	@Override
	public void deleteNotification(int notiNo, int memberNo) {
		List<Notification> notifications = mapper.selectNotifications(memberNo);

		Notification notification = notifications.stream().filter(n -> n.getNotiNo() == notiNo).findFirst()
				.orElseThrow(() -> new ResourceNotFoundException("알림을 찾을 수 없습니다."));

		if (notification.getMemberNo() != memberNo) {
			throw new BusinessException("권한이 없습니다.");
		}

		int result = mapper.deleteNotification(notiNo);
		if (result != 1) {
			log.warn("알림 삭제 실패 - notiNo: {}", notiNo);
		}
	}

	// 전체 비우기
	@Override
	public void clearNotifications(int memberNo) {
		int result = mapper.deleteAllNotifications(memberNo);
		log.info("전체 알림 삭제 완료 - memberNo: {}, 삭제된 개수: {}", memberNo, result);
	}

}
