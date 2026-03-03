package nknk.opus.project.notification.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Notification {

	private int notiNo;
    private int memberNo;
    private String notiType;
    private String notiTitle;
    private String notiContent;
    private String notiLink;
    private String isRead;
    private String createdAt;
	
}
