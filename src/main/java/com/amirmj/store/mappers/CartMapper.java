package com.amirmj.store.mappers;

import com.amirmj.store.entities.CartItem;
import com.amirmj.store.dtos.CartDto;
import com.amirmj.store.dtos.CartItemsDto;
import com.amirmj.store.entities.Cart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "totalPrice", expression = "java(cart.getTotalPrice())")
    CartDto toDto(Cart cart);

    @Mapping(target = "totalPrice", expression = "java(cartItem.getTotalPrice())")
    CartItemsDto toDto(CartItem cartItem);
}
