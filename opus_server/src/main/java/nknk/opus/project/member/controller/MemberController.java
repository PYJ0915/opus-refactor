package nknk.opus.project.member.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.common.util.JwtUtil;
import nknk.opus.project.member.model.dto.Member;
import nknk.opus.project.member.model.service.MemberService;

@RestController
@RequestMapping("/auth")
@Slf4j
@RequiredArgsConstructor
public class MemberController {

	private final MemberService service;
	private final JwtUtil jwtUtil;
	private final BCryptPasswordEncoder encoder;

	// ✅ 비밀번호 정책: 영문+숫자+특수(!@#$%^&*-_) 포함, 8~16자
	private static final String PW_REGEX =
			"^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*\\-_])[A-Za-z\\d!@#$%^&*\\-_]{8,16}$";

	private void validatePasswordPolicy(String pw) {
		if (pw == null || !pw.matches(PW_REGEX)) {
			throw new RuntimeException("비밀번호는 영문, 숫자, 특수문자(!@#$%^&*-_)를 포함하여 8~16자여야 합니다.");
		}
	}

	/** 토큰(로그인) 필수 체크 */
	private void requireAuth(Authentication authentication) {
		if (authentication == null || authentication.getPrincipal() == null) {
			throw new RuntimeException("로그인이 필요합니다.");
		}
	}

	/** Authentication에서 memberNo 추출 (JWT 필터가 principal에 String memberNo 넣어둔 전제) */
	private int getMemberNo(Authentication authentication) {
		requireAuth(authentication);
		return Integer.parseInt((String) authentication.getPrincipal());
	}

