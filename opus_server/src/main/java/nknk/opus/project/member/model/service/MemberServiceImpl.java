package nknk.opus.project.member.model.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.member.model.dto.Member;
import nknk.opus.project.member.model.dto.Role;
import nknk.opus.project.member.model.mapper.MemberMapper;

@Service
@Slf4j
public class MemberServiceImpl implements MemberService {

	@Autowired
	private MemberMapper mapper;

	@Autowired
	private BCryptPasswordEncoder encoder;

	@Autowired
	private JavaMailSender mailSender;

	private final Map<String, String> authStorage = new HashMap<>();

	/* 로그인 */
	@Override
	public Member login(Member inputMember) {
		Member loginMember = mapper.login(inputMember.getMemberEmail());
		if (loginMember == null)
			return null;

		if (!encoder.matches(inputMember.getMemberPw(), loginMember.getMemberPw())) {
			return null;
		}

		loginMember.setMemberPw(null);
		return loginMember;
	}

	/* 연락처 중복 체크 */
	@Override
	public boolean checkTel(String tel) {
		return mapper.checkTel(tel) > 0;
	}

	/* 이메일 중복 체크 */
	@Override
	public boolean checkEmail(String email) {
		return mapper.checkEmail(email) > 0;
	}

	/* 이메일 인증번호 발송 */
	@Override
	public void sendEmail(String email) {
		if (checkEmail(email)) {
			throw new RuntimeException("사용 중인 이메일입니다.");
		}

		String code = String.format("%06d", new Random().nextInt(1000000));
		authStorage.put(email, code);

		try {
			String htmlContent = """
					<!DOCTYPE html>
					<html>
					<body style="margin:0; padding:0; background-color:#f3f4f6; font-family:'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;">
					    <div style="max-width:560px; margin:32px auto; background-color:#ffffff; border:1px solid #e5e7eb;">
					        <div style="background-color:#111827; padding:28px 36px; display:flex; justify-content:space-between; align-items:center;">
					            <span style="font-size:20px; font-weight:900; color:#ffffff;">OPUS</span>
					            <span style="font-size:11px; color:rgba(255,255,255,0.45); text-transform:uppercase;">Email Verification</span>
					        </div>
					        <div style="padding:36px 36px 28px;">
					            <p style="font-size:13px; color:#6b7280; margin:0 0 4px;">안녕하세요, OPUS입니다.</p>
					            <h1 style="font-size:20px; font-weight:900; color:#111827; margin:0 0 20px; line-height:1.35;">회원가입 인증번호를<br/>안내해 드립니다.</h1>
					            <p style="font-size:14px; color:#374151; line-height:1.8; margin:0 0 28px;">OPUS 회원가입을 진행해 주셔서 감사드리며,<br/>아래 인증번호를 정확히 입력해 주세요.</p>

					            <div style="background-color:#f9fafb; border:1px solid #e5e7eb; border-radius:4px; padding:26px; text-align:center; margin-bottom:24px;">
					                <span style="font-size:11px; font-weight:700; color:#9ca3af; text-transform:uppercase; display:block; margin-bottom:10px;">인증번호</span>
					                <div style="font-size:40px; font-weight:900; color:#111827; letter-spacing:8px;">%s</div>
					                <p style="font-size:12px; color:#6b7280; margin-top:10px;">유효시간 5분</p>
					            </div>

					            <div style="background-color:#fffbeb; border:1px solid #fde68a; border-radius:4px; padding:12px 14px; margin-bottom:24px; font-size:12px; color:#92400e; line-height:1.7;">
					                ⚠ 본 인증번호는 발송 시점으로부터 <strong>5분간만 유효</strong>합니다. 타인에게 절대 알려주지 마세요.
					            </div>
					            <hr style="border:0; border-top:1px solid #f3f4f6; margin:24px 0;"/>
					            <p style="font-size:12px; color:#6b7280; line-height:1.8;">본인이 요청하지 않은 경우 이 메일을 무시하셔도 됩니다.</p>
					        </div>
					        <div style="background-color:#f9fafb; border-top:1px solid #e5e7eb; padding:20px 36px;">
					            <p style="font-size:13px; font-weight:900; color:#111827; margin:0 0 8px;">OPUS</p>
					            <p style="font-size:11px; color:#9ca3af; margin:0; line-height:1.7;">© 2026 OPUS. All rights reserved.<br/>본 메일은 발신 전용입니다.</p>
					        </div>
					    </div>
					</body>
					</html>
					"""
					.formatted(code);

			MimeMessage mimeMessage = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

			helper.setTo(email);
			helper.setSubject("[OPUS] 회원가입을 위한 인증번호 안내");
			helper.setText(htmlContent, true);

			mailSender.send(mimeMessage);

		} catch (Exception e) {
			log.error("이메일 발송 실패: {}", e.getMessage());
			throw new RuntimeException("이메일 발송 중 오류 발생");
		}
	}

