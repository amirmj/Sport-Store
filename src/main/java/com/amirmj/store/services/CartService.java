package com.amirmj.store.services;

import com.amirmj.store.dtos.CartDto;
import com.amirmj.store.dtos.CartItemsDto;
import com.amirmj.store.dtos.ProductRequest;
import com.amirmj.store.dtos.UpdateCartItemDto;
import com.amirmj.store.entities.Cart;
import com.amirmj.store.entities.CartItem;
import com.amirmj.store.entities.Product;
import com.amirmj.store.exceptions.CartNotFoundException;
import com.amirmj.store.exceptions.ProductNotFoundException;
import com.amirmj.store.mappers.CartMapper;
import com.amirmj.store.repositories.CartRepository;
import com.amirmj.store.repositories.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class CartService {

    private CartRepository cartRepository;
    private CartMapper cartMapper;
    private ProductRepository productRepository;

    public CartDto addCart() {
        var cart = new Cart();
        cartRepository.save(cart);
        return cartMapper.toDto(cart);
    }

    public CartItemsDto addProductItem(UUID cartId, ProductRequest request) {
        Cart cart = cartRepository.getCartWithItems(cartId).orElse(null);
        if (cart == null) {
            throw new CartNotFoundException();
        }

        Product product = productRepository.findById(request.getProductId()).orElse(null);
        if (product == null) {
            throw new ProductNotFoundException();
        }

        CartItem cartItem = cart.addProduct(product);

        cartRepository.save(cart);

        return cartMapper.toDto(cartItem);

    }

    public CartDto getCartInfo(UUID cartId) {
        Cart cart = cartRepository.getCartWithItems(cartId).orElse(null);
        if (cart == null)
            throw new CartNotFoundException();
        return cartMapper.toDto(cart);
    }


    public CartItemsDto updateCart(UUID cartId, Long productId, UpdateCartItemDto request) {
        Cart cart = cartRepository.findById(cartId).orElse(null);
        if (cart == null)
            throw new CartNotFoundException();

        CartItem cartItem = cart.getCartItems(productId);
        if (cartItem == null) {
            throw new ProductNotFoundException();
        }

        cartItem.setQuantity(request.getQuantity());
        cartRepository.save(cart);
        return cartMapper.toDto(cartItem);
    }

    public void deleteProduct(UUID cartId, Long productId) {
        Cart cart = cartRepository.findById(cartId).orElse(null);
        if (cart == null)
            throw new CartNotFoundException();

        cart.deleteProduct(productId);
        cartRepository.save(cart);
    }


    public void clearCart(UUID cartId) {
        Cart cart = cartRepository.findById(cartId).orElse(null);
        if (cart == null) {
            throw new CartNotFoundException();
        }
        cart.clear();
        cartRepository.save(cart);
    }

}
