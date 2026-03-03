package nknk.opus.project.common.handler;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import nknk.opus.project.common.util.JwtUtil;
import nknk.opus.project.member.model.dto.Member;
import nknk.opus.project.member.model.mapper.MemberMapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

	private final JwtUtil jwtUtil;
	private final MemberMapper mapper;

	@Value("${app.oauth2.redirect-uri}")
	private String redirectUri;

	@Override
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException, ServletException {

		// OAuth2 인증 사용자 정보(이메일) 추출
		OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
		String email = (String) oAuth2User.getAttributes().get("email");

		// 이메일 기반 DB 사용자 정보 조회
		Member member = mapper.findByEmail(email);

		// 서비스 전용 JWT 토큰 생성 (회원번호, 이메일, 권한 포함)
		String token = jwtUtil.createToken(member.getMemberNo(), member.getMemberEmail(), member.getMemberRole());

		// 프론트엔드(React) 결과 페이지로 토큰 포함하여 리다이렉트
		String targetUrl = UriComponentsBuilder.fromUriString(redirectUri).queryParam("token", token).build()
				.encode(StandardCharsets.UTF_8).toUriString();

		getRedirectStrategy().sendRedirect(request, response, targetUrl);
	}
}