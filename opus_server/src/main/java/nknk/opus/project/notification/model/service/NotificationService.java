package nknk.opus.project.notification.model.service;

import java.util.List;

import nknk.opus.project.notification.model.dto.Notification;

public interface NotificationService {

	// 알림 목록 조회
	List<Notification> getNotifications(int memberNo);

	// 읽지 않은 알림 수
	int countUnread(int memberNo);

	// 단건 읽음 처리
	void markAsRead(int notiNo, int memberNo);

	// 전체 읽음 처리
	void markAllAsRead(int memberNo);

	// 알림 생성 (서비스 레이어 내부 호출용)
	void createNotification(int memberNo, String notiType, String notiTitle, String notiContent, String notiLink);

	// 개별 삭제
	void deleteNotification(int notiNo, int memberNo);

	// 전체 비우기
	void clearNotifications(int memberNo);

}
