package nknk.opus.project.common.util;

/**
 * 경매 공통 유틸리티
 * - calcTick : 현재가 구간별 호가(응찰 단위) 반환
 */
public final class UnveilingUtils {

    private UnveilingUtils() {} // 인스턴스화 방지

    /**
     * 호가표: 현재가 구간별 응찰단위
     *   5백만 원 미만         : 100,000
     *   5백만 이상 1천만 미만  : 500,000
     *   1천만 이상 3천만 미만  : 1,000,000
     *   3천만 이상 5천만 미만  : 2,000,000
     *   5천만 이상             : 5,000,000
     */
    public static int calcTick(int currentPrice) {
    
    	if (currentPrice < 5_000_000)  return 100_000;
        if (currentPrice < 10_000_000) return 500_000;
        if (currentPrice < 30_000_000) return 1_000_000;
        if (currentPrice < 50_000_000) return 2_000_000;
        return 5_000_000;
    }
    
    
    
}