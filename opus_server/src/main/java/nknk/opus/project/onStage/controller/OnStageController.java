package nknk.opus.project.onStage.controller;

import java.net.URI;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
	
@RestController
@RequestMapping("/onStage")
public class OnStageController {
    private final RestTemplate restTemplate = new RestTemplate();

    // 전시 목록 조회
    @GetMapping("/exhibitions")
    public ResponseEntity<?> getExhibitions(@RequestParam("serviceKey") String serviceKey, @RequestParam(defaultValue = "1") int pageNo) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString("https://api.kcisa.kr/openapi/API_CCA_145/request")
                    .queryParam("serviceKey", serviceKey)
                    .queryParam("numOfRows", 20)
                    .queryParam("pageNo", pageNo)
                    .build()
                    .encode()
                    .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            headers.set("Accept", "*/*");
            headers.set("Connection", "keep-alive");
            headers.set("Referer", "https://www.kcisa.kr");

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<byte[]> response = restTemplate.exchange(uri, HttpMethod.GET, entity, byte[].class);

            byte[] bytes = response.getBody();

            if (bytes == null) {
                return ResponseEntity.status(500).body("KCISA 응답이 비어있습니다.");
            }

            String body = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/xml; charset=UTF-8")
                    .body(body);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("외부 전시 API 호출 실패: " + e.getMessage());
        }
    }
    
    // 뮤지컬 목록 조회
    @GetMapping("/musicals")
    public ResponseEntity<String> getMusicals (@RequestParam("service") String serviceKey, @RequestParam("stdate") String startDate, @RequestParam("eddate") String endDate,
    		@RequestParam(name="cpage", defaultValue="1") int pageNo, @RequestParam(defaultValue = "100") int rows, @RequestParam(required = false, name="shprfnm") String search) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString("https://www.kopis.or.kr/openApi/restful/pblprfr")
                .queryParam("service", serviceKey)
                .queryParam("stdate", startDate)
                .queryParam("eddate", endDate)
                .queryParam("cpage", pageNo)
                .queryParam("rows", rows)
                .queryParam("shcate", "GGGA")
                .queryParam("signgucode", 11)
                .queryParam("kidstate", "N");

        if (search != null && !search.isBlank()) {
            builder.queryParam("shprfnm", search);
        }

        URI uri = builder.build().encode().toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0");
        
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<byte[]> response = restTemplate.exchange(uri, HttpMethod.GET, entity, byte[].class);

        try {
        	byte[] bytes = response.getBody();
        	
        	if (bytes == null) {
        	    return ResponseEntity.status(500).body("외부 API 응답이 비어있습니다.");
        	}

        	String body = new String(bytes, "EUC-KR");

        	if (body.contains("��")) {
        	    body = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        	}

        	return ResponseEntity.ok().header("Content-Type", "application/xml; charset=UTF-8").body(body);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("인코딩 변환 실패");
        }
    }
    
    @GetMapping("/musicals/detail")
    public ResponseEntity<String> getMusicalDetail(@RequestParam("service") String serviceKey,@RequestParam("mt20id") String mt20id) {

        URI uri = UriComponentsBuilder
        		.fromUriString("https://www.kopis.or.kr/openApi/restful/pblprfr")
        		.path("/" + mt20id)
                .queryParam("service", serviceKey)
                .build()
                .encode()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0");

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<byte[]> response =
                restTemplate.exchange(uri, HttpMethod.GET, entity, byte[].class);

        try {
        	byte[] bytes = response.getBody();
        	
        	if (bytes == null) {
        	    return ResponseEntity.status(500).body("외부 API 응답이 비어있습니다.");
        	}

        	String body = new String(bytes, "EUC-KR");

        	if (body.contains("��")) {
        	    body = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        	}

        	return ResponseEntity.ok().header("Content-Type", "application/xml; charset=UTF-8").body(body);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("상세 조회 실패");
        }
    }
}