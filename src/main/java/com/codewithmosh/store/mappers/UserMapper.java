package com.codewithmosh.store.mappers;

import com.codewithmosh.store.DTO.RegisterUserRequest;
import com.codewithmosh.store.DTO.UserDto;
import com.codewithmosh.store.entities.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toUserDto(User user);

    User toEntity(RegisterUserRequest registerUserRequest);
}
