package nknk.opus.project.cart.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.cart.model.dto.Cart;
import nknk.opus.project.cart.model.mapper.CartMapper;
import nknk.opus.project.common.exception.BusinessException;
import nknk.opus.project.common.exception.ResourceNotFoundException;

@Slf4j
@Service
@Transactional(rollbackFor = Exception.class)
public class CartServiceImpl implements CartService {

	@Autowired
	private CartMapper mapper;

	@Override
	public List<Cart> selectCartItems(int memberNo) {
		return mapper.selectCartItems(memberNo);
	}

	@Override
	public Cart addToCart(Cart cart, int memberNo) {
		// 동일 상품+옵션이 있는지 확인
		Cart existingCart = mapper.selectCartByGoodsAndOption(memberNo, cart.getGoodsNo(), cart.getGoodsOptionNo());

		if (existingCart != null) {
			// 기존 항목의 수량 증가
			int newQty = existingCart.getQty() + cart.getQty();
			updateCartQty(existingCart.getCartNo(), newQty, memberNo);
			return mapper.selectCartByNo(existingCart.getCartNo());
		}

		// 새 항목 추가
		Cart newCart = Cart.builder().memberNo(memberNo).goodsNo(cart.getGoodsNo())
				.goodsOptionNo(cart.getGoodsOptionNo()).qty(cart.getQty()).build();

		int result = mapper.insertCart(newCart);
		if (result != 1) {
			throw new BusinessException("장바구니 추가에 실패했습니다.");
		}

		return mapper.selectCartByNo(newCart.getCartNo());
	}

	@Override
	public Cart updateCartQty(int cartNo, int qty, int memberNo) {
		Cart cart = mapper.selectCartByNo(cartNo);

		if (cart == null) {
			throw new ResourceNotFoundException("장바구니 항목을 찾을 수 없습니다.");
		}

		if (cart.getMemberNo() != memberNo) {
			throw new BusinessException("권한이 없습니다.");
		}

		if (qty < 1) {
			throw new BusinessException("수량은 1개 이상이어야 합니다.");
		}

		if (cart.getStock() != 0 && qty > cart.getStock()) {
			throw new BusinessException("재고가 부족합니다.");
		}

		cart.setQty(qty);
		int result = mapper.updateCartQty(cart);

		if (result != 1) {
			throw new BusinessException("수량 변경에 실패했습니다.");
		}

		return mapper.selectCartByNo(cartNo);
	}

	@Override
	public void removeFromCart(int cartNo, int memberNo) {
		Cart cart = mapper.selectCartByNo(cartNo);

		if (cart == null) {
			throw new ResourceNotFoundException("장바구니 항목을 찾을 수 없습니다.");
		}

		if (cart.getMemberNo() != memberNo) {
			throw new BusinessException("권한이 없습니다.");
		}

		mapper.deleteCart(cartNo);
	}

	@Override
	public void clearCart(int memberNo) {
		mapper.deleteCartByMember(memberNo);
	}

	@Override
	public List<Cart> mergeLocalCart(List<Cart> localItems, int memberNo) {

		int successCount = 0;
		int failCount = 0;

		for (Cart item : localItems) {
			try {
				addToCart(item, memberNo);
				successCount++;
			} catch (Exception e) {
				log.warn("장바구니 병합 중 오류 - goodsNo: {}, error: {}", item.getGoodsNo(), e.getMessage());
				failCount++;
				// 계속 진행 (일부 실패해도 나머지는 병합)
			}
		}

		log.info("장바구니 병합 완료 - 성공: {}개, 실패: {}개", successCount, failCount);
		return selectCartItems(memberNo);
	}
}