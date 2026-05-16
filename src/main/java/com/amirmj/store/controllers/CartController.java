package com.amirmj.store.controllers;

import com.amirmj.store.dtos.CartDto;
import com.amirmj.store.dtos.ProductRequest;
import com.amirmj.store.dtos.UpdateCartItemDto;
import com.amirmj.store.services.CartService;
import com.amirmj.store.dtos.CartItemsDto;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/carts")
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<CartDto> createCart(
            UriComponentsBuilder uriBuilder
    ) {
        CartDto cartDto = cartService.addCart();
        var uri = uriBuilder.path("/carts/{id}").buildAndExpand(cartDto.getId()).toUri();
        return ResponseEntity.created(uri).body(cartDto);
    }


    @PostMapping("/{cartId}/items")
    public ResponseEntity<CartItemsDto> addProductCart(
            @PathVariable UUID cartId,
            @RequestBody ProductRequest request
    ) {
        CartItemsDto cartItemsDto = cartService.addProductItem(cartId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(cartItemsDto);
    }


    @GetMapping("/{cartId}")
    public ResponseEntity<CartDto> getCart(@PathVariable UUID cartId) {
        CartDto info = cartService.getCartInfo(cartId);
        return ResponseEntity.ok(info);
    }

    @PutMapping("/{cartId}/items/{productId}")
    public ResponseEntity<CartItemsDto> updateCart(
            @PathVariable("cartId") UUID cartId,
            @PathVariable("productId") Long productId,
            @RequestBody UpdateCartItemDto updateRequest
    ) {
        CartItemsDto cartItemsDto = cartService.updateCart(cartId, productId, updateRequest);
        return ResponseEntity.ok().body(cartItemsDto);
    }

    @DeleteMapping("/{cartId}/items/{productId}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable("cartId") UUID cartId,
            @PathVariable("productId") Long productId
    ) {
        cartService.deleteProduct(cartId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{cartId}/items")
    public ResponseEntity<Void> clearCart(
            @PathVariable("cartId") UUID cartId
    ) {
        cartService.clearCart(cartId);
        return ResponseEntity.noContent().build();
    }

}
