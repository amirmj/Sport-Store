package com.amirmj.store.services;

import com.amirmj.store.dtos.CheckoutRequest;
import com.amirmj.store.dtos.CheckoutResponse;
import com.amirmj.store.entities.Cart;
import com.amirmj.store.entities.Order;
import com.amirmj.store.exceptions.CartEmptyException;
import com.amirmj.store.exceptions.CartNotFoundException;
import com.amirmj.store.repositories.CartRepository;
import com.amirmj.store.repositories.OrderRepository;
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
