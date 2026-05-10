package com.codewithmosh.store.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.io.Serializable;

/**
 * DTO for {@link com.codewithmosh.store.entities.CartItem}
 */
@Data
public class UpdateCartItemDto {
    @Min(1)
    @Max(100)
    private Integer quantity;
}