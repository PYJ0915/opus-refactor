package nknk.opus.project.scheduler;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.stage.model.dto.StageCache;
import nknk.opus.project.stage.model.service.StageService;

@Slf4j
@Component
@RequiredArgsConstructor
public class OnStageScheduler {

    private final RestTemplate restTemplate = new RestTemplate();
    private final StageService stageService;

    @Value("${kcisa.service-key}")
    private String kcisaKey;

    @Value("${kopis.service-key}")
    private String kopisKey;

    // ── 전시 동기화: 매일 새벽 3시 ──
    @Scheduled(cron = "0 0 3 * * *")
    public void syncExhibitionCache() {
        log.info("[스케줄러] 전시 캐시 동기화 시작");
        int total = 0;

        for (int page = 1; page <= 20; page++) {
            try {
                URI uri = UriComponentsBuilder
                    .fromUriString("https://api.kcisa.kr/openapi/API_CCA_145/request")
                    .queryParam("serviceKey", kcisaKey)
                    .queryParam("numOfRows", 20)
                    .queryParam("pageNo", page)
                    .build().encode().toUri();

                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "Mozilla/5.0");
                headers.set("Accept", "*/*");

                ResponseEntity<byte[]> response = restTemplate.exchange(
                    uri, HttpMethod.GET, new HttpEntity<>(headers), byte[].class
                );

                if (response.getBody() == null) break;

                String xml = new String(response.getBody(), "UTF-8");
                List<StageCache> items = parseExhibitionXml(xml);

                if (items.isEmpty()) break;

                for (StageCache item : items) {
                    stageService.upsertStageCache(item);
                }

                total += items.size();
                log.info("[스케줄러] 전시 {}페이지 처리 완료 ({}건)", page, items.size());

                if (items.size() < 20) break; // 마지막 페이지

                Thread.sleep(500); // API 과부하 방지

            } catch (Exception e) {
                log.error("[스케줄러] 전시 {}페이지 처리 실패: {}", page, e.getMessage());
                break;
            }
        }

        log.info("[스케줄러] 전시 캐시 동기화 완료 - 총 {}건", total);
    }

    // ── 뮤지컬 동기화: 매일 새벽 3시 30분 ──
    @Scheduled(cron = "0 30 3 * * *")
    public void syncMusicalCache() {
        log.info("[스케줄러] 뮤지컬 캐시 동기화 시작");

        // kopisAPI.js의 dateRange와 동일한 구간
        String[][] dateRanges = buildDateRanges();
        int total = 0;

        for (String[] range : dateRanges) {
            try {
                URI uri = UriComponentsBuilder
                    .fromUriString("https://www.kopis.or.kr/openApi/restful/pblprfr")
                    .queryParam("service", kopisKey)
                    .queryParam("stdate", range[0])
                    .queryParam("eddate", range[1])
                    .queryParam("cpage", 1)
                    .queryParam("rows", 100)
                    .queryParam("shcate", "GGGA")
                    .queryParam("signgucode", 11)
                    .queryParam("kidstate", "N")
                    .build().encode().toUri();

                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "Mozilla/5.0");

                ResponseEntity<byte[]> response = restTemplate.exchange(
                    uri, HttpMethod.GET, new HttpEntity<>(headers), byte[].class
                );

                if (response.getBody() == null) continue;

                String xml = new String(response.getBody(), "EUC-KR");
                List<StageCache> items = parseMusicalXml(xml);

                for (StageCache item : items) {
                    stageService.upsertStageCache(item);
                }

                total += items.size();
                log.info("[스케줄러] 뮤지컬 구간 {}-{} 처리 완료 ({}건)",
                    range[0], range[1], items.size());

                Thread.sleep(500);

            } catch (Exception e) {
                log.error("[스케줄러] 뮤지컬 구간 처리 실패: {}", e.getMessage());
            }
        }

        log.info("[스케줄러] 뮤지컬 캐시 동기화 완료 - 총 {}건", total);
    }

    // ── XML 파싱: 전시 ──
    private List<StageCache> parseExhibitionXml(String xml) {
        List<StageCache> result = new ArrayList<>();
        try {
            DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
            Document doc = db.parse(new ByteArrayInputStream(xml.getBytes("UTF-8")));
            NodeList items = doc.getElementsByTagName("item");

            for (int i = 0; i < items.getLength(); i++) {
                Element item = (Element) items.item(i);
                result.add(StageCache.builder()
                    .stageNo(getText(item, "LOCAL_ID"))
                    .stageType("exhibition")
                    .stageTitle(getText(item, "TITLE"))
                    .stageThumbnail(getText(item, "IMAGE_OBJECT"))
                    .stagePeriod(getText(item, "PERIOD"))
                    .stagePlace(getText(item, "CNTC_INSTT_NM"))
                    .build());
            }
        } catch (Exception e) {
            log.error("[스케줄러] 전시 XML 파싱 실패: {}", e.getMessage());
        }
        return result;
    }

    // ── XML 파싱: 뮤지컬 ──
    private List<StageCache> parseMusicalXml(String xml) {
        List<StageCache> result = new ArrayList<>();
        try {
            // EUC-KR 선언을 UTF-8로 교체 후 파싱
            xml = xml.replaceAll("(?i)encoding=\"EUC-KR\"", "encoding=\"UTF-8\"");
            DocumentBuilder db = DocumentBuilderFactory.newInstance().newDocumentBuilder();
            Document doc = db.parse(new ByteArrayInputStream(xml.getBytes("UTF-8")));
            NodeList dbs = doc.getElementsByTagName("db");

            for (int i = 0; i < dbs.getLength(); i++) {
                Element item = (Element) dbs.item(i);
                String from = getText(item, "prfpdfrom");
                String to   = getText(item, "prfpdto");
                result.add(StageCache.builder()
                    .stageNo(getText(item, "mt20id"))
                    .stageType("musical")
                    .stageTitle(getText(item, "prfnm"))
                    .stageThumbnail(getText(item, "poster"))
                    .stagePeriod(from + " ~ " + to)
                    .stagePlace(getText(item, "fcltynm"))
                    .build());
            }
        } catch (Exception e) {
            log.error("[스케줄러] 뮤지컬 XML 파싱 실패: {}", e.getMessage());
        }
        return result;
    }

    // ── kopisAPI.js의 dateRange 동일 구간 생성 ──
    private String[][] buildDateRanges() {
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.format.DateTimeFormatter fmt =
            java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd");

        return new String[][] {
            { today.minusDays(15).format(fmt), today.minusDays(1).format(fmt) },
            { today.format(fmt),               today.plusDays(31).format(fmt)  },
            { today.plusDays(32).format(fmt),  today.plusDays(62).format(fmt)  },
            { today.plusDays(63).format(fmt),  today.plusDays(93).format(fmt)  },
        };
    }

    private String getText(Element el, String tag) {
        NodeList nl = el.getElementsByTagName(tag);
        return (nl.getLength() > 0) ? nl.item(0).getTextContent().trim() : "";
    }
}
