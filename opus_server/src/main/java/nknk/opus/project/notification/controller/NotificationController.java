package nknk.opus.project.notification.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nknk.opus.project.notification.model.dto.Notification;
import nknk.opus.project.notification.model.service.NotificationService;

@RestController
@RequestMapping("notifications")
public class NotificationController {
	
	@Autowired
    private NotificationService service;
	
	// 알림 목록 조회
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication auth) {
        int memberNo = Integer.parseInt((String) auth.getPrincipal());
        return ResponseEntity.ok(service.getNotifications(memberNo));
    }

    // 읽지 않은 알림 수
    @GetMapping("unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(Authentication auth) {
        int memberNo = Integer.parseInt((String) auth.getPrincipal());
        int count = service.countUnread(memberNo);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // 단건 읽음 처리
    @PutMapping("{notiNo}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable("notiNo") int notiNo, Authentication auth) {
        int memberNo = Integer.parseInt((String) auth.getPrincipal());
        service.markAsRead(notiNo, memberNo);
        return ResponseEntity.ok().build();
    }

    // 전체 읽음 처리
    @PutMapping("read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        int memberNo = Integer.parseInt((String) auth.getPrincipal());
        service.markAllAsRead(memberNo);
        return ResponseEntity.ok().build();
    }
    
 // 개별 삭제 
    @DeleteMapping("{notiNo}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable("notiNo") int notiNo, Authentication auth) {
        int memberNo = Integer.parseInt((String) auth.getPrincipal());
        service.deleteNotification(notiNo, memberNo);
        return ResponseEntity.noContent().build();
    }

    // 전체 비우기
    @DeleteMapping
    public ResponseEntity<Void> clearNotifications(Authentication auth) {
        int memberNo = Integer.parseInt((String) auth.getPrincipal());
        service.clearNotifications(memberNo);
        return ResponseEntity.noContent().build();
    }

}
