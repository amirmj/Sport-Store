package com.amirmj.store.mappers;

import com.amirmj.store.dtos.OrderDto;
import com.amirmj.store.entities.Order;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    OrderDto toDto(Order order);
}
