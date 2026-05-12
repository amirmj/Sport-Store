package com.amirmj.store.mappers;

import com.amirmj.store.entities.Product;
import com.amirmj.store.dtos.ProductDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(source = "category.id", target = "categoryId")
    ProductDto toDto(Product product);

    Product toEntity(ProductDto productDto);

    @Mapping(target = "id", ignore = true)
    void updateDto(ProductDto productDto, @MappingTarget Product product);

}
