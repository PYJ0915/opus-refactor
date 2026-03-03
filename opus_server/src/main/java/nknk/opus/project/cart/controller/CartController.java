package nknk.opus.project.cart.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.extern.slf4j.Slf4j;
import nknk.opus.project.cart.model.dto.Cart;
import nknk.opus.project.cart.model.service.CartService;

@Slf4j
@RestController
@RequestMapping("cart")
public class CartController {

	@Autowired
	private CartService service;

	/**
	 * 장바구니 목록 조회
	 */
	@GetMapping
	public ResponseEntity<List<Cart>> selectCartItems(Authentication authentication) {

		String memberNoStr = (String) authentication.getPrincipal();
		int memberNo = Integer.parseInt(memberNoStr);

		List<Cart> cartItems = service.selectCartItems(memberNo);
		return ResponseEntity.ok(cartItems);
	}

	/**
	 * 장바구니에 상품 추가
	 */
	@PostMapping
	public ResponseEntity<Cart> addToCart(@RequestBody Cart cart, Authentication authentication) {

		String memberNoStr = (String) authentication.getPrincipal();
		int memberNo = Integer.parseInt(memberNoStr);

		Cart newItem = service.addToCart(cart, memberNo);
		return ResponseEntity.status(HttpStatus.CREATED).body(newItem);
	}

	/**
	 * 장바구니 수량 변경
	 */
	@PutMapping("{cartNo}")
	public ResponseEntity<Cart> updateCartQty(@PathVariable("cartNo") int cartNo, @RequestParam("qty") int qty,
			Authentication authentication) {

		String memberNoStr = (String) authentication.getPrincipal();
		int memberNo = Integer.parseInt(memberNoStr);

		Cart cart = service.updateCartQty(cartNo, qty, memberNo);
		return ResponseEntity.ok(cart);
	}

	/**
	 * 장바구니 항목 삭제
	 */
	@DeleteMapping("{cartNo}")
	public ResponseEntity<Void> removeFromCart(@PathVariable("cartNo") int cartNo, Authentication authentication) {

		String memberNoStr = (String) authentication.getPrincipal();
		int memberNo = Integer.parseInt(memberNoStr);

		service.removeFromCart(cartNo, memberNo);
		return ResponseEntity.noContent().build();
	}

	/**
	 * 장바구니 비우기
	 */
	@DeleteMapping
	public ResponseEntity<Void> clearCart(Authentication authentication) {

		String memberNoStr = (String) authentication.getPrincipal();
		int memberNo = Integer.parseInt(memberNoStr);

		service.clearCart(memberNo);
		return ResponseEntity.noContent().build();
	}

	/**
	 * 로컬 장바구니 서버로 병합
	 */
	@PostMapping("merge")
	public ResponseEntity<List<Cart>> mergeLocalCart( @RequestBody List<Cart> localCartItems,
												Authentication authentication) {

		String memberNoStr = (String) authentication.getPrincipal();
		int memberNo = Integer.parseInt(memberNoStr);
		
		List<Cart> mergedCart = service.mergeLocalCart(localCartItems, memberNo);
		
		return ResponseEntity.ok(mergedCart);
	}
}