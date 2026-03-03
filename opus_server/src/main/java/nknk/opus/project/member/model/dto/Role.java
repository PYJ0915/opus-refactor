package nknk.opus.project.member.model.dto;

import lombok.Getter;

@Getter
public enum Role {
    // 스프링 시큐리티 권한 이름 앞에 "ROLE_"이 붙어야 됨
    MEMBER("ROLE_MEMBER", "일반회원"),
    COMPANY("ROLE_COMPANY", "기업회원"),
    ADMIN("ROLE_ADMIN", "관리자");

    private final String key;
    private final String title;

    // Enum은 생성자를 직접 써줘야 에러안남
    Role(String key, String title) {
        this.key = key;
        this.title = title;
    }
}