package com.amirmj.store.mappers;

import com.amirmj.store.dtos.RegisterUserRequest;
import com.amirmj.store.entities.User;
import com.amirmj.store.dtos.UserDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toUserDto(User user);

    User toEntity(RegisterUserRequest registerUserRequest);
}
