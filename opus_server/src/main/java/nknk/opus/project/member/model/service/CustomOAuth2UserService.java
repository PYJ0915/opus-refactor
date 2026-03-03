package nknk.opus.project.member.model.service;

import nknk.opus.project.member.model.dto.GoogleUserInfo;
import nknk.opus.project.member.model.dto.Member;
import nknk.opus.project.member.model.dto.OAuth2UserInfo;
import nknk.opus.project.member.model.dto.Role;
import nknk.opus.project.member.model.mapper.MemberMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

	private final MemberMapper mapper;

	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

		OAuth2User oAuth2User = super.loadUser(userRequest);
		OAuth2UserInfo userInfo = new GoogleUserInfo(oAuth2User.getAttributes());
		String email = userInfo.getEmail();

		Member member = mapper.findByEmail(email);

		if (member == null) {
			member = Member.builder().memberEmail(email).memberRole(Role.MEMBER).loginType("GOOGLE")
					.memberDelFl("N").build();

			mapper.insertMember(member);

			member = mapper.findByEmail(email);

		}

		return new DefaultOAuth2User(Collections.singleton(new SimpleGrantedAuthority(member.getMemberRole().getKey())),
				oAuth2User.getAttributes(), "email");
	}
}