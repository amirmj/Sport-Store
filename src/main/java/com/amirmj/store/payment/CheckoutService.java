package com.amirmj.store.payment;

import com.amirmj.store.auth.AuthService;
import com.amirmj.store.carts.CartService;
import com.amirmj.store.carts.Cart;
import com.amirmj.store.orders.Order;
import com.amirmj.store.carts.CartEmptyException;
import com.amirmj.store.carts.CartNotFoundException;
import com.amirmj.store.carts.CartRepository;
import com.amirmj.store.orders.OrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@AllArgsConstructor
@Service
public class CheckoutService {

    private CartRepository cartRepository;
    private OrderRepository orderRepository;
    private AuthService authService;
    private CartService cartService;

    public CheckoutResponse checkout(CheckoutRequest request) {
        Cart cart = cartRepository.getCartWithItems(request.getCartId()).orElse(null);
        if (cart == null) {
            throw new CartNotFoundException();
        }

        if (cart.getItems().isEmpty()) {
            throw new CartEmptyException();
        }

        Order order = Order.fromCart(cart, authService.getCurrentUser());

        orderRepository.save(order);
        cartService.clearCart(cart.getId());

        return new CheckoutResponse(order.getId());
    }
}
