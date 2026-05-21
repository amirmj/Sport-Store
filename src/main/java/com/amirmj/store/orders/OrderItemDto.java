package com.amirmj.store.orders;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemDto {
    private ProductDto product;
    private Integer quantity;
    private BigDecimal totalPrice;
}
