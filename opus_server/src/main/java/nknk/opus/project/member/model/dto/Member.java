package nknk.opus.project.member.model.dto;

// import nknk.opus.project.member.model.dto.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {
	private int memberNo;
	private String memberEmail;
	private String memberPw;
	private String memberTel;
	private String enrollDate;
	private String memberDelFl;
	private String withdrawalDate;

	private Role memberRole; // 스프링 시큐리티시 필수
	private String loginType;

}
