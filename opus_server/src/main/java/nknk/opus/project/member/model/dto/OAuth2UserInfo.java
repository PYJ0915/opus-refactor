package nknk.opus.project.member.model.dto;

import java.util.Map;

public interface OAuth2UserInfo {

	String getEmail();

	Map<String, Object> getAttributes(); // 구글이 준 원본 데이터 전체
}
