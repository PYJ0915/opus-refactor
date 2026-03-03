package nknk.opus.project.myPage.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UnveilingHistoryResponse {

    private int unveilingNo;         // 경매 상세 페이지 이동용
    private String unveilingTitle;   // 작품명
    private String productionArtist; // 작가명
    private String thumbUrl;         // 썸네일

    private int myMaxBidPrice;       // 내 최고 응찰가 (같은 경매 여러 번 응찰 시 MAX)
    private String bidDate;          // 해당 최고 응찰의 응찰 일시

    private String unveilingStatus;  // LIVE / ENDED / NO_WINNER
    private int finalizedFl;         // 낙찰 확정 여부 (0 or 1)
    private int winnerMemberNo;      // 낙찰자 회원번호 (본인 여부 판단용)
    private int finalPrice;          // 낙찰가

    private String paymentStatus;    // PENDING / PAID / EXPIRED / null

}
