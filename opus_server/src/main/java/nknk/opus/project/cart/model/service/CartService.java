package nknk.opus.project.cart.model.service;

import java.util.List;

import nknk.opus.project.cart.model.dto.Cart;

public interface CartService {

	List<Cart> selectCartItems(int memberNo);

	Cart addToCart(Cart cart, int memberNo);

	Cart updateCartQty(int cartNo, int qty, int memberNo);

	void removeFromCart(int cartNo, int memberNo);

	void clearCart(int memberNo);

	List<Cart> mergeLocalCart(List<Cart> localCartItems, int memberNo);

}
