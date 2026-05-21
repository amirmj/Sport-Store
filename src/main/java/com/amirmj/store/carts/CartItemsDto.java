package com.amirmj.store.carts;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartItemsDto {
    private ProductDto product;
    private Integer quantity;
    private BigDecimal totalPrice;
}