	/* 일반 로그인 */
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody Member inputMember,
			@RequestParam(value = "saveId", required = false) String saveId, HttpServletResponse resp) {
		try {
			Member loginMember = service.login(inputMember);

			if (loginMember == null) {
				log.warn("[로그인 실패] Email: {}", inputMember.getMemberEmail());
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("아이디 또는 비밀번호가 일치하지 않습니다.");
			}

			String token = jwtUtil.createToken(loginMember.getMemberNo(), loginMember.getMemberEmail(),
					loginMember.getMemberRole());

			Map<String, Object> result = new HashMap<>();
			result.put("success", true);
			result.put("token", token);

			Map<String, Object> memberInfo = new HashMap<>();
			memberInfo.put("memberNo", loginMember.getMemberNo());
			memberInfo.put("memberEmail", loginMember.getMemberEmail());
			memberInfo.put("memberTel", loginMember.getMemberTel());
			memberInfo.put("role", loginMember.getMemberRole() == null ? null : loginMember.getMemberRole().name());
			memberInfo.put("loginType", loginMember.getLoginType());
			result.put("member", memberInfo);

			// saveId 쿠키 처리(아이디 저장용)
			Cookie cookie = new Cookie("saveId", loginMember.getMemberEmail());
			cookie.setPath("/");
			cookie.setHttpOnly(false);

			if ("true".equals(saveId)) {
				cookie.setMaxAge(60 * 60 * 24 * 30);
			} else {
				cookie.setMaxAge(0);
			}
			resp.addCookie(cookie);

			log.info("[로그인 성공] Email: {}", loginMember.getMemberEmail());
			return ResponseEntity.ok(result);

		} catch (Exception e) {
			log.error("[로그인 에러] 사유: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
		}
	}

	/* 구글 소셜 로그인 */
	@PostMapping("/google")
	public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> payload) {
		try {
			String googleAccessToken = payload.get("accessToken");
			Member loginMember = service.loginGoogle(googleAccessToken);

			if (loginMember == null) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("구글 인증에 실패했습니다.");
			}

			Map<String, Object> result = new HashMap<>();

			// 신규 회원(추가정보 필요)
			if ("REQUIRED".equals(loginMember.getMemberTel())) {
				result.put("success", false);
				result.put("message", "ADDITIONAL_INFO_REQUIRED");
				result.put("email", loginMember.getMemberEmail());
				return ResponseEntity.ok(result);
			}

			// 기존 회원
			String token = jwtUtil.createToken(loginMember.getMemberNo(), loginMember.getMemberEmail(),
					loginMember.getMemberRole());

			result.put("success", true);
			result.put("token", token);

			Map<String, Object> memberInfo = new HashMap<>();
			memberInfo.put("memberNo", loginMember.getMemberNo());
			memberInfo.put("memberEmail", loginMember.getMemberEmail());
			memberInfo.put("memberTel", loginMember.getMemberTel());
			memberInfo.put("role", loginMember.getMemberRole() == null ? null : loginMember.getMemberRole().name());
			memberInfo.put("loginType", loginMember.getLoginType());
			result.put("member", memberInfo);

			log.info("[구글 로그인 성공] Email: {}", loginMember.getMemberEmail());
			return ResponseEntity.ok(result);

		} catch (Exception e) {
			log.error("[구글 로그인 에러] 사유: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류 발생");
		}
	}

	/* 연락처 중복 체크 */
	@PostMapping("/check-tel")
	public ResponseEntity<?> checkTel(@RequestBody Map<String, String> map) {
		String tel = map.get("memberTel");
		boolean isDuplicate = service.checkTel(tel);
		return ResponseEntity.ok(Map.of("duplicate", isDuplicate));
	}

	/* 이메일 중복 체크 */
	@PostMapping("/check-email")
	public ResponseEntity<Boolean> checkEmail(@RequestBody Map<String, String> map) {
		String email = map.get("email");
		boolean isDuplicate = service.checkEmail(email);

		if (isDuplicate)
			log.info("[이메일 중복] Email: {}", email);
		return ResponseEntity.ok(isDuplicate);
	}

	/* 이메일 인증번호 발송 */
	@PostMapping("/email-send")
	public ResponseEntity<String> sendEmail(@RequestBody Map<String, String> map) {
		String email = map.get("email");
		try {
			service.sendEmail(email);
			log.info("[인증번호 발송 성공] Email: {}", email);
			return ResponseEntity.ok("인증번호가 발송되었습니다.");
		} catch (Exception e) {
			log.error("[인증번호 발송 에러] Email: {}, 사유: {}", email, e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	/* 이메일 인증번호 확인 */
	@PostMapping("/email-verify")
	public ResponseEntity<Boolean> verifyCode(@RequestBody Map<String, String> map) {
		String email = map.get("email");
		String code = map.get("code");
		boolean isMatched = service.verifyCode(email, code);

		if (isMatched)
			log.info("[이메일 인증 성공] Email: {}", email);
		else
			log.warn("[이메일 인증 실패] 인증번호 불일치 (Email: {})", email);

		return ResponseEntity.ok(isMatched);
	}

	/* 회원가입 */
	@PostMapping("/signup")
	public ResponseEntity<?> signup(@RequestBody Member inputMember) {
		try {
			// ✅ 추가: 비밀번호 정책 검증
			validatePasswordPolicy(inputMember.getMemberPw());

			inputMember.setLoginType("NORMAL");
			int result = service.signup(inputMember);
			if (result > 0) {
				log.info("[회원가입 성공] Email: {}", inputMember.getMemberEmail());
				return ResponseEntity.ok("회원가입에 성공했습니다.");
			}
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("회원가입에 실패했습니다.");
		} catch (Exception e) {
			log.error("[회원가입 에러] 사유: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		}
	}

	/* 구글 회원가입 완료 및 자동 로그인 */
	@PostMapping("/google/register")
	public ResponseEntity<?> googleRegister(@RequestBody Member inputMember) {
		try {
			int result = service.googleRegister(inputMember);

			if (result > 0) {
				log.info("[구글 회원가입 성공] Email: {}", inputMember.getMemberEmail());

				Member loginMember = service.getMemberByEmail(inputMember.getMemberEmail());

				String token = jwtUtil.createToken(loginMember.getMemberNo(), loginMember.getMemberEmail(),
						loginMember.getMemberRole());

				Map<String, Object> response = new HashMap<>();
				response.put("success", true);
				response.put("token", token);
				response.put("member", loginMember);

				return ResponseEntity.ok(response);
			}
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("구글 가입 실패");
		} catch (Exception e) {
			log.error("[구글 가입 에러] 사유: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
		}
	}

	/** 내 정보 조회 (소셜 로그인 후 member 정보 로드용) */
	@GetMapping("/me")
	public ResponseEntity<?> getMe(Authentication authentication) {
		try {
			int memberNo = getMemberNo(authentication);
			Member member = service.getMemberByMemberNo(memberNo);

			if (member == null) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원 정보를 찾을 수 없습니다.");
			}

			Map<String, Object> memberInfo = new HashMap<>();
			memberInfo.put("memberNo", member.getMemberNo());
			memberInfo.put("memberEmail", member.getMemberEmail());
			memberInfo.put("memberTel", member.getMemberTel());
			memberInfo.put("role", member.getMemberRole() == null ? null : member.getMemberRole().name());
			memberInfo.put("loginType", member.getLoginType());

			return ResponseEntity.ok(memberInfo);
		} catch (Exception e) {
			log.error("[내 정보 조회 에러] 사유: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증 실패");
		}
	}

	/** LOGIN_TYPE=NORMAL 응찰 시 비밀번호 검증 */
	@PostMapping("/verify-password")
	public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> body, Authentication authentication) {
		try {
			int memberNo = getMemberNo(authentication);
			String inputPw = body.get("memberPw");

			if (inputPw == null || inputPw.isBlank()) {
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("비밀번호를 입력해주세요.");
			}

			String savedPw = service.getCurrentPw(memberNo);

			if (savedPw == null) {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("회원 정보를 찾을 수 없습니다.");
			}

			if (!encoder.matches(inputPw, savedPw)) {
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("비밀번호가 일치하지 않습니다.");
			}

			return ResponseEntity.ok("본인 확인이 완료되었습니다.");

		} catch (Exception e) {
			log.error("[비밀번호 검증 에러] 사유: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
		}
	}

	/* 로그아웃 */
	@GetMapping("/logout")
	public ResponseEntity<?> logout() {
		log.info("[로그아웃 완료]");
		return ResponseEntity.ok("로그아웃 되었습니다.");
	}

	/* 연락처 변경 */
	@PostMapping("/updateTel")
	public ResponseEntity<String> updateTel(@RequestBody Member inputMember, Authentication authentication) {
		try {
			int memberNo = getMemberNo(authentication);
			inputMember.setMemberNo(memberNo); // ✅ 본인으로 고정

			int result = service.updateTel(inputMember);
			if (result > 0) {
				log.info("[연락처 변경 성공] MemberNo: {}", memberNo);
				return ResponseEntity.ok("연락처가 변경되었습니다.");
			}
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("연락처 변경에 실패했습니다.");

		} catch (Exception e) {
			log.error("[연락처 변경 에러] 사유: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
		}
	}

	/* 비밀번호 변경 */
	@PostMapping("/changePw")
	public ResponseEntity<?> changePw(@RequestBody Map<String, Object> param, Authentication authentication) {
		try {
			int memberNo = getMemberNo(authentication);
			param.put("memberNo", memberNo); // ✅ 본인으로 고정

			// ✅ 추가: 새 비밀번호 정책 검증
			String newPw = (String) param.get("newPw");
			validatePasswordPolicy(newPw);

			int result = service.changePw(param);

			if (result > 0) {
				log.info("[비밀번호 변경 성공] MemberNo: {}", memberNo);
				return ResponseEntity.ok("비밀번호가 변경되었습니다.");
			} else {
				log.warn("[비밀번호 변경 실패] 현재 비밀번호 불일치 (MemberNo: {})", memberNo);
				return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("현재 비밀번호가 일치하지 않습니다.");
			}

		} catch (RuntimeException e) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
		} catch (Exception e) {
			log.error("[비밀번호 변경 에러] 사유: {}", e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다");
		}
	}

	/* 경매/주문 건수 체크 */
	@GetMapping("/withdraw-check")
	public ResponseEntity<?> checkWithdrawStatus(Authentication authentication) {
		int memberNo = getMemberNo(authentication);

		int activeCount = service.getActiveTransactionCount(memberNo);

		Map<String, Object> response = new HashMap<>();
		response.put("activeCount", activeCount);
		return ResponseEntity.ok(response);
	}

	/* 회원 탈퇴 */
	@PostMapping("/withdraw")
	public ResponseEntity<?> withdrawMember(Authentication authentication) {
		int memberNo = getMemberNo(authentication);

		if (service.getActiveTransactionCount(memberNo) > 0) {
			log.info("[탈퇴 거부] 진행 중인 거래 존재 (MemberNo: {})", memberNo);
			return ResponseEntity.badRequest().body("진행 중인 거래가 있어 탈퇴할 수 없습니다.");
		}

		boolean result = service.withdrawMember(memberNo);

		if (result) {
			log.info("[회원 탈퇴 완료] MemberNo: {}", memberNo);
			return ResponseEntity.ok("회원 탈퇴가 완료되었습니다.");
		} else {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("탈퇴 처리 중 오류가 발생했습니다.");
		}
	}
}