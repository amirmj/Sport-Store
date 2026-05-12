package com.amirmj.store.dtos;

import com.amirmj.store.entities.CartItem;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * DTO for {@link CartItem}
 */
@Data
public class UpdateCartItemDto {
    @Min(1)
    @Max(100)
    private Integer quantity;
}