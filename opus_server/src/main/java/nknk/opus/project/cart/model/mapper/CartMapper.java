package nknk.opus.project.cart.model.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import nknk.opus.project.cart.model.dto.Cart;

/**
 * 장바구니 매퍼 인터페이스
 */
@Mapper
public interface CartMapper {

    /**
     * 장바구니 목록 조회
     * @param memberNo 회원 번호
     * @return 장바구니 목록 (상품 정보 포함)
     */
    List<Cart> selectCartItems(int memberNo);

    /**
     * 장바구니 단일 항목 조회
     * @param cartNo 장바구니 번호
     * @return 장바구니 항목
     */
    Cart selectCartByNo(int cartNo);

    /**
     * 동일 상품+옵션 조회
     * @param memberNo 회원 번호
     * @param goodsNo 상품 번호
     * @param goodsOptionNo 옵션 번호 (null 가능)
     * @return 기존 장바구니 항목 (없으면 null)
     */
    Cart selectCartByGoodsAndOption(
        @Param("memberNo") int memberNo,
        @Param("goodsNo") int goodsNo,
        @Param("goodsOptionNo") Integer goodsOptionNo
    );

    /**
     * 장바구니에 상품 추가
     * @param cart 장바구니 정보
     * @return 추가된 행 수
     */
    int insertCart(Cart cart);

    /**
     * 장바구니 수량 변경
     * @param cart 장바구니 정보 (cartNo, qty 필수)
     * @return 수정된 행 수
     */
    int updateCartQty(Cart cart);

    /**
     * 장바구니 항목 삭제 (단일)
     * @param cartNo 장바구니 번호
     * @return 삭제된 행 수
     */
    int deleteCart(int cartNo);

    /**
     * 장바구니 전체 삭제 (회원별)
     * @param memberNo 회원 번호
     * @return 삭제된 행 수
     */
    int deleteCartByMember(int memberNo);

    /**
     * 장바구니 선택 항목 삭제 (여러 개)
     * @param cartNos 장바구니 번호 목록
     * @return 삭제된 행 수
     */
    int deleteCartItems(List<Integer> cartNos);

    /**
     * 장바구니 항목 수 조회
     * @param memberNo 회원 번호
     * @return 장바구니 항목 수
     */
    int countCartItems(int memberNo);
}