	/* 이메일 인증번호 확인 */
	@Override
	public boolean verifyCode(String email, String code) {
		String savedCode = authStorage.get(email);
		return savedCode != null && savedCode.equals(code);
	}

	/* 회원가입 */
	@Transactional(rollbackFor = Exception.class)
	@Override
	public int signup(Member inputMember) {
		if (inputMember.getMemberRole() == null)
			inputMember.setMemberRole(Role.MEMBER);

		if (inputMember.getLoginType() == null)
			inputMember.setLoginType("NORMAL");

		String pw = inputMember.getMemberPw();

		String pwRegex = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*\\-_])[A-Za-z\\d!@#$%^&*\\-_]{8,16}$";
		if (pw == null || !pw.matches(pwRegex)) {
			throw new RuntimeException("비밀번호는 영문, 숫자, 특수문자(!@#$%^&*-_)를 포함하여 8~16자여야 합니다.");
		}

		inputMember.setMemberPw(encoder.encode(pw));
		return mapper.signup(inputMember);
	}

	/* 연락처 변경 */
	@Transactional(rollbackFor = Exception.class)
	@Override
	public int updateTel(Member inputMember) {
		return mapper.updateTel(inputMember);
	}

	/* 비밀번호 변경 */
	@Transactional(rollbackFor = Exception.class)
	@Override
	public int changePw(Map<String, Object> param) {
		int memberNo = Integer.parseInt(String.valueOf(param.get("memberNo")));
		String currentPw = (String) param.get("currentPw");
		String newPw = (String) param.get("newPw");

		String pwRegex = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*\\-_])[A-Za-z\\d!@#$%^&*\\-_]{8,16}$";
		if (newPw == null || !newPw.matches(pwRegex)) {
			throw new RuntimeException("새 비밀번호는 영문, 숫자, 특수문자(!@#$%^&*-_)를 포함하여 8~16자여야 합니다.");
		}

		String savedPw = mapper.selectCurrentPw(memberNo);
		if (savedPw == null) {
			throw new RuntimeException("회원 정보를 찾을 수 없습니다.");
		}

		if (!encoder.matches(currentPw, savedPw)) {
			return 0; // 현재 비밀번호 불일치
		}

		param.put("newPw", encoder.encode(newPw));
		param.put("memberNo", memberNo);
		return mapper.changePw(param);
	}

	/* 경매/주문 건수 체크 */
	@Override
	public int getActiveTransactionCount(int memberNo) {
		return mapper.getActiveTransactionCount(memberNo);
	}

	/* 회원 탈퇴 */
	@Transactional(rollbackFor = Exception.class)
	@Override
	public boolean withdrawMember(int memberNo) {
		return mapper.withdrawMember(memberNo) > 0;
	}

	/* 구글 소셜 로그인 */
	@Override
	public Member loginGoogle(String accessToken) {
		String googleUserInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
		RestTemplate restTemplate = new RestTemplate();
		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);

		try {
			ResponseEntity<Map<String, Object>> response = restTemplate.exchange(googleUserInfoUrl, HttpMethod.GET,
					new HttpEntity<>(headers), new ParameterizedTypeReference<Map<String, Object>>() {
					});

			Map<String, Object> googleUser = response.getBody();

			if (googleUser == null)
				return null;

			String email = (String) googleUser.get("email");
			Member loginMember = mapper.login(email);

			if (loginMember == null) {
				Member temp = new Member();
				temp.setMemberEmail(email);
				temp.setMemberTel("REQUIRED");
				return temp;
			}

			if (loginMember.getLoginType() == null)
				loginMember.setLoginType("GOOGLE");

			return loginMember;

		} catch (Exception e) {
			log.error("구글 로그인 서비스 에러: {}", e.getMessage());
			return null;
		}
	}

	/* 구글 소셜 회원가입 */
	@Transactional(rollbackFor = Exception.class)
	@Override
	public int googleRegister(Member inputMember) {
		inputMember.setMemberPw(encoder.encode("GOOGLE_SOCIAL_USER"));
		inputMember.setLoginType("GOOGLE");
		if (inputMember.getMemberRole() == null)
			inputMember.setMemberRole(Role.MEMBER);

		return mapper.signup(inputMember);
	}

	/* 가입 후 조회 */
	@Override
	public Member getMemberByEmail(String email) {
		return mapper.findByEmail(email);
	}

	@Override
	public Member getMemberByMemberNo(int memberNo) {
		return mapper.findByMemberNo(memberNo);
	}

	@Override
	public String getCurrentPw(int memberNo) {
		return mapper.selectCurrentPw(memberNo);
	}
}