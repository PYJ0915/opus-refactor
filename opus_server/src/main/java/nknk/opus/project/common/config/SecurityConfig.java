package nknk.opus.project.common.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.common.handler.OAuth2SuccessHandler;
import nknk.opus.project.member.model.service.CustomOAuth2UserService;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final CustomOAuth2UserService customOAuth2UserService;
	private final OAuth2SuccessHandler oauth2SuccessHandler;

	@Value("${cors.allowed.origins}")
	private String allowedOrigins;

	@Bean
	public BCryptPasswordEncoder bCryptPasswordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

		http.csrf(csrf -> csrf.disable()).formLogin(form -> form.disable()).httpBasic(basic -> basic.disable())
				.cors(cors -> cors.configurationSource(corsConfigurationSource()))

				// 401/403 JSON 고정
				.exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
					response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
					response.setContentType("application/json;charset=UTF-8");
					response.getWriter().write("{\"message\":\"세션이 만료되었습니다. 다시 로그인해주세요.\"}");
				}).accessDeniedHandler((request, response, accessDeniedException) -> {
					response.setStatus(HttpServletResponse.SC_FORBIDDEN);
					response.setContentType("application/json;charset=UTF-8");
					response.getWriter().write("{\"message\":\"권한이 없습니다.\"}");
				}))

				.authorizeHttpRequests(auth -> auth.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

						// 공개
						.requestMatchers("/auth/**", "/common/**").permitAll()
						.requestMatchers("/selections/**", "/images/**").permitAll().requestMatchers("/unveiling/**")
						.permitAll().requestMatchers("/login/oauth2/**", "/oauth2/**").permitAll()
						.requestMatchers("/chatbot/**").permitAll()
						.requestMatchers("/onStage/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/unveilings/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/bids/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/stage/bestReview").permitAll()
						.requestMatchers(HttpMethod.GET, "/reviews/likeCount").permitAll()

						// 게시판: GET만 공개, 나머지 인증 필요
						.requestMatchers(HttpMethod.GET, "/api/board/**").permitAll().requestMatchers("/api/board/**")
						.authenticated()

						// 운영자(Admin) API는 ADMIN만
						.requestMatchers("/admin/**").hasRole("ADMIN")

						.requestMatchers("/onStage/reviews/**").authenticated().requestMatchers("/stage/like")
						.authenticated().requestMatchers("/stage/dislike").authenticated()
						.requestMatchers("/stage/save").authenticated()
						

						// 그 외 전부 로그인 필요
						.anyRequest().authenticated())

				.oauth2Login(oauth -> oauth.userInfoEndpoint(userInfo -> userInfo.userService(customOAuth2UserService))
						.successHandler(oauth2SuccessHandler))

				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();

		List<String> origins = parseOrigins(allowedOrigins);

		log.info("=== CORS 설정 ===");
		log.info("Allowed Origins: {}", origins);

		config.setAllowedOrigins(origins);
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("*"));
		config.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	private List<String> parseOrigins(String originsStr) {
		if (originsStr == null || originsStr.trim().isEmpty()) {
			log.warn("CORS origins가 설정되지 않았습니다. 기본값 사용: http://localhost:5173");
			return List.of("http://localhost:5173");
		}

		return Arrays.stream(originsStr.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
	}
}