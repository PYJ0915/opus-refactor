package nknk.opus.project.common.util;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import nknk.opus.project.member.model.dto.Role;

@Component
@PropertySource("classpath:/config.properties")
public class JwtUtil {

	@Value("${jwt.secret}")
	private String secretKey;

	@Value("${jwt.expiration}")
	private long expirationTime;

	// 서명 키 생성
	private SecretKey getSigningKey() {
		byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
		return Keys.hmacShaKeyFor(keyBytes);
	}

	// 토큰 생성
	public String createToken(int memberNo, String memberEmail, Role memberRole) {
		Date now = new Date();
		Date expiryDate = new Date(now.getTime() + expirationTime);
		String role = memberRole.getKey();

		return Jwts.builder().subject(String.valueOf(memberNo)).claim("memberEmail", memberEmail).claim("role", role)
				.issuedAt(now).expiration(expiryDate).signWith(getSigningKey()).compact();
	}

	// 토큰 유효성 검사
	public boolean validateToken(String token) {
		try {
			Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	// 회원 번호 추출
	public String getMemberNo(String token) {
		return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().getSubject();
	}

	// 권한 추출
	public String getMemberRole(String token) {
		return Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token).getPayload().get("role",
				String.class);
	}
	
	/** 이메일 추출
	 * @param token
	 * @return
	 * by Sanghoo
	 */
	public String getMemberEmail(String token) {
	    return Jwts.parser().verifyWith(getSigningKey()).build()
	               .parseSignedClaims(token).getPayload()
	               .get("memberEmail", String.class);
	}
}