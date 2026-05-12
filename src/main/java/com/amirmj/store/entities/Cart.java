package com.amirmj.store.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "carts")
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "date_created")
    private LocalDate dateCreated;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.MERGE, orphanRemoval = true)
    private Set<CartItem> items = new LinkedHashSet<>();


    public BigDecimal getTotalPrice() {
        return items.stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public CartItem getCart(Long productId) {
        return items.stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);
    }

    public CartItem addProduct(Product product) {
        CartItem cartItem = getCart(product.getId());
        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + 1);
        } else {
            cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setCart(this);
            cartItem.setQuantity(1);
            items.add(cartItem);
        }
        return cartItem;
    }


    public boolean hasProduct(Long productId) {
        return items.stream().anyMatch(item -> item.getProduct().getId().equals(productId));
    }


    public void deleteProduct(Long productId) {
        CartItem cartItem = getCart(productId);
        if (cartItem != null) {
            items.remove(cartItem);
            cartItem.setCart(null);
        }
    }


    public void clear() {
        items.clear();
    }
}