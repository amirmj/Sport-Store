package com.codewithmosh.store.dtos;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductRequest {
    @NotNull
    private Long productId;
}
