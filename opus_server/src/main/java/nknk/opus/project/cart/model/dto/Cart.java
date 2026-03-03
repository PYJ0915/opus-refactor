package nknk.opus.project.cart.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class Cart {
    private int cartNo;
    private int memberNo;
    private int goodsNo;
    private int goodsOptionNo;
    private int qty;
    private String cartAddDate;
    
    // JOIN 결과용 필드
    private String goodsName;
    private String thumbnail;
    private int unitPrice;
    private String goodsSize;
    private String goodsColor;
    private int stock;
    private int deliveryCost;
    
    // 수량 변경용 카드키
    private String cartKey; 
   
    public String getCartKey() {
        if (cartKey == null) {
            cartKey = generateCartKey(goodsNo, goodsOptionNo);
        }
        return cartKey;
    }
    
    public static String generateCartKey(int goodsNo, Integer goodsOptionNo) {
        if (goodsOptionNo == null || goodsOptionNo == 0) {
            return "goods_" + goodsNo;
        }
        return "goods_" + goodsNo + "_option_" + goodsOptionNo;
    }
}