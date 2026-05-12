package com.amirmj.store.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartItemsDto {
    private ProductCartDto product;
    private Integer quantity;
    private BigDecimal totalPrice;
}
