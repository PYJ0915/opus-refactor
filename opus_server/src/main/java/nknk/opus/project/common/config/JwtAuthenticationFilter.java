package nknk.opus.project.common.config;

import java.io.IOException;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import nknk.opus.project.common.util.JwtUtil;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    private void write401(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"message\":\"세션이 만료되었습니다. 다시 로그인해주세요.\"}");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();
        String authHeader = request.getHeader("Authorization");

        // 헤더 자체가 없으면: 여기서 막지 말고 시큐리티가 판단하게 둠
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        // "undefined/null/blank" 같은 이상 토큰이면 즉시 401 고정 (랜덤 증상 제거)
        if (token.isBlank() || token.equalsIgnoreCase("undefined") || token.equalsIgnoreCase("null")
                || token.equalsIgnoreCase("NaN")) {
            SecurityContextHolder.clearContext();
            write401(response);
            return;
        }

        try {
            boolean valid = jwtUtil.validateToken(token);

            if (!valid) {
                // 만료/위조/검증실패면 즉시 401
                SecurityContextHolder.clearContext();
                write401(response);
                return;
            }

            String memberNo = jwtUtil.getMemberNo(token);
            String role = jwtUtil.getMemberRole(token);

            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    memberNo, null, Collections.singletonList(new SimpleGrantedAuthority(role))
                );
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            write401(response);
            return;
        }

        filterChain.doFilter(request, response);
    }
}