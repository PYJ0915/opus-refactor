package nknk.opus.project.notification.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import nknk.opus.project.notification.model.dto.Notification;

@Mapper
public interface NotificationMapper {

	// 알림 목록 조회 (최신순 20개)
    List<Notification> selectNotifications(int memberNo);

    // 읽지 않은 알림 수
    int countUnread(int memberNo);

    // 단건 읽음 처리
    int markAsRead(int notiNo);

    // 전체 읽음 처리
    int markAllAsRead(int memberNo);

    // 알림 삽입 (서비스 레이어 내부 호출용)
    int insertNotification(Notification notification);
    
    // 개별 삭제
    int deleteNotification(int notiNo);

    // 전체 비우기
    int deleteAllNotifications(int memberNo);

}
