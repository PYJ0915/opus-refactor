package nknk.opus.project.order.model.service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.common.exception.BusinessException;
import nknk.opus.project.order.model.dto.PaymentConfirmRequest;
import nknk.opus.project.order.model.dto.TossPaymentResponse;

@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
@PropertySource("classpath:/config.properties")
public class TossPaymentServiceImpl implements TossPaymentService {

	@Value("${toss.secret-key}")
	private String secretKey;

	@Value("${toss.api-url}")
	private String apiUrl;

	private final RestTemplate restTemplate;

	public TossPaymentServiceImpl() {
		this.restTemplate = new RestTemplate();
	}

	public TossPaymentResponse confirmPayment(PaymentConfirmRequest request) {

		String url = apiUrl + "/payments/confirm";

		log.info("===== 토스페이먼츠 결제 승인 시작 =====");
		log.info("API URL: {}", url);
		log.info("요청 데이터 - paymentKey: {}", request.getPaymentKey());
		log.info("요청 데이터 - orderId: {}", request.getOrderId());
		log.info("요청 데이터 - amount: {}", request.getAmount());

		try {

			// Basic 인증 헤더 생성
			String auth = secretKey + ":";
			String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

			log.info("Secret Key 길이: {}", secretKey.length());
			log.info("Secret Key 앞 4자리: {}****", secretKey.substring(0, Math.min(4, secretKey.length())));

			HttpHeaders headers = new HttpHeaders();
			headers.set("Authorization", "Basic " + encodedAuth);
			headers.setContentType(MediaType.APPLICATION_JSON);

			// 요청 body
			Map<String, Object> requestBody = new HashMap<>();
			requestBody.put("paymentKey", request.getPaymentKey());
			requestBody.put("orderId", request.getOrderId());
			requestBody.put("amount", request.getAmount());

			HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

			// 토스페이먼츠 API 호출
			ResponseEntity<TossPaymentResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity,
					TossPaymentResponse.class);

			log.info("===== 토스페이먼츠 API 응답 성공 =====");
			log.info("응답 상태 코드: {}", response.getStatusCode());
			log.info("응답 Body: {}", response.getBody());

			log.info("결제 승인 성공 - orderId: {}, paymentKey: {}", request.getOrderId(), request.getPaymentKey());

			return response.getBody();

		} catch (HttpClientErrorException e) {

			log.error("===== 토스페이먼츠 API 호출 실패 (HTTP 에러) =====");
			log.error("HTTP 상태 코드: {}", e.getStatusCode());
			log.error("HTTP 상태 텍스트: {}", e.getStatusText());
			log.error("응답 Body: {}", e.getResponseBodyAsString());
			log.error("에러 발생 orderId: {}", request.getOrderId());

			log.error("결제 승인 실패 - orderId: {}, error: {}", request.getOrderId(), e.getResponseBodyAsString());

			throw new BusinessException("결제 승인에 실패했습니다: " + e.getResponseBodyAsString());
		} catch (Exception e) {
			log.error("===== 결제 승인 중 예상치 못한 오류 발생 =====");
			log.error("에러 타입: {}", e.getClass().getName());
			log.error("에러 메시지: {}", e.getMessage());
			log.error("결제 승인 중 오류 발생", e);
			e.printStackTrace();
			throw new BusinessException("결제 승인 중 오류가 발생했습니다.");
		}

	}

	@Override
	public String getSecretKey() {
		return this.secretKey;
	}

	/**
	 * 결제 취소
	 */
	@Override
	public TossPaymentResponse cancelPayment(String paymentKey, String cancelReason) {
		log.info("===== 토스페이먼츠 결제 취소 요청 =====");
		log.info("paymentKey: {}", paymentKey);
		log.info("cancelReason: {}", cancelReason);

		try {
			// 1. HTTP 헤더 설정
			HttpHeaders headers = createHeaders();

			// 2. 요청 바디 설정
			Map<String, Object> requestBody = new HashMap<>();
			requestBody.put("cancelReason", cancelReason);

			HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

			// 3. 토스페이먼츠 API 호출 (POST /v1/payments/{paymentKey}/cancel)
			String url = apiUrl + "/payments/" + paymentKey + "/cancel";

			ResponseEntity<TossPaymentResponse> response = restTemplate.exchange(url, HttpMethod.POST, entity,
					TossPaymentResponse.class);

			log.info("===== 토스페이먼츠 결제 취소 성공 =====");
			log.info("응답 상태 코드: {}", response.getStatusCode());
			log.info("응답 Body: {}", response.getBody());

			return response.getBody();

		} catch (Exception e) {
			log.error("===== 토스페이먼츠 결제 취소 실패 =====", e);
			throw new BusinessException("결제 취소 중 오류가 발생했습니다: " + e.getMessage());
		}
	}

	/**
	 * HTTP 헤더 생성 (인증 정보 포함)
	 */
	private HttpHeaders createHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_JSON);

		// Base64 인코딩: secretKey:
		String auth = secretKey + ":";
		String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

		headers.set("Authorization", "Basic " + encodedAuth);

		return headers;
	}

}
